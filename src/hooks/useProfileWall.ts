 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 import { useDemoModeContext } from "@/contexts/DemoModeContext";
 import { toast } from "sonner";
 import { CommunityPost, PostCategory } from "@/hooks/useCommunityPosts";
 
 interface CreateWallPostData {
   content: string;
   target_profile_id: string;
   media_urls?: string[];
 }
 
 export function useProfileWall(profileUserId: string | null) {
   const { user } = useAuth();
   const queryClient = useQueryClient();
   const { showDemoData } = useDemoModeContext();
 
   const { data: wallPosts = [], isLoading, error } = useQuery({
     queryKey: ['profile-wall-posts', profileUserId, showDemoData],
     queryFn: async () => {
       if (!profileUserId) return [];
 
       // Fetch posts targeted at this profile
       let query = supabase
         .from('community_posts')
         .select('*')
         .eq('target_profile_id', profileUserId)
         .order('created_at', { ascending: false });
 
       if (!showDemoData) {
         query = query.eq('is_demo', false);
       }
 
       const { data: postsData, error: postsError } = await query;
       if (postsError) throw postsError;
 
       if (!postsData || postsData.length === 0) return [];
 
       // Fetch author profiles
       const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles_public')
        .select('user_id, display_name, avatar_url, profile_accent_color, avatar_border_style')
        .in('user_id', userIds);
 
       // Fetch user roles
       const { data: userRolesData } = await supabase
         .from('user_roles')
         .select('user_id, role')
         .in('user_id', userIds);
 
       const userRolesMap = (userRolesData || []).reduce((acc, r) => {
         const priority = { admin: 4, professor: 3, moderator: 2, student: 1 };
         const currentRole = acc[r.user_id];
         if (!currentRole || priority[r.role as keyof typeof priority] > priority[currentRole as keyof typeof priority]) {
           acc[r.user_id] = r.role;
         }
         return acc;
       }, {} as Record<string, string>);
 
       // Fetch likes and comments counts
       const postIds = postsData.map(p => p.id);
       const { data: likesData } = await supabase
         .from('post_likes')
         .select('post_id')
         .in('post_id', postIds);
 
       const { data: commentsData } = await supabase
         .from('community_comments')
         .select('post_id')
         .in('post_id', postIds);
 
       // Check user's likes
       let userLikes: string[] = [];
       if (user) {
         const { data: userLikesData } = await supabase
           .from('post_likes')
           .select('post_id')
           .eq('user_id', user.id)
           .in('post_id', postIds);
         userLikes = userLikesData?.map(l => l.post_id) || [];
       }
 
       const likesCount = (likesData || []).reduce((acc, l) => {
         acc[l.post_id] = (acc[l.post_id] || 0) + 1;
         return acc;
       }, {} as Record<string, number>);
 
       const commentsCount = (commentsData || []).reduce((acc, c) => {
         acc[c.post_id] = (acc[c.post_id] || 0) + 1;
         return acc;
       }, {} as Record<string, number>);
 
      const profilesMap = (profiles || []).reduce((acc, p) => {
        acc[p.user_id!] = {
          display_name: p.display_name,
          avatar_url: p.avatar_url,
          profile_accent_color: p.profile_accent_color,
          avatar_border_style: p.avatar_border_style,
          role: userRolesMap[p.user_id!] as 'admin' | 'professor' | 'moderator' | 'student' | undefined,
        };
        return acc;
      }, {} as Record<string, { display_name: string | null; avatar_url: string | null; profile_accent_color?: string | null; avatar_border_style?: string | null; role?: 'admin' | 'professor' | 'moderator' | 'student' }>);
 
       return postsData.map(post => ({
         ...post,
         category: post.category as PostCategory,
         media_urls: post.media_urls || [],
         challenge_id: post.challenge_id || null,
         author: profilesMap[post.user_id] || { display_name: null, avatar_url: null },
         likes_count: likesCount[post.id] || 0,
         comments_count: commentsCount[post.id] || 0,
         user_has_liked: userLikes.includes(post.id),
         preview_comments: [],
       })) as CommunityPost[];
     },
     enabled: !!profileUserId && !!user,
   });
 
   const createWallPost = useMutation({
     mutationFn: async (data: CreateWallPostData) => {
       if (!user) throw new Error('Must be logged in');
 
       const { data: post, error } = await supabase
         .from('community_posts')
         .insert({
           user_id: user.id,
           title: 'Wall Post',
           content: data.content,
           category: 'general' as PostCategory,
           target_profile_id: data.target_profile_id,
           media_urls: data.media_urls || [],
           is_project_post: false,
         })
         .select()
         .single();
 
       if (error) throw error;
 
       // Create notification for profile owner (if not posting on own wall)
       if (data.target_profile_id !== user.id) {
         await supabase.from('notifications').insert({
           user_id: data.target_profile_id,
           sender_id: user.id,
           type: 'wall_post',
           reference_type: 'post',
           reference_id: post.id,
           post_id: post.id,
           content_preview: data.content.slice(0, 100),
         });
       }
 
       return post;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['profile-wall-posts'] });
       queryClient.invalidateQueries({ queryKey: ['community-posts'] });
       toast.success('Posted to wall!');
     },
     onError: (error: Error) => {
       toast.error(error.message || 'Failed to post');
     },
   });
 
   const deleteWallPost = useMutation({
     mutationFn: async (postId: string) => {
       const { error } = await supabase
         .from('community_posts')
         .delete()
         .eq('id', postId);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['profile-wall-posts'] });
       queryClient.invalidateQueries({ queryKey: ['community-posts'] });
       toast.success('Post deleted');
     },
     onError: () => {
       toast.error('Failed to delete post');
     },
   });
 
   return {
     wallPosts,
     isLoading,
     error,
     createWallPost,
     deleteWallPost,
   };
 }
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type PostCategory = 'general' | 'course_discussion' | 'project_submission' | 'feedback_critique' | 'announcement';

export interface CommentPreview {
  id: string;
  content: string;
  user_id: string;
  author?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: PostCategory;
  course_code: string | null;
  is_project_post: boolean;
  media_urls: string[];
  video_url: string | null;
  is_pinned: boolean;
  is_highlighted: boolean;
  created_at: string;
  updated_at: string;
  challenge_id: string | null;
  // Joined fields
  author?: {
    display_name: string | null;
    avatar_url: string | null;
    role?: 'admin' | 'professor' | 'moderator' | 'student' | null;
  };
  likes_count?: number;
  comments_count?: number;
  user_has_liked?: boolean;
  user_is_following?: boolean;
  preview_comments?: CommentPreview[];
}

interface CreatePostData {
  title: string;
  content: string;
  category: PostCategory;
  course_code?: string;
  is_project_post?: boolean;
  media_urls?: string[];
  video_url?: string;
  mentioned_user_ids?: string[];
  challenge_id?: string;
}

export function useCommunityPosts(filters?: {
  category?: PostCategory;
  course_code?: string;
  sort_by?: 'recent' | 'popular';
  challenge_only?: boolean;
  following_only?: boolean;
  include_comment_previews?: boolean;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['community-posts', filters],
    queryFn: async () => {
      // Fetch posts
      let query = supabase
        .from('community_posts')
        .select('*')
        .order('is_pinned', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.course_code) {
        query = query.eq('course_code', filters.course_code);
      }
      
      if (filters?.challenge_only) {
        query = query.not('challenge_id', 'is', null);
      }

      if (filters?.sort_by === 'popular') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data: postsData, error: postsError } = await query;
      if (postsError) throw postsError;

      if (!postsData || postsData.length === 0) return [];

      // Fetch profiles for authors (using limited public view for privacy)
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles_public' as any)
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds) as { data: { user_id: string; display_name: string | null; avatar_url: string | null }[] | null };

      // Fetch user roles for authors
      const { data: userRolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const userRolesMap = (userRolesData || []).reduce((acc, r) => {
        // Prioritize admin > professor > moderator > student
        const priority = { admin: 4, professor: 3, moderator: 2, student: 1 };
        const currentRole = acc[r.user_id];
        if (!currentRole || priority[r.role as keyof typeof priority] > priority[currentRole as keyof typeof priority]) {
          acc[r.user_id] = r.role;
        }
        return acc;
      }, {} as Record<string, string>);

      // Fetch likes count for each post
      const postIds = postsData.map(p => p.id);
      const { data: likesData } = await supabase
        .from('post_likes')
        .select('post_id')
        .in('post_id', postIds);

      // Fetch comments count for each post
      const { data: commentsData } = await supabase
        .from('community_comments')
        .select('post_id')
        .in('post_id', postIds);

      // Check user's likes
      let userLikes: string[] = [];
      let userFollows: string[] = [];
      if (user) {
        const { data: userLikesData } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);
        userLikes = userLikesData?.map(l => l.post_id) || [];

        const { data: userFollowsData } = await supabase
          .from('post_follows')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);
        userFollows = userFollowsData?.map(f => f.post_id) || [];
      }

      // Combine data
      const likesCount = (likesData || []).reduce((acc, l) => {
        acc[l.post_id] = (acc[l.post_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const commentsCount = (commentsData || []).reduce((acc, c) => {
        acc[c.post_id] = (acc[c.post_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const profilesMap = (profiles || []).reduce((acc, p) => {
        acc[p.user_id] = {
          ...p,
          role: userRolesMap[p.user_id] as 'admin' | 'professor' | 'moderator' | 'student' | undefined,
        };
        return acc;
      }, {} as Record<string, { display_name: string | null; avatar_url: string | null; role?: 'admin' | 'professor' | 'moderator' | 'student' }>);

      // Fetch comment previews if requested
      let commentPreviews: Record<string, CommentPreview[]> = {};
      if (filters?.include_comment_previews) {
        const { data: commentsPreviewData } = await supabase
          .from('community_comments')
          .select('id, post_id, content, user_id')
          .in('post_id', postIds)
          .is('parent_comment_id', null)
          .order('created_at', { ascending: false });

        if (commentsPreviewData) {
          // Get unique user IDs from comments
          const commentUserIds = [...new Set(commentsPreviewData.map(c => c.user_id))];
          const { data: commentProfiles } = await supabase
            .from('profiles_public' as any)
            .select('user_id, display_name, avatar_url')
            .in('user_id', commentUserIds) as { data: { user_id: string; display_name: string | null; avatar_url: string | null }[] | null };

          const commentProfilesMap = (commentProfiles || []).reduce((acc, p) => {
            acc[p.user_id] = p;
            return acc;
          }, {} as Record<string, { display_name: string | null; avatar_url: string | null }>);

          // Group by post_id and take first 2 comments per post
          commentsPreviewData.forEach(c => {
            if (!commentPreviews[c.post_id]) {
              commentPreviews[c.post_id] = [];
            }
            if (commentPreviews[c.post_id].length < 2) {
              commentPreviews[c.post_id].push({
                id: c.id,
                content: c.content,
                user_id: c.user_id,
                author: commentProfilesMap[c.user_id] || { display_name: null, avatar_url: null },
              });
            }
          });
        }
      }

      let enrichedPosts = postsData.map(post => ({
        ...post,
        category: post.category as PostCategory,
        media_urls: post.media_urls || [],
        challenge_id: post.challenge_id || null,
        author: profilesMap[post.user_id] || { display_name: null, avatar_url: null },
        likes_count: likesCount[post.id] || 0,
        comments_count: commentsCount[post.id] || 0,
        user_has_liked: userLikes.includes(post.id),
        user_is_following: userFollows.includes(post.id),
        preview_comments: commentPreviews[post.id] || [],
      })) as CommunityPost[];

      // Filter following only on client side
      if (filters?.following_only) {
        enrichedPosts = enrichedPosts.filter(p => p.user_is_following);
      }

      return enrichedPosts;
    },
    enabled: !!user,
  });

  const createPost = useMutation({
    mutationFn: async (data: CreatePostData) => {
      if (!user) throw new Error('Must be logged in');
      
      const { data: post, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          title: data.title,
          content: data.content,
          category: data.category,
          course_code: data.course_code || null,
          is_project_post: data.is_project_post || false,
          media_urls: data.media_urls || [],
          video_url: data.video_url || null,
          challenge_id: data.challenge_id || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Create mention notifications
      if (data.mentioned_user_ids && data.mentioned_user_ids.length > 0) {
        const notifications = data.mentioned_user_ids
          .filter(id => id !== user.id)
          .map(userId => ({
            user_id: userId,
            sender_id: user.id,
            type: 'mention',
            reference_type: 'post',
            reference_id: post.id,
            post_id: post.id,
            content_preview: data.content.slice(0, 100),
          }));

        if (notifications.length > 0) {
          await supabase.from('notifications').insert(notifications);
        }
      }

      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast.success('Post created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create post');
    },
  });

  const toggleLike = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('id', existingLike.id);
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });

  const toggleFollow = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { data: existingFollow } = await supabase
        .from('post_follows')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingFollow) {
        await supabase
          .from('post_follows')
          .delete()
          .eq('id', existingFollow.id);
        toast.success('Unfollowed thread');
      } else {
        await supabase
          .from('post_follows')
          .insert({ post_id: postId, user_id: user.id });
        toast.success('Following thread');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast.success('Post deleted');
    },
    onError: () => {
      toast.error('Failed to delete post');
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('community-posts-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts',
        },
        () => {
          // Invalidate and refetch when any change occurs
          queryClient.invalidateQueries({ queryKey: ['community-posts'] });
          queryClient.invalidateQueries({ queryKey: ['admin-community-posts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    posts,
    isLoading,
    error,
    createPost,
    toggleLike,
    toggleFollow,
    deletePost,
  };
}

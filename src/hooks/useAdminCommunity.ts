import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PostCategory } from "@/hooks/useCommunityPosts";

export interface AdminPost {
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
  author?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  likes_count?: number;
  comments_count?: number;
}

export function useAdminCommunity() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['admin-community-posts'],
    queryFn: async () => {
      // Fetch all posts (admin can see all)
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      if (!postsData || postsData.length === 0) return [];

      // Fetch profiles for authors
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      // Fetch likes count
      const postIds = postsData.map(p => p.id);
      const { data: likesData } = await supabase
        .from('post_likes')
        .select('post_id')
        .in('post_id', postIds);

      // Fetch comments count
      const { data: commentsData } = await supabase
        .from('community_comments')
        .select('post_id')
        .in('post_id', postIds);

      // Build maps
      const profilesMap = (profiles || []).reduce((acc, p) => {
        acc[p.user_id] = p;
        return acc;
      }, {} as Record<string, { display_name: string | null; avatar_url: string | null }>);

      const likesCount = (likesData || []).reduce((acc, l) => {
        acc[l.post_id] = (acc[l.post_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const commentsCount = (commentsData || []).reduce((acc, c) => {
        acc[c.post_id] = (acc[c.post_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return postsData.map(post => ({
        ...post,
        category: post.category as PostCategory,
        media_urls: post.media_urls || [],
        author: profilesMap[post.user_id] || { display_name: null, avatar_url: null },
        likes_count: likesCount[post.id] || 0,
        comments_count: commentsCount[post.id] || 0,
      })) as AdminPost[];
    },
    enabled: !!user,
  });

  const togglePin = useMutation({
    mutationFn: async ({ postId, isPinned }: { postId: string; isPinned: boolean }) => {
      const { error } = await supabase
        .from('community_posts')
        .update({ is_pinned: !isPinned })
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-community-posts'] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast.success(variables.isPinned ? 'Post unpinned' : 'Post pinned');
    },
    onError: () => {
      toast.error('Failed to update post');
    },
  });

  const toggleHighlight = useMutation({
    mutationFn: async ({ postId, isHighlighted }: { postId: string; isHighlighted: boolean }) => {
      const { error } = await supabase
        .from('community_posts')
        .update({ is_highlighted: !isHighlighted })
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-community-posts'] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast.success(variables.isHighlighted ? 'Highlight removed' : 'Post highlighted');
    },
    onError: () => {
      toast.error('Failed to update post');
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
      queryClient.invalidateQueries({ queryKey: ['admin-community-posts'] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast.success('Post deleted');
    },
    onError: () => {
      toast.error('Failed to delete post');
    },
  });

  const highlightComment = useMutation({
    mutationFn: async ({ commentId, isHighlighted }: { commentId: string; isHighlighted: boolean }) => {
      const { error } = await supabase
        .from('community_comments')
        .update({ is_highlighted: !isHighlighted })
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['community-comments'] });
      toast.success(variables.isHighlighted ? 'Highlight removed' : 'Comment highlighted');
    },
    onError: () => {
      toast.error('Failed to update comment');
    },
  });

  return {
    posts,
    isLoading,
    error,
    togglePin,
    toggleHighlight,
    deletePost,
    highlightComment,
  };
}

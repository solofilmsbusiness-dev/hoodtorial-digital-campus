import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type PostCategory = 'general' | 'course_discussion' | 'project_submission' | 'feedback_critique' | 'announcement';

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
  // Joined fields
  author?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  likes_count?: number;
  comments_count?: number;
  user_has_liked?: boolean;
  user_is_following?: boolean;
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
}

export function useCommunityPosts(filters?: {
  category?: PostCategory;
  course_code?: string;
  sort_by?: 'recent' | 'popular';
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

      if (filters?.sort_by === 'popular') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data: postsData, error: postsError } = await query;
      if (postsError) throw postsError;

      if (!postsData || postsData.length === 0) return [];

      // Fetch profiles for authors
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

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
        acc[p.user_id] = p;
        return acc;
      }, {} as Record<string, { display_name: string | null; avatar_url: string | null }>);

      return postsData.map(post => ({
        ...post,
        category: post.category as PostCategory,
        media_urls: post.media_urls || [],
        author: profilesMap[post.user_id] || { display_name: null, avatar_url: null },
        likes_count: likesCount[post.id] || 0,
        comments_count: commentsCount[post.id] || 0,
        user_has_liked: userLikes.includes(post.id),
        user_is_following: userFollows.includes(post.id),
      })) as CommunityPost[];
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

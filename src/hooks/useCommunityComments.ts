import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  what_works: string | null;
  what_could_improve: string | null;
  actionable_suggestion: string | null;
  is_instructor_comment: boolean;
  is_highlighted: boolean;
  media_urls: string[];
  created_at: string;
  updated_at: string;
  // Joined fields
  author?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  user_role?: string;
  likes_count?: number;
  user_has_liked?: boolean;
  replies?: CommunityComment[];
}

interface CreateCommentData {
  post_id: string;
  parent_comment_id?: string;
  content: string;
  what_works?: string;
  what_could_improve?: string;
  actionable_suggestion?: string;
  media_urls?: string[];
  mentioned_user_ids?: string[];
}

export function useCommunityComments(postId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading, error } = useQuery({
    queryKey: ['community-comments', postId],
    queryFn: async () => {
      if (!postId) return [];

      const { data: commentsData, error: commentsError } = await supabase
        .from('community_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      if (!commentsData || commentsData.length === 0) return [];

      // Fetch profiles for authors (using limited public view for privacy)
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles_public' as any)
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds) as { data: { user_id: string; display_name: string | null; avatar_url: string | null }[] | null };

      // Fetch roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      // Fetch likes count
      const commentIds = commentsData.map(c => c.id);
      const { data: likesData } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .in('comment_id', commentIds);

      // Check user's likes
      let userLikes: string[] = [];
      if (user) {
        const { data: userLikesData } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentIds);
        userLikes = userLikesData?.map(l => l.comment_id) || [];
      }

      // Build maps
      const profilesMap = (profiles || []).reduce((acc, p) => {
        acc[p.user_id] = p;
        return acc;
      }, {} as Record<string, { display_name: string | null; avatar_url: string | null }>);

      const rolesMap = (roles || []).reduce((acc, r) => {
        if (!acc[r.user_id] || r.role === 'admin' || r.role === 'moderator') {
          acc[r.user_id] = r.role;
        }
        return acc;
      }, {} as Record<string, string>);

      const likesCount = (likesData || []).reduce((acc, l) => {
        acc[l.comment_id] = (acc[l.comment_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Build threaded comments
      const commentsWithMeta = commentsData.map(comment => ({
        ...comment,
        author: profilesMap[comment.user_id] || { display_name: null, avatar_url: null },
        user_role: rolesMap[comment.user_id] || 'student',
        likes_count: likesCount[comment.id] || 0,
        user_has_liked: userLikes.includes(comment.id),
        media_urls: comment.media_urls || [],
        replies: [] as CommunityComment[],
      }));

      // Thread replies
      const rootComments: CommunityComment[] = [];
      const commentsById = new Map<string, CommunityComment>();
      
      commentsWithMeta.forEach(c => commentsById.set(c.id, c as CommunityComment));
      
      commentsWithMeta.forEach(comment => {
        if (comment.parent_comment_id && commentsById.has(comment.parent_comment_id)) {
          const parent = commentsById.get(comment.parent_comment_id)!;
          parent.replies = parent.replies || [];
          parent.replies.push(comment as CommunityComment);
        } else {
          rootComments.push(comment as CommunityComment);
        }
      });

      return rootComments;
    },
    enabled: !!postId && !!user,
  });

  const createComment = useMutation({
    mutationFn: async (data: CreateCommentData) => {
      if (!user) throw new Error('Must be logged in');

      // Check if user is admin/moderator for instructor comment flag
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      const isInstructor = userRoles?.some(r => r.role === 'admin' || r.role === 'moderator');

      const { data: comment, error } = await supabase
        .from('community_comments')
        .insert({
          post_id: data.post_id,
          user_id: user.id,
          parent_comment_id: data.parent_comment_id || null,
          content: data.content,
          what_works: data.what_works || null,
          what_could_improve: data.what_could_improve || null,
          actionable_suggestion: data.actionable_suggestion || null,
          is_instructor_comment: isInstructor || false,
          media_urls: data.media_urls || [],
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
            reference_type: 'comment',
            reference_id: comment.id,
            post_id: data.post_id,
            content_preview: data.content.slice(0, 100),
          }));

        if (notifications.length > 0) {
          await supabase.from('notifications').insert(notifications);
        }
      }

      return comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast.success('Comment posted!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to post comment');
    },
  });

  const toggleCommentLike = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        await supabase
          .from('comment_likes')
          .delete()
          .eq('id', existingLike.id);
      } else {
        await supabase
          .from('comment_likes')
          .insert({ comment_id: commentId, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-comments', postId] });
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('community_comments')
        .delete()
        .eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast.success('Comment deleted');
    },
  });

  // Subscribe to realtime updates for this post's comments
  useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`community-comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          // Invalidate and refetch when any change occurs
          queryClient.invalidateQueries({ queryKey: ['community-comments', postId] });
          queryClient.invalidateQueries({ queryKey: ['community-posts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  return {
    comments,
    isLoading,
    error,
    createComment,
    toggleCommentLike,
    deleteComment,
  };
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  submission_count: number;
  likes_received: number;
  rank: number;
}

export function useCommunityLeaderboard(period: 'week' | 'month' | 'all' = 'week') {
  const getStartDate = () => {
    const now = new Date();
    if (period === 'week') {
      now.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      now.setMonth(now.getMonth() - 1);
    } else {
      return null; // All time - no filter
    }
    return now.toISOString();
  };

  // Top challenge completers
  const { data: topCompleters = [], isLoading: isLoadingCompleters } = useQuery({
    queryKey: ['leaderboard-completers', period],
    queryFn: async () => {
      const startDate = getStartDate();
      
      let query = supabase
        .from('challenge_submissions')
        .select('user_id');

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      const { data: submissions, error } = await query;
      if (error) throw error;

      // Count submissions per user
      const counts: Record<string, number> = {};
      (submissions || []).forEach(s => {
        counts[s.user_id] = (counts[s.user_id] || 0) + 1;
      });

      // Get user profiles
      const userIds = Object.keys(counts);
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles_public')
        .select('user_id, display_name, avatar_url, profile_accent_color, avatar_border_style')
        .in('user_id', userIds);

      // Build leaderboard
      const leaderboard = userIds
        .map(userId => ({
          user_id: userId,
          display_name: profiles?.find(p => p.user_id === userId)?.display_name || 'Anonymous',
          avatar_url: profiles?.find(p => p.user_id === userId)?.avatar_url || null,
          submission_count: counts[userId],
          likes_received: 0,
          rank: 0,
        }))
        .sort((a, b) => b.submission_count - a.submission_count)
        .slice(0, 10)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      return leaderboard as LeaderboardEntry[];
    },
  });

  // Top liked creators
  const { data: topLiked = [], isLoading: isLoadingLiked } = useQuery({
    queryKey: ['leaderboard-liked', period],
    queryFn: async () => {
      const startDate = getStartDate();
      
      // Get posts with challenge_id (challenge responses)
      let postsQuery = supabase
        .from('community_posts')
        .select('id, user_id')
        .not('challenge_id', 'is', null);

      if (startDate) {
        postsQuery = postsQuery.gte('created_at', startDate);
      }

      const { data: posts, error: postsError } = await postsQuery;
      if (postsError) throw postsError;

      if (!posts || posts.length === 0) return [];

      // Get likes for these posts
      const postIds = posts.map(p => p.id);
      const { data: likes, error: likesError } = await supabase
        .from('post_likes')
        .select('post_id')
        .in('post_id', postIds);

      if (likesError) throw likesError;

      // Count likes per user
      const likesByPost: Record<string, number> = {};
      (likes || []).forEach(l => {
        likesByPost[l.post_id] = (likesByPost[l.post_id] || 0) + 1;
      });

      const likesByUser: Record<string, number> = {};
      posts.forEach(p => {
        const postLikes = likesByPost[p.id] || 0;
        likesByUser[p.user_id] = (likesByUser[p.user_id] || 0) + postLikes;
      });

      // Get user profiles
      const userIds = Object.keys(likesByUser);
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles_public')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      // Build leaderboard
      const leaderboard = userIds
        .map(userId => ({
          user_id: userId,
          display_name: profiles?.find(p => p.user_id === userId)?.display_name || 'Anonymous',
          avatar_url: profiles?.find(p => p.user_id === userId)?.avatar_url || null,
          submission_count: 0,
          likes_received: likesByUser[userId],
          rank: 0,
        }))
        .sort((a, b) => b.likes_received - a.likes_received)
        .slice(0, 10)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      return leaderboard as LeaderboardEntry[];
    },
  });

  return {
    topCompleters,
    topLiked,
    isLoading: isLoadingCompleters || isLoadingLiked,
  };
}

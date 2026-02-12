import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  prompt: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  credits_reward: number;
  category: 'lighting' | 'composition' | 'movement' | 'storytelling' | 'general';
  active_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface ChallengeSubmission {
  id: string;
  challenge_id: string;
  user_id: string;
  post_id: string;
  credits_awarded: number | null;
  awarded_at: string | null;
  created_at: string;
}

export function useDailyChallenges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch current active challenge (spans multiple days)
  const { data: todaysChallenge, isLoading: isLoadingToday } = useQuery({
    queryKey: ['daily-challenge-today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .lte('active_date', today)
        .gte('end_date', today)
        .eq('is_active', true)
        .order('active_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as DailyChallenge | null;
    },
  });

  // Fetch all active challenges (for browsing)
  const { data: challenges = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['daily-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('is_active', true)
        .lte('active_date', new Date().toISOString().split('T')[0])
        .order('active_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as DailyChallenge[];
    },
  });

  // Check if user has submitted to today's challenge
  const { data: userSubmission, isLoading: isLoadingSubmission } = useQuery({
    queryKey: ['user-challenge-submission', todaysChallenge?.id],
    queryFn: async () => {
      if (!todaysChallenge || !user) return null;

      const { data, error } = await supabase
        .from('challenge_submissions')
        .select('*')
        .eq('challenge_id', todaysChallenge.id)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as ChallengeSubmission | null;
    },
    enabled: !!todaysChallenge && !!user,
  });

  // Submit a challenge response
  const submitChallenge = useMutation({
    mutationFn: async ({ 
      challengeId, 
      postId, 
      creditsReward 
    }: { 
      challengeId: string; 
      postId: string; 
      creditsReward: number;
    }) => {
      if (!user) throw new Error('Must be logged in');

      // Insert submission
      const { data: submission, error: submissionError } = await supabase
        .from('challenge_submissions')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          post_id: postId,
          credits_awarded: creditsReward,
          awarded_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Award credits to user progress (update or insert)
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('id, credits_earned')
        .eq('user_id', user.id)
        .eq('course_code', 'CHALLENGE_REWARDS')
        .single();

      if (existingProgress) {
        await supabase
          .from('user_progress')
          .update({
            credits_earned: existingProgress.credits_earned + creditsReward,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProgress.id);
      } else {
        await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            course_code: 'CHALLENGE_REWARDS',
            credits_earned: creditsReward,
            completed: false,
          });
      }

      return submission;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-challenge-submission'] });
      queryClient.invalidateQueries({ queryKey: ['challenge-streak'] });
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
      toast.success(`+${variables.creditsReward} credits earned! 🎬`, {
        description: 'Great work completing today\'s challenge!',
      });
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate')) {
        toast.error('You\'ve already submitted to this challenge');
      } else {
        toast.error('Failed to submit challenge');
      }
    },
  });

  // Calculate days remaining on current challenge
  const daysRemaining = todaysChallenge
    ? Math.max(0, Math.ceil((new Date(todaysChallenge.end_date + 'T23:59:59').getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    todaysChallenge,
    challenges,
    userSubmission,
    hasSubmittedToday: !!userSubmission,
    daysRemaining,
    isLoading: isLoadingToday || isLoadingAll || isLoadingSubmission,
    submitChallenge,
  };
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalSubmissions: number;
  lastSubmissionDate: string | null;
}

const STREAK_BONUSES = {
  7: 0.5,
  14: 1,
  30: 2,
  60: 3,
  100: 5,
};

export function useChallengeStreak() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: streakData, isLoading } = useQuery({
    queryKey: ['challenge-streak', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get all user submissions ordered by date
      const { data: submissions, error } = await supabase
        .from('challenge_submissions')
        .select(`
          id,
          created_at,
          challenge:daily_challenges!inner(active_date)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!submissions || submissions.length === 0) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          totalSubmissions: 0,
          lastSubmissionDate: null,
        };
      }

      // Calculate streak
      const dates = submissions
        .map(s => {
          const challenge = s.challenge as unknown as { active_date: string };
          return challenge.active_date;
        })
        .filter((v, i, a) => a.indexOf(v) === i) // unique dates
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < dates.length; i++) {
        const submissionDate = new Date(dates[i]);
        submissionDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (i === 0) {
          // First submission - check if it's today or yesterday to start streak
          if (daysDiff <= 1) {
            currentStreak = 1;
            tempStreak = 1;
          }
        } else {
          const prevDate = new Date(dates[i - 1]);
          prevDate.setHours(0, 0, 0, 0);
          const gapDays = Math.floor((prevDate.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (gapDays === 1) {
            tempStreak++;
            if (i === 0 || currentStreak > 0) {
              currentStreak = tempStreak;
            }
          } else {
            tempStreak = 1;
          }
        }
        
        longestStreak = Math.max(longestStreak, tempStreak);
      }

      return {
        currentStreak,
        longestStreak,
        totalSubmissions: submissions.length,
        lastSubmissionDate: dates[0] || null,
      };
    },
    enabled: !!user,
  });

  const awardStreakBonus = useMutation({
    mutationFn: async (streakDays: number) => {
      if (!user) throw new Error('Must be logged in');
      
      const bonus = STREAK_BONUSES[streakDays as keyof typeof STREAK_BONUSES];
      if (!bonus) return null;

      // Check if bonus already awarded for this streak milestone
      const storageKey = `streak_bonus_${streakDays}_${user.id}`;
      const alreadyAwarded = localStorage.getItem(storageKey);
      if (alreadyAwarded) return null;

      // Award bonus credits
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('id, credits_earned')
        .eq('user_id', user.id)
        .eq('course_code', 'STREAK_BONUS')
        .single();

      if (existingProgress) {
        await supabase
          .from('user_progress')
          .update({
            credits_earned: existingProgress.credits_earned + bonus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProgress.id);
      } else {
        await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            course_code: 'STREAK_BONUS',
            credits_earned: bonus,
            completed: false,
          });
      }

      localStorage.setItem(storageKey, new Date().toISOString());
      return bonus;
    },
    onSuccess: (bonus, streakDays) => {
      if (bonus) {
        queryClient.invalidateQueries({ queryKey: ['user-progress'] });
        toast.success(`🔥 ${streakDays}-Day Streak Bonus!`, {
          description: `+${bonus} credits for your dedication!`,
        });
      }
    },
  });

  // Check for streak bonuses when streak data changes
  const checkStreakBonuses = () => {
    if (!streakData || !user) return;
    
    Object.keys(STREAK_BONUSES).forEach(days => {
      const daysNum = parseInt(days);
      if (streakData.currentStreak >= daysNum) {
        const storageKey = `streak_bonus_${daysNum}_${user.id}`;
        if (!localStorage.getItem(storageKey)) {
          awardStreakBonus.mutate(daysNum);
        }
      }
    });
  };

  return {
    streakData: streakData || {
      currentStreak: 0,
      longestStreak: 0,
      totalSubmissions: 0,
      lastSubmissionDate: null,
    },
    isLoading,
    checkStreakBonuses,
    STREAK_BONUSES,
  };
}

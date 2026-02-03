import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ActivityItem {
  id: string;
  type: "enrollment" | "quiz_pass" | "quiz_fail" | "post" | "signup";
  userId: string;
  userDisplayName: string | null;
  description: string;
  metadata?: {
    courseCode?: string;
    quizId?: string;
    score?: number;
    postTitle?: string;
  };
  createdAt: string;
}

export interface PendingItem {
  type: "trial_expiring" | "new_signup";
  count: number;
  items: Array<{
    userId: string;
    displayName: string | null;
    expiresAt?: string;
    signedUpAt?: string;
  }>;
}

export function useAdminActivity() {
  // Fetch recent enrollments
  const { data: enrollments } = useQuery({
    queryKey: ["admin-activity-enrollments"],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("enrollments")
        .select("id, user_id, course_code, enrolled_at")
        .gte("enrolled_at", sevenDaysAgo.toISOString())
        .order("enrolled_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch recent quiz results
  const { data: quizResults } = useQuery({
    queryKey: ["admin-activity-quizzes"],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("quiz_results")
        .select("id, user_id, quiz_id, course_code, passed, score, created_at")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch recent community posts
  const { data: posts } = useQuery({
    queryKey: ["admin-activity-posts"],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("community_posts")
        .select("id, user_id, title, created_at")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch user profiles for display names
  const userIds = [
    ...(enrollments?.map((e) => e.user_id) || []),
    ...(quizResults?.map((q) => q.user_id) || []),
    ...(posts?.map((p) => p.user_id) || []),
  ];
  const uniqueUserIds = [...new Set(userIds)];

  const { data: profiles } = useQuery({
    queryKey: ["admin-activity-profiles", uniqueUserIds],
    queryFn: async () => {
      if (uniqueUserIds.length === 0) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", uniqueUserIds);

      if (error) throw error;
      return data || [];
    },
    enabled: uniqueUserIds.length > 0,
  });

  // Build profile map
  const profileMap = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);

  // Combine and sort all activities
  const activities: ActivityItem[] = [
    ...(enrollments?.map((e) => ({
      id: `enrollment-${e.id}`,
      type: "enrollment" as const,
      userId: e.user_id,
      userDisplayName: profileMap.get(e.user_id) || null,
      description: `enrolled in ${e.course_code}`,
      metadata: { courseCode: e.course_code },
      createdAt: e.enrolled_at,
    })) || []),
    ...(quizResults?.map((q) => ({
      id: `quiz-${q.id}`,
      type: (q.passed ? "quiz_pass" : "quiz_fail") as "quiz_pass" | "quiz_fail",
      userId: q.user_id,
      userDisplayName: profileMap.get(q.user_id) || null,
      description: q.passed
        ? `passed quiz in ${q.course_code}`
        : `attempted quiz in ${q.course_code}`,
      metadata: { quizId: q.quiz_id, score: q.score, courseCode: q.course_code },
      createdAt: q.created_at,
    })) || []),
    ...(posts?.map((p) => ({
      id: `post-${p.id}`,
      type: "post" as const,
      userId: p.user_id,
      userDisplayName: profileMap.get(p.user_id) || null,
      description: `posted "${p.title.substring(0, 30)}${p.title.length > 30 ? "..." : ""}"`,
      metadata: { postTitle: p.title },
      createdAt: p.created_at,
    })) || []),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    activities: activities.slice(0, 15),
    isLoading: !enrollments || !quizResults || !posts,
  };
}

export function useAdminPendingItems() {
  // Trials expiring in next 3 days
  const { data: expiringTrials } = useQuery({
    queryKey: ["admin-pending-trials"],
    queryFn: async () => {
      const now = new Date();
      const threeDaysLater = new Date();
      threeDaysLater.setDate(now.getDate() + 3);

      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, trial_ends_at")
        .eq("subscription_status", "trial")
        .gte("trial_ends_at", now.toISOString())
        .lte("trial_ends_at", threeDaysLater.toISOString())
        .order("trial_ends_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // New signups today
  const { data: newSignups } = useQuery({
    queryKey: ["admin-pending-signups"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, enrolled_at")
        .gte("enrolled_at", today.toISOString())
        .order("enrolled_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const pendingItems: PendingItem[] = [];

  if (expiringTrials && expiringTrials.length > 0) {
    pendingItems.push({
      type: "trial_expiring",
      count: expiringTrials.length,
      items: expiringTrials.map((t) => ({
        userId: t.user_id,
        displayName: t.display_name,
        expiresAt: t.trial_ends_at || undefined,
      })),
    });
  }

  if (newSignups && newSignups.length > 0) {
    pendingItems.push({
      type: "new_signup",
      count: newSignups.length,
      items: newSignups.map((s) => ({
        userId: s.user_id,
        displayName: s.display_name,
        signedUpAt: s.enrolled_at,
      })),
    });
  }

  const totalCount = pendingItems.reduce((sum, item) => sum + item.count, 0);

  return {
    pendingItems,
    totalCount,
    isLoading: !expiringTrials || !newSignups,
  };
}

export function useCompletionRate() {
  const { data: completionData } = useQuery({
    queryKey: ["admin-completion-rate"],
    queryFn: async () => {
      // Get total lessons completed
      const { count: completedLessons } = await supabase
        .from("user_progress")
        .select("*", { count: "exact", head: true })
        .eq("completed", true);

      // Get total enrollments as base
      const { count: totalEnrollments } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Get total lessons available
      const { count: totalLessons } = await supabase
        .from("lessons")
        .select("*", { count: "exact", head: true });

      return {
        completedLessons: completedLessons || 0,
        totalEnrollments: totalEnrollments || 0,
        totalLessons: totalLessons || 0,
      };
    },
  });

  // Calculate a meaningful completion rate
  // (completed lessons / (enrolled students * avg lessons per course)) * 100
  const rate =
    completionData && completionData.totalEnrollments > 0 && completionData.totalLessons > 0
      ? Math.round(
          (completionData.completedLessons /
            (completionData.totalEnrollments * 5)) * // Assume ~5 lessons per enrolled course
            100
        )
      : 0;

  return {
    rate: Math.min(rate, 100), // Cap at 100%
    completedLessons: completionData?.completedLessons || 0,
    isLoading: !completionData,
  };
}

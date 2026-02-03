import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];
type MembershipTier = Database["public"]["Enums"]["membership_tier"];

export interface StudentEnrollment {
  courseCode: string;
  courseTitle: string;
  enrolledAt: string;
  status: string;
}

export interface QuizStats {
  passed: number;
  failed: number;
  totalAttempts: number;
  passRate: number;
}

export interface AssessmentResult {
  experienceLevel: string;
  interests: string[];
  totalScore: number;
}

export interface StudentSummary {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  location: string | null;
  membershipTier: MembershipTier;
  subscriptionStatus: string | null;
  trialEndsAt: string | null;
  enrolledAt: string;
  roles: AppRole[];
  enrollmentCount: number;
  quizStats: QuizStats;
}

export interface StudentDetails extends StudentSummary {
  bio: string | null;
  enrollments: StudentEnrollment[];
  assessmentResult: AssessmentResult | null;
  lessonsCompleted: number;
}

export function useAdminStudents() {
  return useQuery({
    queryKey: ["admin-students"],
    queryFn: async (): Promise<StudentSummary[]> => {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, location, membership_tier, subscription_status, trial_ends_at, enrolled_at")
        .order("enrolled_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Fetch enrollment counts per user
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select("user_id, status");

      if (enrollmentsError) throw enrollmentsError;

      // Fetch quiz results for stats
      const { data: quizResults, error: quizError } = await supabase
        .from("quiz_results")
        .select("user_id, passed");

      if (quizError) throw quizError;

      // Group roles by user_id
      const rolesByUser = roles.reduce((acc, { user_id, role }) => {
        if (!acc[user_id]) acc[user_id] = [];
        acc[user_id].push(role);
        return acc;
      }, {} as Record<string, AppRole[]>);

      // Count enrollments per user
      const enrollmentCountByUser = enrollments.reduce((acc, { user_id, status }) => {
        if (status === "active") {
          acc[user_id] = (acc[user_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Calculate quiz stats per user
      const quizStatsByUser = quizResults.reduce((acc, { user_id, passed }) => {
        if (!acc[user_id]) {
          acc[user_id] = { passed: 0, failed: 0, totalAttempts: 0 };
        }
        acc[user_id].totalAttempts += 1;
        if (passed) {
          acc[user_id].passed += 1;
        } else {
          acc[user_id].failed += 1;
        }
        return acc;
      }, {} as Record<string, { passed: number; failed: number; totalAttempts: number }>);

      // Fetch emails for all users using the security definer function
      const userIds = profiles.map((p) => p.user_id);
      const emailPromises = userIds.map(async (userId) => {
        const { data, error } = await supabase.rpc("get_user_email", { _user_id: userId });
        return { userId, email: error ? null : data };
      });
      const emailResults = await Promise.all(emailPromises);
      const emailsByUser = emailResults.reduce((acc, { userId, email }) => {
        acc[userId] = email;
        return acc;
      }, {} as Record<string, string | null>);

      // Combine data
      const students: StudentSummary[] = profiles.map((profile) => {
        const stats = quizStatsByUser[profile.user_id] || { passed: 0, failed: 0, totalAttempts: 0 };
        const passRate = stats.totalAttempts > 0 ? Math.round((stats.passed / stats.totalAttempts) * 100) : 0;

        return {
          id: profile.user_id,
          email: emailsByUser[profile.user_id] || null,
          displayName: profile.display_name,
          avatarUrl: profile.avatar_url,
          location: profile.location,
          membershipTier: profile.membership_tier,
          subscriptionStatus: profile.subscription_status,
          trialEndsAt: profile.trial_ends_at,
          enrolledAt: profile.enrolled_at,
          roles: rolesByUser[profile.user_id] || ["student"],
          enrollmentCount: enrollmentCountByUser[profile.user_id] || 0,
          quizStats: {
            ...stats,
            passRate,
          },
        };
      });

      return students;
    },
  });
}

export function useStudentDetails(userId: string | null) {
  return useQuery({
    queryKey: ["admin-student-detail", userId],
    queryFn: async (): Promise<StudentDetails | null> => {
      if (!userId) return null;

      // Fetch full profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) return null;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (rolesError) throw rolesError;

      // Fetch enrollments with course info
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select("course_code, enrolled_at, status")
        .eq("user_id", userId);

      if (enrollmentsError) throw enrollmentsError;

      // Fetch course titles for enrollments
      const courseCodes = enrollments.map((e) => e.course_code);
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("code, title")
        .in("code", courseCodes.length > 0 ? courseCodes : ["__none__"]);

      if (coursesError) throw coursesError;

      const courseMap = new Map(courses?.map((c) => [c.code, c.title]) || []);

      // Fetch quiz results
      const { data: quizResults, error: quizError } = await supabase
        .from("quiz_results")
        .select("passed")
        .eq("user_id", userId);

      if (quizError) throw quizError;

      // Fetch assessment results
      const { data: assessment, error: assessmentError } = await supabase
        .from("assessment_results")
        .select("experience_level, interests, total_score")
        .eq("user_id", userId)
        .maybeSingle();

      if (assessmentError) throw assessmentError;

      // Fetch lesson completion count
      const { data: progress, error: progressError } = await supabase
        .from("user_progress")
        .select("id")
        .eq("user_id", userId)
        .eq("completed", true);

      if (progressError) throw progressError;

      // Calculate quiz stats
      const quizStats = quizResults?.reduce(
        (acc, { passed }) => {
          acc.totalAttempts += 1;
          if (passed) acc.passed += 1;
          else acc.failed += 1;
          return acc;
        },
        { passed: 0, failed: 0, totalAttempts: 0 }
      ) || { passed: 0, failed: 0, totalAttempts: 0 };

      const passRate = quizStats.totalAttempts > 0 
        ? Math.round((quizStats.passed / quizStats.totalAttempts) * 100) 
        : 0;

      // Fetch email for this user
      const { data: email } = await supabase.rpc("get_user_email", { _user_id: userId });

      return {
        id: profile.user_id,
        email: email || null,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        location: profile.location,
        membershipTier: profile.membership_tier,
        subscriptionStatus: profile.subscription_status,
        trialEndsAt: profile.trial_ends_at,
        enrolledAt: profile.enrolled_at,
        roles: roles?.map((r) => r.role) || ["student"],
        enrollmentCount: enrollments?.filter((e) => e.status === "active").length || 0,
        quizStats: { ...quizStats, passRate },
        enrollments: enrollments?.map((e) => ({
          courseCode: e.course_code,
          courseTitle: courseMap.get(e.course_code) || e.course_code,
          enrolledAt: e.enrolled_at,
          status: e.status,
        })) || [],
        assessmentResult: assessment
          ? {
              experienceLevel: assessment.experience_level,
              interests: assessment.interests,
              totalScore: assessment.total_score,
            }
          : null,
        lessonsCompleted: progress?.length || 0,
      };
    },
    enabled: !!userId,
  });
}

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useTestModeContext } from "@/contexts/TestModeContext";
import { useTrialLimits } from "@/hooks/useTrialLimits";

export interface Enrollment {
  id: string;
  user_id: string;
  course_code: string;
  status: "active" | "completed" | "dropped";
  enrolled_at: string;
  completed_at: string | null;
}

// Default max is 3 for paid, but trial users get 2
const MAX_ACTIVE_COURSES_PAID = 3;
const MAX_ACTIVE_COURSES_TRIAL = 2;

export function useEnrollments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasAccess, isTrialing, isPaid } = useSubscription();
  // Use context directly to avoid circular dependency
  const testModeContext = useTestModeContext();
  const isTestModeEnabled = testModeContext.isTestModeEnabled;
  
  // Determine max courses based on subscription status
  const maxCourses = isTestModeEnabled || isPaid ? MAX_ACTIVE_COURSES_PAID : MAX_ACTIVE_COURSES_TRIAL;
  
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setEnrollments([]);
      setLoading(false);
      return;
    }

    const fetchEnrollments = async () => {
      try {
        const { data, error } = await supabase
          .from("enrollments")
          .select("*")
          .eq("user_id", user.id)
          .order("enrolled_at", { ascending: false });

        if (error) throw error;
        setEnrollments((data || []) as Enrollment[]);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [user]);

  const activeEnrollments = enrollments.filter((e) => e.status === "active");
  const completedEnrollments = enrollments.filter((e) => e.status === "completed");
  const canEnroll = isTestModeEnabled || activeEnrollments.length < maxCourses;

  const isEnrolled = useCallback(
    (courseCode: string) => {
      // Test mode: always enrolled
      if (isTestModeEnabled) return true;
      
      return enrollments.some(
        (e) => e.course_code === courseCode && (e.status === "active" || e.status === "completed")
      );
    },
    [enrollments, isTestModeEnabled]
  );

  const getEnrollment = useCallback(
    (courseCode: string) => {
      return enrollments.find((e) => e.course_code === courseCode);
    },
    [enrollments]
  );

  const enroll = useCallback(
    async (courseCode: string) => {
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to enroll in courses.",
          variant: "destructive",
        });
        return { error: new Error("Not authenticated"), data: null };
      }

      // Test mode bypasses subscription check
      if (!isTestModeEnabled && !hasAccess) {
        toast({
          title: "Subscription required",
          description: "Start your free trial or subscribe to enroll in courses.",
          variant: "destructive",
        });
        return { error: new Error("No paid access"), data: null };
      }

      // Test mode bypasses enrollment limit
      if (!isTestModeEnabled && !canEnroll) {
        toast({
          title: "Enrollment limit reached",
          description: `You can only have ${maxCourses} active courses at a time. Complete a course or upgrade to enroll in more.`,
          variant: "destructive",
        });
        return { error: new Error("Max enrollments reached"), data: null };
      }

      try {
        const { data, error } = await supabase
          .from("enrollments")
          .upsert(
            {
              user_id: user.id,
              course_code: courseCode,
              status: "active",
              enrolled_at: new Date().toISOString(),
            },
            { onConflict: "user_id,course_code" }
          )
          .select()
          .single();

        if (error) throw error;

        setEnrollments((prev) => {
          const existing = prev.findIndex((e) => e.course_code === courseCode);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = data as Enrollment;
            return updated;
          }
          return [data as Enrollment, ...prev];
        });

        toast({
          title: "Enrolled!",
          description: "You've successfully enrolled in this course.",
        });

        return { error: null, data: data as Enrollment };
      } catch (err) {
        toast({
          title: "Enrollment failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
        return { error: err as Error, data: null };
      }
    },
    [user, canEnroll, hasAccess, toast, isTestModeEnabled, maxCourses]
  );

  const completeCourse = useCallback(
    async (courseCode: string) => {
      if (!user) return { error: new Error("Not authenticated"), data: null };

      try {
        const { data, error } = await supabase
          .from("enrollments")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("course_code", courseCode)
          .select()
          .single();

        if (error) throw error;

        setEnrollments((prev) =>
          prev.map((e) => (e.course_code === courseCode ? (data as Enrollment) : e))
        );

        toast({
          title: "Course Completed! 🎉",
          description: "Congratulations on completing this course!",
        });

        return { error: null, data: data as Enrollment };
      } catch (err) {
        return { error: err as Error, data: null };
      }
    },
    [user, toast]
  );

  return {
    enrollments,
    activeEnrollments,
    completedEnrollments,
    loading,
    error,
    canEnroll,
    slotsRemaining: isTestModeEnabled ? maxCourses : maxCourses - activeEnrollments.length,
    maxSlots: maxCourses,
    isEnrolled,
    getEnrollment,
    enroll,
    completeCourse,
  };
}

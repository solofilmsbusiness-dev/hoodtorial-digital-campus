import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useTestModeContext } from "@/contexts/TestModeContext";
import { getPathCourses } from "@/lib/degreePathCourses";
import type { DegreePath, CertificateDepartment } from "@/hooks/useDegreeSelection";

export interface Enrollment {
  id: string;
  user_id: string;
  course_code: string;
  status: "active" | "completed" | "dropped";
  enrolled_at: string;
  completed_at: string | null;
  swaps_used: number;
  dropped_at: string | null;
}

// Default max is 3 for paid, but trial users get 2
const MAX_ACTIVE_COURSES_PAID = 3;
const MAX_ACTIVE_COURSES_TRIAL = 2;
const MAX_SWAPS_PER_ENROLLMENT = 1;
const GRACE_PERIOD_HOURS = 24;

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
  const droppedEnrollments = enrollments.filter((e) => e.status === "dropped");
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

  // Check if an enrollment is within the 24-hour grace period
  const isInGracePeriod = useCallback(
    (courseCode: string): boolean => {
      const enrollment = enrollments.find((e) => e.course_code === courseCode && e.status === "active");
      if (!enrollment) return false;
      
      const enrolledAt = new Date(enrollment.enrolled_at).getTime();
      const now = Date.now();
      const hoursSinceEnrollment = (now - enrolledAt) / (1000 * 60 * 60);
      
      return hoursSinceEnrollment < GRACE_PERIOD_HOURS;
    },
    [enrollments]
  );

  // Get remaining grace period time in hours
  const getGracePeriodRemaining = useCallback(
    (courseCode: string): number => {
      const enrollment = enrollments.find((e) => e.course_code === courseCode && e.status === "active");
      if (!enrollment) return 0;
      
      const enrolledAt = new Date(enrollment.enrolled_at).getTime();
      const now = Date.now();
      const hoursSinceEnrollment = (now - enrolledAt) / (1000 * 60 * 60);
      
      return Math.max(0, GRACE_PERIOD_HOURS - hoursSinceEnrollment);
    },
    [enrollments]
  );

  // Get remaining swaps for an enrollment
  const getRemainingSwaps = useCallback(
    (courseCode: string): number => {
      const enrollment = enrollments.find((e) => e.course_code === courseCode);
      if (!enrollment) return MAX_SWAPS_PER_ENROLLMENT;
      
      return Math.max(0, MAX_SWAPS_PER_ENROLLMENT - (enrollment.swaps_used || 0));
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
              swaps_used: 0,
              dropped_at: null,
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

  // Drop a course
  const dropCourse = useCallback(
    async (courseCode: string) => {
      if (!user) return { error: new Error("Not authenticated"), data: null };

      const enrollment = enrollments.find((e) => e.course_code === courseCode && e.status === "active");
      if (!enrollment) {
        toast({
          title: "Not enrolled",
          description: "You are not enrolled in this course.",
          variant: "destructive",
        });
        return { error: new Error("Not enrolled"), data: null };
      }

      try {
        const { data, error } = await supabase
          .from("enrollments")
          .update({
            status: "dropped",
            dropped_at: new Date().toISOString(),
          })
          .eq("id", enrollment.id)
          .select()
          .single();

        if (error) throw error;

        setEnrollments((prev) =>
          prev.map((e) => (e.id === enrollment.id ? (data as Enrollment) : e))
        );

        toast({
          title: "Course Dropped",
          description: "You've dropped this course. Your progress has been saved.",
        });

        return { error: null, data: data as Enrollment };
      } catch (err) {
        toast({
          title: "Drop failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
        return { error: err as Error, data: null };
      }
    },
    [user, enrollments, toast]
  );

  // Swap a course for another
  const swapCourse = useCallback(
    async (fromCourseCode: string, toCourseCode: string) => {
      if (!user) return { error: new Error("Not authenticated"), data: null };

      const fromEnrollment = enrollments.find(
        (e) => e.course_code === fromCourseCode && e.status === "active"
      );
      
      if (!fromEnrollment) {
        toast({
          title: "Not enrolled",
          description: "You are not enrolled in the course you want to swap.",
          variant: "destructive",
        });
        return { error: new Error("Not enrolled in source course"), data: null };
      }

      // Check if already enrolled in target course
      const existingTarget = enrollments.find(
        (e) => e.course_code === toCourseCode && e.status === "active"
      );
      if (existingTarget) {
        toast({
          title: "Already enrolled",
          description: "You are already enrolled in the target course.",
          variant: "destructive",
        });
        return { error: new Error("Already enrolled in target"), data: null };
      }

      const inGracePeriod = isInGracePeriod(fromCourseCode);
      const remainingSwaps = getRemainingSwaps(fromCourseCode);

      // Check swap limits if not in grace period
      if (!inGracePeriod && remainingSwaps <= 0) {
        toast({
          title: "No swaps remaining",
          description: "You've used all your swaps for this enrollment.",
          variant: "destructive",
        });
        return { error: new Error("No swaps remaining"), data: null };
      }

      try {
        // Drop the old course
        const { error: dropError } = await supabase
          .from("enrollments")
          .update({
            status: "dropped",
            dropped_at: new Date().toISOString(),
            // Increment swaps_used only if not in grace period
            swaps_used: inGracePeriod 
              ? fromEnrollment.swaps_used 
              : (fromEnrollment.swaps_used || 0) + 1,
          })
          .eq("id", fromEnrollment.id);

        if (dropError) throw dropError;

        // Enroll in the new course
        const { data: newEnrollment, error: enrollError } = await supabase
          .from("enrollments")
          .upsert(
            {
              user_id: user.id,
              course_code: toCourseCode,
              status: "active",
              enrolled_at: new Date().toISOString(),
              swaps_used: 0,
              dropped_at: null,
            },
            { onConflict: "user_id,course_code" }
          )
          .select()
          .single();

        if (enrollError) throw enrollError;

        // Refresh enrollments
        const { data: updatedEnrollments } = await supabase
          .from("enrollments")
          .select("*")
          .eq("user_id", user.id)
          .order("enrolled_at", { ascending: false });

        setEnrollments((updatedEnrollments || []) as Enrollment[]);

        toast({
          title: "Course Swapped!",
          description: inGracePeriod 
            ? "Course swapped (free swap - within grace period)."
            : `Course swapped. ${remainingSwaps - 1} swaps remaining.`,
        });

        return { error: null, data: newEnrollment as Enrollment };
      } catch (err) {
        toast({
          title: "Swap failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
        return { error: err as Error, data: null };
      }
    },
    [user, enrollments, toast, isInGracePeriod, getRemainingSwaps]
  );

  // Auto-enroll next course in degree path after a completion
  const autoEnrollNextCourse = useCallback(
    async (userId: string) => {
      try {
        // Fetch user's degree path
        const { data: profile } = await supabase
          .from("profiles")
          .select("degree_path, certificate_department")
          .eq("user_id", userId)
          .maybeSingle();

        const path = profile?.degree_path as DegreePath;
        if (!path) return;

        const department = profile?.certificate_department as CertificateDepartment;
        const courseCodes = getPathCourses(path, department);

        // Fetch current enrollments
        const { data: currentEnrollments } = await supabase
          .from("enrollments")
          .select("course_code, status")
          .eq("user_id", userId);

        const activeCount = (currentEnrollments || []).filter(e => e.status === "active").length;
        const enrolledCodes = new Set(
          (currentEnrollments || [])
            .filter(e => e.status === "active" || e.status === "completed")
            .map(e => e.course_code)
        );

        const availableSlots = Math.max(0, maxCourses - activeCount);
        if (availableSlots <= 0) return;

        // Find next un-enrolled course in path sequence
        const nextCourse = courseCodes.find(code => !enrolledCodes.has(code));
        if (!nextCourse) return;

        const { error: insertError } = await supabase
          .from("enrollments")
          .upsert(
            {
              user_id: userId,
              course_code: nextCourse,
              status: "active",
              enrolled_at: new Date().toISOString(),
              swaps_used: 0,
              dropped_at: null,
            },
            { onConflict: "user_id,course_code" }
          );

        if (insertError) throw insertError;

        // Refresh local state
        const { data: refreshed } = await supabase
          .from("enrollments")
          .select("*")
          .eq("user_id", userId)
          .order("enrolled_at", { ascending: false });

        setEnrollments((refreshed || []) as Enrollment[]);

        toast({
          title: "Next course unlocked! 🎓",
          description: `Auto-enrolled in the next course in your degree path.`,
        });
      } catch (err) {
        console.error("Auto-enroll next course failed:", err);
      }
    },
    [maxCourses, toast]
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

        // Auto-enroll next course in the degree path
        await autoEnrollNextCourse(user.id);

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
    droppedEnrollments,
    loading,
    error,
    canEnroll,
    slotsRemaining: isTestModeEnabled ? maxCourses : maxCourses - activeEnrollments.length,
    maxSlots: maxCourses,
    maxSwapsPerEnrollment: MAX_SWAPS_PER_ENROLLMENT,
    isEnrolled,
    getEnrollment,
    isInGracePeriod,
    getGracePeriodRemaining,
    getRemainingSwaps,
    enroll,
    dropCourse,
    swapCourse,
    completeCourse,
  };
}

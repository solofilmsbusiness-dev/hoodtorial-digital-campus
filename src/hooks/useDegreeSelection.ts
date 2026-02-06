import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getPathCourses } from "@/lib/degreePathCourses";

export type DegreePath = "associate" | "bachelor" | "certificate" | null;
export type CertificateDepartment = "cinematography" | "post-production" | "directing" | "production" | null;

interface DegreeSelection {
  degreePath: DegreePath;
  certificateDepartment: CertificateDepartment;
  loading: boolean;
  error: Error | null;
  setDegreeSelection: (path: DegreePath, department?: CertificateDepartment) => Promise<boolean>;
  clearDegreeSelection: () => Promise<boolean>;
}

export function useDegreeSelection(): DegreeSelection {
  const { user } = useAuth();
  const [degreePath, setDegreePath] = useState<DegreePath>(null);
  const [certificateDepartment, setCertificateDepartment] = useState<CertificateDepartment>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch current selection on mount
  useEffect(() => {
    if (!user) {
      setDegreePath(null);
      setCertificateDepartment(null);
      setLoading(false);
      return;
    }

    const fetchSelection = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("degree_path, certificate_department")
          .eq("user_id", user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        setDegreePath(data?.degree_path as DegreePath);
        setCertificateDepartment(data?.certificate_department as CertificateDepartment);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSelection();
  }, [user]);

  /**
   * Auto-enroll the user in the first N courses of their selected path,
   * skipping any courses they're already enrolled in.
   */
  const autoEnrollInitialCourses = useCallback(
    async (path: Exclude<DegreePath, null>, department?: CertificateDepartment) => {
      if (!user) return;

      try {
        const courseCodes = getPathCourses(path, department);

        // Get the user's subscription status to determine slot limit
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_status, trial_ends_at, subscription_ends_at")
          .eq("user_id", user.id)
          .maybeSingle();

        const isPaid = profile?.subscription_status === "active" &&
          (!profile.subscription_ends_at || new Date(profile.subscription_ends_at) > new Date());
        const isTrial = profile?.subscription_status === "trial" &&
          profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date();

        const maxSlots = isPaid ? 3 : isTrial ? 2 : 3;

        // Get existing enrollments to avoid duplicates
        const { data: existing } = await supabase
          .from("enrollments")
          .select("course_code, status")
          .eq("user_id", user.id);

        const activeCount = (existing || []).filter(e => e.status === "active").length;
        const enrolledCodes = new Set((existing || []).filter(e => e.status === "active" || e.status === "completed").map(e => e.course_code));

        // Find courses to enroll (first N not already enrolled, up to available slots)
        const availableSlots = Math.max(0, maxSlots - activeCount);
        const toEnroll = courseCodes
          .filter(code => !enrolledCodes.has(code))
          .slice(0, availableSlots);

        if (toEnroll.length === 0) return;

        // Insert enrollments
        const { error: insertError } = await supabase
          .from("enrollments")
          .upsert(
            toEnroll.map(code => ({
              user_id: user.id,
              course_code: code,
              status: "active",
              enrolled_at: new Date().toISOString(),
              swaps_used: 0,
              dropped_at: null,
            })),
            { onConflict: "user_id,course_code" }
          );

        if (insertError) throw insertError;

        toast.success(`Auto-enrolled in ${toEnroll.length} course${toEnroll.length > 1 ? "s" : ""}!`);
      } catch (err) {
        console.error("Auto-enrollment failed:", err);
        // Don't block the degree selection flow on enrollment failure
      }
    },
    [user]
  );

  const setDegreeSelection = useCallback(
    async (path: DegreePath, department?: CertificateDepartment): Promise<boolean> => {
      if (!user) {
        toast.error("You must be logged in to select a degree path");
        return false;
      }

      // Validate certificate requires department
      if (path === "certificate" && !department) {
        toast.error("Please select a department for your certificate");
        return false;
      }

      try {
        const updates: { degree_path: DegreePath; certificate_department: CertificateDepartment } = {
          degree_path: path,
          certificate_department: path === "certificate" ? department! : null,
        };

        const { error: updateError } = await supabase
          .from("profiles")
          .update(updates)
          .eq("user_id", user.id);

        if (updateError) throw updateError;

        setDegreePath(path);
        setCertificateDepartment(path === "certificate" ? department! : null);

        const pathNames = {
          associate: "Associate of Film",
          bachelor: "Bachelor of Film",
          certificate: `Certificate in ${department ? department.charAt(0).toUpperCase() + department.slice(1) : ""}`,
        };

        toast.success(`Enrolled in ${pathNames[path!]}`);

        // Auto-enroll first courses in the path
        await autoEnrollInitialCourses(path!, department);

        return true;
      } catch (err) {
        toast.error("Failed to save degree selection");
        setError(err as Error);
        return false;
      }
    },
    [user, autoEnrollInitialCourses]
  );

  const clearDegreeSelection = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ degree_path: null, certificate_department: null })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setDegreePath(null);
      setCertificateDepartment(null);
      toast.success("Degree path cleared");
      return true;
    } catch (err) {
      toast.error("Failed to clear degree selection");
      return false;
    }
  }, [user]);

  return {
    degreePath,
    certificateDepartment,
    loading,
    error,
    setDegreeSelection,
    clearDegreeSelection,
  };
}

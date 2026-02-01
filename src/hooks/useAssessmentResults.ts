import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { courses } from "@/data/courses";

interface AssessmentResult {
  id: string;
  user_id: string;
  interests: string[];
  experience_level: string;
  department_scores: Record<string, number>;
  recommended_courses: string[];
  total_score: number;
  time_taken_seconds: number | null;
  created_at: string;
  completed_at: string;
}

export function useAssessmentResults() {
  const { user } = useAuth();
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setResults([]);
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const { data, error } = await supabase
          .from("assessment_results")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Type assertion since the table is newly created
        setResults((data as unknown as AssessmentResult[]) || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user]);

  const calculateRecommendations = (
    departmentScores: Record<string, number>,
    interests: string[],
    experienceLevel: string
  ): string[] => {
    // Weight scores by interests (1.5x multiplier)
    const weightedScores = { ...departmentScores };
    interests.forEach((interest) => {
      if (weightedScores[interest] !== undefined) {
        weightedScores[interest] *= 1.5;
      }
    });

    // Determine difficulty level based on average score
    const avgScore =
      Object.values(departmentScores).reduce((a, b) => a + b, 0) /
      Object.values(departmentScores).length;

    let targetLevels: string[];
    if (avgScore <= 40) {
      targetLevels = ["Beginner"];
    } else if (avgScore <= 70) {
      targetLevels = ["Beginner", "Intermediate"];
    } else {
      targetLevels = ["Intermediate", "Advanced"];
    }

    // Adjust based on experience level
    if (experienceLevel === "professional") {
      targetLevels = ["Intermediate", "Advanced"];
    } else if (experienceLevel === "beginner") {
      targetLevels = ["Beginner"];
    }

    // Filter and rank courses
    const scoredCourses = courses
      .filter((course) => {
        const matchesInterest = interests.includes(course.departmentId);
        const matchesLevel = targetLevels.includes(course.level);
        return matchesInterest && matchesLevel;
      })
      .map((course) => ({
        code: course.code,
        relevance:
          (weightedScores[course.departmentId] || 0) +
          (course.level === "Beginner" ? 10 : 0),
      }))
      .sort((a, b) => b.relevance - a.relevance);

    // Return top 5-7 course codes
    return scoredCourses.slice(0, 7).map((c) => c.code);
  };

  const saveAssessmentResult = async (result: {
    interests: string[];
    experience_level: string;
    department_scores: Record<string, number>;
    total_score: number;
    time_taken_seconds?: number;
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    const recommended_courses = calculateRecommendations(
      result.department_scores,
      result.interests,
      result.experience_level
    );

    try {
      const { data, error } = await supabase
        .from("assessment_results")
        .insert({
          user_id: user.id,
          interests: result.interests,
          experience_level: result.experience_level,
          department_scores: result.department_scores,
          recommended_courses,
          total_score: result.total_score,
          time_taken_seconds: result.time_taken_seconds,
        })
        .select()
        .single();

      if (error) throw error;

      const typedData = data as unknown as AssessmentResult;
      setResults((prev) => [typedData, ...prev]);
      return { error: null, data: typedData };
    } catch (err) {
      return { error: err as Error, data: null };
    }
  };

  const latestResult = results[0] || null;
  const hasCompletedAssessment = results.length > 0;

  return {
    results,
    latestResult,
    hasCompletedAssessment,
    loading,
    error,
    saveAssessmentResult,
    calculateRecommendations,
  };
}

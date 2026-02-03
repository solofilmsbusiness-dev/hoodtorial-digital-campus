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

export interface RoadmapPhase {
  name: string;
  description: string;
  courses: string[]; // course codes
  estimatedWeeks: number;
}

export interface LearningRoadmap {
  phases: RoadmapPhase[];
  totalWeeks: number;
  primaryStrength: string;
  secondaryStrength: string | null;
  areasToImprove: string[];
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

        setResults((data as unknown as AssessmentResult[]) || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user]);

  // Calculate starting level for a department based on score
  const getStartingLevel = (score: number, experienceLevel: string): string[] => {
    // Adjust based on experience
    let adjustedScore = score;
    if (experienceLevel === "professional") {
      adjustedScore = Math.max(score, 60); // Professionals start at least at intermediate
    } else if (experienceLevel === "beginner") {
      adjustedScore = Math.min(score, 50); // Beginners capped for humility
    }

    if (adjustedScore <= 30) {
      return ["Beginner"];
    } else if (adjustedScore <= 60) {
      return ["Beginner", "Intermediate"];
    } else if (adjustedScore <= 85) {
      return ["Intermediate"];
    } else {
      return ["Intermediate", "Advanced"];
    }
  };

  // Build a phased learning roadmap
  const calculateRoadmap = (
    departmentScores: Record<string, number>,
    interests: string[],
    experienceLevel: string
  ): LearningRoadmap => {
    // 1. Rank departments by score within interests
    const interestScores = interests
      .map((dept) => ({ dept, score: departmentScores[dept] || 0 }))
      .sort((a, b) => b.score - a.score);

    const primaryStrength = interestScores[0]?.dept || interests[0];
    const secondaryStrength = interestScores[1]?.dept || null;
    
    // Identify areas needing improvement (score < 50%)
    const areasToImprove = interestScores
      .filter(({ score }) => score < 50)
      .map(({ dept }) => dept);

    const phases: RoadmapPhase[] = [];

    // Phase 1: Foundation (for departments where student scored < 60%)
    if (experienceLevel !== "professional") {
      const foundationDepts = interests.filter(
        (dept) => (departmentScores[dept] || 0) < 60
      );

      const foundationCourses = foundationDepts
        .flatMap((dept) =>
          courses
            .filter((c) => c.departmentId === dept && c.level === "Beginner")
            .slice(0, 1)
            .map((c) => c.code)
        )
        .slice(0, 3); // Max 3 foundation courses

      if (foundationCourses.length > 0) {
        phases.push({
          name: "Foundation",
          description: "Build core fundamentals in areas that need strengthening",
          courses: foundationCourses,
          estimatedWeeks: foundationCourses.length * 4,
        });
      }
    }

    // Phase 2: Core Skills (Intermediate courses in strongest areas)
    const coreStrengthDepts = interests
      .filter((dept) => (departmentScores[dept] || 0) >= 40)
      .sort((a, b) => (departmentScores[b] || 0) - (departmentScores[a] || 0));

    // If no dept scored >= 40, use all interests
    const coreDepts = coreStrengthDepts.length > 0 ? coreStrengthDepts : interests;

    const coreCourses = coreDepts
      .flatMap((dept) => {
        const levels = getStartingLevel(departmentScores[dept] || 0, experienceLevel);
        // For core, prioritize Intermediate
        const level = levels.includes("Intermediate") ? "Intermediate" : levels[0];
        return courses
          .filter((c) => c.departmentId === dept && c.level === level)
          .slice(0, 1)
          .map((c) => c.code);
      })
      .slice(0, 3); // Max 3 core courses

    if (coreCourses.length > 0) {
      phases.push({
        name: "Core Skills",
        description: "Develop professional techniques in your areas of interest",
        courses: coreCourses,
        estimatedWeeks: coreCourses.length * 5,
      });
    }

    // Phase 3: Specialization (Advanced courses for top performers)
    const hasStrongArea = Object.entries(departmentScores)
      .filter(([dept]) => interests.includes(dept))
      .some(([_, score]) => score >= 65);

    if (hasStrongArea || experienceLevel === "professional" || experienceLevel === "semi-professional") {
      const specializationDepts = [primaryStrength];
      if (secondaryStrength && (departmentScores[secondaryStrength] || 0) >= 60) {
        specializationDepts.push(secondaryStrength);
      }

      const advancedCourses = specializationDepts
        .flatMap((dept) =>
          courses
            .filter((c) => c.departmentId === dept && c.level === "Advanced")
            .slice(0, 1)
            .map((c) => c.code)
        )
        .slice(0, 2); // Max 2 advanced courses

      if (advancedCourses.length > 0) {
        phases.push({
          name: "Specialization",
          description: "Master advanced concepts in your strongest areas",
          courses: advancedCourses,
          estimatedWeeks: advancedCourses.length * 5,
        });
      }
    }

    // Calculate total weeks
    const totalWeeks = phases.reduce((sum, p) => sum + p.estimatedWeeks, 0);

    return {
      phases,
      totalWeeks,
      primaryStrength,
      secondaryStrength,
      areasToImprove,
    };
  };

  // Flatten roadmap into ordered course list for database storage
  const calculateRecommendations = (
    departmentScores: Record<string, number>,
    interests: string[],
    experienceLevel: string
  ): string[] => {
    const roadmap = calculateRoadmap(departmentScores, interests, experienceLevel);
    
    // Flatten phases into ordered course codes
    const orderedCourses = roadmap.phases.flatMap((phase) => phase.courses);
    
    // Deduplicate while maintaining order
    return [...new Set(orderedCourses)];
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

  // Get roadmap for latest result
  const latestRoadmap = latestResult
    ? calculateRoadmap(
        latestResult.department_scores,
        latestResult.interests,
        latestResult.experience_level
      )
    : null;

  return {
    results,
    latestResult,
    latestRoadmap,
    hasCompletedAssessment,
    loading,
    error,
    saveAssessmentResult,
    calculateRecommendations,
    calculateRoadmap,
  };
}

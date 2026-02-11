import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WalkthroughStep {
  id: string;
  target: string; // data-tour attribute value
  title: string;
  description: string;
  icon?: string;
}

const TOUR_STEPS: WalkthroughStep[] = [
  {
    id: "active-courses",
    target: "active-courses",
    title: "Your Active Courses",
    description: "These are your enrolled courses. You start with up to 3 courses auto-enrolled from your degree path. Click any course to start learning!",
    icon: "📚",
  },
  {
    id: "course-slots",
    target: "course-slots",
    title: "Course Slots",
    description: "You have a limited number of course slots. Complete or drop a course to free up space for new ones.",
    icon: "🎰",
  },
  {
    id: "degree-stats",
    target: "degree-stats",
    title: "Track Your Progress",
    description: "Each course has lessons and quizzes. Complete them all to earn credits toward your degree. Watch your stats grow here!",
    icon: "📊",
  },
  {
    id: "browse-courses",
    target: "browse-courses",
    title: "Browse All Courses",
    description: "Visit Academics to explore all 16 courses across 4 departments. Click any course to see details and enroll.",
    icon: "🔍",
  },
  {
    id: "degree-progress",
    target: "degree-progress",
    title: "Degree Progress",
    description: "Track how close you are to graduating. Credits, completed courses, and passed quizzes all count toward your degree.",
    icon: "🎓",
  },
  {
    id: "quick-links",
    target: "quick-links",
    title: "Quick Links & Help",
    description: "Use these shortcuts to access your grades, profile, community, and more. You can also retake this tour anytime from here!",
    icon: "⚡",
  },
];

const STORAGE_KEY = "walkthrough_completed";

interface UseWalkthroughOptions {
  walkthroughCompleted?: boolean | null;
  userId?: string;
}

export function useWalkthrough(options: UseWalkthroughOptions = {}) {
  const { walkthroughCompleted, userId } = options;
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Auto-trigger only for users who haven't completed the tour
  useEffect(() => {
    // Fast path: check localStorage cache first
    const cachedCompleted = localStorage.getItem(STORAGE_KEY);
    if (cachedCompleted === "true") return;

    // If profile says completed, cache it and skip
    if (walkthroughCompleted === true) {
      localStorage.setItem(STORAGE_KEY, "true");
      return;
    }

    // Only auto-trigger if we know for sure it's not completed (false, not undefined/null while loading)
    if (walkthroughCompleted === false) {
      const timer = setTimeout(() => setIsActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, [walkthroughCompleted]);

  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const markCompleted = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    if (userId) {
      supabase
        .from("profiles")
        .update({ walkthrough_completed: true } as any)
        .eq("user_id", userId)
        .then();
    }
  }, [userId]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((i) => i + 1);
    } else {
      setIsActive(false);
      markCompleted();
    }
  }, [currentStepIndex, markCompleted]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1);
    }
  }, [currentStepIndex]);

  const skipTour = useCallback(() => {
    setIsActive(false);
    markCompleted();
  }, [markCompleted]);

  return {
    isActive,
    currentStep: TOUR_STEPS[currentStepIndex],
    currentStepIndex,
    totalSteps: TOUR_STEPS.length,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    steps: TOUR_STEPS,
  };
}

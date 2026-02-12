import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProfileWalkthroughStep {
  id: string;
  target: string;
  title: string;
  description: string;
  icon?: string;
  tab?: string | null;
}

const TOUR_STEPS: ProfileWalkthroughStep[] = [
  {
    id: "cover-avatar",
    target: "profile-cover-avatar",
    tab: "appearance",
    title: "Your Look",
    description: "Upload a cover banner and avatar photo. This is the first thing people see on your profile — make it count!",
    icon: "📸",
  },
  {
    id: "theme-picker",
    target: "profile-theme-picker",
    tab: "appearance",
    title: "Pick Your Vibe",
    description: "Choose an accent color and avatar border style that matches your creative personality.",
    icon: "🎨",
  },
  {
    id: "bio-section",
    target: "profile-bio-section",
    tab: "about",
    title: "Tell Your Story",
    description: "Add your name, bio, creative role, and style. Let others know who you are and what you create.",
    icon: "✍️",
  },
  {
    id: "portfolio-tab",
    target: "profile-portfolio-tab",
    tab: null,
    title: "Showcase Your Work",
    description: "Switch to the Portfolio tab to add a featured project, upload gallery items, and list your favorite films.",
    icon: "🎬",
  },
  {
    id: "layout-tab",
    target: "profile-layout-tab",
    tab: null,
    title: "Arrange Your Page",
    description: "Use the Layout tab to drag and reorder sections on your public profile. Make the most important things appear first!",
    icon: "📐",
  },
];

const STORAGE_KEY = "profile_editor_toured";

interface UseProfileWalkthroughOptions {
  profileEditorToured?: boolean | null;
  userId?: string;
}

export function useProfileWalkthrough(options: UseProfileWalkthroughOptions = {}) {
  const { profileEditorToured, userId } = options;
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const cachedCompleted = localStorage.getItem(STORAGE_KEY);
    if (cachedCompleted === "true") return;

    if (profileEditorToured === true) {
      localStorage.setItem(STORAGE_KEY, "true");
      return;
    }

    if (profileEditorToured === false) {
      const timer = setTimeout(() => setIsActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, [profileEditorToured]);

  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const markCompleted = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    if (userId) {
      supabase
        .from("profiles")
        .update({ profile_editor_toured: true } as any)
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

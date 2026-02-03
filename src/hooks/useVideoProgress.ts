import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const WATCH_THRESHOLD = 90; // 90% watched to mark complete
const SAVE_INTERVAL = 5000; // Save every 5 seconds

interface VideoProgressState {
  watchedSeconds: number;
  durationSeconds: number;
  watchPercentage: number;
  isCompleted: boolean;
  isLoading: boolean;
}

interface UseVideoProgressOptions {
  courseCode: string;
  lessonId: string;
  onComplete?: () => void;
}

export function useVideoProgress({ courseCode, lessonId, onComplete }: UseVideoProgressOptions) {
  const { user } = useAuth();
  const [state, setState] = useState<VideoProgressState>({
    watchedSeconds: 0,
    durationSeconds: 0,
    watchPercentage: 0,
    isCompleted: false,
    isLoading: true,
  });

  const lastSaveRef = useRef<number>(0);
  const pendingSaveRef = useRef<NodeJS.Timeout | null>(null);
  const hasCompletedRef = useRef(false);

  // Load initial progress from database
  useEffect(() => {
    if (!user || !lessonId) return;

    const loadProgress = async () => {
      try {
        const { data, error } = await supabase
          .from("user_progress")
          .select("watched_seconds, video_duration_seconds, watch_percentage, completed")
          .eq("user_id", user.id)
          .eq("course_code", courseCode)
          .eq("lesson_id", lessonId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setState({
            watchedSeconds: data.watched_seconds || 0,
            durationSeconds: data.video_duration_seconds || 0,
            watchPercentage: data.watch_percentage || 0,
            isCompleted: data.completed || false,
            isLoading: false,
          });
          hasCompletedRef.current = data.completed || false;
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (err) {
        console.error("Failed to load video progress:", err);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadProgress();
  }, [user, courseCode, lessonId]);

  // Save progress to database (debounced)
  const saveProgress = useCallback(
    async (watchedSeconds: number, durationSeconds: number, forceComplete = false) => {
      if (!user || !lessonId || durationSeconds <= 0) return;

      const watchPercentage = Math.round((watchedSeconds / durationSeconds) * 100);
      const shouldComplete = forceComplete || watchPercentage >= WATCH_THRESHOLD;

      try {
        await supabase.from("user_progress").upsert(
          {
            user_id: user.id,
            course_code: courseCode,
            lesson_id: lessonId,
            watch_percentage: watchPercentage,
            watched_seconds: Math.round(watchedSeconds),
            video_duration_seconds: Math.round(durationSeconds),
            completed: shouldComplete,
            completed_at: shouldComplete ? new Date().toISOString() : null,
          },
          { onConflict: "user_id,course_code,lesson_id" }
        );

        // Trigger completion callback once
        if (shouldComplete && !hasCompletedRef.current) {
          hasCompletedRef.current = true;
          setState((prev) => ({ ...prev, isCompleted: true }));
          onComplete?.();
        }
      } catch (err) {
        console.error("Failed to save video progress:", err);
      }
    },
    [user, courseCode, lessonId, onComplete]
  );

  // Update progress (called frequently from video player)
  const updateProgress = useCallback(
    (watchedSeconds: number, durationSeconds: number) => {
      if (durationSeconds <= 0) return;

      const watchPercentage = Math.round((watchedSeconds / durationSeconds) * 100);
      const shouldComplete = watchPercentage >= WATCH_THRESHOLD;

      setState((prev) => ({
        ...prev,
        watchedSeconds,
        durationSeconds,
        watchPercentage,
        isCompleted: prev.isCompleted || shouldComplete,
      }));

      // Debounce saves to every 5 seconds
      const now = Date.now();
      if (now - lastSaveRef.current >= SAVE_INTERVAL || shouldComplete) {
        lastSaveRef.current = now;

        // Clear any pending save
        if (pendingSaveRef.current) {
          clearTimeout(pendingSaveRef.current);
        }

        saveProgress(watchedSeconds, durationSeconds);
      } else if (!pendingSaveRef.current) {
        // Schedule a save for later
        pendingSaveRef.current = setTimeout(() => {
          pendingSaveRef.current = null;
          saveProgress(watchedSeconds, durationSeconds);
        }, SAVE_INTERVAL);
      }
    },
    [saveProgress]
  );

  // Force save on unmount or lesson change
  useEffect(() => {
    return () => {
      if (pendingSaveRef.current) {
        clearTimeout(pendingSaveRef.current);
      }
      // Final save with current state
      if (state.durationSeconds > 0) {
        saveProgress(state.watchedSeconds, state.durationSeconds);
      }
    };
  }, [lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get resume position (in seconds)
  const getResumePosition = useCallback(() => {
    // Resume from slightly before where they left off (max 10 seconds back)
    return Math.max(0, state.watchedSeconds - 10);
  }, [state.watchedSeconds]);

  return {
    ...state,
    updateProgress,
    getResumePosition,
    watchThreshold: WATCH_THRESHOLD,
  };
}

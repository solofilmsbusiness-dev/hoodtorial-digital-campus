import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const TEST_MODE_KEY = "hu-admin-test-mode";

interface TestModeState {
  enabled: boolean;
  autoPassQuizzes: boolean;
  bypassVideoProgress: boolean;
}

interface TestModeContextType {
  isTestModeEnabled: boolean;
  autoPassQuizzes: boolean;
  bypassVideoProgress: boolean;
  toggleTestMode: () => void;
  setAutoPassQuizzes: (value: boolean) => void;
  setBypassVideoProgress: (value: boolean) => void;
  canUseTestMode: boolean;
}

const defaultState: TestModeState = {
  enabled: false,
  autoPassQuizzes: true,
  bypassVideoProgress: true,
};

const TestModeContext = createContext<TestModeContextType | undefined>(undefined);

export function TestModeProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAdminAuth();
  const [state, setState] = useState<TestModeState>(defaultState);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TEST_MODE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as TestModeState;
        setState(parsed);
      }
    } catch (err) {
      console.error("Failed to load test mode state:", err);
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(TEST_MODE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("Failed to save test mode state:", err);
    }
  }, [state]);

  // Disable test mode if user loses admin status
  useEffect(() => {
    if (!isLoading && !isAdmin && state.enabled) {
      setState((prev) => ({ ...prev, enabled: false }));
    }
  }, [isAdmin, isLoading, state.enabled]);

  const toggleTestMode = useCallback(() => {
    if (!isAdmin) return;
    setState((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, [isAdmin]);

  const setAutoPassQuizzes = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, autoPassQuizzes: value }));
  }, []);

  const setBypassVideoProgress = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, bypassVideoProgress: value }));
  }, []);

  // Only enable test mode if user is verified admin
  const effectiveEnabled = isAdmin && state.enabled;

  return (
    <TestModeContext.Provider
      value={{
        isTestModeEnabled: effectiveEnabled,
        autoPassQuizzes: state.autoPassQuizzes,
        bypassVideoProgress: state.bypassVideoProgress,
        toggleTestMode,
        setAutoPassQuizzes,
        setBypassVideoProgress,
        canUseTestMode: isAdmin,
      }}
    >
      {children}
    </TestModeContext.Provider>
  );
}

export function useTestModeContext() {
  const context = useContext(TestModeContext);
  if (context === undefined) {
    throw new Error("useTestModeContext must be used within a TestModeProvider");
  }
  return context;
}

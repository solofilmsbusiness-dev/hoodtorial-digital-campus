import { useMemo } from "react";
import { differenceInDays } from "date-fns";

export interface LearningMetrics {
  avgWatchPercentage: number;
  lessonCompletionRate: number;
  quizScoreTrend: "improving" | "declining" | "stable";
  totalWatchTimeMinutes: number;
  engagementScore: number;
  engagementLabel: string;
  lastActivityAt: string | null;
  lastActivityDaysAgo: number | null;
  coursesWithNoProgress: string[];
  averageQuizScore: number;
  quizPassRate: number;
  totalQuizAttempts: number;
}

interface ProgressEntry {
  watch_percentage: number | null;
  watched_seconds: number | null;
  completed: boolean;
  course_code: string;
  updated_at: string;
}

interface QuizResult {
  score: number;
  total_questions: number;
  passed: boolean;
  created_at: string;
  course_code: string;
}

interface Enrollment {
  course_code: string;
  status: string;
}

interface AnalyticsInput {
  progress: ProgressEntry[];
  quizResults: QuizResult[];
  enrollments: Enrollment[];
}

function getEngagementLabel(score: number): string {
  if (score >= 80) return "Highly Engaged";
  if (score >= 60) return "Active Learner";
  if (score >= 40) return "Moderate";
  if (score >= 20) return "At Risk";
  return "Inactive";
}

function normalizeQuizScore(score: number, totalQuestions: number): number {
  // If score > totalQuestions, it's already stored as a percentage (legacy static quizzes)
  // Otherwise it's a raw correct count that needs conversion
  if (totalQuestions > 0 && score > totalQuestions) return Math.min(score, 100);
  if (totalQuestions > 0) return (score / totalQuestions) * 100;
  return 0;
}

function calculateQuizTrend(quizResults: QuizResult[]): "improving" | "declining" | "stable" {
  if (quizResults.length < 2) return "stable";

  // Sort by date ascending
  const sorted = [...quizResults].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Calculate scores as percentages (normalized for mixed formats)
  const scores = sorted.map((r) => normalizeQuizScore(r.score, r.total_questions));

  // Compare first half average to second half average
  const midpoint = Math.floor(scores.length / 2);
  const firstHalf = scores.slice(0, midpoint);
  const secondHalf = scores.slice(midpoint);

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;

  if (diff > 10) return "improving";
  if (diff < -10) return "declining";
  return "stable";
}

export function calculateLearningMetrics(input: AnalyticsInput): LearningMetrics {
  const { progress, quizResults, enrollments } = input;

  // Calculate average watch percentage
  const watchPercentages = progress
    .filter((p) => p.watch_percentage !== null && p.watch_percentage > 0)
    .map((p) => p.watch_percentage as number);
  const avgWatchPercentage =
    watchPercentages.length > 0
      ? Math.round(watchPercentages.reduce((a, b) => a + b, 0) / watchPercentages.length)
      : 0;

  // Calculate total watch time
  const totalWatchedSeconds = progress.reduce((sum, p) => sum + (p.watched_seconds || 0), 0);
  const totalWatchTimeMinutes = Math.round(totalWatchedSeconds / 60);

  // Calculate lesson completion rate
  const completedLessons = progress.filter((p) => p.completed).length;
  const totalLessons = progress.length;
  const lessonCompletionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Calculate quiz stats
  const passedQuizzes = quizResults.filter((r) => r.passed).length;
  const quizPassRate = quizResults.length > 0 ? Math.round((passedQuizzes / quizResults.length) * 100) : 0;
  
  const averageQuizScore =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce((sum, r) => sum + normalizeQuizScore(r.score, r.total_questions), 0) / quizResults.length
        )
      : 0;

  // Calculate quiz trend
  const quizScoreTrend = calculateQuizTrend(quizResults);

  // Find last activity
  const allDates = [
    ...progress.map((p) => p.updated_at),
    ...quizResults.map((r) => r.created_at),
  ].filter(Boolean);

  const lastActivityAt =
    allDates.length > 0
      ? allDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
      : null;

  const lastActivityDaysAgo = lastActivityAt
    ? differenceInDays(new Date(), new Date(lastActivityAt))
    : null;

  // Find courses with no progress
  const coursesWithProgress = new Set(progress.map((p) => p.course_code));
  const coursesWithNoProgress = enrollments
    .filter((e) => e.status === "active" && !coursesWithProgress.has(e.course_code))
    .map((e) => e.course_code);

  // Calculate activity recency score (0-100)
  let activityRecency = 0;
  if (lastActivityDaysAgo !== null) {
    if (lastActivityDaysAgo <= 1) activityRecency = 100;
    else if (lastActivityDaysAgo <= 3) activityRecency = 80;
    else if (lastActivityDaysAgo <= 7) activityRecency = 60;
    else if (lastActivityDaysAgo <= 14) activityRecency = 40;
    else if (lastActivityDaysAgo <= 30) activityRecency = 20;
    else activityRecency = 0;
  }

  // Calculate quiz consistency score (0-100) based on attempts
  let quizConsistency = 0;
  if (quizResults.length >= 5) quizConsistency = 100;
  else if (quizResults.length >= 3) quizConsistency = 70;
  else if (quizResults.length >= 1) quizConsistency = 40;

  // Calculate engagement score using weighted formula
  const engagementScore = Math.round(
    avgWatchPercentage * 0.30 +
    lessonCompletionRate * 0.25 +
    quizPassRate * 0.25 +
    activityRecency * 0.10 +
    quizConsistency * 0.10
  );

  return {
    avgWatchPercentage,
    lessonCompletionRate,
    quizScoreTrend,
    totalWatchTimeMinutes,
    engagementScore,
    engagementLabel: getEngagementLabel(engagementScore),
    lastActivityAt,
    lastActivityDaysAgo,
    coursesWithNoProgress,
    averageQuizScore,
    quizPassRate,
    totalQuizAttempts: quizResults.length,
  };
}

export function useStudentAnalytics(input: AnalyticsInput | null) {
  return useMemo(() => {
    if (!input) return null;
    return calculateLearningMetrics(input);
  }, [input]);
}

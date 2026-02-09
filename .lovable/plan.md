
# Fix: AI Learning Insights Show Incorrect Data for Students

## Problem

The AI Learning Insights panel shows inaccurate metrics because the analytics calculations produce wrong numbers. The root cause is a **mixed scoring format** in the `quiz_results` table:

- **New DB quizzes** (UUID-based quiz IDs) store `score` as the **raw correct count** (e.g., score=17, total_questions=20)
- **Old static quizzes** (string quiz IDs like `hu204-q1`) store `score` as a **percentage** (e.g., score=100, total_questions=5)

The analytics code in `useStudentAnalytics.ts` always calculates `(score / total_questions) * 100`, which produces correct results for DB quizzes (17/20 = 85%) but absurd numbers for static quizzes (100/5 = 2000%).

This corrupts the `averageQuizScore`, `quizPassRate`, `quizScoreTrend`, and `engagementScore` -- all of which feed into the AI prompt, producing nonsensical insights.

## Solution

Update the analytics calculation to detect which format each quiz result uses and normalize scores before averaging.

## Technical Changes

### 1. Update `src/hooks/useStudentAnalytics.ts`

Add a score normalization step in `calculateLearningMetrics()`:

- If `score > total_questions`, the score is already a percentage -- use it directly
- If `score <= total_questions`, it's a raw count -- convert to percentage via `(score / total_questions) * 100`

This handles both formats correctly:
- `score=17, total=20` -> 17 <= 20, so calculate (17/20)*100 = 85%
- `score=100, total=5` -> 100 > 5, so use 100 directly = 100%
- `score=60, total=5` -> 60 > 5, so use 60 directly = 60%

Apply this normalization to:
- `averageQuizScore` calculation (line ~94)
- `calculateQuizTrend()` function (line ~54)

### 2. Update `src/components/admin/AIInsightsPanel.tsx`

No changes needed -- it already passes `metrics.averageQuizScore` and other values from the analytics hook. Once the hook is fixed, the AI prompt will receive correct data.

### Summary

| File | Change |
|------|--------|
| `src/hooks/useStudentAnalytics.ts` | Add score normalization to handle mixed percentage/raw-count formats |

This is a small, targeted fix -- just adding a helper function to normalize quiz scores before they enter the analytics pipeline.

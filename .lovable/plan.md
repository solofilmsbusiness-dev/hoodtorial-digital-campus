

## Improve AI Learning Insights with Granular Student Data

### Problem
The AI Insights edge function currently receives only pre-aggregated summary metrics (e.g., "avgWatchPercentage: 45%", "quizPassRate: 60%"). It never sees the actual raw data -- individual quiz scores, per-lesson watch times, or per-course breakdowns. This means the AI is essentially commenting on numbers it could have computed itself, rather than analyzing real learning patterns.

### Solution
Have the edge function fetch granular student data directly from the database and build a rich, detailed prompt so the AI can identify specific problem areas, trends, and actionable insights.

### What Changes

**Edge Function: `supabase/functions/student-insights/index.ts`**

Instead of relying solely on the pre-computed metrics object from the client, the function will:

1. **Fetch per-course quiz results** from `quiz_results` table -- individual scores, dates, pass/fail for each quiz attempt, grouped by course
2. **Fetch per-lesson video progress** from `user_progress` table -- watch percentage and watched seconds for each lesson, grouped by course
3. **Fetch enrollment data** from `enrollments` table -- which courses, enrollment dates, status
4. **Fetch course titles** from `courses` table -- for readable output

The prompt will then include structured data like:

```text
COURSE-BY-COURSE BREAKDOWN:

Course: "Introduction to Cinematography" (CIN101)
  Enrolled: Jan 15, 2026
  Video Progress:
    - Lesson 1: 100% watched (12 min)
    - Lesson 2: 85% watched (8 min)
    - Lesson 3: 22% watched (3 min)  <-- dropped off here
    - Lesson 4: 0% watched
  Quiz Results:
    - Quiz 1: 80% (passed) - Jan 18
    - Quiz 2: 45% (failed) - Jan 22
    - Quiz 2 (retake): 55% (failed) - Jan 25  <-- struggling

Course: "Film Editing Fundamentals" (EDIT201)
  Enrolled: Feb 1, 2026
  Video Progress: No lessons started
  Quiz Results: None
```

This gives the AI real patterns to analyze: where students drop off in videos, which specific quizzes they're failing, whether they improve on retakes, and which courses they've abandoned.

**Client: `src/components/admin/AIInsightsPanel.tsx`**

Simplify the payload sent to the edge function -- just send `userId` and `studentName`. The edge function will fetch everything it needs from the database directly, ensuring it always has the most current and complete data.

### Technical Details

**File: `supabase/functions/student-insights/index.ts`**
- Create a Supabase service-role client (using `SUPABASE_SERVICE_ROLE_KEY`) so the function can read student data regardless of RLS
- Fetch from `user_progress`, `quiz_results`, `enrollments`, and `courses` tables filtered by the student's user ID
- Build a detailed per-course breakdown in the prompt text
- Include a timeline of activity (most recent quiz dates, last video watched)
- Include per-quiz score history to show retake patterns
- Keep the existing fallback logic but enhance it with per-course awareness
- Keep the same response JSON format so the frontend doesn't need major changes

**File: `src/components/admin/AIInsightsPanel.tsx`**
- Remove the `metrics` prop dependency for the edge function call
- Send only `{ userId, studentName }` in the request body
- Keep the `metrics` prop for local display in `StudentAnalyticsCard` (unchanged)
- Keep all existing UI rendering logic as-is

**No database changes required** -- all the data already exists in the tables.

### Files Affected
- `supabase/functions/student-insights/index.ts` -- major rewrite of data fetching and prompt building
- `src/components/admin/AIInsightsPanel.tsx` -- simplify the request payload




## Fix Progress Percentage Sync Between Active Courses and Journey

### Root Cause
The `useJourneyData` hook uses **hardcoded mock percentages** for course progress instead of real data:
- In-progress courses always show 40% in the Journey card
- Completed courses always show 100%
- The Student Center calculates real progress from actual lesson completions and quiz results

These two systems use completely different logic, so they never agree.

### Solution
Update `useJourneyData` to calculate real progress using the same data sources as the Student Center: `user_progress` records for lessons and `quiz_results` for quizzes. Also incorporate `useDbCourseCounts` so database-managed courses get accurate totals.

### Changes

**Modified: `src/hooks/useJourneyData.ts`**

1. Import `useQuizResults` and `useDbCourseCounts` hooks (same ones StudentCenter uses)
2. Replace the mock progress calculation (lines 198-200) with real data:
   - Count actual completed lessons from the `progress` array (records where `lesson_id` is set and `completed` is true)
   - Count actual passed quizzes from `quiz_results` (unique passed quiz IDs per course)
   - Use `dbCourseCounts` for lesson/quiz totals when available, falling back to static course data
   - Calculate percentage as `(completedLessons + passedQuizzes) / (totalLessons + totalQuizzes) * 100`
3. Fix the `in_progress` detection: instead of relying on the `inProgressCourseCodes` set (which only checks incomplete progress records), also consider courses with any completed lessons or passed quizzes that aren't fully complete

This ensures the Journey Progress Card, the Learning Journey page, and the Active Courses section all show identical percentages for the same course.

### Technical Detail

Current mock logic being replaced:
```
lessonsCompleted = isInProgress ? Math.floor(totalLessons * 0.4) : 0
percentage = isInProgress ? 40 : 0
```

New real logic (mirrors StudentCenter.getCourseProgress):
```
lessonsCompleted = progress.filter(p => p.course_code === code && p.lesson_id && p.completed).length
quizzesPassed = unique passed quiz IDs from quiz_results for this course
total = dbCourseCounts[code] or static fallback
percentage = Math.round((lessonsCompleted + quizzesPassed) / total * 100)
```

### Files

| File | Action |
|------|--------|
| `src/hooks/useJourneyData.ts` | Add `useQuizResults` and `useDbCourseCounts` imports; replace mock progress with real calculation |


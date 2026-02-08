

# Fix: Course Progress Percentages Always Showing 0% in Student Center

## Problem

The Student Center's `getCourseProgress()` function always prefers the **static course data** to count total lessons and quizzes. But after the recent change, course detail pages now use **database content** (with UUID-based lesson IDs). So:

- Students complete lessons tracked with DB UUIDs (e.g., `0e957dae-...`)
- But progress calculation counts totals from static modules (which may have different lesson counts or not exist at all)
- For DB-only courses, `useCourseStatus` returns `modules: []`, so total is always 0, meaning progress is always 0%

For HU-101, the database has 9 lessons + 3 quizzes, but the static version may have a completely different structure.

## Solution

Update `getCourseProgress()` in `StudentCenter.tsx` to fetch and use database module/lesson/quiz counts when available, falling back to static data only when the database has no content.

## Technical Changes

### 1. Create a new hook: `src/hooks/useDbCourseCounts.ts`

A lightweight hook that fetches lesson and quiz counts per course from the database. This avoids loading full module content -- just counts.

```typescript
// Queries:
// SELECT course_id, count(*) as lesson_count FROM lessons GROUP BY course_id
// SELECT course_id, count(*) as quiz_count FROM quizzes GROUP BY course_id
// JOIN with courses to map course_id -> course_code
```

Returns a map: `{ [courseCode]: { totalLessons: number, totalQuizzes: number } }`

### 2. Update `getCourseProgress()` in `src/pages/StudentCenter.tsx`

Change the progress calculation to:
1. First check if DB counts are available for the course
2. If yes, use DB counts for total lessons/quizzes
3. If no, fall back to static course module counts (existing behavior)

This ensures that courses edited via admin (with DB content) calculate progress correctly against the actual DB content structure.

### 3. Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useDbCourseCounts.ts` | Create | Hook to fetch lesson/quiz counts per course from DB |
| `src/pages/StudentCenter.tsx` | Edit | Use DB counts in `getCourseProgress()` when available |

### Why This Works

- Progress records already track `course_code` correctly regardless of ID format
- The `completedLessons` count (line 171) just counts progress records with `lesson_id && completed` -- this works with both static and DB IDs
- Only the **total** count was wrong because it came from static modules -- fixing the total fixes the percentage


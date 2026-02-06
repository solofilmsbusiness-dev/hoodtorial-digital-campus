

# Fix: Course Progress Percentage Mismatch Between Student Center and Course Detail

## Problem

The Student Center and Course Detail page calculate course progress differently, causing mismatched percentages:

- **Student Center** (`getCourseProgress` in `StudentCenter.tsx`, line 169-171): Counts a lesson as complete if `completed === true` **OR** `watch_percentage >= 90%`
- **Course Detail** (`getModuleProgress` in `useLessonProgress.ts`, line 194-198): Counts a lesson as complete **only** if `completed === true`

This means the Student Center can show a higher percentage than the Course Detail page for the same course, because it's counting partially-watched videos (90%+) as complete even if the student never clicked "Mark Complete."

## Root Cause

When the 90% watch requirement was removed (so students can skip videos), the `useLessonProgress.ts` hook was updated but the `getCourseProgress` function in `StudentCenter.tsx` was not -- it still has the old `watch_percentage >= 90` fallback.

## Fix

### `src/pages/StudentCenter.tsx` (lines 169-171)

Remove the `watch_percentage >= 90` fallback from the progress calculation. Only count lessons where `completed === true`, matching the logic used in `useLessonProgress.ts`.

**Before:**
```typescript
const completedLessons = courseProgress.filter(p => 
  p.lesson_id && (p.completed || (p.watch_percentage ?? 0) >= 90)
).length;
```

**After:**
```typescript
const completedLessons = courseProgress.filter(p => 
  p.lesson_id && p.completed
).length;
```

This single-line change aligns both progress calculations to the same logic: a lesson is only "complete" when explicitly marked complete by the student.

## Files

| File | Change |
|------|--------|
| `src/pages/StudentCenter.tsx` | Remove `watch_percentage >= 90` fallback from `getCourseProgress` (line 170) |


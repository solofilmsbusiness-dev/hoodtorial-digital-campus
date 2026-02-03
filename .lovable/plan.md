
# Fix: Course Actions 404 and Student Detail Sheet Glitching

## Problem 1: Course Actions Causing 404

**Root Cause**: In `CourseManager.tsx`, the "View" button links to `/course/${course.code}`. When navigating, if the course code is missing or empty, it results in `/course/` which triggers the NotFound page.

The issue is that when clicking "View" for a course that exists in static data but not yet in the database, the course object's `code` might be working, but the actual problem is that the route `/course/:code` expects the CourseDetail page to find the course via `getCourseByCode()` which only searches static data. New courses created in admin exist only in the database and are not found.

**Fix**: Update CourseManager to check if a course exists before navigation, or show a toast for courses not yet viewable.

---

## Problem 2: StudentDetailSheet Infinite Re-render Loop

**Root Cause**: The `fetchQuizResultsWithAnswers` function in `useAdminQuizManagement.ts` is not memoized with `useCallback`. This causes:

1. Every render of `StudentDetailSheet` gets a new function reference
2. The `useEffect` depends on this function
3. Effect runs, sets state, triggers re-render
4. New function reference, effect runs again... infinite loop!

This explains the "glitching and flashing" behavior.

**Fix**: Wrap `fetchQuizResultsWithAnswers` in `useCallback` to maintain a stable reference.

---

## Implementation Plan

### File 1: `src/hooks/useAdminQuizManagement.ts`

**Change**: Wrap `fetchQuizResultsWithAnswers` function in `useCallback` to prevent infinite re-renders.

Before:
```typescript
const fetchQuizResultsWithAnswers = async (userId: string) => { ... }
```

After:
```typescript
const fetchQuizResultsWithAnswers = useCallback(async (userId: string) => { ... }, []);
```

Also wrap the delete functions with `useCallback` for consistency and performance.

### File 2: `src/pages/admin/CourseManager.tsx`

**Change**: Add safety check for empty course codes and provide better navigation feedback.

Current:
```tsx
<Link to={`/course/${course.code}`}>
```

Improved:
- Check if the course code is valid before rendering the link
- For newly created admin courses that don't exist in static data, show a different action (preview not available) or navigate to the editor instead

---

## Technical Details

### useCallback Fix

```typescript
import { useState, useCallback } from "react";  // Add useCallback import

// Wrap the function
const fetchQuizResultsWithAnswers = useCallback(async (userId: string): Promise<QuizResultDetail[]> => {
  // ... existing implementation
}, []);  // Empty dependency array - function doesn't depend on external values
```

### CourseManager Link Safety

Option A - Disable view for courses not in static catalog:
```tsx
{staticCourses.some(s => s.code === course.code) ? (
  <Button variant="ghost" size="icon" asChild>
    <Link to={`/course/${course.code}`}>
      <Eye className="h-4 w-4" />
    </Link>
  </Button>
) : (
  <Button variant="ghost" size="icon" disabled title="Preview not available">
    <Eye className="h-4 w-4 opacity-50" />
  </Button>
)}
```

Option B - Always link but let CourseDetail handle it gracefully (current behavior is fine since CourseDetail shows "Course Not Found")

Recommended: Option A for better UX - admin knows immediately if preview is available.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useAdminQuizManagement.ts` | Wrap async functions in `useCallback` to prevent infinite re-renders |
| `src/pages/admin/CourseManager.tsx` | Add visual indicator for courses without preview |

---

## Summary

This fix addresses:
1. **Infinite re-render loop** - The main cause of "glitching and flashing" when viewing student details
2. **404 confusion** - Better UX for admin when viewing courses not yet in the public catalog

The key insight is that the `useEffect` in StudentDetailSheet depends on `fetchQuizResultsWithAnswers`, and without `useCallback`, that function gets a new identity on every render, causing the effect to re-run continuously.

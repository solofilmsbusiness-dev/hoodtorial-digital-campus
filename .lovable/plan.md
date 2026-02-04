
# Fix Swap Course Dialog to Show Database Courses

## Problem

The `SwapCourseDialog` component only shows courses from the static `src/data/courses.ts` file. New courses created through the admin panel (like "Advanced VFX Tracking") are stored in the database and are not included in this static list.

The issue is on line 19 of `SwapCourseDialog.tsx`:
```typescript
import { courses } from "@/data/courses";
```

This imports only the hardcoded static courses, missing any database-only courses.

---

## Solution

Use the `useCourseStatus` hook inside `SwapCourseDialog` to get all published courses (both static and database). This hook already exists and correctly merges courses from both sources.

---

## Implementation

### File: `src/components/enrollment/SwapCourseDialog.tsx`

**Changes:**

1. Import the `useCourseStatus` hook instead of static courses
2. Get the list of published courses from the hook
3. Filter available courses from this dynamic list
4. Handle the loading state while courses are being fetched

**Code Changes:**

```typescript
// Before
import { courses } from "@/data/courses";

// After  
import { useCourseStatus } from "@/hooks/useCourseStatus";
```

```typescript
// Inside the component, use the hook
const { courses, isLoading: coursesLoading } = useCourseStatus();

// Filter available courses using the dynamic list
const availableCourses = courses.filter(
  (c) => !enrolledCourseCodes.includes(c.code) && c.code !== fromCourseCode
);

// Also filter out "coming soon" courses that can't be enrolled in
const enrollableCourses = availableCourses.filter(c => !c.isComingSoon);
```

---

## Additional Improvements

1. **Filter out "Coming Soon" courses** - Courses marked as locked/coming soon should not appear in the swap list since users can't enroll in them

2. **Loading state** - Show a loading indicator while courses are being fetched from the database

3. **Empty state** - Show a message if there are no available courses to swap to

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/enrollment/SwapCourseDialog.tsx` | Replace static import with `useCourseStatus` hook; filter out coming soon courses; add loading state |

---

## Result

After implementation:
- All published courses (static + database) will appear in the swap dropdown
- "Advanced VFX Tracking" and other newly created courses will be available
- Coming soon courses are excluded since they can't be enrolled in
- Users see a loading state while courses are fetched

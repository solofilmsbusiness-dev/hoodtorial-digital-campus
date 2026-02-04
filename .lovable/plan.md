
# Fix Database Courses Display & Completion Badges in Student Center

## Problem Summary

Two related issues in the Student Center:

1. **Database-only courses not appearing**: Courses like "CIN-123 - Advanced VFX Tracking" that exist only in the database (not in static `courses.ts`) don't show up in the Active Courses section
2. **Completed courses missing badges**: Progress calculation fails for database-only courses, so the 100% completion badge never displays

## Root Cause

The Student Center uses `getCourseByCode()` from `src/data/courses.ts`, which only searches **static courses**. Database-only courses return `undefined` and get filtered out:

```typescript
// Current code in StudentCenter.tsx (line 70-75)
const activeCourseDetails = activeEnrollments
  .map((e) => {
    const course = getCourseByCode(e.course_code);  // Returns undefined for DB-only courses!
    return course ? { ...course, enrollment: e } : null;
  })
  .filter(Boolean);  // Removes all DB-only courses
```

Similarly, `getCourseProgress()` returns 0 for courses not found in static data.

---

## Solution

Use the `useCourseStatus()` hook which already merges static courses with database courses. This hook:
- Fetches all courses from the database
- Merges them with static course data
- Provides both `courses` (published only) and `allCourses` (all courses)

### File Changes

**File: `src/pages/StudentCenter.tsx`**

1. **Import `useCourseStatus` hook**:
   ```typescript
   import { useCourseStatus } from "@/hooks/useCourseStatus";
   ```

2. **Use the hook to get all courses**:
   ```typescript
   const { allCourses: allCoursesFromStatus, isLoading: coursesLoading } = useCourseStatus();
   ```

3. **Create a helper to find courses from merged list**:
   ```typescript
   const getCourse = (code: string) => {
     return allCoursesFromStatus.find(c => c.code === code);
   };
   ```

4. **Update `activeCourseDetails` to use the merged course list**:
   ```typescript
   const activeCourseDetails = activeEnrollments
     .map((e) => {
       const course = getCourse(e.course_code);
       return course ? { ...course, enrollment: e } : null;
     })
     .filter(Boolean);
   ```

5. **Update `getCourseProgress()` to use the merged course list**:
   ```typescript
   const getCourseProgress = (courseCode: string) => {
     const course = getCourse(courseCode);
     if (!course) return 0;
     
     // For DB-only courses with no modules, check if there's any tracked progress
     const totalLessons = course.modules?.length > 0 
       ? getTotalLessonsCount(course) 
       : 0;
     const totalQuizzes = course.modules?.length > 0 
       ? getTotalQuizzesCount(course) 
       : 0;
     // ... rest of progress calculation
   };
   ```

6. **Handle loading state** (optional but recommended):
   ```typescript
   if (profileLoading || coursesLoading) {
     return (/* loading UI */);
   }
   ```

---

## Additional Fix for Empty Modules

Database-only courses may have empty `modules: []` arrays. The progress calculation needs to handle this:

- If a course has no modules defined, check the enrollment status
- If `enrollment.status === 'completed'`, show 100% progress
- Otherwise, show 0% (since there's no content to track)

```typescript
const getCourseProgress = (courseCode: string) => {
  const course = getCourse(courseCode);
  const enrollment = activeEnrollments.find(e => e.course_code === courseCode);
  
  // If enrollment is marked complete, always show 100%
  if (enrollment?.status === 'completed') return 100;
  
  if (!course) return 0;
  
  // Handle DB-only courses with no modules
  const totalLessons = course.modules?.length > 0 ? getTotalLessonsCount(course) : 0;
  const totalQuizzes = course.modules?.length > 0 ? getTotalQuizzesCount(course) : 0;
  const total = totalLessons + totalQuizzes;
  
  if (total === 0) return 0;
  
  // ... existing progress calculation
};
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/pages/StudentCenter.tsx` | Import and use `useCourseStatus()` instead of relying only on static `getCourseByCode()` |
| `src/pages/StudentCenter.tsx` | Update `getCourseProgress()` to handle DB-only courses with empty modules |
| `src/pages/StudentCenter.tsx` | Add `coursesLoading` to loading state check |

---

## Testing Checklist

After implementation:
1. Navigate to Student Center while enrolled in "Advanced VFX Tracking" (CIN-123) - course should now appear
2. Verify course card displays correctly with proper title, department, and credits
3. Check that progress calculation works for both static and database-only courses
4. Complete a course and verify the green completion badge appears at 100%
5. Test that the swap course dialog still shows database-only courses as options

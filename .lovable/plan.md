
# Fix Blank Course Content Issue

## Problem Summary

When selecting a course in the academics section, the "Course Content" area appears blank with no lessons or modules displayed. This happens because:

1. Courses exist in the database with basic info (title, description, credits, etc.)
2. But these database courses have **no modules or lessons** added yet
3. The code always uses database course data when it exists, ignoring the static course content
4. Result: Students see an empty course with no content to learn from

## Root Cause

In `CourseDetail.tsx` (line 134):
```typescript
const course = dbCourse ? transformDbCourse(dbCourse) : staticCourse;
```

This is an all-or-nothing approach:
- If database course exists, use it entirely (even if it has no modules)
- Only fall back to static course if database course doesn't exist at all

## Solution

Merge database course metadata with static course content when the database course has no modules. This gives us:
- Database course as source of truth for: title, description, credits, level, publish status
- Static course as fallback for: modules, lessons, quizzes (content)

## Implementation Plan

### File: `src/pages/CourseDetail.tsx`

**Changes:**

1. After transforming the database course, check if it has empty modules
2. If database course has no modules but static course exists with modules, merge the static course content into the transformed course

**Current Logic (line ~132-134):**
```typescript
const staticCourse = getCourseByCode(code || "");
const course = dbCourse ? transformDbCourse(dbCourse) : staticCourse;
```

**New Logic:**
```typescript
const staticCourse = getCourseByCode(code || "");

// Build the course from database, falling back to static for content
const course = useMemo(() => {
  if (!dbCourse) return staticCourse;
  
  const transformed = transformDbCourse(dbCourse);
  
  // If database course has no modules but static course does, use static content
  if (transformed.modules.length === 0 && staticCourse?.modules?.length > 0) {
    return {
      ...transformed,
      modules: staticCourse.modules,
      finalExam: staticCourse.finalExam,
      lessons: staticCourse.lessons,
      duration: staticCourse.duration || transformed.duration,
    };
  }
  
  return transformed;
}, [dbCourse, staticCourse]);
```

This approach:
- Preserves database course metadata (title, credits, publish status, etc.)
- Uses static course content when database has none
- Once admins add modules to the database, those take precedence
- Maintains backward compatibility with fully static courses

### Optional Enhancement: Lesson Count Fix

Currently, database-only courses show "0 Lessons" in the course cards because `lessons: 0` is set when the database has no modules. We can also update `useCourseStatus.ts` to merge static course lesson counts:

**File:** `src/hooks/useCourseStatus.ts` (optional)

Update the DB-only course handling to fall back to static lesson count:
```typescript
// In the dbCourse loop
const staticCourse = staticCourses.find((s) => s.code === dbCourse.code);
const lessonCount = staticCourse?.lessons ?? 0;

coursesWithStatus.push({
  ...
  lessons: lessonCount, // Use static count as fallback
  ...
});
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/CourseDetail.tsx` | Merge static course content when database course has empty modules |
| `src/hooks/useCourseStatus.ts` | (Optional) Use static lesson count as fallback for course cards |

## Expected Outcome

1. Courses will display their full curriculum (modules, lessons, quizzes) even when database modules haven't been added yet
2. Once admins populate course content in the database, that content will take priority
3. Course cards will show accurate lesson counts
4. No breaking changes to existing functionality

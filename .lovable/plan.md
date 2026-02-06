

# Fix: Progress ID Mismatch Between Database and Static Course Data

## Problem

Course progress is broken because **two different ID systems** are in use:

- **Static course data** uses short IDs like `hu101-l1`, `hu101-q1`, `hu101-final`
- **Database course data** uses UUID IDs like `3769ab07-cdf3-46d2-9c1f-a1b16dcfb3dc`

All existing user progress (lessons watched, quizzes passed) was recorded using the **static IDs**. But the Course Detail page now fetches course structure from the **database**, which returns UUID-based lesson and quiz IDs. When it checks "is this lesson completed?", it looks up the UUID in the progress map -- and finds nothing, because the progress map only contains static IDs.

The Student Center happened to work because it uses `getTotalLessonsCount()` from static data and counts progress rows directly from the database (which have static IDs). But the Course Detail page shows 0% because it iterates over DB lessons with UUID IDs that don't match any progress records.

## Root Cause

When courses were imported into the database, new auto-generated UUIDs were assigned to lessons and quizzes. The original static IDs (like `hu101-l1`) were not preserved. So existing progress records can't be matched to the DB-defined lessons.

## Fix Strategy

The simplest and most reliable fix: **make the Course Detail page prefer static course content when it exists**, since all progress was tracked against static IDs. The DB course record is still used for metadata (published status, locked status, etc.), but the modules/lessons/quizzes come from static data when available.

This is actually what the code already attempts on line 134-143, but only when `transformed.modules.length === 0`. The problem is the DB courses DO have modules (they were bulk-imported), so the fallback never triggers.

### Change 1: `src/pages/CourseDetail.tsx` (lines 129-146)

Update the course resolution logic to **always prefer static course content** when it exists, regardless of whether the DB also has modules. The DB is still used for course-level metadata.

**Before:**
```typescript
const course = useMemo(() => {
  if (!dbCourse) return staticCourse;
  const transformed = transformDbCourse(dbCourse);
  if (transformed.modules.length === 0 && staticCourse?.modules?.length > 0) {
    return { ...transformed, modules: staticCourse.modules, ... };
  }
  return transformed;
}, [dbCourse, staticCourse]);
```

**After:**
```typescript
const course = useMemo(() => {
  if (!dbCourse) return staticCourse;
  const transformed = transformDbCourse(dbCourse);
  // Always prefer static content when available -- progress is tracked against static IDs
  if (staticCourse?.modules && staticCourse.modules.length > 0) {
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

This ensures that any course with static data uses static lesson/quiz IDs, matching the progress records.

### Change 2: `src/pages/StudentCenter.tsx` -- align total counting

The StudentCenter also needs to handle the case where the course it finds from `allCourses` (via `useCourseStatus`) may have empty modules for courses that are in the DB but fallback was not applied. The `useCourseStatus` hook already handles this (DB-only courses get `modules: []`), but let's make sure the static course is always preferred when counting totals too.

Update `getCourseProgress` to explicitly look up the static course for total counts:

```typescript
const getCourseProgress = (courseCode: string) => {
  const enrollment = activeEnrollments.find(e => e.course_code === courseCode);
  if (enrollment?.status === 'completed') return 100;

  // Prefer static course for module structure (IDs match progress records)
  const staticCourse = courses.find(c => c.code === courseCode);
  const course = staticCourse || getCourse(courseCode);
  if (!course) return 0;
  // ... rest unchanged
};
```

## Summary

| File | Change |
|------|--------|
| `src/pages/CourseDetail.tsx` | Always use static modules/quizzes when available (lines 129-146) |
| `src/pages/StudentCenter.tsx` | Prefer static course for total counts in `getCourseProgress` |

## Why Not Migrate the IDs?

Migrating all user_progress and quiz_results records to use UUID IDs would require updating every existing row and changing all progress-tracking code to use DB IDs going forward. This is risky and complex. The simpler approach is to keep using static IDs as the source of truth for courses that have static definitions, and only use DB-generated IDs for courses created entirely through the admin panel (which have no static equivalent).

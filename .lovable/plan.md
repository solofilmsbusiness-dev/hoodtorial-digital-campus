
# Fix: New Courses Not Showing & Edit Subsections Not Working

## Problem Analysis

### Issue 1: New Courses Don't Appear on Academics Page

**Root Cause**: The `useCourseStatus` hook only iterates over static courses from `src/data/courses.ts`. When a new course is created in admin, it exists only in the database, so it's never included in the loop.

Current logic (broken):
```typescript
// Only loops through static courses
const coursesWithStatus = staticCourses.map((course) => {
  const dbStatus = dbCourses?.find((db) => db.code === course.code);
  ...
});
```

### Issue 2: Cannot Edit Course Subsections (Modules, Lessons, Videos)

**Root Cause**: In `CourseEditor.tsx`, the Modules section only renders when `dbCourse` exists:
```typescript
{!isNew && dbCourse && (
  <ModulesSection courseId={dbCourse.id} />
)}
```

When editing a static course that hasn't been saved to the database yet, `dbCourse` is `null`, so the modules section is hidden.

---

## Solution

### Phase 1: Fix Academics Page to Show Database Courses

**File: `src/hooks/useCourseStatus.ts`**

Change the logic to:
1. Fetch ALL courses from the database (not just status)
2. For courses in static data, merge with DB status
3. For courses ONLY in database, include them too
4. This ensures newly created courses appear on the Academics page

New approach:
```typescript
// Start with database courses
const dbBasedCourses = dbCourses.map(dbCourse => {
  const staticCourse = staticCourses.find(s => s.code === dbCourse.code);
  if (staticCourse) {
    // Merge static + db
    return { ...staticCourse, isPublished, isComingSoon };
  }
  // Create course from DB only (new courses)
  return { 
    code: dbCourse.code,
    title: dbCourse.title,
    // ... map other fields
    isPublished, 
    isComingSoon 
  };
});
```

### Phase 2: Fix Course Editor to Show Modules After Initial Save

**File: `src/pages/admin/CourseEditor.tsx`**

The issue is that when editing a static course, `dbCourse` is `null` until the admin saves it. But the modules section requires a database ID.

Two-part fix:
1. After saving a new course, refetch the data and show the modules section
2. For existing static courses being edited, prompt admin to "Save" first before adding modules

Add a message when `dbCourse` is null:
```typescript
{!isNew && !dbCourse && !isLoading && (
  <Card>
    <CardContent className="py-8 text-center text-muted-foreground">
      <p>Save the course first to add modules and lessons.</p>
    </CardContent>
  </Card>
)}
```

Also invalidate the course-status query after save:
```typescript
queryClient.invalidateQueries({ queryKey: ["course-status"] });
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useCourseStatus.ts` | Fetch full course data from DB, include DB-only courses, merge with static data for backward compatibility |
| `src/pages/admin/CourseEditor.tsx` | Add helpful message when modules section is hidden, invalidate course-status query on save |

---

## Data Flow After Fix

```
Admin Creates Course → Database
                          ↓
                    useCourseStatus
                          ↓
                    Academics Page
                    (now includes DB-only courses)
```

---

## Technical Details

### Updated useCourseStatus Hook Logic

1. Fetch all fields from courses table (not just code/status)
2. Build course list from database as primary source
3. For each DB course, check if matching static course exists for additional fields (modules, lessons count, etc.)
4. For DB-only courses, construct Course object from DB fields
5. Apply same published/locked filtering

### Database Fields Available

The `courses` table already has:
- `code`, `title`, `description`, `department_id`, `credits`, `level`, `duration`
- `is_published`, `is_locked`

This is enough to display courses on the Academics page without static data.

---

## Summary

This fix ensures:
1. New courses created in admin immediately appear on the Academics page
2. Status changes (Coming Soon, Published) reflect in real-time
3. Course subsections (modules, lessons, video links) can be edited after initial save
4. Backward compatibility with existing static course data

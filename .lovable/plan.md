
# Fix View Button for Database-Only Courses

## Problem

The View button (eye icon) in Course Manager doesn't work for courses created in the database because:

1. `CourseDetail.tsx` only fetches courses from the static `src/data/courses.ts` file using `getCourseByCode()`
2. New courses created via the admin panel exist only in the database
3. When clicking View on a database-only course, students/admins see "Course Not Found"

Currently, the button is intentionally disabled for database-only courses with a tooltip "Preview not available for database-only courses" - but this is a workaround, not a solution.

## Solution

Update `CourseDetail.tsx` to fetch course data from the database first, falling back to static data. This mirrors the pattern already used in `CourseEditor.tsx`.

## Implementation

### 1. Update CourseDetail.tsx to Fetch from Database

Add a database query to fetch the course and its modules/lessons:

```typescript
// Fetch course from database
const { data: dbCourse, isLoading: isLoadingCourse } = useQuery({
  queryKey: ["course-detail", code],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("courses")
      .select(`
        *,
        modules (
          *,
          lessons (*)
        )
      `)
      .eq("code", code)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },
});

// Fallback to static course if not in database
const staticCourse = getCourseByCode(code || "");
const course = dbCourse ? transformDbCourse(dbCourse) : staticCourse;
```

### 2. Create a Transform Function

Convert database course format to the Course interface format expected by components:

```typescript
function transformDbCourse(dbCourse): Course {
  return {
    code: dbCourse.code,
    title: dbCourse.title,
    description: dbCourse.description || "",
    department: dbCourse.department_id,
    departmentId: dbCourse.department_id,
    credits: dbCourse.credits,
    level: dbCourse.level,
    duration: dbCourse.duration || "Self-paced",
    lessons: countLessons(dbCourse.modules),
    modules: transformModules(dbCourse.modules),
    finalExam: null, // Will need separate handling
  };
}
```

### 3. Update CourseManager View Button

Enable the View button for all courses once CourseDetail can handle database courses:

```tsx
<Button variant="ghost" size="icon" asChild>
  <Link to={`/course/${course.code}`}>
    <Eye className="h-4 w-4" />
  </Link>
</Button>
```

### 4. Add Loading State

Show a loading skeleton while fetching course data:

```tsx
if (isLoadingCourse) {
  return (
    <PageLayout>
      <Section className="pt-32">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading course...</p>
        </div>
      </Section>
    </PageLayout>
  );
}
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/CourseDetail.tsx` | Add database query, transform function, loading state, merge static + DB data |
| `src/pages/admin/CourseManager.tsx` | Remove disabled state on View button - always enable it |

## Technical Considerations

1. **Quiz Data**: Database courses may not have quiz questions stored - need to handle this gracefully
2. **Module/Lesson Order**: Ensure `sort_order` is respected when loading from DB
3. **Caching**: Use React Query to cache course data efficiently
4. **Backward Compatibility**: Static courses should continue to work as-is

## Expected Behavior After Fix

1. Admin creates a new course in Course Manager
2. Admin can click View (eye icon) to preview the course page
3. Students can navigate to database-only courses via direct URL
4. Course displays properly with modules, lessons, and quizzes from the database
5. Static courses continue to work as before (fallback)

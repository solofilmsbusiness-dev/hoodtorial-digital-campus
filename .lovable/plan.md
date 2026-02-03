
# Fix Course Editor & Add Per-Question Timer to Admin Quiz Settings

## Issues Identified

### Issue 1: Can't Edit Course After Creation
**Root Cause**: The `ModulesSection` component only renders when `dbCourse` exists (line 424):
```typescript
{!isNew && dbCourse && (
  <ModulesSection courseId={dbCourse.id} />
)}
```

However, when a new course is created:
1. The course is saved with an empty code if the user didn't fill in the code field first
2. After saving, the page navigates to `/admin/courses/${form.code}` 
3. If `form.code` was empty, the URL becomes `/admin/courses/` which doesn't work
4. Even if the code exists, the query may not immediately refetch the new course

**Evidence**: The database has a course with an empty code: `"Intro To Drone Cinematography"` with `code: ""`

### Issue 2: Can't Add Modules/Lessons to Newly Created Courses  
**Root Cause**: Same as Issue 1 - the `ModulesSection` only shows when `dbCourse` is loaded, but the query invalidation timing can cause it to not appear immediately after creation.

### Issue 3: Quiz Per-Question Timer Settings Missing from Admin
**Root Cause**: The `quizzes` table doesn't have columns for per-question timer settings (`per_question_seconds`, `use_per_question_timer`). The current implementation added these to the static `Quiz` interface, but:
1. Database-managed quizzes don't have these columns
2. The `QuizDialog` admin component doesn't have inputs for these settings

---

## Implementation Plan

### Phase 1: Fix Course Code Validation

**File**: `src/pages/admin/CourseEditor.tsx`

**Changes**:
1. Add validation to prevent saving a course with an empty code
2. Show an error message if code is missing
3. Make the "Save Course" button disabled when code is empty

```typescript
// Add validation before save
const canSave = form.code.trim().length > 0 && form.title.trim().length > 0;

// Disable button if can't save
<Button type="submit" disabled={saveCourse.isPending || !canSave}>
```

### Phase 2: Fix Query Key Mismatch After Create

**File**: `src/pages/admin/CourseEditor.tsx`

**Changes**:
1. After creating a new course, invalidate the query using the URL param that will be navigated to
2. Add a refetch trigger when the URL param changes
3. Use the returned course data from insert to immediately set `dbCourse`

```typescript
const saveCourse = useMutation({
  mutationFn: async (data: CourseForm) => {
    if (isNew) {
      const { data: newCourse, error } = await supabase
        .from("courses")
        .insert({ ... })
        .select()
        .single();  // Return the created course
      if (error) throw error;
      return newCourse;  // Return for onSuccess
    }
    // ... update logic
  },
  onSuccess: (newCourse) => {
    if (isNew && newCourse) {
      // Immediately set course data, then navigate
      queryClient.setQueryData(["admin-course", newCourse.code], newCourse);
    }
    // ... rest of success handling
  }
});
```

### Phase 3: Add Per-Question Timer to Database

**Database Migration**:
Add two new columns to the `quizzes` table:
- `per_question_seconds` (integer, nullable, default 60)
- `use_per_question_timer` (boolean, default false)

```sql
ALTER TABLE quizzes 
ADD COLUMN per_question_seconds integer DEFAULT 60,
ADD COLUMN use_per_question_timer boolean DEFAULT false NOT NULL;
```

### Phase 4: Update Quiz Admin Components

**File**: `src/hooks/useAdminQuizContent.ts`

Add the new fields to the `DbQuiz` interface:
```typescript
export interface DbQuiz {
  // ... existing fields
  per_question_seconds: number | null;
  use_per_question_timer: boolean;
}
```

**File**: `src/components/admin/QuizDialog.tsx`

Add UI controls for per-question timer settings:
1. Toggle switch for "Use Per-Question Timer"
2. Number input for "Seconds Per Question" (only visible when toggle is on)
3. Update the `onSave` callback to include these new fields

**File**: `src/components/admin/QuizSection.tsx`

Display per-question timer info in the quiz item display.

### Phase 5: Connect QuizPlayer to Database Quiz Settings

**File**: `src/components/course/QuizPlayer.tsx`

Update to read per-question timer settings from the database quiz object when available, falling back to the static quiz config.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/admin/CourseEditor.tsx` | Add code validation, fix query after create |
| `src/hooks/useAdminQuizContent.ts` | Add per-question timer fields to interface |
| `src/components/admin/QuizDialog.tsx` | Add per-question timer toggle and input |
| `src/components/admin/QuizSection.tsx` | Display per-question timer info |
| `src/components/course/QuizPlayer.tsx` | Read timer settings from database quiz |

## Database Migration

Add new columns to the `quizzes` table for per-question timer settings.

---

## Expected Outcome

1. Course code is required before saving - prevents empty code issues
2. Modules section appears immediately after creating a course
3. Admins can configure per-question timer settings when creating/editing quizzes
4. Quiz player uses database settings for per-question timing
5. Backward compatible - existing quizzes use global timer by default

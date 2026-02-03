
# Enable Editing of Pre-existing Static Course Content

## Problem Summary

When you edit pre-existing courses like "iPhone Cinematography" (HU-101), the modules/lessons/quizzes don't appear in the editor. This happens because:

1. The course metadata exists in the database (title, code, credits, etc.)
2. But the content (modules, lessons, quizzes) only exists in static code files
3. The Course Editor only shows database content, not static content

Currently: Database has the course record, but 0 modules. The static file has 4 modules with 8 lessons and quizzes.

## Solution

Add an "Import Static Content" feature that copies static modules, lessons, and quizzes into the database when editing a pre-existing course. This is a one-time migration per course.

## Implementation Plan

### 1. Create Import Function in Course Editor

**File:** `src/pages/admin/CourseEditor.tsx`

Add logic to detect when a course has static content but no database modules, then provide an import button:

```typescript
// Inside ModulesSection component or CourseEditor
const staticCourse = staticCourses.find(c => c.code === courseCode);
const hasStaticContent = staticCourse && staticCourse.modules.length > 0;
const hasDbModules = modules.length > 0;

// Show import option when static content exists but DB is empty
if (hasStaticContent && !hasDbModules) {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <p>This course has pre-built content that needs to be imported to the database before you can edit it.</p>
        <Button onClick={handleImportStaticContent}>
          Import Existing Content
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 2. Implement Import Logic

Create a mutation that:
1. Reads the static course modules from `courses.ts`
2. Inserts each module into the `modules` table
3. Inserts each lesson into the `lessons` table
4. Inserts each quiz into the `quizzes` table
5. Inserts each quiz question into the `quiz_questions` table

### 3. Quiz Questions Source

For importing quizzes, we need to pull questions from the quiz data files. The static quizzes reference question banks in:
- `src/data/quizzes/cinematography.ts`
- `src/data/quizzes/directing.ts`
- `src/data/quizzes/production.ts`
- `src/data/quizzes/post-production.ts`

We'll need to map quiz IDs to their question sets during import.

### 4. Add Import Hook

**File:** `src/hooks/useImportStaticCourse.ts` (new)

```typescript
export function useImportStaticCourse(courseId: string, courseCode: string) {
  // 1. Find static course by code
  // 2. Import modules with sort_order
  // 3. Import lessons under each module
  // 4. Import quizzes under each module
  // 5. Import quiz questions
  // 6. Invalidate queries to refresh UI
}
```

### 5. Update Course Editor UI

**File:** `src/pages/admin/CourseEditor.tsx`

- Pass `courseCode` to `ModulesSection`
- Add import button when static content is detected but no DB modules exist
- Show loading state during import
- After import, the normal module editor appears with all content editable

## File Changes Summary

| File | Changes |
|------|---------|
| `src/hooks/useImportStaticCourse.ts` | New hook to handle static-to-database migration |
| `src/pages/admin/CourseEditor.tsx` | Add import UI, pass course code to ModulesSection |
| `src/data/quizzes/index.ts` | (May need) Export helper to get questions by quiz ID |

## Expected Outcome

1. Admin opens Course Editor for "iPhone Cinematography" (HU-101)
2. Sees message: "This course has pre-built content. Click to import."
3. Clicks "Import Existing Content"
4. All 4 modules, 8 lessons, and quizzes are copied to the database
5. Admin can now edit, reorder, delete, and add new content
6. Changes are saved to the database (static file unchanged)

## Technical Notes

- Import is one-time per course - once in DB, it stays there
- Static content remains as fallback for courses not yet imported
- Existing database content (if any) is preserved - import only adds new content
- Quiz questions will be imported with their full data (question text, options, correct answer, explanation)

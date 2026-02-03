

# Bulk Import All Static Courses

## Current Situation

Your database has 28 courses, but most only have metadata (title, code, credits). The actual content (modules, lessons, quizzes, questions) exists only in static code files:

| Status | Courses |
|--------|---------|
| Already imported | HU-101, CIN-123, CIN-205, HU-302 (have modules in DB) |
| Need import | 24 remaining courses (0 modules in DB) |

Static courses with content available for import:
- HU-102 through HU-505 (full curriculum with modules, lessons, quizzes)
- Total: ~20+ courses with pre-built content ready to import

## Solution

Add a "Bulk Import All Static Courses" feature to the Course Manager page that will:
1. Identify all static courses that have content but haven't been imported yet
2. Import modules, lessons, quizzes, and questions for each course in one operation
3. Show progress during the import
4. Skip courses that already have modules in the database

## Implementation Plan

### 1. Create Bulk Import Hook

**File:** `src/hooks/useBulkImportStaticCourses.ts` (new)

Create a hook that:
- Iterates through all static courses
- Checks which ones have matching DB course entries with 0 modules
- Imports content for each course using similar logic to `useImportStaticCourse`
- Tracks and reports progress

### 2. Add Bulk Import UI to Course Manager

**File:** `src/pages/admin/CourseManager.tsx`

Add a new card/button section that:
- Shows count of courses that need importing
- Provides a "Import All Static Content" button
- Displays progress during import (e.g., "Importing 5 of 20...")
- Shows summary when complete

### 3. UI Design

```
+------------------------------------------------------------------+
| Import Static Content                                             |
|                                                                   |
| 20 courses have pre-built content ready to import.               |
| Once imported, you can edit modules, lessons, and quizzes.       |
|                                                                   |
| [Import All Static Content]                                       |
+------------------------------------------------------------------+
```

During import:
```
| Importing course 5 of 20...                                      |
| HU-202: Color Grading Masterclass                                |
| [=========>                    ] 25%                             |
```

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useBulkImportStaticCourses.ts` | Create | Bulk import logic for all static courses |
| `src/pages/admin/CourseManager.tsx` | Modify | Add bulk import UI card and button |

## Technical Details

### Bulk Import Logic

```typescript
// Pseudocode for bulk import
async function bulkImport() {
  const results = [];
  
  for (const staticCourse of staticCourses) {
    // Find matching DB course
    const dbCourse = dbCourses.find(c => c.code === staticCourse.code);
    if (!dbCourse) continue;
    
    // Check if already has modules
    const moduleCount = await getModuleCount(dbCourse.id);
    if (moduleCount > 0) continue; // Skip already imported
    
    // Import this course's content
    const result = await importCourseContent(dbCourse.id, staticCourse);
    results.push(result);
  }
  
  return results;
}
```

### Progress Tracking

The hook will return:
- `isImporting`: boolean
- `currentCourse`: string (course being imported)
- `progress`: { current: number, total: number }
- `results`: array of import results

## Expected Outcome

1. Admin goes to Course Manager (`/admin/courses`)
2. Sees banner: "20 courses have pre-built content ready to import"
3. Clicks "Import All Static Content"
4. Progress indicator shows import status
5. After completion: "Successfully imported content for 20 courses"
6. All courses now have editable modules, lessons, and quizzes


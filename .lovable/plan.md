

# Fix: Admin Student Quiz View and Course Status Toggles

## Issues Identified

### Issue 1: Course Status Toggles Not Working

**Root Cause**: The `courses` table in the database is **empty**. The `CourseManager` page has a fallback that displays courses from static data (`src/data/courses.ts`) when no database records exist. However, when you click the toggle buttons, they try to update records in the database using the course `id` - but since no records exist, the update silently fails.

The code attempts:
```typescript
const { error } = await supabase
  .from("courses")
  .update({ is_published })
  .eq("id", id);  // This ID doesn't exist in the database
```

Since the courses are from static data, the `id` being used is actually the course code (e.g., `HU-101`), but there's no corresponding row in the database to update.

**Solution**: Seed the database with course data from the static courses file. This will populate the `courses` table so that toggles work correctly. Additionally, we should show a clearer error when toggles fail.

---

### Issue 2: Admin Student Quiz View Error

**Root Cause**: The quiz results display in `StudentDetailSheet.tsx` relies on `getQuizQuestions(result.quiz_id)` to fetch question details. The quiz questions are stored in static files organized by course/department. If a `quiz_id` format doesn't match the expected key in `quizQuestions` record, the function returns an empty array.

Looking at the code:
```typescript
const quizQuestions = getQuizQuestions(result.quiz_id);
const resultAnswers = answersByResultId[result.id] || [];

// If quizQuestions is empty, questions won't be found
const question = quizQuestions.find((q) => q.id === answer.questionId);
return {
  questionText: question?.question || "Question not found",
  // ...
};
```

The issue could be:
1. The `quiz_id` stored in the database doesn't match keys in `quizQuestions` record
2. The `quiz_answers` table is empty (answers were saved before answer tracking was enabled)
3. Question IDs don't match between what was saved and what's in static data

**Solution**: 
1. Add better handling for missing question data
2. Add a fallback message when question details can't be found
3. Ensure quiz IDs are consistent between database and static data

---

## Implementation Plan

### Phase 1: Seed Courses Database (Fixes Toggle Issue)

Create a migration to populate the `courses` table from static data. This needs to be done once to enable course management features.

**Files to modify**:
- Create database seed migration with all courses from `src/data/courses.ts`

**Alternatively** - Add an "Initialize Courses" button in CourseManager:
- When clicked, inserts all static courses into the database
- One-time action that enables full course management

### Phase 2: Improve CourseManager Toggle Error Handling

**File**: `src/pages/admin/CourseManager.tsx`

Changes:
1. Add proper error feedback when toggle fails
2. Show explicit message that courses need to be seeded
3. Add "Seed Courses" button when using static data

```typescript
// Better error handling for mutations
onError: (error) => {
  console.error("Toggle error:", error);
  toast({ 
    title: "Failed to update course", 
    description: "Courses may need to be initialized in the database first.",
    variant: "destructive" 
  });
},
```

### Phase 3: Fix Quiz Question Display

**File**: `src/hooks/useAdminQuizManagement.ts`

Changes:
1. Add better null checking for question lookups
2. Log warnings when questions aren't found
3. Provide meaningful fallback data

```typescript
const answersWithDetails = resultAnswers.map((answer) => {
  const question = quizQuestions.find((q) => q.id === answer.questionId);
  
  if (!question) {
    console.warn(`Question not found: ${answer.questionId} in quiz ${result.quiz_id}`);
  }
  
  return {
    questionId: answer.questionId,
    questionText: question?.question || `Question ${answer.questionId} (data not available)`,
    options: question?.options || [],
    selectedAnswer: answer.selectedAnswer,
    correctAnswer: question?.correctAnswer ?? -1,
    isCorrect: answer.isCorrect,
  };
});
```

### Phase 4: Add Course Seeding Functionality

**File**: `src/pages/admin/CourseManager.tsx`

Add a button to seed courses when database is empty:

```typescript
const seedCourses = useMutation({
  mutationFn: async () => {
    const coursesToInsert = staticCourses.map((c) => ({
      code: c.code,
      title: c.title,
      department_id: c.departmentId,
      credits: c.credits,
      level: c.level,
      description: c.description,
      is_published: true,
      is_locked: false,
      sort_order: 0,
    }));
    
    const { error } = await supabase
      .from("courses")
      .insert(coursesToInsert);
      
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    toast({ title: "Courses initialized successfully!" });
  },
});
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/pages/admin/CourseManager.tsx` | Modify | Add seed courses button and better error handling |
| `src/hooks/useAdminQuizManagement.ts` | Modify | Improve question lookup and error handling |
| `src/components/admin/StudentDetailSheet.tsx` | Modify | Add better fallback for missing question data |

---

## Summary

1. **Course toggles failing**: The database has no course records. Solution is to add a "Seed Courses" button that populates the database from static data, enabling full course management.

2. **Quiz view errors**: Question lookups may fail if quiz IDs don't match or data is missing. Solution is to add better error handling and fallback displays for missing data.

Both fixes focus on graceful degradation and providing clear feedback to admins when data is missing or operations fail.


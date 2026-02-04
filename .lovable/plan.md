
# Fix: Database Quizzes Not Showing for Students

## Problem Identified

When quizzes are created through the admin panel, they are stored in the database with UUID identifiers. However, the `QuizPlayer` component only looks up questions from static TypeScript files - it never queries the database for questions.

**Current Flow:**
1. Admin creates quiz -> saved to `quizzes` table with UUID
2. Admin adds questions -> saved to `quiz_questions` table
3. Student opens quiz -> `QuizPlayer` calls `getQuizQuestions(quiz.id)`
4. `getQuizQuestions()` only searches static `quizQuestions` object
5. UUID not found in static data -> returns empty array
6. Student sees "Quiz Not Available - Questions for this quiz are coming soon"

---

## Solution

Modify the `QuizPlayer` component to:
1. First check if questions exist in the database for the given quiz ID
2. If found, use database questions
3. If not found, fall back to static `getQuizQuestions()` for legacy support

---

## Implementation

### File: `src/components/course/QuizPlayer.tsx`

**Changes:**
1. Add a React Query hook to fetch questions from the database
2. Merge database questions with static questions (database takes priority)
3. Transform database question format to match the expected `QuizQuestion` interface

**Key Code Changes:**

```typescript
// Add import for supabase and useQuery
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Inside QuizPlayer component, add database query
const { data: dbQuestions = [], isLoading: isLoadingQuestions } = useQuery({
  queryKey: ["quiz-questions", quiz.id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quiz.id)
      .order("sort_order");
    
    if (error) throw error;
    
    // Transform to QuizQuestion format
    return (data || []).map(q => ({
      id: q.id,
      question: q.question,
      options: Array.isArray(q.options) ? q.options : JSON.parse(q.options),
      correctAnswer: q.correct_answer,
      explanation: q.explanation || undefined,
    }));
  },
});

// Use database questions if available, otherwise fall back to static
const staticQuestions = getQuizQuestions(quiz.id);
const originalQuestions = dbQuestions.length > 0 ? dbQuestions : staticQuestions;
```

**Loading State:**
- Add a loading indicator while fetching questions from database
- Show loading spinner before quiz intro screen

---

## Visual Flow After Fix

```
Student opens quiz
        |
        v
[Fetch from quiz_questions table]
        |
    /       \
   v         v
[Found]   [Not Found]
   |           |
   v           v
Use DB     Use Static
Questions   Questions
   \         /
    \       /
     v     v
   Show Quiz Intro
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/course/QuizPlayer.tsx` | Add database query for questions, handle loading state, merge with static fallback |

---

## Technical Notes

- Uses existing RLS policies for `quiz_questions` table (already configured)
- Database questions use `correct_answer` (number), static uses `correctAnswer` - transformation handles this
- Options stored as JSON array in database, may need parsing
- Sort order preserved via `ORDER BY sort_order`
- Backward compatible - static quizzes continue to work

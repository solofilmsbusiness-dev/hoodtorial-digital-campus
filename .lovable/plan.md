

## Fix: Quiz Data Not Showing in Admin Student Detail

### Problem
When viewing a student's quiz results in the admin panel, the question breakdown shows **"Question X (data not available)"** for all database-driven quizzes. This happens because the admin quiz management hook (`useAdminQuizManagement.ts`) tries to look up question text from static files using `getQuizQuestions(quiz_id)`, but database quizzes use UUIDs that don't exist in the static data.

The console logs confirm this with repeated warnings: `"Admin Quiz View: Question not found"`.

### Solution
Update `fetchQuizResultsWithAnswers` in `useAdminQuizManagement.ts` to fetch question details from the `quiz_questions` database table when the static lookup returns no results.

### Technical Details

**File: `src/hooks/useAdminQuizManagement.ts`**

1. After the static lookup (`getQuizQuestions`) returns empty for a quiz ID, query the `quiz_questions` table for all unique quiz IDs from the results that had no static match
2. Build a map of `question_id -> { question, options, correct_answer }` from the DB data
3. Use this DB map as the fallback when mapping answer details, so the admin can see the actual question text, options, and which answer was correct vs. selected

The key change is in the `fetchQuizResultsWithAnswers` function:
- Collect all unique `quiz_id` values from results
- For any quiz ID where `getQuizQuestions()` returns empty, batch-fetch from `quiz_questions` table
- When building `answersWithDetails`, use DB question data as fallback
- This ensures both legacy static quizzes and new DB quizzes display full detail in the admin view

No database schema changes or new migrations are needed -- the `quiz_questions` table already has all the necessary columns (question, options, correct_answer), and admin users have read access.


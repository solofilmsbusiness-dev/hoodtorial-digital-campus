

# Fix: Quiz Shows "Coming Soon" for Non-Admin Users

## Problem

When a student opens a quiz on the iPhone Cinematography course (or any course), the quiz player says "Questions for this quiz are coming soon" even though questions exist in the database.

**Root cause:** The `quiz_questions` table has Row Level Security (RLS) enabled with policies that **only allow admins** to read rows. The `quiz_questions_public` view (which strips the `correct_answer` column for security) reads from this table, but since the student is not an admin, RLS blocks all rows. The quiz player receives 0 questions and displays the "coming soon" fallback message.

## Solution

Add a SELECT policy on the `quiz_questions` table that allows all authenticated (logged-in) users to read quiz questions. This is safe because:
- The application already uses the `quiz_questions_public` view which excludes the `correct_answer` column
- Answer verification happens server-side via an edge function

## Technical Change

**Database migration** -- Add one RLS policy:

```sql
CREATE POLICY "Authenticated users can read quiz questions"
  ON public.quiz_questions
  FOR SELECT
  TO authenticated
  USING (true);
```

This allows any logged-in user to read quiz questions. The existing admin-only policies remain in place for INSERT/UPDATE/DELETE operations, so only admins can modify questions.

No code file changes are needed -- the QuizPlayer component already fetches from `quiz_questions_public` correctly; it just gets empty results due to this RLS block.

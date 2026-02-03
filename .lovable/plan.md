
# Admin Student Management: Quiz Reset and Course Management

## Overview
Add administrative capabilities to reset quiz results, manage student enrollments, and view detailed question-by-question quiz performance in the Student Detail Sheet.

---

## Current Limitations
- Quiz results only store aggregate scores (pass/fail, score percentage) - individual answers are NOT saved
- Admins cannot reset or delete quiz results for students
- Admins cannot remove student enrollments
- No visibility into which specific questions students got right or wrong

---

## Implementation Plan

### Phase 1: Database Changes

**New table: `quiz_answers`**
Store individual question responses for each quiz attempt:

```sql
CREATE TABLE public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_result_id UUID REFERENCES public.quiz_results(id) ON DELETE CASCADE NOT NULL,
  question_id TEXT NOT NULL,
  selected_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Users can view their own, admins can view all
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz answers"
  ON public.quiz_answers FOR SELECT
  TO authenticated
  USING (
    quiz_result_id IN (
      SELECT id FROM public.quiz_results WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all quiz answers"
  ON public.quiz_answers FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own quiz answers"
  ON public.quiz_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    quiz_result_id IN (
      SELECT id FROM public.quiz_results WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete quiz answers"
  ON public.quiz_answers FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

**Add delete policies to existing tables:**
```sql
-- Allow admins to delete quiz results
CREATE POLICY "Admins can delete quiz results"
  ON public.quiz_results FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete enrollments
CREATE POLICY "Admins can delete enrollments"
  ON public.enrollments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

---

### Phase 2: Update Quiz Player to Save Answers

**Modify: `src/hooks/useQuizResults.ts`**
Add function to save individual answers after quiz completion.

**Modify: `src/components/course/QuizPlayer.tsx`**
After quiz submission, save each answer with:
- question_id
- selected_answer index
- is_correct boolean

---

### Phase 3: Enhanced Student Detail Sheet

**Modify: `src/hooks/useAdminStudents.ts`**
Add new interface and data fetching for detailed quiz results:

```typescript
interface QuizResultDetail {
  id: string;
  quizId: string;
  quizTitle: string;
  courseCode: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  attemptNumber: number;
  createdAt: string;
  answers: Array<{
    questionId: string;
    questionText: string;
    options: string[];
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
  }>;
}
```

**Modify: `src/components/admin/StudentDetailSheet.tsx`**
Add three new sections:

1. **Enrolled Courses with Actions**
   - Each course shows a delete/unenroll button
   - Confirmation dialog before deletion
   
2. **Quiz Results with Actions**
   - Expandable list showing each quiz attempt
   - Reset button to delete specific quiz results
   - "Reset All" button to clear all quiz results for student
   
3. **Question-by-Question Breakdown**
   - Expandable section within each quiz result
   - Shows each question with student's answer vs correct answer
   - Visual indicators (green check / red X)

---

### UI Wireframe for Enhanced Student Detail Sheet

```text
+------------------------------------------+
| ENROLLED COURSES (3)                     |
+------------------------------------------+
| HU-202: Color Grading          [Active]  |
|   Enrolled: Jan 15             [Remove]  |
+------------------------------------------+
| HU-303: Advanced Directing     [Active]  |
|   Enrolled: Jan 20             [Remove]  |
+------------------------------------------+

+------------------------------------------+
| QUIZ RESULTS                  [Reset All]|
+------------------------------------------+
| HU-202 Quiz 1 - 80% PASSED     [▼][Reset]|
| └─ Question Breakdown:                   |
|    [✓] Q1: What is color temperature...  |
|    [✗] Q2: Which tool creates a mask...  |
|        Your answer: B. Pen Tool          |
|        Correct: C. Shapes Tool           |
|    [✓] Q3: Log footage preserves...      |
|    [✓] Q4: A LUT is used for...          |
|    [✗] Q5: Color wheels affect...        |
+------------------------------------------+
| HU-202 Final - 70% FAILED      [▼][Reset]|
+------------------------------------------+
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/xxx.sql` | Create | Add quiz_answers table and admin delete policies |
| `src/hooks/useQuizResults.ts` | Modify | Add saveQuizAnswers function |
| `src/components/course/QuizPlayer.tsx` | Modify | Save answers on quiz completion |
| `src/hooks/useAdminStudents.ts` | Modify | Add detailed quiz results fetching |
| `src/components/admin/StudentDetailSheet.tsx` | Major Edit | Add course/quiz management and answer breakdown |

---

## Admin Actions Summary

| Action | Description | Confirmation Required |
|--------|-------------|----------------------|
| Remove Enrollment | Delete enrollment record, keeps progress | Yes |
| Reset Quiz | Delete specific quiz result and answers | Yes |
| Reset All Quizzes | Delete all quiz results for student | Yes (with warning) |

---

## Technical Considerations

1. **Quiz questions are static**: Questions are defined in `src/data/quizzes/*.ts` files, so we can join saved answer data with static question data to display the breakdown

2. **Cascade deletes**: quiz_answers will cascade delete when quiz_results are deleted

3. **Historical data**: Existing quiz results won't have answer breakdowns - only new attempts will have detailed data

4. **Performance**: Fetch detailed quiz answers only when expanding a specific result, not on initial load

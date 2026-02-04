
# Fix Quiz Score Calculation & Improve Quiz Completion State

## ✅ COMPLETED

### Changes Made

1. **`src/lib/quizUtils.ts`**: Added `calculateCorrectCount()` function that returns raw correct count instead of percentage.

2. **`src/components/course/QuizPlayer.tsx`**: 
   - Now stores `correctCount` (raw count) in database instead of percentage
   - Uses `scorePercent` for display and pass/fail logic
   - Fixed both `handleFinishQuiz` and `handleTimeExpired` to store raw counts

3. **`src/pages/StudentGrades.tsx`**: No changes needed - formula `(score / total_questions) * 100` was correct, just needed correct data

4. **`src/hooks/useStudentAnalytics.ts`**: No changes needed - same formula was correct

5. **Quiz button states**: Already implemented correctly in `LockedQuizCard.tsx` - shows "Passed", "Retake", or attempt count

6. **60-second timer**: Already implemented (line 89 in QuizPlayer.tsx)

### Testing
New quiz attempts will store raw count. To verify:
1. Take a quiz with 5 questions, get 3 correct
2. Database should store `score: 3`, `total_questions: 5`
3. StudentGrades page should show 60% average

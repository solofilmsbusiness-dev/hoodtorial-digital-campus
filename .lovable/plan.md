
# Fix Quiz Score Calculation & Improve Quiz Completion State

## Problems to Fix

### 1. Average Quiz Score Shows 1200% (Critical Bug)
The database stores `score` as a percentage (0-100) from `calculateShuffledScore()`, but also stores `total_questions`. When calculating averages, the code does:

```javascript
(score / total_questions) * 100  // = (60 / 5) * 100 = 1200%
```

This happens in:
- `src/pages/StudentGrades.tsx` (line 35)
- `src/hooks/useStudentAnalytics.ts` (line 108)

### 2. Quiz Button Should Show Completion Status Better
When a quiz is passed, the button should clearly indicate "Completed" rather than offering to "Start Quiz". When failed, it should show "Retake Quiz" with attempt count.

### 3. 60-Second Timer Already Implemented
The QuizPlayer already enforces a 60-second per-question timer (lines 88-89 in QuizPlayer.tsx). No changes needed here.

---

## Solution

**Option: Fix the score storage to be consistent**

Store the **raw correct count** in the `score` field instead of percentage. This makes calculations intuitive and prevents confusion.

---

## Implementation Details

### File 1: `src/lib/quizUtils.ts`

Create a new function to get raw correct count instead of percentage:

```typescript
export function calculateCorrectCount(
  answers: Record<string, number>,
  shuffledQuestions: ShuffledQuestion[]
): number {
  let correct = 0;
  shuffledQuestions.forEach((q) => {
    const userAnswer = answers[q.id];
    if (userAnswer !== undefined && userAnswer === q.shuffledCorrectAnswer) {
      correct++;
    }
  });
  return correct;
}
```

### File 2: `src/components/course/QuizPlayer.tsx`

Update the score saving logic to store **correct count** instead of percentage:

**Changes:**
1. Import `calculateCorrectCount` from quizUtils
2. Add `const correctCount = calculateCorrectCount(answers, shuffledQuestions);`
3. Calculate percentage for display: `const scorePercent = shuffledQuestions.length > 0 ? Math.round((correctCount / shuffledQuestions.length) * 100) : 0;`
4. Use `correctCount` when saving to database
5. Use `scorePercent` for display and passing logic

```typescript
// Line ~99: Add correct count
const correctCount = useMemo(() => 
  shuffledQuestions.filter(q => answers[q.id] === q.shuffledCorrectAnswer).length,
  [answers, shuffledQuestions]
);

const scorePercent = shuffledQuestions.length > 0 
  ? Math.round((correctCount / shuffledQuestions.length) * 100) 
  : 0;

const passed = scorePercent >= quiz.passingScore;

// In handleFinishQuiz (line ~158):
await saveQuizResult({
  quiz_id: quiz.id,
  course_code: courseCode,
  score: correctCount,  // Changed from percentage to raw count
  total_questions: shuffledQuestions.length,
  passed,
  time_taken_seconds: timeTaken,
}, ...);
```

Update results display to show percentage properly:
```typescript
// Line ~548: Results display
<div className="text-7xl font-black mb-2">
  {scorePercent}%  // Use scorePercent instead of score
</div>
```

### File 3: `src/pages/StudentGrades.tsx`

The calculation is already correct (`(r.score / r.total_questions) * 100`), but now it will work properly since `score` will be the raw count:

```typescript
const averageScore = totalQuizzes > 0 
  ? Math.round(results.reduce((sum, r) => sum + (r.score / r.total_questions) * 100, 0) / totalQuizzes)
  : 0;
```

No changes needed here - the formula was correct, the data was wrong.

### File 4: `src/hooks/useStudentAnalytics.ts`

Same situation - the formula is correct:
```typescript
const averageQuizScore =
  quizResults.length > 0
    ? Math.round(
        quizResults.reduce((sum, r) => sum + (r.score / r.total_questions) * 100, 0) / quizResults.length
      )
    : 0;
```

No changes needed - will work correctly once score stores raw count.

### File 5: `src/hooks/useQuizResults.ts`

Update `instantPassQuiz` to store correct count instead of matching total:
```typescript
// Line ~140: Already correct! score: totalQuestions means 100%
score: totalQuestions,  // This is correct - raw count
```

### File 6: Update Existing Data (Optional)

For existing bad data in the database, we can provide an admin fix or migration. The existing records where `score > total_questions` are the ones with the percentage bug.

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/lib/quizUtils.ts` | Add `calculateCorrectCount()` function for raw count |
| `src/components/course/QuizPlayer.tsx` | Store raw correct count, display percentage separately |
| `src/pages/StudentGrades.tsx` | No changes needed (formula was correct) |
| `src/hooks/useStudentAnalytics.ts` | No changes needed (formula was correct) |
| `src/hooks/useQuizResults.ts` | Already correct (instantPassQuiz stores count) |

---

## Testing Checklist

After implementation:
1. Take a quiz with 5 questions, get 3 correct
2. Verify database stores `score: 3`, `total_questions: 5`
3. Check StudentGrades page shows 60% average (not 1200%)
4. Check admin analytics shows correct averages
5. Verify quiz completion state shows correctly in course view

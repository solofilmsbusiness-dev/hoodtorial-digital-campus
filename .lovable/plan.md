

# Save Quiz Progress to Student Center

## Overview
Connect the quiz system to save all student quiz attempts to the database, so progress appears in the Student Center dashboard and Grades page. Currently, quizzes work but results aren't persisted.

---

## Current State

The database and hooks are already set up:
- `quiz_results` table exists with proper security policies
- `user_progress` table tracks lesson and course completion
- `useQuizResults` hook has a `saveQuizResult()` function ready to use
- Student Center already displays quiz results from the database

**The missing link:** The `QuizPlayer` component doesn't call `saveQuizResult()` when a quiz is completed.

---

## What Will Change

### 1. Update QuizPlayer Component
Modify `src/components/course/QuizPlayer.tsx` to:
- Accept the `courseCode` as a prop (needed for saving)
- Track start time to calculate `time_taken_seconds`
- Call `saveQuizResult()` when quiz is completed
- Show a saving indicator briefly

### 2. Update CourseDetail Page
Modify `src/pages/CourseDetail.tsx` to:
- Import and use `useQuizResults` hook
- Pass `courseCode` to QuizPlayer
- Use real quiz completion data from the database to show progress
- Import and use `useUserProgress` for lesson tracking
- Calculate actual progress percentages from database

### 3. Update Module Components
Modify `src/components/course/ModuleAccordion.tsx` and `QuizCard.tsx` to:
- Show completed state for quizzes the user has passed
- Pass completion status from parent based on database records

---

## Data Flow

```text
User completes quiz in QuizPlayer
         |
         v
QuizPlayer.onComplete() called
         |
         v
saveQuizResult() inserts into quiz_results table
         |
         v
useQuizResults hook updates local state
         |
         v
CourseDetail recalculates progress from results
         |
         v
Progress card & module indicators update
         |
         v
Student Center shows new result in "Recent Quiz Results"
```

---

## Technical Details

### QuizPlayer Changes

Add new props:
- `courseCode: string` - Required to save which course the quiz belongs to

Add state:
- `startTime: number` - Track when quiz started for time calculation
- `isSaving: boolean` - Show loading state during save

Modified completion logic:
```typescript
// When quiz finishes, save to database
const handleQuizComplete = async () => {
  const timeTaken = Math.round((Date.now() - startTime) / 1000);
  
  await saveQuizResult({
    quiz_id: quiz.id,
    course_code: courseCode,
    score: correctAnswers,
    total_questions: questions.length,
    passed: score >= quiz.passingScore,
    time_taken_seconds: timeTaken,
  });
  
  onComplete?.(score, passed);
};
```

### CourseDetail Changes

Use hooks to get real data:
```typescript
const { results, saveQuizResult } = useQuizResults();
const { progress } = useUserProgress();

// Calculate completed quizzes for this course
const courseQuizResults = results.filter(r => r.course_code === course.code);
const passedQuizzes = courseQuizResults.filter(r => r.passed);

// Check if specific quiz is passed
const isQuizPassed = (quizId: string) => 
  courseQuizResults.some(r => r.quiz_id === quizId && r.passed);
```

Pass to components:
```typescript
<QuizPlayer
  quiz={activeQuiz}
  courseCode={course.code}
  onComplete={handleQuizComplete}
  saveQuizResult={saveQuizResult}
/>

<QuizCard
  quiz={module.quiz}
  isCompleted={isQuizPassed(module.quiz.id)}
/>
```

### Progress Card Updates

Show real numbers based on database:
```typescript
const completedLessons = progress.filter(
  p => p.course_code === course.code && p.lesson_id && p.completed
).length;

const completedQuizzes = passedQuizzes.length;
const progressPercent = Math.round(
  ((completedLessons + completedQuizzes) / (totalLessons + totalQuizzes)) * 100
);
```

---

## User Experience

### During Quiz
1. User starts quiz - timer begins
2. User answers questions
3. User clicks "Finish" on last question
4. Brief "Saving..." indicator appears
5. Results screen shows with score

### After Completing Quiz
- Quiz card shows checkmark if passed
- Progress card updates percentage
- Lesson/Quiz counts update
- Toast notification confirms save

### In Student Center
- New result appears in "Recent Quiz Results"
- Stats update (quizzes passed, credits)
- Grades page shows full history

---

## Files to Modify

1. `src/components/course/QuizPlayer.tsx`
   - Add courseCode prop
   - Add time tracking
   - Add save logic with loading state

2. `src/pages/CourseDetail.tsx`
   - Import useQuizResults and useUserProgress
   - Calculate real progress from database
   - Pass courseCode and save function to QuizPlayer
   - Pass completion status to QuizCard

3. `src/components/course/ModuleAccordion.tsx`
   - Accept quiz completion status
   - Pass to QuizCard

4. `src/components/course/QuizCard.tsx`
   - Already supports `isCompleted` prop (no changes needed)

---

## Authentication Requirement

Quiz saving requires the user to be logged in. For logged-out users:
- Quizzes still work (practice mode)
- Results are not saved
- Optional: Show a prompt encouraging login to save progress

---

## Summary

This connects the existing quiz system to the database:
- Quiz results persist when students complete quizzes
- Progress shows on the course page in real-time
- Student Center dashboard reflects actual progress
- Grades page shows full quiz history
- All data is already secured with row-level security policies


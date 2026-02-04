

# Auto-Complete Courses When Reaching 100% Progress

## Problem

When students complete all lessons and pass all quizzes in a course, the progress shows as 100% visually, but:
- The enrollment `status` remains "active" in the database
- The course doesn't appear in the "Your Achievements" section
- There's no automatic mechanism to mark the course as "completed"

Currently, the `completeCourse()` function exists in `useEnrollments` but is never called.

## Solution

Add automatic course completion detection that triggers when:
1. A quiz is passed (in case it's the final quiz/exam)
2. A lesson is marked complete (in case there are no quizzes or it's the last piece of content)

After each of these events, check if progress has reached 100%, and if so, call `completeCourse()`.

---

## Changes Overview

### File 1: `src/pages/CourseDetail.tsx`

1. **Destructure `completeCourse` from `useEnrollments`**

2. **Create a completion check function** that calculates current progress and triggers course completion:
   ```typescript
   const checkAndCompleteCourse = useCallback(async () => {
     if (!enrolled || !course) return;
     
     // Calculate current completion
     let completedLessons = 0;
     let completedQuizzes = 0;
     
     course.modules.forEach((module) => {
       module.lessons.forEach((lesson) => {
         if (isLessonCompleted(lesson.id)) completedLessons++;
       });
       if (module.quiz && isQuizActuallyPassed(module.quiz.id)) completedQuizzes++;
     });
     
     if (course.finalExam && isQuizActuallyPassed(course.finalExam.id)) {
       completedQuizzes++;
     }

     const totalLessons = getTotalLessonsCount(course);
     const totalQuizzes = getTotalQuizzesCount(course);
     const total = totalLessons + totalQuizzes;
     const completed = completedLessons + completedQuizzes;
     
     if (completed >= total && total > 0) {
       await completeCourse(course.code);
     }
   }, [course, enrolled, isLessonCompleted, isQuizActuallyPassed, completeCourse]);
   ```

3. **Update `handleQuizComplete`** to check for course completion after a quiz is passed:
   ```typescript
   const handleQuizComplete = async (score: number, passed: boolean) => {
     toast({...});
     
     if (passed) {
       // Small delay to allow quiz result to be saved and state to update
       setTimeout(() => {
         checkAndCompleteCourse();
       }, 500);
     }
   };
   ```

4. **Update `handleMarkComplete`** (lesson completion) to also check for course completion:
   ```typescript
   const handleMarkComplete = async () => {
     // ... existing logic ...
     
     await markLessonComplete(course.code, activeLesson.id, 0);
     
     // Check if course is now complete
     setTimeout(() => {
       checkAndCompleteCourse();
     }, 500);
   };
   ```

---

## Technical Details

### Why `isQuizActuallyPassed` instead of `isQuizPassed`?

The `isQuizPassed` function in `useLessonProgress` returns `true` in Test Mode for all quizzes (for unlock bypass). But for completion calculation, we need the **real** status, so we use `isQuizActuallyPassed` which always returns the actual database value.

### Why use `setTimeout`?

The quiz results and lesson progress are saved asynchronously. A small delay ensures the progress data has been updated before we calculate the total completion percentage.

### Handling Edge Cases

- **Courses with no modules**: If `total === 0`, don't mark as complete
- **Already completed**: `completeCourse` should handle idempotency (won't fail if called twice)
- **Empty courses**: The check `total > 0` prevents auto-completing courses with no content

---

## Summary

| File | Changes |
|------|---------|
| `src/pages/CourseDetail.tsx` | Add `completeCourse` from useEnrollments, create `checkAndCompleteCourse()` helper, call it after quiz pass and lesson completion |

---

## Expected Behavior After Fix

1. Student completes final quiz of CIN-123 → quiz passes
2. System checks progress: 2/2 lessons complete + 1/1 quiz passed = 100%
3. `completeCourse("CIN-123")` is called automatically
4. Database updates enrollment `status` from "active" to "completed"
5. Student sees CIN-123 in the "Your Achievements" section with certification badge


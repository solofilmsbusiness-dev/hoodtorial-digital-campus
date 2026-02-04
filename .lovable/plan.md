

# Add Progress Tracking to Enrollment Management Cards

## Problem

The `EnrollmentManagementCard` components in the Student Center currently show 0% progress for all courses. The `getCourseProgress` function in `StudentCenter.tsx` (lines 93-104) is a placeholder that always returns 0:

```typescript
const getCourseProgress = (courseCode: string) => {
  const course = getCourseByCode(courseCode);
  if (!course) return 0;
  
  // Return a placeholder - in a real implementation, we'd calculate from lesson progress
  return 0;
};
```

## Solution

Calculate actual lesson completion percentage for each enrolled course using the existing `user_progress` data from `useUserProgress` and quiz results from `useQuizResults`.

---

## Implementation

### File: `src/pages/StudentCenter.tsx`

**Changes:**

1. Import the necessary functions from courses data:
   - `getTotalLessonsCount` and `getTotalQuizzesCount` for total counts

2. Replace the placeholder `getCourseProgress` function with actual calculation logic that:
   - Counts completed lessons from `user_progress` data
   - Counts passed quizzes from quiz results
   - Calculates percentage: `(completedLessons + completedQuizzes) / (totalLessons + totalQuizzes) * 100`

3. The calculation will follow the same logic as `CourseDetail.tsx`:
   - A lesson is complete if `progress.completed === true` OR `watch_percentage >= 90`
   - A quiz is complete if there's a passed result

**Code Changes:**

```typescript
// Add to imports
import { getTotalLessonsCount, getTotalQuizzesCount } from "@/data/courses";

// Get user progress data from the hook
const { progress } = useUserProgress();

// Replace getCourseProgress function
const getCourseProgress = (courseCode: string) => {
  const course = getCourseByCode(courseCode);
  if (!course) return 0;
  
  const totalLessons = getTotalLessonsCount(course);
  const totalQuizzes = getTotalQuizzesCount(course);
  const total = totalLessons + totalQuizzes;
  
  if (total === 0) return 0;
  
  // Count completed lessons for this course
  const courseProgress = progress.filter(p => p.course_code === courseCode);
  const completedLessons = courseProgress.filter(p => 
    p.lesson_id && (p.completed || (p.watch_percentage ?? 0) >= 90)
  ).length;
  
  // Count passed quizzes for this course
  const courseQuizResults = results.filter(r => r.course_code === courseCode && r.passed);
  const uniquePassedQuizIds = new Set(courseQuizResults.map(r => r.quiz_id));
  const completedQuizzes = uniquePassedQuizIds.size;
  
  const completed = completedLessons + completedQuizzes;
  return Math.round((completed / total) * 100);
};
```

---

## Data Flow

```
useUserProgress()                useQuizResults()
      |                                |
      v                                v
progress[]                        results[]
      |                                |
      +----------- getCourseProgress -----------+
                         |
                         v
                   percentage (0-100)
                         |
                         v
            EnrollmentManagementCard
                         |
                         v
              [Progress Bar Display]
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/StudentCenter.tsx` | Import `getTotalLessonsCount`, `getTotalQuizzesCount`; rewrite `getCourseProgress` to use actual progress/quiz data |

---

## Result

After implementation:
- Each enrollment card will show the actual lesson completion percentage
- Progress updates in real-time as students complete lessons and quizzes
- Consistent calculation with what's shown on the CourseDetail page


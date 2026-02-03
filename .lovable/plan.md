
# Fix Test Mode Quiz Retake Issue

## Problem
When Test Mode is enabled, quizzes show as "Passed" and cannot be clicked/taken because:

1. **`isQuizPassed()`** returns `true` in Test Mode to allow content progression
2. **`LockedQuizCard`** checks `!isPassed` to determine if quiz can be attempted
3. This creates a conflict: We need quizzes to be "passed" for progression BUT still takeable

```text
Test Mode Active:
isQuizPassed() → true (for progression)
        ↓
LockedQuizCard receives isPassed = true
        ↓
canAttempt = isUnlocked && !isPassed && attempts < max
           = true && !true && 0 < 3
           = false ← CANNOT CLICK!
```

---

## Solution
Separate the concept of "quiz unlocks next content" from "quiz is actually passed" in Test Mode.

### Approach
Create two different checks:
1. **`isQuizPassedForProgression`** - Returns `true` in Test Mode (unlocks content)
2. **`isQuizActuallyPassed`** - Returns real quiz status (for display and retake logic)

Then update components to use the correct check for each purpose.

---

## Implementation Steps

### Step 1: Update useLessonProgress Hook
**Edit: `src/hooks/useLessonProgress.ts`**

Add a new function that returns the actual quiz pass status (ignoring Test Mode):

```typescript
// For progression/unlocking - respects Test Mode bypass
const isQuizPassed = useCallback((quizId: string) => {
  if (isTestModeEnabled) return true;
  return courseProgress.quizMap.get(quizId)?.passed || false;
}, [courseProgress, isTestModeEnabled]);

// For display/retake logic - always returns real status
const isQuizActuallyPassed = useCallback((quizId: string) => {
  return courseProgress.quizMap.get(quizId)?.passed || false;
}, [courseProgress]);
```

Update `canAttemptQuiz` to use real pass status:
```typescript
const canAttemptQuiz = useCallback((quizId: string) => {
  // In Test Mode: unlimited attempts, only blocked if actually passed
  if (isTestModeEnabled) {
    const reallyPassed = courseProgress.quizMap.get(quizId)?.passed || false;
    return !reallyPassed; // Can retry if not actually passed
  }
  // Normal mode
  const attempts = getQuizAttempts(quizId);
  const passed = isQuizPassed(quizId);
  return !passed && attempts < 3;
}, [...]);
```

### Step 2: Update ProgressionModuleAccordion
**Edit: `src/components/course/ProgressionModuleAccordion.tsx`**

Add new prop for actual pass status and pass it to LockedQuizCard:

```typescript
// In props
isQuizActuallyPassed?: (quizId: string) => boolean;

// When rendering LockedQuizCard
<LockedQuizCard
  isPassed={isQuizActuallyPassed?.(module.quiz.id) ?? isQuizPassed(module.quiz.id)}
  ...
/>
```

### Step 3: Update CourseDetail Page
**Edit: `src/pages/CourseDetail.tsx`**

Pass the new `isQuizActuallyPassed` function to the accordion components.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useLessonProgress.ts` | Add `isQuizActuallyPassed` function, update `canAttemptQuiz` |
| `src/components/course/ProgressionModuleAccordion.tsx` | Add optional `isQuizActuallyPassed` prop |
| `src/pages/CourseDetail.tsx` | Pass `isQuizActuallyPassed` to accordion |

---

## Behavior After Fix

| Scenario | isQuizPassed (progression) | isQuizActuallyPassed (display) | canAttempt |
|----------|---------------------------|-------------------------------|------------|
| Test Mode, not taken | true | false | true ✓ |
| Test Mode, failed | true | false | true ✓ |
| Test Mode, passed | true | true | false |
| Normal, not taken | false | false | true |
| Normal, passed | true | true | false |

---

## Summary
- Quizzes remain unlocked in Test Mode (content progression works)
- Quizzes can be clicked and taken normally (shows real status)
- After actually passing, quiz shows checkmark and becomes disabled
- Unlimited retries in Test Mode until actually passed

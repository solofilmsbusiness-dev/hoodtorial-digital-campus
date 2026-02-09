

# Fix: Quiz Review Mode Undoes Pass Progress

## Problem

After passing a quiz, when a student clicks "Review Answers" and navigates to the last question, the only available action button is **"Retake Quiz"**. There is no "Back to Results" or "Done" button. This forces users down one of two bad paths:

1. They click "Retake Quiz" thinking it means "I'm done reviewing" -- this resets the QuizPlayer to the intro/start screen, making it look like the quiz hasn't been completed
2. They then start a new attempt, potentially fail, and a new failed result gets saved -- making the quiz appear as "not passed" in the UI

Additionally, when the user is in review mode at any question (not just the last), there is no way to go back to the results screen without using the browser's close (X) button.

## Solution

Add proper navigation options in the review mode so users can return to the results screen, and never show "Retake Quiz" when the quiz was already passed.

## Technical Changes

### File: `src/components/course/QuizPlayer.tsx`

**1. Add a "Back to Results" handler**

Add a callback that returns the user from review mode back to the results screen:

```typescript
const handleBackToResults = useCallback(() => {
  setCurrentIndex(0);
  setShowExplanation(false);
  setState("results");
}, []);
```

**2. Fix the review mode footer (last question)**

Currently (line 977-981), the last question in review shows only "Retake Quiz". Change this to:
- If the quiz was **passed**: Show "Back to Results" button (no retake option -- they already passed)
- If the quiz was **failed**: Show both "Back to Results" and "Retake Quiz" buttons

**3. Add "Back to Results" button in review mode header area**

Add a persistent "Back to Results" link/button in the review mode UI so users can exit review at any time, not just on the last question.

### Summary

| File | Change |
|------|--------|
| `src/components/course/QuizPlayer.tsx` | Add `handleBackToResults` callback; update review mode footer to show "Back to Results" instead of/alongside "Retake Quiz"; add persistent back button in review mode |

This is a UI-only fix. No database changes needed -- the quiz results are already saved correctly; the issue is purely that the review mode UI funnels users into restarting the quiz when they just want to finish reviewing.

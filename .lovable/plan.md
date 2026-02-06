

# Fix: Welcome Screen Should Only Show Once for New Users

## Problem

The "Welcome to Your Assessment" page appears every time a user visits `/assessment`, even after they have already completed it. It should only appear once for brand new users taking the assessment for the first time.

## Root Cause

In `src/pages/Assessment.tsx`, the initial `step` state is always set to `"welcome"` (line 56). There is no logic to automatically skip past the welcome screen when the user has already completed the assessment. Currently, returning users see a "You've already completed" card on the welcome page, but the welcome page itself still renders.

## Solution

Add an effect that checks `hasCompletedAssessment` once loading is done. If the user has already completed the assessment, automatically jump to the `"results"` step (populating `finalResults` from `latestResult`) instead of lingering on `"welcome"`.

## File to Modify

| File | Change |
|------|--------|
| `src/pages/Assessment.tsx` | Add a `useEffect` that auto-skips the welcome step for returning users |

## Technical Details

Add a new `useEffect` after the existing ones (around line 105) that runs when `resultsLoading` finishes:

```tsx
// Auto-skip welcome for returning users
useEffect(() => {
  if (!resultsLoading && hasCompletedAssessment && latestResult && latestRoadmap && step === "welcome" && !isRetaking) {
    setFinalResults({
      departmentScores: latestResult.department_scores as Record<string, number>,
      totalScore: latestResult.total_score,
      recommendedCourses: latestResult.recommended_courses,
      roadmap: latestRoadmap,
    });
    setInterests(latestResult.interests);
    setExperienceLevel(latestResult.experience_level);
    setStep("results");
  }
}, [resultsLoading, hasCompletedAssessment, latestResult, latestRoadmap, step, isRetaking]);
```

This ensures:
- First-time users see the welcome screen as normal
- Returning users are taken directly to their results
- The "Retake Assessment" button still works (guarded by `!isRetaking`)
- The `?step=degree-recommendation` query param still works (handled by existing effect)


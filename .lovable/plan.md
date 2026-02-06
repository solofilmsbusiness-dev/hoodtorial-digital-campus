
# Fix: Users Stuck in Assessment Redirect Loop

## Problem Identified

Users who have **completed the assessment** but did not select a **degree path** are caught in a redirect loop:

```text
User visits /community
         │
         ▼
┌─────────────────────────────────────────────────────┐
│ AssessmentRequiredRoute checks:                     │
│   ✅ hasCompletedAssessment = true                  │
│   ❌ degree_path = null                             │
│   ❌ onboarding_completed = false                   │
│                                                     │
│   → Redirects to /assessment?step=degree-recommendation │
└─────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│ Assessment.tsx loads:                               │
│   - Data still loading...                           │
│   - Shows "welcome" step instead of degree step     │
│   - User confused, clicks something                 │
│   - Loop continues                                  │
└─────────────────────────────────────────────────────┘
```

**Affected Users** (7 users with completed assessment but no degree path):
- Test User
- Jason Young  
- zach
- Jessica Norton
- Test Account
- Jardani
- Ja'Van

---

## Root Cause

Two issues:

1. **Race Condition**: The `useEffect` that sets the step to "degree-recommendation" depends on `latestResult` and `latestRoadmap` being loaded. During loading, users see the confusing "welcome" step.

2. **No Loading State**: Assessment page doesn't show a loading state while checking assessment data, causing the wrong UI to flash.

---

## Solution

### Part 1: Fix Assessment.tsx Loading State

Add proper loading state handling so users don't see the welcome screen while data loads:

**File: `src/pages/Assessment.tsx`**

Add a check at the beginning of the component to show loading while assessment data is being fetched:

```typescript
// Show loading while checking assessment status
if (resultsLoading) {
  return (
    <PageLayout>
      <div className="container max-w-4xl py-16 text-center">
        <div className="animate-pulse text-primary font-bold text-xl">
          Loading your assessment data...
        </div>
      </div>
    </PageLayout>
  );
}
```

### Part 2: Fix Step Initialization Logic

Update the step initialization to properly handle the degree-recommendation redirect **before** rendering the welcome screen:

```typescript
// Initialize step based on URL params and assessment state
const [step, setStep] = useState<Step>(() => {
  // This will be properly set in useEffect once data loads
  return "welcome";
});

// Immediately set correct step when data is available
useEffect(() => {
  const stepParam = searchParams.get("step");
  
  if (stepParam === "degree-recommendation" && hasCompletedAssessment) {
    // Even before roadmap loads, show loading or degree step
    if (latestResult && latestRoadmap) {
      setFinalResults({
        departmentScores: latestResult.department_scores as Record<string, number>,
        totalScore: latestResult.total_score,
        recommendedCourses: latestResult.recommended_courses,
        roadmap: latestRoadmap,
      });
      setInterests(latestResult.interests);
      setExperienceLevel(latestResult.experience_level);
      setStep("degree-recommendation");
    }
    // If not loaded yet, the loading state above handles it
  }
}, [searchParams, hasCompletedAssessment, latestResult, latestRoadmap]);
```

### Part 3: Database Fix for Affected Users

Reset `onboarding_completed` to allow affected users to properly complete the flow:

```sql
-- Users who completed assessment but never selected degree path
-- Set onboarding_completed = true so they can access the site
-- They can select degree path later from settings
UPDATE profiles 
SET onboarding_completed = true
WHERE user_id IN (
  SELECT p.user_id 
  FROM profiles p
  WHERE EXISTS (
    SELECT 1 FROM assessment_results ar WHERE ar.user_id = p.user_id
  )
  AND p.degree_path IS NULL 
  AND p.onboarding_completed = false
);
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Assessment.tsx` | Add loading state check at component start |
| Database | Update affected users' onboarding_completed to true |

---

## Implementation Steps

1. **Add Loading State** - Show loading spinner while assessment data fetches
2. **Fix Step Logic** - Ensure degree-recommendation step is shown immediately when URL param is present
3. **Database Update** - Allow affected users to access the site by setting onboarding_completed = true
4. **Test** - Verify users can access Community without redirect loop

---

## Expected Behavior After Fix

1. User visits `/community`
2. `AssessmentRequiredRoute` sees `onboarding_completed = true` → allows access
3. Users can optionally select a degree path from their profile/settings later
4. New users completing assessment see proper loading states and smooth transitions

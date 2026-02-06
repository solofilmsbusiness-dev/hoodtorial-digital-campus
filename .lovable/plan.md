

# Fix: Prince Moran Cannot Start Assessment

## Problem Identified

Prince Moran's profile is in a **corrupted data state** that prevents proper assessment flow:

| Field | Current Value | Expected for New User |
|-------|---------------|----------------------|
| `degree_path` | `"bachelor"` | `null` |
| `onboarding_completed` | `false` | `false` |
| `assessment_results` | `[]` (none) | `[]` (none) |

The user somehow has a `degree_path` set without ever completing an assessment. This is an impossible state that breaks the onboarding flow.

---

## Root Cause

The degree path was set through one of these scenarios:
1. Direct database modification
2. A previous bug that didn't enforce assessment completion before degree selection
3. Profile was modified before the assessment gate was fully implemented

---

## Solution: Two-Part Fix

### Part 1: Immediate Data Fix

Reset Prince Moran's profile to allow proper onboarding:

```sql
UPDATE profiles 
SET degree_path = NULL, 
    certificate_department = NULL,
    recommended_degree_path = NULL
WHERE user_id = '3e612916-6557-4b3f-81b4-3b3e185064c6';
```

### Part 2: Defensive Code Change (Prevent Future Issues)

Add detection in `Assessment.tsx` for the inconsistent state where a user has `degree_path` set but no assessment results, and automatically reset them:

**File: `src/pages/Assessment.tsx`**

Add useEffect to detect and fix the corrupted state:

```typescript
// Detect and fix corrupted profile state
useEffect(() => {
  // If user has degree_path but no assessment results, reset their degree path
  if (!resultsLoading && !hasCompletedAssessment && profile?.degree_path) {
    console.warn("Detected corrupted profile state: degree_path set without assessment");
    updateProfile({
      degree_path: null,
      certificate_department: null,
      recommended_degree_path: null,
    });
  }
}, [resultsLoading, hasCompletedAssessment, profile?.degree_path, updateProfile]);
```

---

## Files to Modify

| File | Changes |
|------|---------|
| Database | Run SQL to reset Prince Moran's profile |
| `src/pages/Assessment.tsx` | Add defensive useEffect to auto-reset corrupted profiles |

---

## Implementation Steps

1. **Run Database Fix** - Reset Prince Moran's degree_path to null
2. **Add Defensive Code** - Prevent future users from getting stuck in this state
3. **Test** - Have Prince Moran log in and verify they can now start the assessment

---

## Expected Behavior After Fix

1. Prince Moran accesses `/assessment`
2. Page shows "Welcome to Your Assessment" with "Start Assessment" button
3. User completes interests → experience → quiz → results → degree selection
4. Only after degree selection is `degree_path` set AND `onboarding_completed` becomes `true`


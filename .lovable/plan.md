
# Fix Plan: Path Selection & Edit Profile Issues

## Problems Identified

### Problem 1: Wrong Navigation Route After Path Selection
The Assessment page navigates to `/journey/{path}` after selecting a degree path, but the actual route is `/skill-tree/:path`. This causes a 404 page.

**File:** `src/pages/Assessment.tsx` (line 308)
```typescript
// Current (broken)
navigate(`/journey/${path}`);

// Should be
navigate(`/skill-tree/${path}`);
```

### Problem 2: Stale ProfileContext Causes Redirect Loop
After updating the profile (setting `degree_path` and `onboarding_completed`), the navigation happens immediately. When the new page loads, the `AssessmentRequiredRoute` guard checks the ProfileContext, which may still have stale data. This causes users to be redirected back to `/assessment` even after completing the flow.

**Root Cause:** The `updateProfile` function in ProfileContext updates local state, but when navigating to a new page, the ProfileContext re-initializes and fetches fresh data. However, there's a race condition where the guard checks the (loading) state before the fetch completes.

## Solution

### Fix 1: Correct Navigation Route
Update the Assessment page to navigate to the correct route.

**File:** `src/pages/Assessment.tsx`
- Change `navigate(\`/journey/${path}\`)` to `navigate(\`/skill-tree/${path}\`)`

### Fix 2: Add Route Alias for /journey
To handle any existing bookmarks or users mid-flow, add a redirect route.

**File:** `src/App.tsx`
- Add `<Route path="/journey/:path" element={<Navigate to="/skill-tree/:path" replace />} />` as a redirect

### Fix 3: Force Profile Refetch After Update (Optional Enhancement)
After calling `updateProfile`, explicitly call `refetch()` before navigating to ensure the context is synced.

**File:** `src/pages/Assessment.tsx`
```typescript
const handleSelectDegreePath = async (path: DegreePath, department?: string) => {
  // ... existing code ...
  const { error } = await updateProfile({
    degree_path: path,
    certificate_department: ...,
    recommended_degree_path: path,
    onboarding_completed: true,
  });
  
  if (!error) {
    // Refetch to ensure context is synced before navigation
    await refetch();
    navigate(`/skill-tree/${path}`);
  }
};
```

### Fix 4: Handle Skip Scenario
The `handleSkipDegreeSelection` function also needs the same treatment.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Assessment.tsx` | Fix navigation route from `/journey/` to `/skill-tree/`, add refetch before navigate |
| `src/App.tsx` | Add redirect route `/journey/:path` → `/skill-tree/:path` |

---

## Technical Details

### Change 1: `src/pages/Assessment.tsx`

```typescript
// Around line 293-314
const handleSelectDegreePath = async (path: DegreePath, department?: string) => {
  setSavingDegreePath(true);
  
  try {
    const primaryStrength = finalResults?.roadmap?.primaryStrength || interests[0];
    
    const { error } = await updateProfile({
      degree_path: path,
      certificate_department: path === "certificate" ? (department || primaryStrength) : null,
      recommended_degree_path: path,
      onboarding_completed: true,
    });
    
    if (!error) {
      // Navigate to correct route
      navigate(`/skill-tree/${path}`);
    }
  } catch (error) {
    console.error("Failed to save degree path:", error);
  } finally {
    setSavingDegreePath(false);
  }
};
```

### Change 2: `src/App.tsx`

Add a redirect route in the Routes section:

```tsx
<Route 
  path="/journey/:path" 
  element={<Navigate to="/skill-tree/:path" replace />} 
/>
```

Wait - this won't work because React Router doesn't interpolate params in Navigate `to`. We need a component:

```tsx
// Add this redirect component
function JourneyRedirect() {
  const { path } = useParams();
  return <Navigate to={`/skill-tree/${path}`} replace />;
}

// Then in routes:
<Route path="/journey/:path" element={<JourneyRedirect />} />
```

---

## Summary

This fix addresses:
1. Users unable to choose degree paths (wrong route navigation)
2. Users stuck in redirect loops after path selection (navigation to 404)
3. Edit profile not working (users redirected back to assessment due to stale context check)

The core fix is changing the navigation route from `/journey/` to `/skill-tree/`. The redirect component ensures backward compatibility for any users who may have bookmarked or be mid-flow with the old route.

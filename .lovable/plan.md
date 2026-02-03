
# Fix Admin Test Mode to Fully Bypass All Restrictions

## Problem Analysis
Test Mode is implemented but not working because there are **three layers of access control** that block admins before Test Mode can take effect:

```text
User visits /course/HU-102
        ↓
[1] PaidRoute checks subscription → BLOCKED (no hasAccess)
        ↓ (if passes)
[2] CourseDetail checks enrollment → BLOCKED (not enrolled)
        ↓ (if passes)
[3] Lesson/Quiz progression → ✓ Test Mode WORKS HERE
```

Currently, Test Mode only bypasses layer 3 (progression), but layers 1 and 2 block the admin before they even reach the course content.

---

## Solution Architecture

```text
Test Mode Active + isAdmin
        ↓
[1] PaidRoute → Check isTestModeEnabled → BYPASS
        ↓
[2] useEnrollments → Check isTestModeEnabled → Auto-enrolled
        ↓
[3] Lesson/Quiz progression → Already working ✓
```

---

## Implementation Steps

### Step 1: Update PaidRoute to Bypass for Test Mode
**Edit: `src/components/auth/PaidRoute.tsx`**

Add Test Mode check to skip subscription requirement:
- Import `useTestMode` hook
- If `isTestModeEnabled` is true, skip subscription check
- Render children directly for admins in test mode

### Step 2: Update useSubscription Hook (Optional Enhancement)
**Edit: `src/hooks/useSubscription.ts`**

Add Test Mode integration:
- When Test Mode is active, report `hasAccess: true`
- This ensures all subscription checks pass throughout the app

### Step 3: Update useEnrollments Hook
**Edit: `src/hooks/useEnrollments.ts`**

Add Test Mode bypass for enrollment:
- When Test Mode is active, `isEnrolled()` returns true for any course
- Bypass the `hasAccess` check in `enroll()` function
- Allow unlimited course slots

### Step 4: Update CourseDetail Enrollment Display
**Edit: `src/pages/CourseDetail.tsx`**

When Test Mode is active:
- Skip showing enrollment card
- Treat user as enrolled for all content access
- Show indicator that test mode is simulating enrollment

---

## Technical Details

### PaidRoute Changes
```typescript
// Before rendering subscription check
const { isTestModeEnabled, canUseTestMode } = useTestMode();

// Allow admins with test mode to bypass subscription
if (canUseTestMode && isTestModeEnabled) {
  return <>{children}</>;
}

// Normal subscription check continues...
```

### useEnrollments Changes
```typescript
const { isTestModeEnabled } = useTestMode();

const isEnrolled = useCallback((courseCode: string) => {
  // Test mode: always enrolled
  if (isTestModeEnabled) return true;
  
  return enrollments.some(/* existing logic */);
}, [enrollments, isTestModeEnabled]);
```

### useSubscription Changes
```typescript
const { isTestModeEnabled } = useTestMode();

const hasAccess = useMemo(() => {
  // Test mode bypasses subscription
  if (isTestModeEnabled) return true;
  
  return isTrialing || isPaid;
}, [isTrialing, isPaid, isTestModeEnabled]);
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/auth/PaidRoute.tsx` | Add Test Mode bypass before subscription check |
| `src/hooks/useSubscription.ts` | Report `hasAccess: true` when Test Mode active |
| `src/hooks/useEnrollments.ts` | Make `isEnrolled()` return true in Test Mode |
| `src/pages/CourseDetail.tsx` | Use Test Mode flag for enrollment status |

---

## Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| Admin without subscription | Test Mode bypasses subscription check |
| Admin not enrolled in course | Test Mode simulates enrollment |
| Admin hits enrollment limit | Test Mode bypasses limit |
| Non-admin tries Test Mode | Silently ignored (context verifies admin status) |
| Test Mode disabled | Normal access control resumes |

---

## Security Notes

- Test Mode state is checked against verified admin role (via `has_role` RPC)
- Even if localStorage is manipulated, `isTestModeEnabled` only returns true if `isAdmin` is true
- No actual database records are modified when simulating enrollment
- Real enrollment/subscription data remains intact

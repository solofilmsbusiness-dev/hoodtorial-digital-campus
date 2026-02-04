

# Fix Enrollment Slot Limit Not Updating After Subscription Upgrade

## Problem

When a student upgrades from trial to a paid subscription, their enrollment slot limit stays stuck at 2 (trial limit) instead of increasing to 3 (paid limit). The extra slot only appears after refreshing the page.

### Root Cause

The `useSubscription` hook fetches subscription data from the database in a `useEffect` that only runs when the `user` changes. After a successful payment:

1. The `Checkout.tsx` page updates the profile with `subscription_status: "active"` in the database
2. But `useSubscription` doesn't know to refetch the data
3. The `isPaid` value stays `false` (stale data)
4. `useEnrollments` uses this stale `isPaid` value, keeping `maxCourses` at 2

---

## Solution

Add a `refetch` function to `useSubscription` and call it after successful payment in `Checkout.tsx`. This ensures the subscription state is immediately updated when a user upgrades.

---

## Implementation

### File 1: `src/hooks/useSubscription.ts`

**Changes:**

1. Extract the fetch logic into a reusable function
2. Expose a `refetch` function that can be called externally
3. Use `useCallback` to memoize the fetch function

```typescript
// Add useCallback to imports
import { useEffect, useState, useMemo, useCallback } from "react";

// Inside the hook:
const fetchSubscription = useCallback(async () => {
  if (!user) return;
  
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("subscription_status, trial_started_at, trial_ends_at, subscription_started_at, subscription_ends_at, terms_accepted_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      setSubscription({
        status: data.subscription_status as SubscriptionStatus,
        // ... rest of state update
      });
    }
  } catch (err) {
    setError(err as Error);
  } finally {
    setLoading(false);
  }
}, [user]);

// Use it in useEffect
useEffect(() => {
  if (!user) {
    // reset state
    return;
  }
  fetchSubscription();
}, [user, fetchSubscription]);

// Return refetch in the hook
return {
  ...subscription,
  refetch: fetchSubscription,  // <-- Add this
  // ...rest
};
```

### File 2: `src/pages/Checkout.tsx`

**Changes:**

1. Get the `refetch` function from `useSubscription`
2. Call `refetch()` after successful payment before showing the success modal

```typescript
// Add useSubscription import
import { useSubscription } from "@/hooks/useSubscription";

// Inside component:
const { refetch: refetchSubscription } = useSubscription();

// In handlePayment, after successful database update:
try {
  const { error } = await supabase
    .from("profiles")
    .update({...})
    .eq("user_id", user!.id);

  if (error) throw error;

  // Refresh subscription state so hooks get updated values
  await refetchSubscription();

  setIsProcessing(false);
  setShowSuccess(true);
} catch (err) {
  // ...
}
```

---

## Data Flow After Fix

```text
Payment Success
      |
      v
Update profiles table (subscription_status: "active")
      |
      v
Call refetchSubscription()
      |
      v
useSubscription fetches new data
      |
      v
isPaid = true (updated)
      |
      v
useEnrollments recalculates maxCourses
      |
      v
maxCourses = 3 (paid limit)
      |
      v
UI shows 3 slots available
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useSubscription.ts` | Add `refetch` function and expose it in return value |
| `src/pages/Checkout.tsx` | Import `useSubscription`, call `refetch()` after payment success |

---

## Additional Benefit

This `refetch` pattern can be reused for other scenarios where subscription status might change, such as:
- After cancellation
- After renewal
- When returning from an external payment provider


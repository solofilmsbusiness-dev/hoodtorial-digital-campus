

# Fix Demo User Filtering, Enrollment Slots, and Swap Limits

## Overview

This plan addresses three issues that were reported as "reset":

1. **Admin User List Demo Filtering** - Add ability to filter out demo users in admin panels
2. **Paid User Course Slots** - Ensure paid users get 3 active course slots (not 2)
3. **Swap Limit** - Change from 2 swaps per enrollment to 1 swap per enrollment

---

## Issue 1: Filter Demo Users in Admin Views

Currently, the `useAllUsers` and `useAdminStudents` hooks fetch all profiles including demo users. We need to add demo filtering similar to how `useCommunityPosts` was updated.

### Changes Required

**File: `src/hooks/useAllUsers.ts`**
- Import `useDemoModeContext` to access `showDemoData` setting
- Add `is_demo` to the profile select query
- Filter out demo users when `showDemoData` is false
- Add `showDemoData` to the query key for proper cache invalidation
- Export `isDemo` field in the `UserWithRoles` interface

**File: `src/hooks/useAdminStudents.ts`**
- Import `useDemoModeContext` to access `showDemoData` setting
- Add `is_demo` to the profile select query
- Filter out demo users when `showDemoData` is false
- Add `showDemoData` to the query key
- Add `isDemo` field to `StudentSummary` interface

---

## Issue 2: Active Courses Showing 2 Instead of 3

Looking at `useEnrollments.ts`, the logic appears correct:

```typescript
const MAX_ACTIVE_COURSES_PAID = 3;
const MAX_ACTIVE_COURSES_TRIAL = 2;

const maxCourses = isTestModeEnabled || isPaid ? MAX_ACTIVE_COURSES_PAID : MAX_ACTIVE_COURSES_TRIAL;
```

The issue is that `isPaid` from `useSubscription` might not be returning `true` when it should. Let me verify the conditions:

```typescript
const isPaid = useMemo(() => {
  return (
    subscription.status === "active" &&
    (subscription.subscriptionEndsAt === null || subscription.subscriptionEndsAt > now)
  );
}, [subscription.status, subscription.subscriptionEndsAt]);
```

**Potential Issue:** If a user completes payment and their `subscription_status` is set to `"active"` but `subscription_ends_at` is set to a past date or not properly handled, they could be treated as trial users.

### Changes Required

**File: `src/hooks/useEnrollments.ts`**
- Add debug logging to verify `isPaid` status (temporary)
- Ensure the logic correctly identifies paid users
- The current code looks correct, so this may be a data issue in the database

**Verification Steps:**
1. Check that after payment, the user's profile has `subscription_status = 'active'`
2. Verify `subscription_ends_at` is either `null` or a future date

---

## Issue 3: Change Swap Limit from 2 to 1

This is a simple constant change.

### Changes Required

**File: `src/hooks/useEnrollments.ts`**
- Change `MAX_SWAPS_PER_ENROLLMENT` from `2` to `1`

```typescript
// Before
const MAX_SWAPS_PER_ENROLLMENT = 2;

// After
const MAX_SWAPS_PER_ENROLLMENT = 1;
```

---

## Implementation Details

### File 1: `src/hooks/useAllUsers.ts`

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useDemoModeContext } from "@/contexts/DemoModeContext";

type AppRole = Database["public"]["Enums"]["app_role"];

export interface UserWithRoles {
  id: string;
  email: string;
  displayName: string | null;
  roles: AppRole[];
  enrolledAt: string;
  isDemo: boolean;  // NEW FIELD
}

export function useAllUsers() {
  const { showDemoData } = useDemoModeContext();
  
  return useQuery({
    queryKey: ["all-users", showDemoData],  // Include in query key
    queryFn: async () => {
      // Build query
      let query = supabase
        .from("profiles")
        .select("user_id, display_name, enrolled_at, is_demo")
        .order("enrolled_at", { ascending: false });

      // Filter out demo users if showDemoData is false
      if (!showDemoData) {
        query = query.eq("is_demo", false);
      }

      const { data: profiles, error: profilesError } = await query;
      if (profilesError) throw profilesError;

      // ... rest of the hook logic with isDemo field added
    },
  });
}
```

### File 2: `src/hooks/useAdminStudents.ts`

```typescript
// Add import
import { useDemoModeContext } from "@/contexts/DemoModeContext";

// Add to StudentSummary interface
export interface StudentSummary {
  // ... existing fields
  isDemo: boolean;  // NEW FIELD
}

export function useAdminStudents() {
  const { showDemoData } = useDemoModeContext();
  
  return useQuery({
    queryKey: ["admin-students", showDemoData],  // Include in query key
    queryFn: async (): Promise<StudentSummary[]> => {
      // Build query with demo filtering
      let query = supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, location, membership_tier, subscription_status, trial_ends_at, enrolled_at, is_banned, banned_at, ban_reason, is_demo")
        .order("enrolled_at", { ascending: false });

      if (!showDemoData) {
        query = query.eq("is_demo", false);
      }

      const { data: profiles, error: profilesError } = await query;
      // ... rest with isDemo field added to return
    },
  });
}
```

### File 3: `src/hooks/useEnrollments.ts`

```typescript
// Line 22: Change from 2 to 1
const MAX_SWAPS_PER_ENROLLMENT = 1;
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/hooks/useAllUsers.ts` | Add demo filtering with `showDemoData` toggle |
| `src/hooks/useAdminStudents.ts` | Add demo filtering with `showDemoData` toggle, add `isDemo` to interface |
| `src/hooks/useEnrollments.ts` | Change `MAX_SWAPS_PER_ENROLLMENT` from `2` to `1` |

---

## Testing Checklist

After implementation:
1. Go to Admin Settings and toggle "Show Demo Data" off
2. Navigate to User Manager - demo users should be hidden
3. Toggle "Show Demo Data" on - demo users should appear
4. Create a paid subscription user and verify they see 3 course slots
5. Test course swapping - verify only 1 swap is allowed per enrollment
6. Verify the swap messaging shows "0 swaps remaining" after the first swap


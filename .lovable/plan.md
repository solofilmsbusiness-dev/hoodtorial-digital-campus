

# Fix: Enrollments Not Persisting After Re-login

## Problem Identified

When a user adds a course to their active courses in the Student Center, it appears to work. However, when they log out and log back in, the course is gone and they have to re-add it.

## Root Cause

There's a **mismatch between frontend access checks and database RLS policies**:

### The Flow

```text
User clicks "Enroll"
       │
       ▼
┌──────────────────────────────────┐
│ Frontend Check (useEnrollments)  │
│ Line 143-144:                    │
│ if (!isTestModeEnabled &&        │
│     !hasAccess) → BLOCK          │
│                                  │
│ Test Mode or hasAccess? → ALLOW  │
└──────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Database RLS Policy (INSERT)     │
│                                  │
│ with_check:                      │
│   auth.uid() = user_id           │
│   AND has_paid_access(auth.uid())│
│                                  │
│ No paid access? → INSERT FAILS   │
└──────────────────────────────────┘
```

### The Problem

1. **Test Mode** only bypasses the frontend check - it doesn't change the user's actual subscription status in the database
2. The database RLS INSERT policy requires `has_paid_access(auth.uid())` to be true
3. When Test Mode is enabled for an admin testing as a non-paying user, the frontend allows the attempt, but the **database rejects the insert due to RLS**
4. The error may not be properly surfaced to the user, making it appear that enrollment succeeded
5. On re-login, the enrollment isn't in the database

---

## Solution

Update the RLS INSERT policy to allow enrollment when either:
1. The user has paid access (current behavior), OR
2. The user is an admin (allows Test Mode to work properly)

This ensures that admins testing the flow can actually persist enrollments, while still requiring paid access for regular users.

---

## Changes Required

### Database Migration

Update the RLS INSERT policy for the `enrollments` table:

```sql
-- Drop the existing policy
DROP POLICY IF EXISTS "Users with paid access can enroll" ON public.enrollments;

-- Create updated policy that allows admins OR users with paid access
CREATE POLICY "Users with paid access can enroll" 
ON public.enrollments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND (
    has_paid_access(auth.uid()) 
    OR has_role(auth.uid(), 'admin')
  )
);
```

---

## Alternative Consideration

If the issue is affecting regular users (not just Test Mode), the problem might be:

1. **Trial Expiration**: User's trial expired between enrollment and re-login
2. **Race Condition**: The subscription status check happens before the profile is fully loaded

If this is affecting regular paid/trial users, we should also verify:
- The `has_paid_access` function is returning correct results
- The subscription status is being set correctly after checkout

---

## Files to Modify

| Location | Change |
|----------|--------|
| Database (RLS) | Update INSERT policy to include admin check |

---

## Testing After Fix

1. Enable Test Mode as admin
2. Enroll in a course
3. Log out
4. Log back in
5. Verify the course is still showing in active courses


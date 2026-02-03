
# Paid Access & 3-Day Trial Implementation

## Overview

This plan implements paid access control for courses with a 3-day free trial. Users will only be able to access courses if they have an active subscription OR are within their trial period.

## Current State

- Profiles have a `membership_tier` field but no subscription status
- No payment integration exists
- Anyone with an account can enroll in courses
- No trial tracking mechanism

## Database Changes

### 1. Add Subscription Fields to Profiles Table

```sql
ALTER TABLE public.profiles
ADD COLUMN subscription_status text DEFAULT 'trial'
  CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
ADD COLUMN trial_started_at timestamptz DEFAULT now(),
ADD COLUMN trial_ends_at timestamptz DEFAULT (now() + interval '3 days'),
ADD COLUMN subscription_started_at timestamptz,
ADD COLUMN subscription_ends_at timestamptz;
```

Fields:
- `subscription_status`: Current state of the subscription
- `trial_started_at`: When the user started their trial
- `trial_ends_at`: When the trial expires (3 days after signup)
- `subscription_started_at`: When paid subscription began
- `subscription_ends_at`: When paid subscription expires

### 2. Create Access Check Function

```sql
CREATE OR REPLACE FUNCTION public.has_paid_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN _user_id IS NULL THEN false
    ELSE EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = _user_id
      AND (
        -- Active paid subscription
        (subscription_status = 'active' AND (subscription_ends_at IS NULL OR subscription_ends_at > now()))
        OR
        -- Within trial period
        (subscription_status = 'trial' AND trial_ends_at > now())
      )
    )
  END
$$;
```

### 3. Update is_enrolled_student Function

Modify the existing function to also check for paid access:

```sql
CREATE OR REPLACE FUNCTION public.is_enrolled_student(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN _user_id IS NULL THEN false
    ELSE (
      -- Must have paid access (trial or subscription)
      has_paid_access(_user_id)
      AND
      -- Must have at least one active enrollment
      EXISTS (
        SELECT 1 FROM public.enrollments
        WHERE user_id = _user_id AND status = 'active'
      )
    )
  END
$$;
```

### 4. Update RLS on Enrollments Table

Add policy to prevent enrollment without paid access:

```sql
-- Drop existing insert policy if any
DROP POLICY IF EXISTS "Users can enroll in courses" ON public.enrollments;

-- New insert policy requiring paid access
CREATE POLICY "Users with paid access can enroll"
  ON public.enrollments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND has_paid_access(auth.uid())
  );
```

## Frontend Changes

### 1. Create Subscription Hook

New file: `src/hooks/useSubscription.ts`

```typescript
// Hook to manage subscription state and access checks
export function useSubscription() {
  // Fetches subscription status from profile
  // Provides: isTrialing, isPaid, hasAccess, trialDaysRemaining
  // Handles trial expiry warnings
}
```

### 2. Create PaidRoute Component

New file: `src/components/auth/PaidRoute.tsx`

```typescript
// Similar to ProtectedRoute but also checks for paid access
// Redirects to /enrollment if no active subscription or trial
```

### 3. Update Course Pages

| File | Change |
|------|--------|
| `src/App.tsx` | Wrap course-related routes with `PaidRoute` |
| `src/pages/CourseDetail.tsx` | Show subscription required message if no access |
| `src/pages/Academics.tsx` | Show upgrade banner for trial/non-paid users |

### 4. Add Trial Banner Component

New file: `src/components/subscription/TrialBanner.tsx`

Displays:
- Trial days remaining for trial users
- Upgrade prompt when trial is about to expire
- Expired trial message with CTA to subscribe

### 5. Update Enrollment Flow

| File | Change |
|------|--------|
| `src/hooks/useEnrollments.ts` | Check paid access before allowing enrollment |
| `src/components/course/EnrollmentCard.tsx` | Show subscription required if no access |

## User Experience Flow

```text
1. New User Signs Up
   └── Profile created with subscription_status = 'trial'
   └── trial_ends_at = now() + 3 days
   
2. During Trial (3 days)
   └── Full access to all course content
   └── Trial banner shows days remaining
   
3. Trial Expires
   └── subscription_status remains 'trial'
   └── trial_ends_at is in the past
   └── has_paid_access() returns false
   └── User redirected to /enrollment
   
4. User Subscribes
   └── subscription_status = 'active'
   └── subscription_started_at = now()
   └── subscription_ends_at set based on plan
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useSubscription.ts` | Subscription state management |
| `src/components/auth/PaidRoute.tsx` | Route protection for paid content |
| `src/components/subscription/TrialBanner.tsx` | Trial status display |
| `src/components/subscription/SubscriptionGate.tsx` | Paywall component |
| `supabase/migrations/xxx_add_subscription_fields.sql` | Database changes |

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add PaidRoute wrapper to course routes |
| `src/pages/CourseDetail.tsx` | Add subscription check and paywall |
| `src/pages/Academics.tsx` | Add trial/subscription banner |
| `src/hooks/useEnrollments.ts` | Add paid access check |
| `src/hooks/useProfile.ts` | Include subscription fields |

## Future Payment Integration

This plan prepares the data model for Stripe integration. When ready:

1. Enable Stripe connector
2. Create checkout flow
3. Add webhook to update `subscription_status` and dates
4. Handle subscription renewal and cancellation

## Security Considerations

- `has_paid_access()` uses `SECURITY DEFINER` to prevent RLS bypass
- Enrollment RLS policy enforces paid access at database level
- Trial dates are set server-side to prevent manipulation
- Subscription status can only be updated by backend/admin

## Technical Notes

- Trial period is set to 3 days as requested
- Trial starts automatically at profile creation
- No payment method required for trial
- Access is blocked immediately when trial expires
- Admins/moderators bypass paid access checks for testing

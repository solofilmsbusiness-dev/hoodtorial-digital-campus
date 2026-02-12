

## Ensure the 3-Day Trial Works Correctly

After reviewing the full trial flow — signup, email verification, sign-in, terms acceptance, trial activation, and content gating — the system is mostly correct. There is one important fix needed to prevent a potential bypass.

### Current Flow (Working)

1. User signs up and verifies email
2. User signs in and is prompted to accept Terms of Service
3. Accepting terms sets `subscription_status = 'trial'`, `trial_started_at`, and `trial_ends_at` (3 days out)
4. Trial banner shows remaining days; content is gated by `useSubscription` and `useTrialLimits`
5. After expiry, user sees "Trial Expired" messaging and is prompted to subscribe

### Issue Found

The `profiles` table has **column defaults** that auto-set `subscription_status = 'trial'`, `trial_started_at = now()`, and `trial_ends_at = now() + 3 days`. While the `handle_new_user` trigger correctly overrides these to `NULL`, any profile row created outside the trigger (e.g., via an admin tool, edge function, or manual fix) would silently grant a free trial without terms acceptance.

### Fix

**Database migration** — Remove the risky column defaults so `subscription_status`, `trial_started_at`, and `trial_ends_at` default to `NULL`. This ensures the trial can only be activated through the Terms Acceptance Modal, matching the intended design.

```sql
ALTER TABLE public.profiles
  ALTER COLUMN subscription_status DROP DEFAULT,
  ALTER COLUMN trial_started_at DROP DEFAULT,
  ALTER COLUMN trial_ends_at DROP DEFAULT;
```

### No Code Changes Needed

The frontend hooks (`useSubscription`, `useTrialLimits`), the `TermsAcceptanceModal`, the `TrialBanner`, the `SubscriptionGate`, and the Auth page flow are all correctly wired and working as designed. Only the database defaults need this safety fix.


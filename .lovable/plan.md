

# Enhanced Sign-Up System with Terms Acceptance and Test Paywall

## Overview

This plan implements a complete sign-up flow redesign with:
1. **Terms of Service acceptance** required before starting a 3-day trial
2. **Trial content limitations** - trial users get limited but enjoyable access
3. **Test paywall** - a realistic payment flow simulation for testing without actual payments

---

## Current State Analysis

| Component | Current Behavior |
|-----------|-----------------|
| Sign-up | Creates profile with `subscription_status: 'trial'` and 3-day trial automatically |
| Trial Access | Full access to courses (same as paid) |
| Terms | No terms acceptance required |
| Payment | No payment flow exists |
| Enrollment | Limited to 3 active courses |

---

## Part 1: Terms Acceptance During Sign-Up

### Database Changes

Add a `terms_accepted_at` column to track when users accepted terms:

```sql
ALTER TABLE public.profiles
ADD COLUMN terms_accepted_at timestamptz;
```

Update the profile creation trigger to NOT automatically start trial (trial starts after terms acceptance):

```sql
-- Updated handle_new_user: creates profile WITHOUT trial active
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    display_name,
    subscription_status
    -- Note: trial_started_at and trial_ends_at are NULL until terms accepted
  )
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'display_name',
    NULL  -- No status until terms accepted
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;
```

### UI Changes - Auth.tsx

Add a step after sign-up where users must accept terms:

1. After successful sign-up, show a **Terms Acceptance Modal**
2. Display:
   - Welcome message
   - Terms of Service summary
   - "By clicking Accept, you agree to our Terms of Service and start your 3-day free trial"
   - Checkbox for terms acceptance
   - "Start My Trial" button
3. On acceptance:
   - Update profile with `terms_accepted_at: now()`
   - Set `subscription_status: 'trial'`
   - Set `trial_started_at: now()`
   - Set `trial_ends_at: now() + 3 days`

### New Component: TermsAcceptanceModal

```tsx
// src/components/auth/TermsAcceptanceModal.tsx
- Cinematic modal matching login page aesthetic
- Film grain overlay
- Terms summary with key points
- Checkbox with animated checkmark
- "Start My 3-Day Trial" button
- Clear indication of what trial includes
```

---

## Part 2: Trial Content Limitations

Trial users should experience the platform but with appetizing restrictions that encourage subscription.

### Trial Limitations

| Feature | Trial Access | Paid Access |
|---------|-------------|-------------|
| Courses | First 2 modules only | All modules |
| Quizzes | Module quizzes only | Module + Final exams |
| Final Exams | Locked | Unlocked |
| Enrollment Slots | 2 active courses | 3 active courses |
| Community | View-only | Full participation |
| Skill Tree | View progress | Full interaction |

### Implementation

#### useSubscription.ts Enhancements

Add trial-specific access levels:

```typescript
// New computed values
const trialLimits = {
  maxModules: 2,           // Can only access first 2 modules per course
  maxEnrollments: 2,       // Only 2 active courses during trial
  canTakeFinalExams: false,
  canPostInCommunity: false,
  canSubmitProjects: false,
};

return {
  ...existing,
  trialLimits,
  canAccessModule: (moduleIndex: number) => isPaid || (isTrialing && moduleIndex < 2),
  canTakeFinalExam: isPaid,
  canPostInCommunity: isPaid,
};
```

#### CourseDetail.tsx Updates

- Show "Trial Preview" badge on locked content
- Modules 3+ show lock icon with "Upgrade to Unlock" messaging
- Final exam shows "Available with Subscription" overlay

#### Community.tsx Updates

- Trial users can view posts but see "Subscribe to Post" prompt when clicking create
- Like/comment buttons show upgrade prompt

---

## Part 3: Test Paywall (Fake Payment Flow)

Create a realistic payment simulation that mimics a real Stripe-like experience for testing.

### New Page: Checkout.tsx

A dedicated checkout page at `/checkout` that simulates the payment experience:

```text
/checkout?tier=sophomore
```

Features:
- Tier selection (if not pre-selected)
- "Credit card" form (fake inputs)
- Test card numbers documented (e.g., "4242 4242 4242 4242")
- Processing animation
- Success/failure states
- Updates profile with active subscription

### Checkout Flow

```text
User clicks "Subscribe" on Enrollment page
         |
         v
    /checkout?tier=sophomore
         |
         v
   Fill fake card form
   (Test card: 4242 4242 4242 4242)
         |
         v
   Click "Subscribe Now"
         |
         v
   Fake processing animation (2s)
         |
         v
   Update profile:
   - subscription_status: 'active'
   - subscription_started_at: now()
   - membership_tier: selected tier
         |
         v
   Success page with confetti
         |
         v
   Redirect to /student
```

### Test Card Numbers

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success - Subscription activated |
| 4000 0000 0000 0002 | Decline - Card declined |
| 4000 0000 0000 9995 | Decline - Insufficient funds |

### New Components

#### TestPaymentForm.tsx

```tsx
// Fake Stripe-like card input
- Card number input with validation formatting
- Expiry date (MM/YY)
- CVC
- Test card hint displayed
- "Pay $XX/month" button
```

#### CheckoutPage.tsx

```tsx
// Full checkout experience
- Selected tier summary
- Price breakdown
- TestPaymentForm
- Security badges (fake but realistic)
- Processing overlay
- Success modal with confetti
```

#### PaymentSuccessModal.tsx

```tsx
// Celebration after "payment"
- Confetti animation
- "Welcome to [Tier]!" message
- List of unlocked features
- "Start Learning" button
```

---

## Part 4: Updated Enrollment Page

Transform `/enrollment` into a proper paywall:

### For Non-Subscribers

- Show all three tiers prominently
- "Start Free Trial" for users without terms accepted
- "Subscribe Now" buttons linking to `/checkout?tier=X`
- Trial countdown if in trial
- Feature comparison table

### For Trial Users

- Prominent "Your trial ends in X days" banner
- "Upgrade Now" buttons
- Show what they're missing (locked features preview)

### For Paid Users

- "You're on [Tier]" confirmation
- "Upgrade" option if not on Graduate tier
- "Manage Subscription" placeholder

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/auth/TermsAcceptanceModal.tsx` | Terms acceptance after signup |
| `src/components/checkout/TestPaymentForm.tsx` | Fake credit card form |
| `src/components/checkout/PaymentSuccessModal.tsx` | Success celebration |
| `src/components/checkout/index.ts` | Barrel export |
| `src/pages/Checkout.tsx` | Checkout page |
| `src/hooks/useTrialLimits.ts` | Trial-specific access logic |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Auth.tsx` | Show TermsAcceptanceModal after signup |
| `src/pages/Enrollment.tsx` | Add checkout links, trial messaging |
| `src/hooks/useSubscription.ts` | Add trial limits and access checks |
| `src/hooks/useEnrollments.ts` | Reduce trial slots to 2 |
| `src/pages/CourseDetail.tsx` | Show trial module locks |
| `src/pages/Community.tsx` | Add posting restrictions for trial |
| `src/App.tsx` | Add `/checkout` route |
| Database migration | Add `terms_accepted_at` column, update trigger |

---

## User Journey Flow

```text
New User Signs Up
       |
       v
Email Verified
       |
       v
Terms Acceptance Modal
"Accept terms to start your 3-day trial"
       |
       v
Trial Activated
(2 courses, 2 modules/course, no final exams)
       |
       v
Browses Courses, Sees Limitations
       |
       v
Clicks "Upgrade" or Trial Expires
       |
       v
/enrollment page (paywall)
       |
       v
Selects Tier, Goes to /checkout
       |
       v
Enters Test Card (4242...)
       |
       v
Fake Processing...
       |
       v
Success! Subscription Active
       |
       v
Full Platform Access
```

---

## Technical Notes

- All "payments" are simulated - no real money involved
- Profile subscription fields are updated directly in the database
- Test mode (admin) continues to bypass all restrictions
- Clear "TEST MODE" indicators on checkout page so users know it's not real


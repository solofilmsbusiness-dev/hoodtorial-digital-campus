
# Payment Integration and Tier-Based Access Control

## Overview
This plan implements a real Stripe payment system where each membership tier (Freshman, Sophomore, Graduate) is a clickable payment link. After payment, users will only have access to the features included in their purchased tier.

## Architecture

### Payment Flow
```text
User clicks "Enroll Now" on a tier
        ↓
Redirected to Stripe Checkout
        ↓
Stripe processes payment
        ↓
Webhook updates user profile
        ↓
User redirected back with access to tier features
```

### Tier Access Matrix
| Feature | Freshman ($49) | Sophomore ($99) | Graduate ($199) |
|---------|----------------|-----------------|-----------------|
| Foundational Courses (HU-101 to HU-106) | Yes | Yes | Yes |
| Advanced Courses (HU-201+) | No | Yes | Yes |
| Module Quizzes | Yes | Yes | Yes |
| Final Exams | No | Yes | Yes |
| Project Submissions | No | Yes | Yes |
| Capstone Film | No | No | Yes |
| 1-on-1 Mentorship | No | No | Yes |

---

## Implementation Steps

### Step 1: Enable Stripe Integration
- Use the Lovable Stripe connector to enable Stripe
- This will provide tools to create products, prices, and checkout sessions
- Will also set up the required Stripe secret key

### Step 2: Create Stripe Products and Prices
Create three subscription products in Stripe:
1. **Freshman** - $49/month subscription
2. **Sophomore** - $99/month subscription  
3. **Graduate** - $199/month subscription

### Step 3: Create Checkout Edge Function
**New file: `supabase/functions/create-checkout/index.ts`**

Creates a Stripe Checkout session for the selected tier:
- Accepts tier parameter (freshman, sophomore, graduate)
- Validates user is authenticated
- Creates Stripe customer if not exists
- Returns checkout URL
- Stores Stripe customer ID in profiles table

### Step 4: Create Stripe Webhook Edge Function
**New file: `supabase/functions/stripe-webhook/index.ts`**

Handles Stripe webhook events:
- `checkout.session.completed` - Update user's membership_tier and subscription_status to "active"
- `customer.subscription.updated` - Handle tier changes/upgrades
- `customer.subscription.deleted` - Set subscription_status to "expired"
- `invoice.payment_failed` - Handle failed payments

### Step 5: Add Database Column for Stripe Customer ID
**Database Migration:**
```sql
ALTER TABLE profiles 
ADD COLUMN stripe_customer_id TEXT;
```

### Step 6: Update Enrollment Page
**Edit: `src/pages/Enrollment.tsx`**

- Add tier selection state and checkout handler
- Each "Enroll Now" button calls the checkout edge function with the tier name
- Handle loading states during checkout
- Add redirect handling for success/cancel URLs

### Step 7: Create New Hook for Tier Access
**New file: `src/hooks/useTierAccess.ts`**

Provides tier-based permission checking:
- `canAccessCourse(courseCode)` - Check if user's tier allows access
- `canAccessFinalExams()` - Sophomore+ only
- `canSubmitProjects()` - Sophomore+ only
- `canAccessMentorship()` - Graduate only
- `getCurrentTier()` - Returns user's membership tier

### Step 8: Update Course Access Control
**Edit: `src/pages/CourseDetail.tsx`**

- Import and use `useTierAccess` hook
- Show tier upgrade prompt if course requires higher tier
- Block access to final exams for Freshman tier
- Display clear messaging about what tier is needed

### Step 9: Update Subscription Hook
**Edit: `src/hooks/useSubscription.ts`**

Add tier information to the subscription state:
- Include `membershipTier` in the returned state
- Add helper for tier comparison (e.g., `isTierAtLeast('sophomore')`)

### Step 10: Create Tier Upgrade Component
**New file: `src/components/subscription/TierUpgradePrompt.tsx`**

Shows when user tries to access content above their tier:
- Displays what tier is required
- Shows price difference for upgrade
- CTA button to upgrade tier
- Links back to enrollment page with tier pre-selected

### Step 11: Update TierCard Component
**Edit: `src/components/cards/TierCard.tsx`**

- Accept `onSelect` callback instead of static href
- Add loading state for when checkout is processing
- Highlight current tier if user is already subscribed
- Show "Current Plan" badge for active tier

---

## Technical Details

### Foundational Courses (Freshman Access)
```typescript
const FOUNDATIONAL_COURSES = [
  "HU-101", "HU-102", "HU-103", "HU-104", "HU-105", "HU-106"
];
```

### Tier Hierarchy
```typescript
const TIER_HIERARCHY = {
  freshman: 1,
  sophomore: 2,
  graduate: 3
};
```

### Course Tier Requirements
- Courses HU-1XX (100-level) = Freshman+
- Courses HU-2XX (200-level) = Sophomore+
- Courses HU-3XX (300-level) = Sophomore+
- Final Exams = Sophomore+
- Project Submissions = Sophomore+
- Capstone = Graduate only

---

## Files to Create
1. `supabase/functions/create-checkout/index.ts`
2. `supabase/functions/stripe-webhook/index.ts`
3. `src/hooks/useTierAccess.ts`
4. `src/components/subscription/TierUpgradePrompt.tsx`

## Files to Modify
1. `src/pages/Enrollment.tsx` - Add checkout integration
2. `src/pages/CourseDetail.tsx` - Add tier-based access checks
3. `src/hooks/useSubscription.ts` - Add tier info
4. `src/components/cards/TierCard.tsx` - Add click handler and states
5. `src/components/subscription/index.ts` - Export new component

## Database Changes
1. Add `stripe_customer_id` column to profiles table

---

## Security Considerations
- Webhook endpoint validates Stripe signature
- Tier checks happen both client-side (UX) and server-side (edge functions)
- RLS policies ensure users can only read their own tier
- Stripe customer ID is only set via authenticated edge functions

## Next Steps After Implementation
1. Test the complete payment flow end-to-end
2. Verify tier restrictions work correctly on course access
3. Test subscription cancellation handling
4. Test tier upgrade flow

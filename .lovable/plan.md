

## Make the Tour Only Auto-Trigger for Brand New Users

### Problem
The walkthrough tour currently uses `localStorage` to track completion. This means:
- A returning user on a new device/browser will see the tour again
- A new user on a device where someone already completed the tour won't see it
- It's not tied to the actual user account at all

### Solution
Store tour completion in the `profiles` database table (new column: `walkthrough_completed`) and only auto-trigger the tour for users who have **never** completed it in the database. Keep localStorage as a fast cache to avoid unnecessary DB reads on every page load.

### Technical Changes

**1. Database migration** -- Add `walkthrough_completed` column to `profiles`
- `ALTER TABLE public.profiles ADD COLUMN walkthrough_completed boolean DEFAULT false;`
- Update the `profiles_public` view to include this column (it's not sensitive data)

**2. Update `src/hooks/useWalkthrough.ts`**
- Accept the user's profile data (specifically `walkthrough_completed`) as input
- Auto-trigger only when `profile.walkthrough_completed` is `false`
- On tour completion or skip, update the `profiles` table (`walkthrough_completed = true`) AND set localStorage as a fast cache
- On mount, check localStorage first (fast path), then fall back to the profile data

**3. Update `src/pages/StudentCenter.tsx`**
- Pass the profile's `walkthrough_completed` value into the `useWalkthrough` hook
- The manual "Retake Tour" button continues to work as before (it just calls `startTour()` without resetting the DB flag)

### What This Fixes
- Returning users who log in will never see the auto-tour again, regardless of device
- New users will always see the tour on their first visit to Student Center, regardless of device
- The manual "Retake Tour" button still works anytime


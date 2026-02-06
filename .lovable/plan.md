

# Fix: Login Failure and Waitlist Approval Password Overwrite

## Problem Summary

There are two related issues:

1. **Login not working for bangoutfilms@gmail.com**: The `approve-waitlist` Edge Function overwrote this user's existing password with a random temporary password when it was approved. The user is trying to log in with their original password ("Killab513"), which no longer works.

2. **Site "crashing"**: The site loads correctly -- the login page renders fine. The perceived crash is the inability to get past the login screen due to the password mismatch.

## Root Cause

In the recent fix to `approve-waitlist`, when a user already exists in the auth system, the function calls `updateUserById` and sets a **new random temporary password**, destroying the user's original password. This is wrong for users who already registered themselves -- their existing password should be preserved.

## Solution

### Step 1: Reset the user's password (immediate fix)

Use the admin API to update the password for `bangoutfilms@gmail.com` back to `Killab513` so the user can log in immediately.

### Step 2: Fix the approve-waitlist function (prevent future issues)

Update the Edge Function so that when an existing user is found, it does NOT overwrite their password. It should only:
- Confirm their email (set `email_confirm: true`)
- Update metadata if needed
- Skip password replacement entirely

The temp password and welcome email with credentials should only be sent for **newly created** users.

### Step 3: Add a "Forgot Password" link on the login page

The Auth page currently has no visible password reset option. Adding a "Forgot Password?" link will let users self-service password resets in the future, preventing this class of issue from requiring admin intervention.

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/approve-waitlist/index.ts` | Stop overwriting passwords for existing users |
| `src/pages/Auth.tsx` | Add a "Forgot Password?" link/flow to the sign-in form |

## Database Change

- Reset password for `bangoutfilms@gmail.com` to the user's expected password via admin API

---

## Technical Details

**approve-waitlist change** (existing user path):

Before:
```typescript
await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
  password: tempPassword,  // <-- destroys existing password
  email_confirm: true,
  user_metadata: { display_name: name || username }
});
```

After:
```typescript
await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
  email_confirm: true,  // only confirm email, don't touch password
  user_metadata: { display_name: name || username }
});
// Skip sending temp password email for existing users
```

**Auth.tsx change**: Add a "Forgot Password?" button below the password field that triggers `supabase.auth.resetPasswordForEmail()` and shows a confirmation toast.


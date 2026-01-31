

# Test Login Implementation

## Overview
Simplify the login process for testing by adding quick "Test Login" functionality and redirecting users to create/complete their profile after signing in.

---

## What Changes

### Auth Page Updates
- Add a prominent "Test Login" button below the regular login form
- Pre-fill test credentials (test@example.com / 1234)
- One-click login for faster testing

### Login Flow Changes
- After successful login, check if the user has completed their profile
- If profile is incomplete (missing display name), redirect to `/student/profile` instead of `/student`
- Show a "Complete Your Profile" message on first login

### Password Validation
- Reduce minimum password requirement from 6 characters to 4 for testing
- Change from "Password must be at least 6 characters" to "Password must be at least 4 characters"

---

## Technical Details

### Files to Modify

**src/pages/Auth.tsx**
- Add "Test Login" button that auto-fills email: `test@example.com` and password: `1234`
- Update password validation from `min(6)` to `min(4)`
- After successful sign-in, fetch the user's profile to check completion status
- Redirect to `/student/profile` if profile is incomplete, otherwise `/student`

**src/contexts/AuthContext.tsx**
- Add a helper function to check if profile is complete
- Return profile data along with auth state (optional enhancement)

### Test Login Button
A styled button that says "Test Login" with visual distinction from the main form, placed below the toggle between Sign In/Sign Up.

### Profile Completion Check
After login, query the `profiles` table to check if `display_name` is set. If not, the user needs to complete their profile setup.

---

## User Experience

```text
Current Flow:
1. Go to /auth
2. Enter email
3. Enter password (min 6 chars)
4. Click Sign In
5. Redirect to /student

New Flow (Test Mode):
1. Go to /auth
2. Click "Test Login" button
3. Auto-fills test@example.com / 1234
4. Click Sign In (or auto-submits)
5. Check if profile complete
6. Redirect to /student/profile if incomplete
7. User fills out profile
8. Navigate to /student

```

---

## Visual Design

The Test Login button will be styled distinctly:
- Positioned below the sign in/sign up toggle
- Outlined style with a different color (e.g., amber/gold)
- Icon indicating it's for testing (e.g., beaker or test tube)
- Clear label: "Quick Test Login"

---

## Implementation Steps

1. Update password validation to allow 4 character minimum
2. Add Test Login button to Auth page
3. Create pre-filled test credentials handler
4. Add profile completion check after login
5. Update redirect logic to go to profile page if incomplete
6. Ensure auto-confirm is enabled in auth settings for smooth testing


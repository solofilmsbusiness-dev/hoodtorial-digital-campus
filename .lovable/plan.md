
# Plan: Redirect to Login Page After Sign Out

## Overview
When users sign out, they should be redirected to the `/auth` page (the login screen with the university logo and sign-in form) instead of staying on their current page.

## Current Behavior
- Sign out clears the session but users remain on whatever page they were on
- If on a protected route, they eventually get redirected, but it's not a smooth experience

## Proposed Changes

### 1. Update Navigation Component
**File: `src/components/layout/Navigation.tsx`**

Add `useNavigate` hook and navigate to `/auth` after signing out:
- Import `useNavigate` from react-router-dom
- Update `handleSignOut` to navigate to `/auth` after the sign out completes

### 2. Update Admin Layout Component  
**File: `src/components/admin/AdminLayout.tsx`**

Same pattern - add navigation after sign out:
- Import `useNavigate` from react-router-dom
- Create a `handleSignOut` function that calls `signOut()` then navigates to `/auth`
- Update the button's onClick to use the new handler

## User Experience Flow
```text
1. User clicks "Sign Out" from dropdown menu or admin header
2. Session is cleared
3. User is immediately redirected to /auth (login page)
4. User sees the "Welcome Back" form with the logo
```

## Files to Modify
1. `src/components/layout/Navigation.tsx` - Add navigation after sign out
2. `src/components/admin/AdminLayout.tsx` - Add navigation after sign out


# Admin Delete User Feature

## Overview
Add the ability for admins to permanently delete users from the platform. This is a destructive action that will remove the user from auth.users and cascade to all related data.

## Implementation Approach

Since deleting a user from `auth.users` requires admin privileges that cannot be performed from the client-side Supabase SDK, we need to create a backend function that uses the service role key to call `auth.admin.deleteUser()`.

---

## Changes Required

### 1. Create Delete User Edge Function

Create a new backend function `supabase/functions/delete-user/index.ts` that:
- Validates the caller has admin role (using the same JWT validation pattern as approve-waitlist)
- Uses `supabaseAdmin.auth.admin.deleteUser(userId)` to delete the user
- All related data will cascade automatically due to `ON DELETE CASCADE` foreign keys

### 2. Add Delete User Hook

Update `src/hooks/useAdminQuizManagement.ts` to add a `deleteUser` function that:
- Calls the new edge function with the user ID
- Passes the Authorization header for admin verification
- Handles success/error responses
- Invalidates relevant queries

### 3. Update UserManager UI

Modify `src/pages/admin/UserManager.tsx` to:
- Add "Delete User" option to the dropdown menu (with Trash2 icon)
- Prevent deleting yourself (current user check)
- Add new confirmation dialog type for user deletion
- Show destructive styling for the delete option

### 4. Update StudentDetailSheet

Modify `src/components/admin/StudentDetailSheet.tsx` to:
- Add "Delete User" button in the actions section
- Add new `deleteUser` confirmation dialog type
- Show strong warning about permanent data loss

---

## UI/UX Details

- **Dropdown Menu**: Add a red "Delete User" option with Trash2 icon at the bottom of the menu, separated by a divider
- **Confirmation Dialog**: Show a strong warning that this action is irreversible and will permanently delete all user data including:
  - Account and login credentials
  - Profile information
  - Course enrollments and progress
  - Quiz results
  - Community posts and comments
  - Messages and friendships
- **Self-deletion Prevention**: Hide the delete option if the user is the currently logged-in admin

---

## Files to Modify/Create

| File | Action |
|------|--------|
| `supabase/functions/delete-user/index.ts` | Create new edge function |
| `src/hooks/useAdminQuizManagement.ts` | Add `deleteUser` function |
| `src/pages/admin/UserManager.tsx` | Add dropdown menu item and dialog |
| `src/components/admin/StudentDetailSheet.tsx` | Add delete button and dialog handling |

---

## Technical Notes

- The edge function uses the same authentication pattern as approve-waitlist (JWT claims validation)
- Cascade deletes are already configured in the database schema for user-related tables
- The edge function needs service role access since `auth.admin.deleteUser()` is an admin-only operation

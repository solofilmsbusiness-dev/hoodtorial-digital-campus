

# Admin Access System

## Overview
Create a complete admin access system with two key features:
1. A way to access the admin panel from the main navigation (only visible to admins)
2. A user management page where admins can grant/revoke admin access to approved users

---

## Current Situation

- Admin pages exist at `/admin` but there's no link to access them
- Your user (bangoutfilms@gmail.com) only has the "student" role
- The `user_roles` table and `has_role()` function are already set up correctly
- First, I'll grant you admin access, then build the management UI

---

## Implementation

### 1. Grant Admin Access to You

Run a database migration to add the "admin" role to your user account so you can access the admin panel immediately.

### 2. Add Admin Link to Navigation

Update the main navigation to show an "Admin" link in the user dropdown menu, but only if the user has the admin role.

```text
User Avatar Dropdown:
├── Student Center
├── Admin Panel (only if admin) ← NEW
├── ─────────────
└── Sign Out
```

### 3. Create User Management Page

Build `/admin/users` page where admins can:
- View all registered users with their roles
- Search/filter users by name or email
- Grant admin or moderator roles to users
- Revoke roles from users
- See when users joined

### 4. Add RLS Policies for User Role Management

Create secure policies so only admins can modify the `user_roles` table.

---

## Database Changes

### Add RLS Policies for user_roles table

```sql
-- Allow authenticated users to read their own roles
CREATE POLICY "Users can read own roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow admins to read all roles
CREATE POLICY "Admins can read all roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Allow admins to manage roles
CREATE POLICY "Admins can insert roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON user_roles FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));
```

### Grant You Admin Access

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('50da13a2-e553-4b31-815e-38492078b7eb', 'admin');
```

---

## New Files

| File | Purpose |
|------|---------|
| `src/pages/admin/UserManager.tsx` | User management page with role controls |
| `src/hooks/useAllUsers.ts` | Hook to fetch all users with their roles |
| `src/hooks/useManageRoles.ts` | Hook with mutations to add/remove roles |

---

## Navigation Changes

**Update `src/components/layout/Navigation.tsx`:**
- Import `useAdminAuth` hook
- Add "Admin Panel" dropdown item with Shield icon
- Only show if `isAdmin` is true
- Add same to mobile menu

---

## User Manager Features

### Table Columns
- Avatar (initials)
- Display Name
- Email
- Current Roles (badges)
- Joined Date
- Actions (grant/revoke role buttons)

### Actions Available
- **Make Admin**: Adds "admin" role to user
- **Remove Admin**: Removes "admin" role from user
- **Make Moderator**: Adds "moderator" role
- Confirmation dialogs for security

---

## Security Considerations

1. All role changes happen server-side via RLS policies
2. Only existing admins can modify roles
3. The `has_role()` function is `SECURITY DEFINER` - can't be bypassed
4. Users cannot escalate their own privileges
5. Admins cannot remove their own admin role (prevents lockout)

---

## Route Addition

Add to `src/App.tsx`:
```text
/admin/users → UserManager (AdminRoute protected)
```

Add to `src/components/admin/AdminSidebar.tsx`:
- Add "Users" nav item pointing to `/admin/users`

---

## Summary

| Change | Description |
|--------|-------------|
| Grant admin access | Add admin role to your account |
| Navigation update | Show "Admin Panel" link for admins only |
| User Manager page | Full user list with role management |
| RLS policies | Secure role modification to admins only |
| Sidebar update | Add Users link to admin sidebar |

After implementation, you'll be able to:
1. See "Admin Panel" in your user dropdown
2. Access `/admin` dashboard
3. Go to `/admin/users` to manage other users' access
4. Grant admin access to anyone you approve


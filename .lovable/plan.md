
# Add "Tester" Role for Full Platform Testing Access

## Overview

Create a new "tester" role that grants designated users full access to test the platform without needing admin privileges. Testers get:
- All courses unlocked (bypass enrollment requirements)
- All modules accessible (skip progression locks)
- Ability to take quizzes normally (results tracked for testing purposes)
- Full video access (bypass video watch requirements)
- No subscription/trial restrictions

Unlike admin test mode, testers:
- Do NOT have admin panel access
- Do NOT have the ability to toggle bypasses on/off
- Have a distinct visual indicator (purple "Tester Mode" banner vs red "Admin Test Mode")
- Their quiz results and progress ARE tracked normally for testing validation

---

## System Architecture

```text
                    ROLE-BASED TEST ACCESS
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌────────────┐    ┌────────────┐    ┌────────────┐           │
│   │   Admin    │    │   Tester   │    │  Student   │           │
│   │            │    │            │    │            │           │
│   │ Full admin │    │ Full test  │    │ Normal     │           │
│   │ + test mode│    │ access     │    │ access     │           │
│   └────────────┘    └────────────┘    └────────────┘           │
│         │                 │                 │                   │
│         ▼                 ▼                 ▼                   │
│   ┌────────────────────────────────────────────────────────┐   │
│   │              TestModeContext (enhanced)                 │   │
│   │   - Checks for 'admin' OR 'tester' role                │   │
│   │   - Testers get automatic full access                   │   │
│   │   - Admins toggle test mode manually                    │   │
│   └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Changes

### Add 'tester' to app_role enum

```sql
ALTER TYPE public.app_role ADD VALUE 'tester';
```

This adds the new role value to the existing enum used in the `user_roles` table.

---

## Implementation Details

### 1. New Hook: useTesterAuth

Similar to `useAdminAuth`, this hook checks if the current user has the "tester" role.

```typescript
// src/hooks/useTesterAuth.ts
export function useTesterAuth() {
  const { user, loading: authLoading } = useAuth();

  const { data: isTester, isLoading: roleLoading } = useQuery({
    queryKey: ["tester-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "tester",
      });
      return data === true;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    isTester: isTester ?? false,
    isLoading: authLoading || roleLoading,
    user,
  };
}
```

### 2. Enhanced TestModeContext

Update the context to recognize testers as having automatic test access:

| Check | Admin | Tester | Student |
|-------|-------|--------|---------|
| `canUseTestMode` | Yes (toggle) | N/A (always on) | No |
| `isTestModeEnabled` | Manual toggle | Always true | No |
| `isTesterRole` | false | true | false |

Key changes:
- Add `isTester` check from new hook
- Testers get `isTestModeEnabled = true` automatically (no toggle)
- All bypass flags enabled by default for testers
- Add `isTesterRole` flag to distinguish display

### 3. TesterModeBanner Component

A distinct purple banner for testers (different from admin's red banner):

```text
┌─────────────────────────────────────────────────────────────────┐
│ 🧪 Tester Mode Active — Full platform access for testing       │
└─────────────────────────────────────────────────────────────────┘
```

Unlike the admin banner:
- No "Disable" button (testers can't toggle off)
- Purple/violet color scheme to distinguish from admin
- Shows simpler message (no bypass toggles)

### 4. Update UserManager for Tester Role

Add "Make Tester" and "Remove Tester" options to the user management dropdown, similar to existing admin/moderator/professor role management.

### 5. Update StudentFilters for Tester Role

Add "tester" option to the role filter dropdown so admins can filter to see all testers.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useTesterAuth.ts` | Hook to check if user has tester role |
| `src/components/admin/TesterModeBanner.tsx` | Purple banner shown to testers |

## Files to Modify

| File | Changes |
|------|---------|
| `src/contexts/TestModeContext.tsx` | Add tester role detection, automatic enabling |
| `src/hooks/useTestMode.ts` | Add `isTesterRole` flag |
| `src/pages/admin/UserManager.tsx` | Add Make/Remove Tester menu options |
| `src/components/admin/StudentFilters.tsx` | Add "tester" to RoleFilter type |
| `src/App.tsx` | Include TesterModeBanner component |
| Database migration | Add 'tester' to app_role enum |

---

## Behavior Matrix

| Feature | Admin (Test Mode OFF) | Admin (Test Mode ON) | Tester | Student |
|---------|----------------------|---------------------|--------|---------|
| Course enrollment check | Normal | Bypassed | Bypassed | Normal |
| Video progress tracking | Normal | Optional bypass | Bypassed | Normal |
| Quiz taking | Normal | Auto-pass option | Normal (tracked) | Normal |
| Progression locks | Normal | Can skip | Unlocked | Normal |
| Subscription check | Normal | Bypassed | Bypassed | Normal |
| Admin panel access | Yes | Yes | No | No |
| Banner shown | None | Red | Purple | None |
| Can toggle mode | N/A | Yes | No | N/A |

---

## Key Differences: Tester vs Admin Test Mode

| Aspect | Tester Role | Admin Test Mode |
|--------|-------------|-----------------|
| Access control | Role-based (permanent until removed) | Toggle (admin chooses when to use) |
| Quiz results | Always tracked normally | Can auto-pass (skip tracking) |
| Banner color | Purple (tester) | Red (warning) |
| Disable button | None | Yes |
| Admin panel | No access | Full access |
| Purpose | QA testing by non-admins | Admin development/debugging |

---

## User Experience Flow

### Granting Tester Access
1. Admin navigates to User Management (`/admin/users`)
2. Finds the user to make a tester
3. Clicks dropdown menu → "Make Tester"
4. Confirms in dialog
5. User now has tester role

### Tester Using Platform
1. Tester logs in normally
2. Purple "Tester Mode Active" banner appears
3. All courses visible and accessible
4. Can enroll in any course without limits
5. All modules unlocked within courses
6. Can take quizzes (results tracked for validation)
7. Progress saved normally for testing verification
8. No admin panel access (404 if attempted)

---

## Summary

| Category | Changes |
|----------|---------|
| Database | Add 'tester' value to app_role enum |
| New Files | 2 (useTesterAuth hook, TesterModeBanner) |
| Modified Files | 5 (context, hook, UserManager, filters, App) |
| Role Management | Full CRUD via existing useManageRoles hook |

This implementation allows admins to designate specific users as testers, giving them full platform access for QA testing while:
- Keeping their quiz results and progress tracked
- Preventing access to administrative functions
- Providing a clear visual indicator of their testing status

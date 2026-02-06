
# Fix: User List Not Refreshing After Deletion

## Problem
When deleting a user, the edge function succeeds (confirmed in logs: "User successfully deleted"), but the user remains visible in the list. The UI doesn't refresh after deletion.

## Root Cause
**Query key mismatch between the hook and invalidation:**

| Location | Query Key Used |
|----------|----------------|
| `useAdminStudents` | `["admin-students", showDemoData]` |
| `deleteUser` invalidation | `["admin-students"]` |

The `useAdminStudents` hook includes `showDemoData` (a boolean) in its query key, but the invalidation in `deleteUser` only invalidates `["admin-students"]` without matching the full key.

React Query's `invalidateQueries` with an exact key like `["admin-students"]` won't match `["admin-students", true]` or `["admin-students", false]`.

## Solution
Update the `deleteUser` function to use a **partial match** that invalidates all queries starting with `["admin-students"]`, regardless of additional parameters.

Change from:
```typescript
queryClient.invalidateQueries({ queryKey: ["admin-students"] });
```

To:
```typescript
queryClient.invalidateQueries({ queryKey: ["admin-students"], exact: false });
```

Setting `exact: false` ensures any query key that starts with `["admin-students"]` gets invalidated, including `["admin-students", true]` and `["admin-students", false]`.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useAdminQuizManagement.ts` | Add `exact: false` to the query invalidation for `deleteUser` |

---

## Technical Details

React Query's `invalidateQueries` behavior:
- **Default (exact: true)**: Only invalidates queries with exactly matching keys
- **exact: false**: Invalidates all queries whose keys start with the provided prefix

Since `showDemoData` is dynamically added to the query key, we need partial matching to catch all variations.

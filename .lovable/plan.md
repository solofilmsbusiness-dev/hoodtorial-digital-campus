
# Fix: Course Unlock Not Reflecting on Academics Page

## Problem Identified

When you toggle the "Coming Soon" lock status in the admin panel, the academics page still shows the course as locked. This happens because:

1. **Admin panel** uses query key: `["admin-courses"]`
2. **Academics page** uses query key: `["course-status"]`

When you toggle the lock status in admin, only `["admin-courses"]` gets invalidated/refreshed. The academics page cache remains stale with the old lock status.

---

## Solution

When toggling course status in the admin panel, also invalidate the `["course-status"]` query key so the academics page fetches fresh data.

---

## Changes Required

### File: `src/pages/admin/CourseManager.tsx`

Update both mutation `onSuccess` handlers to invalidate the course-status query:

**togglePublished mutation (around line 133-135):**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
  queryClient.invalidateQueries({ queryKey: ["course-status"] }); // ADD THIS
  toast({ title: "Course updated" });
},
```

**toggleLocked mutation (around line 155-157):**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
  queryClient.invalidateQueries({ queryKey: ["course-status"] }); // ADD THIS
  toast({ title: "Course updated" });
},
```

---

## Why This Fixes It

| Before | After |
|--------|-------|
| Admin toggle updates DB | Admin toggle updates DB |
| Only admin cache refreshed | Both admin AND academics caches refreshed |
| Academics page shows stale data | Academics page shows updated data immediately |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/admin/CourseManager.tsx` | Add `queryClient.invalidateQueries({ queryKey: ["course-status"] })` to both toggle mutations |

---

## Technical Notes

- The `useCourseStatus` hook has a 5-minute stale time, so without invalidation the user would have to wait up to 5 minutes to see updates
- Adding the invalidation ensures immediate synchronization between admin panel and public-facing pages
- This same pattern should be applied to the `deleteCourse` mutation for consistency

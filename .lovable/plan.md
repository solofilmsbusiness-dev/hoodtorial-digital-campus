

## Fix: User Deletion Error & Static Course Management

### Issue 1: Admin Cannot Delete Users

**Root Cause:** When a user's auth record has already been removed (e.g., previously deleted or orphaned), the `delete-user` edge function calls `auth.admin.deleteUser()` which throws a 404 "User not found" error. The profile row remains in the database, leaving a ghost entry the admin can never remove.

**Fix:** Update the `delete-user` edge function to:
- Catch the "User not found" error from `auth.admin.deleteUser()` and treat it as a success (the auth record is already gone)
- After deleting (or confirming absence of) the auth record, explicitly delete the profile row and any other orphaned data using the service-role client
- This ensures admins can always clean up user entries regardless of auth state

**File:** `supabase/functions/delete-user/index.ts`

---

### Issue 2: "Lighting for Mobile Film" Cannot Be Deleted or Hidden

**Root Cause:** HU-102 exists only in static data (`src/data/courses.ts`) but has no row in the `courses` database table. The Course Manager flags it as `isStaticOnly: true`, which disables the Published toggle, Coming Soon toggle, and Delete button. The admin has no way to manage it.

**Fix:** Update `CourseManager.tsx` to auto-initialize a static-only course into the database when an admin tries to toggle its visibility or delete it, rather than blocking the action entirely. Specifically:

- When an admin clicks "Published" or "Coming Soon" on a static-only course, first insert it into the `courses` table (from static data), then apply the toggle
- When an admin clicks "Delete" on a static-only course, show a message explaining it's a built-in course that can be hidden instead, or allow them to initialize and then delete it
- Remove the `disabled={course.isStaticOnly}` restrictions on the toggle buttons and delete button
- Add an `autoInitializeCourse` helper mutation that creates the DB row from static data on demand

**File:** `src/pages/admin/CourseManager.tsx`

---

### Technical Summary

| File | Change |
|------|--------|
| `supabase/functions/delete-user/index.ts` | Handle 404 "User not found" gracefully; also delete orphaned profile rows directly |
| `src/pages/admin/CourseManager.tsx` | Auto-initialize static-only courses into DB when admin interacts with them; remove `isStaticOnly` disabled states |


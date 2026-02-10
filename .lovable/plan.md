

## Fix: Ensure All Courses Can Be Deleted and Hidden

### Problem
When courses have been initialized into the database, static-only courses (ones that exist in code but weren't imported to the DB) still appear in the table. These courses use their code (e.g., "MF-201") as a fake ID. Clicking Delete or toggling Published/Hidden targets a database row that doesn't exist, so nothing happens.

Additionally, the `isUsingStaticData` flag only disables buttons when there are **zero** DB courses. Once some courses are in the DB, the buttons become enabled for all rows -- including static-only ones that have no matching DB record.

### Solution
Track which courses are "static-only" (not in the database) on a per-row basis, and disable actions for those rows while enabling them for all real DB courses.

### Technical Changes

**File: `src/pages/admin/CourseManager.tsx`**

1. **Add an `isStaticOnly` flag to each course in the merge logic** -- courses from the static fallback that have no matching DB record get `isStaticOnly: true`. DB courses get `isStaticOnly: false`.

2. **Use `isStaticOnly` per-row instead of the global `isUsingStaticData`** to disable the Published toggle, Coming Soon toggle, and Delete button. This means:
   - DB courses: all actions work (delete, hide, lock)
   - Static-only courses: actions are disabled with a tooltip explaining the course needs to be initialized first

3. **Update the `Course` interface** to include `isStaticOnly: boolean`.

4. **Keep the global `isUsingStaticData` banner** at the top for when zero courses are in the DB (unchanged).

### What This Fixes
- "Lighting for Mobile Film" and any other static-only course will show disabled action buttons with a clear explanation
- All database-backed courses will be fully deletable and hideable regardless of whether static courses also exist
- No silent failures -- the UI accurately reflects what actions are possible


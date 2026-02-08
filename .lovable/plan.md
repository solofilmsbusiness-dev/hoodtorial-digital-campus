

# Fix: Database Content Not Showing for Static Courses

## Problem

When you add quizzes, videos, or other content to HU-101 (iPhone Cinematography) in the admin panel, those changes are saved to the database but **never displayed** on the course detail page.

This happens because the code has a "fallback" rule: if a course exists in both the old static data files AND the database, it **always uses the static version** and ignores the database. Since HU-101 is one of the original static courses, your database edits are invisible.

## Solution

Change the logic so that **if the database has modules/content, use the database version**. Only fall back to static data if the database has no modules at all.

## Technical Changes

### 1. Update `src/pages/CourseDetail.tsx` (lines ~129-146)

Current logic:
```
If static course has modules -> always use static
```

New logic:
```
If database course has modules -> use database
Else if static course has modules -> fall back to static
```

This is a small change to the `useMemo` block that builds the course object. The condition flips from "prefer static" to "prefer database when it has content."

### 2. Update `src/hooks/useCourseStatus.ts`

The same fallback pattern exists in the course status hook (used by the Academics page and Student Center). Apply the same fix: prefer database modules when they exist, only fall back to static when the database has none.

## What This Fixes

- Quizzes you add in admin will appear on the course page
- Video URLs you set on lessons will play correctly
- Any module/lesson edits in admin will be reflected for students
- Courses that only exist in static data (and haven't been edited in admin) continue working as before

## Important Note

Since existing student progress may be tracked against old static IDs (like `hu101-q1`), the new database content will use different IDs (UUIDs). This means previously completed progress won't carry over to the new database-driven content -- but going forward, all new progress will track against the database IDs.


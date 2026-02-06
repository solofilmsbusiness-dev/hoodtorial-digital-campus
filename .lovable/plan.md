

# Fix: Admin Course List, Footer Links, and Video Skip Option

## 1. Admin Course Manager -- Show All Courses

**Problem:** When the database has courses (e.g., 27), the admin only sees those 27. Any static courses not yet seeded into the DB are invisible.

**Fix in `src/pages/admin/CourseManager.tsx`:**
- Change the course list logic (lines 70-81) to merge DB courses with static courses
- After loading DB courses, check which static course codes are missing from the DB
- Append those missing static courses to the list with a visual "Not in DB" badge
- This ensures every course from the static catalog is always visible to the admin

```text
Current logic:
  DB has courses? -> show only DB courses
  DB empty? -> show static courses

New logic:
  Start with DB courses
  + Append any static courses whose code is NOT in the DB set
  = Complete merged list
```

## 2. Footer Links -- Fix Broken Navigation

**Problem:** Several footer links point to non-existent routes:
- "Student Center" points to `/student-center` (correct route is `/student`)
- "Contact" points to `/contact` (no such page)
- "Privacy", "Terms", "Academic Integrity" point to pages that don't exist

**Fix in `src/components/layout/Footer.tsx`:**
- Update "Student Center" href to `/student`
- Replace "Contact" with "Community" linking to `/community`
- Replace legal links with existing pages: "About" -> `/about`
- Keep the legal section but point to real routes or remove dead links

## 3. Video Lessons -- Allow Skipping (Remove 90% Requirement)

**Problem:** Users currently must watch 90% of a video before they can mark a lesson complete and proceed. The user wants students to be able to skip videos without watching the full 90%.

**Changes across multiple files:**

### `src/pages/CourseDetail.tsx`
- Remove the 90% gate on the "Mark Complete" button (lines 370-378 and 674-701)
- Allow the "Mark Complete" button to always be clickable for video lessons (not disabled)
- Remove the "Watch at least 90%" messaging, replace with optional progress display
- Keep video progress tracking (so admins can still see how much was watched) but don't block progression

### `src/hooks/useLessonProgress.ts`
- In `isContentUnlocked` (line ~80), change the video lesson check: instead of requiring 90% watched OR completed, just check if `completed` is true
- In `isLessonCompleted` (line ~162), same change: only check `data.completed`, not `watchPercentage >= WATCH_THRESHOLD`
- In `getModuleProgress` (line ~143), same: only count a video lesson as complete if `data.completed` is true (no auto-complete from watch percentage)

### `src/hooks/useVideoProgress.ts`
- Remove the auto-completion logic that triggers `onComplete` when reaching 90%
- Keep progress tracking and saving (useful for analytics) but don't auto-mark as complete
- The `isCompleted` state should only be true if explicitly marked complete in the DB, not from watch percentage

### Summary of behavior change:
- Video progress is still tracked and displayed (watch percentage bar still shows)
- Students can click "Mark Complete" at any time, regardless of how much they watched
- Sequential progression still works -- you must mark a lesson complete to unlock the next one
- Admins can still see watch percentages in analytics

## Files Summary

| File | Change |
|------|--------|
| `src/pages/admin/CourseManager.tsx` | Merge static courses not in DB into the displayed list |
| `src/components/layout/Footer.tsx` | Fix hrefs: Student Center -> /student, Contact -> /community, legal -> /about |
| `src/pages/CourseDetail.tsx` | Remove 90% gate on Mark Complete button, allow skipping videos |
| `src/hooks/useLessonProgress.ts` | Remove watch percentage checks from unlock/completion logic |
| `src/hooks/useVideoProgress.ts` | Remove auto-complete on 90% threshold, keep tracking only |


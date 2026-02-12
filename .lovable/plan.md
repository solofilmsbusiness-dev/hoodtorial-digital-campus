
## Three Fixes: Faculty Photos, Intro Videos, and Gallery Comments

### Issue 1: Faculty Image Shows Blank

**Root Cause:** The existing faculty member has a YouTube URL (`https://www.youtube.com/watch?v=ME1_SxxAr4o`) stored in the `image_url` column. The template renders this as an `<img>` tag, which can't display a YouTube link -- resulting in a blank box.

**Fix (Admin side):** Replace the plain "Image URL" text input in `FacultyManager.tsx` with a proper file upload button that uploads to the existing `site-assets` storage bucket and saves the resulting public URL. Keep the URL input as a fallback for pasting external image links.

**Fix (Faculty page):** No changes needed -- the `<img>` tag will work once `image_url` contains an actual image URL from the upload.

**Files:** `src/pages/admin/FacultyManager.tsx`

---

### Issue 2: "Watch Intro" Button Does Nothing

**Root Cause:** The "Watch Intro" buttons in `Faculty.tsx` are plain `<Button>` elements with no `onClick` handler and no video URL stored in the database. The `faculty_members` table has no `intro_video_url` column.

**Fix:**
- Add an `intro_video_url` column to the `faculty_members` table (text, nullable)
- Add a "Video URL" input field to the admin Faculty Manager form
- Update `Faculty.tsx` to open a dialog/modal that plays the intro video (supports YouTube, Vimeo, and direct video URLs using the existing `videoUtils.ts` helpers)
- Hide the "Watch Intro" button when no video URL is set

**Files:** Database migration, `src/pages/admin/FacultyManager.tsx`, `src/pages/Faculty.tsx`, `src/hooks/useFacultyMembers.ts`

---

### Issue 3: Users Cannot Comment on Portfolio Gallery Images

**Root Cause:** The `ProfileGallery` component is a standalone lightbox with no commenting system. There's no database table or UI to support per-image comments.

**Fix:**
- Create a new `gallery_comments` table with columns: `id`, `gallery_owner_id` (the profile owner), `image_url` (which gallery image), `user_id` (commenter), `content`, `created_at`
- Add RLS policies allowing authenticated users to read and create comments, and delete their own
- Create a `useGalleryComments` hook for fetching/creating/deleting comments on a specific gallery image
- Update the `ProfileGallery` lightbox dialog to show a comment thread below the image, with an input to add a comment (similar to the existing community comment system but simpler)
- Include commenter avatar, name (linked to their profile), and timestamp

**Files:** Database migration, new `src/hooks/useGalleryComments.ts`, `src/components/profile/ProfileGallery.tsx`

---

### Technical Summary

| File | Change |
|------|--------|
| Database migration | Add `intro_video_url` to `faculty_members`; create `gallery_comments` table with RLS |
| `src/pages/admin/FacultyManager.tsx` | Add image file upload button + intro video URL field |
| `src/pages/Faculty.tsx` | Video playback modal for "Watch Intro"; hide button when no video |
| `src/hooks/useFacultyMembers.ts` | Add `intro_video_url` to types |
| `src/hooks/useGalleryComments.ts` | New hook: fetch, create, delete gallery comments |
| `src/components/profile/ProfileGallery.tsx` | Add comment thread to lightbox dialog |

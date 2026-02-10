

## Direct Video Upload for Course Lessons (up to 400MB)

### What Changes
Right now, video lessons only accept a URL (YouTube, Vimeo, or a link to a hosted file). This update adds a direct file upload option so you can upload full-quality videos straight from your computer -- up to 400MB per file.

### How It Will Work
- When editing a video lesson, you will see two tabs: **"Paste URL"** and **"Upload Video"**
- The Upload tab provides a drag-and-drop area for .mp4, .webm, and .mov files
- A progress bar shows upload status
- Once uploaded, a preview of the video appears in the dialog
- You can remove an uploaded video and switch back to URL if needed
- Uploaded videos play exactly the same as any other direct video in the course player -- no changes needed there

### Technical Details

**1. Create `lesson-videos` storage bucket (migration)**
- New bucket with a 400MB file size limit
- Allowed MIME types: `video/mp4`, `video/webm`, `video/quicktime`
- Public bucket so students can stream videos
- RLS policies: authenticated users can upload; admins can delete; public read access

**2. Create `useLessonVideoUpload` hook** (`src/hooks/useLessonVideoUpload.ts`)
- Mirrors the existing `useLessonDocumentUpload` pattern
- 400MB max file size validation
- Uploads to `lesson-videos` bucket with unique filenames
- Returns public URL on success
- Provides `uploadVideo`, `deleteVideo`, `isUploading`, `uploadProgress`

**3. Update `LessonDialog` component** (`src/components/admin/LessonDialog.tsx`)
- Add a toggle (tabs) between "URL" and "Upload" when lesson type is "video"
- Upload mode: file picker for video files with progress bar and preview
- URL mode: existing URL input (unchanged)
- When a video is uploaded, its public URL is saved to `video_url` -- the rest of the system already handles direct video URLs seamlessly

**No other changes needed** -- the `VideoPlayer` component and course detail page already support direct `.mp4/.webm` URLs via the `getVideoType("direct")` path.


# Fix Course Edit Button & Clarify Video Link Support

## Issues Identified

### Issue 1: Can't Click Edit Button for Some Courses

**Root Cause**: One course in the database ("Intro To Drone Cinematography") has an empty course code (`code: ""`). When clicking the edit pencil button for this course:

1. The Link navigates to `/admin/courses/${course.code}`
2. With an empty code, this becomes `/admin/courses/`
3. This URL matches the **CourseManager** route (`/admin/courses`) instead of the **CourseEditor** route (`/admin/courses/:code`)
4. Result: The page "refreshes" to CourseManager instead of opening the editor

**Evidence from database query:**
```
id: 1b5c84d1-e921-4c1c-8c8e-b23731a47a90
code: ""  <-- EMPTY!
title: "Intro To Drone Cinematography"
```

**Fix**: Two-pronged approach:
1. Fix the existing data - update the empty code to a valid code
2. Add validation in the UI to prevent editing courses with empty codes

### Issue 2: Adding Video Links to Courses

**Current State**: Video links ARE already supported for **lessons**:
- When creating/editing a lesson in the LessonDialog
- Select type "Video" 
- A "Video URL" field appears that supports YouTube, Vimeo, and direct .mp4/.webm URLs
- A live preview of the video is shown

**Potential Confusion**: The user may be expecting:
- A course-level intro/promo video (not currently supported)
- Or they may not realize the video URL field appears only when the lesson type is "video"

---

## Implementation Plan

### Phase 1: Fix Empty Course Code Issue

**Database Fix**: Update the course with empty code to have a valid code
```sql
UPDATE courses SET code = 'CIN-DRONE' WHERE id = '1b5c84d1-e921-4c1c-8c8e-b23731a47a90' AND code = '';
```

### Phase 2: Prevent Future Empty Code Issues

**File**: `src/pages/admin/CourseManager.tsx`

Add a check before rendering the edit link. If the course has an empty code, show a warning or disable the edit button:

```typescript
// In the table row for each course
{course.code ? (
  <Button variant="ghost" size="icon" asChild>
    <Link to={`/admin/courses/${course.code}`}>
      <Pencil className="h-4 w-4" />
    </Link>
  </Button>
) : (
  <Button 
    variant="ghost" 
    size="icon" 
    disabled 
    title="Course has no code - cannot edit"
  >
    <Pencil className="h-4 w-4" />
  </Button>
)}
```

### Phase 3: Add Course-Level Promo Video (Optional Enhancement)

If a course-level intro/promo video is desired:

**Database Migration**: Add `intro_video_url` column to courses table
```sql
ALTER TABLE courses ADD COLUMN intro_video_url text;
```

**File**: `src/pages/admin/CourseEditor.tsx`

Add a new field in the Course Details card:
- Input for intro/promo video URL
- Preview similar to the LessonDialog video preview

**File**: `src/pages/CourseDetail.tsx`

Display the intro video at the top of the course page before the modules.

---

## Files Summary

| File | Changes |
|------|---------|
| Database | Fix empty code: `UPDATE courses SET code = 'CIN-DRONE' WHERE code = ''` |
| `src/pages/admin/CourseManager.tsx` | Add guard for empty course codes on edit button |
| `src/pages/admin/CourseEditor.tsx` | (Optional) Add intro video URL field |

---

## Clarification: Video Links for Lessons

Video links are already supported in the lesson editor. To add a video to a lesson:

1. Go to Course Editor > Modules section
2. Add or edit a lesson
3. Change the lesson "Type" dropdown to "Video"
4. The "Video URL" field will appear
5. Paste a YouTube, Vimeo, or direct video URL
6. A preview will show automatically

---

## Expected Outcome

1. All courses will be editable (no empty code issues)
2. Future courses cannot be saved without a valid code (already implemented via `canSave` validation)
3. Clear understanding that video URLs are added at the lesson level
4. (Optional) Course-level promo videos for marketing/intro purposes

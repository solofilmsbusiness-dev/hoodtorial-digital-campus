
# Improve Course Visibility Controls in Admin

## Current State

The admin already has the ability to hide courses from the Academics page:
- **Course Editor** (`/admin/courses/:code`): Has a "Visibility" card with a "Published" switch
- **Course Manager** (`/admin/courses`): Has clickable Published/Hidden badge toggles

When "Published" is toggled off, `useCourseStatus` filters out the course from the Academics page (line 93: `filter(course => course.isPublished)`).

## Problem

The current labels ("Published" / "Visible to students") don't clearly communicate that toggling this off will **completely hide the course from the Academics page**. This may be why it seems like the option doesn't exist.

## Changes

### 1. Improve Course Editor Labels (src/pages/admin/CourseEditor.tsx)

Update the Visibility card to make the behavior explicit:
- "Published" label stays, but description changes to **"Show on Academics page. When off, course is completely hidden from students."**
- "Coming Soon" description changes to **"Show course on Academics page but lock enrollment."**

### 2. Improve Course Manager Labels (src/pages/admin/CourseManager.tsx)

Add a tooltip or clearer labeling on the Published/Hidden badge toggle to indicate it controls Academics page visibility.

### 3. Add "Hidden" Status Badge Styling

Make the "Hidden" state more visually distinct (e.g., red/destructive styling) so admins clearly see which courses are hidden from the Academics page.

No database changes needed -- the existing `is_published` column already handles this correctly.

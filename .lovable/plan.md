

# Build Admin Backend System

## The Problem
The `/admin` route returns a 404 error because the admin pages were never created. The previous plan was proposed but not implemented.

---

## What Will Be Built

### 1. Admin Route Protection
Create a secure `AdminRoute` component that:
- Checks if user is authenticated
- Verifies user has `admin` role via `has_role()` function
- Redirects non-admins to home with error toast

### 2. Admin Hook
Create `useAdminAuth` hook to:
- Query user's role from database
- Return `{ isAdmin, isLoading }` for use throughout admin pages

### 3. Admin Pages

**Dashboard (`/admin`)**
- Overview stats (total courses, students, quiz completions)
- Quick action links
- Recent activity

**Course Manager (`/admin/courses`)**
- List all courses from static data (for now)
- Edit, lock/unlock, and visibility toggles
- "Coming Soon" badge support

**Course Editor (`/admin/courses/:code`)**
- Edit course title, description, credits, level
- Manage modules (add, edit, delete, reorder)
- Add lessons with video URLs
- Quiz configuration

### 4. Admin Layout
Create consistent admin layout with:
- Sidebar navigation
- Dark theme matching site aesthetic
- Breadcrumb navigation

---

## Database Changes

### New Tables

**courses**
```text
id              uuid PRIMARY KEY
code            text UNIQUE
title           text
description     text
department_id   text
credits         integer
level           text
duration        text
is_published    boolean DEFAULT true
is_locked       boolean DEFAULT false (Coming Soon)
sort_order      integer
created_at      timestamp
updated_at      timestamp
```

**modules**
```text
id              uuid PRIMARY KEY
course_id       uuid REFERENCES courses
title           text
sort_order      integer
created_at      timestamp
updated_at      timestamp
```

**lessons**
```text
id              uuid PRIMARY KEY
module_id       uuid REFERENCES modules
title           text
description     text
duration        text
type            text (video, reading, practice)
video_url       text NULLABLE
content         text NULLABLE
sort_order      integer
created_at      timestamp
updated_at      timestamp
```

### RLS Policies
- All users can READ published courses
- Only admin role can INSERT, UPDATE, DELETE
- Uses `has_role(auth.uid(), 'admin')` for authorization

---

## Files to Create

### Admin Components
- `src/components/admin/AdminLayout.tsx` - Layout wrapper with sidebar
- `src/components/admin/AdminSidebar.tsx` - Navigation sidebar
- `src/components/admin/CourseTable.tsx` - Course listing table
- `src/components/admin/ModuleEditor.tsx` - Module management
- `src/components/admin/LessonForm.tsx` - Lesson creation/editing
- `src/components/admin/VideoUrlInput.tsx` - Video URL with preview

### Admin Pages
- `src/pages/admin/AdminDashboard.tsx` - Main dashboard
- `src/pages/admin/CourseManager.tsx` - Course list/management
- `src/pages/admin/CourseEditor.tsx` - Individual course editing

### Protected Route
- `src/components/auth/AdminRoute.tsx` - Admin-only route guard

### Hooks
- `src/hooks/useAdminAuth.ts` - Admin role verification
- `src/hooks/useCourses.ts` - Course CRUD operations
- `src/hooks/useModules.ts` - Module CRUD operations
- `src/hooks/useLessons.ts` - Lesson CRUD operations

### Route Updates
Add to `src/App.tsx`:
```text
/admin          -> AdminDashboard (AdminRoute protected)
/admin/courses  -> CourseManager (AdminRoute protected)
/admin/courses/:code -> CourseEditor (AdminRoute protected)
```

---

## Admin Features

### Course Management
- View all courses in sortable table
- Toggle "Published" status (visible to students)
- Toggle "Coming Soon" / locked status
- Edit any course content inline or via detail page
- Add new courses
- Delete courses (with confirmation)

### Module & Lesson Management
- Drag-and-drop reordering
- Add/edit/delete modules within a course
- Add/edit/delete lessons within modules
- Video URL field with YouTube/Vimeo auto-detection
- Rich text for reading content

### Video URL Support
The video input will:
- Accept YouTube URLs (youtube.com, youtu.be)
- Accept Vimeo URLs
- Accept direct video links (.mp4, .webm)
- Show thumbnail preview when valid URL entered

---

## Data Migration Strategy

1. Create database tables first
2. Build admin interface pointing to database
3. Keep static `courses.ts` as fallback during transition
4. Add a data seeder to populate database from static data
5. Frontend queries database, falls back to static if empty

---

## Security Model

### Route Protection
```text
User visits /admin
  -> Check if authenticated (redirect to /auth if not)
  -> Check if has admin role (redirect to / with error if not)
  -> Show admin content
```

### Database Security
- RLS ensures only admins can modify course data
- Students can only read published, non-locked courses
- All checks happen server-side via Supabase policies

---

## Implementation Order

1. Create database tables and RLS policies
2. Create `AdminRoute` guard and `useAdminAuth` hook
3. Build admin layout and sidebar
4. Create dashboard page with basic stats
5. Build course manager (list view)
6. Build course editor with module/lesson management
7. Add video URL input with preview
8. Connect public course pages to database (with static fallback)

---

## Summary

This implementation creates a complete admin backend for managing all course content:

| Feature | Description |
|---------|-------------|
| Protected routes | Admin-only access via role check |
| Course CRUD | Add, edit, delete, lock courses |
| Module management | Organize course sections |
| Lesson management | Videos, readings, practice exercises |
| Video integration | YouTube, Vimeo, direct URL support |
| "Coming Soon" | Lock unreleased courses |
| Database-driven | All content stored in Lovable Cloud |


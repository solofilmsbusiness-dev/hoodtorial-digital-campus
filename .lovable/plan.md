

# Plan: Admin Video Management for Course Lessons

## Overview
Implement a complete admin interface for managing modules and lessons within courses, with video URL support for YouTube, Vimeo, and direct video files. This will replace the current "coming soon" placeholder in the CourseEditor with a fully functional module and lesson management system.

## Current State
- The database already has `modules` and `lessons` tables with `video_url` column
- The CourseEditor has a "Modules & Lessons" section with a disabled "Add Module" button
- The VideoPlayer component currently shows a placeholder instead of real videos
- RLS policies for admin CRUD operations already exist

## What Will Be Built

### 1. Module Management
- Add new modules to a course
- Edit module titles
- Reorder modules via drag-and-drop or sort buttons
- Delete modules (with confirmation)

### 2. Lesson Management (per Module)
- Add lessons with:
  - Title
  - Type (video, reading, practice)
  - Duration
  - Video URL (for video lessons)
  - Content/description
- Edit existing lessons
- Reorder lessons within modules
- Delete lessons

### 3. Video URL Input
Support three video sources:
- **YouTube**: Paste link like `https://youtube.com/watch?v=...` or `https://youtu.be/...`
- **Vimeo**: Paste link like `https://vimeo.com/...`
- **Direct URL**: Paste `.mp4` or `.webm` file URLs

### 4. Updated Video Player
Modify the VideoPlayer component to actually play videos based on the URL type, using:
- YouTube embed iframe for YouTube links
- Vimeo embed iframe for Vimeo links
- Native HTML5 `<video>` element for direct file URLs

## UI Layout

### Course Editor - Modules Section
```
┌──────────────────────────────────────────────────────────────────┐
│  Modules & Lessons                           [+ Add Module]       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ⋮⋮  Module 1: Getting Started           [Edit] [Delete]    │  │
│  │     ├─ Lesson 1: Introduction (video, 12 min)  [Edit] [×]  │  │
│  │     ├─ Lesson 2: Setup Guide (reading)         [Edit] [×]  │  │
│  │     └─ [+ Add Lesson]                                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ⋮⋮  Module 2: Core Concepts             [Edit] [Delete]    │  │
│  │     └─ [+ Add Lesson]                                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Add/Edit Lesson Dialog
```
┌────────────────────────────────────────────┐
│  Add Lesson                           [×]  │
├────────────────────────────────────────────┤
│  Title:  [________________________]        │
│                                            │
│  Type:   [Video        ▼]                  │
│                                            │
│  Duration: [12 min      ]                  │
│                                            │
│  Video URL:                                │
│  [https://youtube.com/watch?v=abc123]      │
│  ℹ️ Supports YouTube, Vimeo, or direct URLs │
│                                            │
│  Description (optional):                   │
│  [____________________________________]    │
│  [____________________________________]    │
│                                            │
│           [Cancel]    [Save Lesson]        │
└────────────────────────────────────────────┘
```

## Technical Implementation

### Files to Create

**1. `src/components/admin/ModuleEditor.tsx`**
Component for managing a single module with its lessons:
- Module title edit inline
- List of lessons with edit/delete buttons
- Add lesson button opening dialog
- Drag handle for reordering

**2. `src/components/admin/LessonDialog.tsx`**
Dialog component for adding/editing lessons:
- Form with title, type, duration, video_url, content
- Video URL validation and preview
- Save/cancel actions

**3. `src/hooks/useAdminCourseContent.ts`**
Custom hook for managing modules and lessons:
- Fetch modules and lessons for a course
- CRUD mutations for modules
- CRUD mutations for lessons
- Reorder functionality

### Files to Modify

**1. `src/pages/admin/CourseEditor.tsx`**
- Replace "coming soon" section with functional ModuleEditor list
- Add "Add Module" functionality
- Fetch and display modules from database

**2. `src/components/course/VideoPlayer.tsx`**
- Parse video URL to detect source type
- Render appropriate player (YouTube embed, Vimeo embed, or HTML5 video)
- Keep existing placeholder style for lessons without video_url

**3. `src/pages/CourseDetail.tsx`**
- Update to fetch lessons from database when available
- Fall back to static data when no database lessons exist

### Database Changes
No schema changes needed - the existing `lessons.video_url` column will be used.

### Video URL Parsing Logic
```typescript
function getVideoType(url: string): 'youtube' | 'vimeo' | 'direct' | null {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  if (url.match(/\.(mp4|webm)$/i)) return 'direct';
  return null;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}
```

## Implementation Order

1. Create `useAdminCourseContent` hook with data fetching and mutations
2. Create `LessonDialog` component for add/edit forms
3. Create `ModuleEditor` component with lesson list
4. Update `CourseEditor` to use new components
5. Update `VideoPlayer` to render actual videos
6. Update `CourseDetail` to prefer database lessons

## User Experience Flow

1. Admin navigates to `/admin/courses/HU-101`
2. Scrolls to "Modules & Lessons" section
3. Clicks "Add Module" → enters title → module appears
4. Clicks "Add Lesson" in module → dialog opens
5. Enters lesson details including YouTube URL
6. Saves → lesson appears in list
7. Student visits course → video plays in lesson viewer


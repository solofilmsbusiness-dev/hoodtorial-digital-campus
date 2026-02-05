
# Enhanced Profile Gallery & Customization System

## Overview

Transform the profile editing experience into a powerful creative canvas where students can:
1. **Manage Portfolio Gallery** in the Edit Profile page with drag-to-reorder capability
2. **Add a Featured Project** with a prominent, full-width showcase display
3. **Rearrange Profile Sections** to customize the layout of their public profile
4. **Enhanced Visual Focus** with larger gallery items and better media presentation

---

## Current State

| Feature | Status |
|---------|--------|
| Portfolio Gallery on Public Profile | Exists (view-only grid) |
| Portfolio Gallery in Edit Profile | Missing |
| Drag-to-reorder gallery items | Missing |
| Featured Project showcase | Missing (only text field) |
| Section reordering | Missing |
| Custom layout control | Missing |

---

## Database Changes

### New Columns on profiles Table

```sql
ALTER TABLE public.profiles
ADD COLUMN featured_project_url TEXT,
ADD COLUMN featured_project_title TEXT,
ADD COLUMN featured_project_thumbnail TEXT,
ADD COLUMN profile_section_order TEXT[] DEFAULT ARRAY['stats', 'achievements', 'gallery', 'wall'];
```

### Update profiles_public View

Add new columns for public visibility:

```sql
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  -- existing columns --
  featured_project_url,
  featured_project_title,
  featured_project_thumbnail,
  profile_section_order
FROM public.profiles;
```

---

## System Architecture

```text
                 ENHANCED EDIT PROFILE LAYOUT
┌─────────────────────────────────────────────────────────────────┐
│  EDIT PROFILE PAGE                                              │
├─────────────────────────────────────────────────────────────────┤
│  1. Cover & Avatar          [existing]                          │
│  2. Basic Information       [existing]                          │
│  3. Creative Identity       [existing]                          │
├─────────────────────────────────────────────────────────────────┤
│  4. FEATURED PROJECT SHOWCASE  [NEW]                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Project Title: [________________]                          ││
│  │  Project URL:   [________________] (YouTube/Vimeo/Link)     ││
│  │  Thumbnail:     [Upload] or [Auto-fetch from URL]           ││
│  │                                                              ││
│  │  Preview: ┌─────────────────────────────────────────────┐   ││
│  │           │        FULL WIDTH VIDEO/IMAGE PREVIEW       │   ││
│  │           └─────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  5. PORTFOLIO GALLERY MANAGER  [NEW]                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  [+ Add Media]                          12/12 slots used    ││
│  │                                                              ││
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                       ││
│  │  │ ≡ 1 │ │ ≡ 2 │ │ ≡ 3 │ │ ≡ 4 │  ← Drag handles         ││
│  │  │ IMG │ │ VID │ │ IMG │ │ IMG │                            ││
│  │  │ [X] │ │ [X] │ │ [X] │ │ [X] │  ← Delete buttons         ││
│  │  └──────┘ └──────┘ └──────┘ └──────┘                       ││
│  │                                                              ││
│  │  Drag items to reorder. Changes save automatically.         ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  6. PROFILE LAYOUT CUSTOMIZATION  [NEW]                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Drag sections to reorder how they appear on your profile:  ││
│  │                                                              ││
│  │  ┌─────────────────────────────────────────────────────┐    ││
│  │  │ ≡  Academic Stats                                   │    ││
│  │  └─────────────────────────────────────────────────────┘    ││
│  │  ┌─────────────────────────────────────────────────────┐    ││
│  │  │ ≡  Course Achievements                              │    ││
│  │  └─────────────────────────────────────────────────────┘    ││
│  │  ┌─────────────────────────────────────────────────────┐    ││
│  │  │ ≡  Portfolio Gallery                                │    ││
│  │  └─────────────────────────────────────────────────────┘    ││
│  │  ┌─────────────────────────────────────────────────────┐    ││
│  │  │ ≡  Profile Wall                                     │    ││
│  │  └─────────────────────────────────────────────────────┘    ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  7. Portfolio & Social Links  [existing]                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Public Profile Layout (After Changes)

```text
                    PUBLIC PROFILE (CUSTOMIZED)
┌─────────────────────────────────────────────────────────────────┐
│  [Cover Banner]                                                 │
│  [Avatar & Identity]                                            │
│  [Bio Quote]                                                    │
│  [Creative Info Cards]                                          │
├─────────────────────────────────────────────────────────────────┤
│  ◆ FEATURED PROJECT ◆  [NEW - Always at top if set]            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │               FULL WIDTH VIDEO EMBED                        ││
│  │               or HERO IMAGE WITH LINK                       ││
│  │                                                              ││
│  │  "My Latest Short Film"                                     ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  [Sections rendered in user's custom order]                     │
│                                                                 │
│  e.g., if order = ['gallery', 'stats', 'achievements', 'wall']: │
│                                                                 │
│  ◆ PORTFOLIO GALLERY ◆                                          │
│  [Larger, more visual grid]                                     │
│                                                                 │
│  ◆ ACADEMIC STATS ◆                                              │
│  [Stats cards]                                                  │
│                                                                 │
│  ◆ COURSE ACHIEVEMENTS ◆                                         │
│  [Course badges]                                                │
│                                                                 │
│  ◆ WALL ◆                                                        │
│  [Wall posts]                                                   │
├─────────────────────────────────────────────────────────────────┤
│  [Social Links - Always at bottom]                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## New Components

| File | Purpose |
|------|---------|
| `src/components/profile/GalleryEditor.tsx` | Drag-to-reorder gallery manager with dnd-kit |
| `src/components/profile/SortableGalleryItem.tsx` | Individual draggable gallery item |
| `src/components/profile/FeaturedProjectEditor.tsx` | Featured project form with preview |
| `src/components/profile/FeaturedProjectShowcase.tsx` | Full-width featured project display |
| `src/components/profile/SectionLayoutEditor.tsx` | Drag-to-reorder section order |
| `src/components/profile/SortableSectionItem.tsx` | Individual draggable section item |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/StudentProfile.tsx` | Add gallery editor, featured project, and section order cards |
| `src/pages/PublicProfile.tsx` | Render sections dynamically based on order, add featured project |
| `src/hooks/usePublicProfile.ts` | Add new fields to interface |
| `src/hooks/useProfileGallery.ts` | Add reorder functionality |
| `src/components/profile/ProfileGallery.tsx` | Enhanced visual display, larger items |
| `src/components/profile/index.ts` | Export new components |
| Database migration | Add new columns |

---

## Implementation Details

### 1. GalleryEditor Component

```typescript
// Uses dnd-kit for drag-and-drop reordering
// Grid layout with visual drag handles
// Each item shows thumbnail with delete overlay
// Changes persist to database on drop

interface GalleryEditorProps {
  gallery: string[];
  onReorder: (newOrder: string[]) => void;
  onAdd: (files: File[]) => void;
  onRemove: (url: string) => void;
  isUploading: boolean;
}
```

Features:
- 4-column grid with 1:1 aspect ratio items
- Drag handle (grip icon) on each item
- Visual feedback during drag (opacity, scale)
- Delete button on hover
- Add media button
- Slot counter (e.g., "8/12 used")

### 2. FeaturedProjectEditor Component

```typescript
interface FeaturedProjectEditorProps {
  title: string;
  url: string;
  thumbnail: string | null;
  onChange: (updates: {
    featured_project_title?: string;
    featured_project_url?: string;
    featured_project_thumbnail?: string | null;
  }) => void;
}
```

Features:
- URL input with auto-detection (YouTube, Vimeo, custom)
- Title input
- Thumbnail upload or auto-extract from video URL
- Live preview of how it will look on profile
- Clear button to remove featured project

### 3. FeaturedProjectShowcase Component

```typescript
interface FeaturedProjectShowcaseProps {
  title: string;
  url: string;
  thumbnail: string | null;
}
```

Display modes:
- **YouTube/Vimeo**: Embedded responsive player
- **Image URL**: Full-width clickable image
- **External link**: Hero thumbnail with play button overlay

Visual styling:
- Full-width container with rounded corners
- Gradient overlay on thumbnail
- Title below with accent styling
- Glow effect on hover
- Film-grain texture overlay for cinematic feel

### 4. SectionLayoutEditor Component

```typescript
interface SectionLayoutEditorProps {
  order: string[];
  onChange: (newOrder: string[]) => void;
}

const AVAILABLE_SECTIONS = [
  { id: 'stats', label: 'Academic Stats', icon: GraduationCap },
  { id: 'achievements', label: 'Course Achievements', icon: Trophy },
  { id: 'gallery', label: 'Portfolio Gallery', icon: Images },
  { id: 'wall', label: 'Profile Wall', icon: MessageSquare },
];
```

Features:
- Vertical list with drag handles
- Clear section labels with icons
- Visual feedback during drag
- Saves on drop

### 5. Enhanced ProfileGallery for Public View

Visual improvements:
- Larger grid items (3 columns on desktop vs 4)
- 16:9 aspect ratio for more cinematic feel
- Lightbox with navigation arrows
- Video autoplay in lightbox
- Caption/title option for items (future)

---

## Hook Updates

### useProfileGallery Enhancement

```typescript
const reorderGallery = async (newOrder: string[]) => {
  if (!isOwnProfile || !user) return;
  
  await updateGalleryMutation.mutateAsync(newOrder);
};

return {
  // existing...
  reorderGallery,
};
```

---

## Database Migration

```sql
-- Add featured project fields
ALTER TABLE public.profiles
ADD COLUMN featured_project_url TEXT,
ADD COLUMN featured_project_title TEXT,
ADD COLUMN featured_project_thumbnail TEXT;

-- Add section order preference
ALTER TABLE public.profiles
ADD COLUMN profile_section_order TEXT[] DEFAULT ARRAY['stats', 'achievements', 'gallery', 'wall'];

-- Update profiles_public view to include new fields
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker=on) AS
SELECT 
  user_id,
  display_name,
  avatar_url,
  cover_banner_url,
  bio,
  filmmaking_style,
  camera_gear,
  current_project,
  favorite_films,
  influences,
  portfolio_url,
  imdb_url,
  vimeo_url,
  instagram_url,
  youtube_url,
  twitter_url,
  tiktok_url,
  profile_accent_color,
  avatar_border_style,
  portfolio_gallery,
  featured_project_url,
  featured_project_title,
  featured_project_thumbnail,
  profile_section_order
FROM public.profiles;
```

---

## UI/UX Details

### Gallery Editor Card in Edit Profile

```text
┌─────────────────────────────────────────────────────────────────┐
│  📸 Portfolio Gallery                              8/12 items   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ ≡        │ │ ≡        │ │ ≡        │ │ ≡        │           │
│  │          │ │          │ │    ▶     │ │          │           │
│  │   IMG    │ │   IMG    │ │  VIDEO   │ │   IMG    │           │
│  │          │ │          │ │          │ │          │           │
│  │     [×]  │ │     [×]  │ │     [×]  │ │     [×]  │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ ≡        │ │ ≡        │ │ ≡        │ │ ≡        │           │
│  │   IMG    │ │   IMG    │ │   IMG    │ │   IMG    │           │
│  │     [×]  │ │     [×]  │ │     [×]  │ │     [×]  │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                 │
│  [+ Add Media]                                                  │
│                                                                 │
│  💡 Drag items to reorder. First item shows as primary.        │
└─────────────────────────────────────────────────────────────────┘
```

### Featured Project Card in Edit Profile

```text
┌─────────────────────────────────────────────────────────────────┐
│  🎬 Featured Project                           [Clear Project]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Project Title                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ My Latest Short Film                                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Project URL (YouTube, Vimeo, or any link)                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ https://youtu.be/xyz123                                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Thumbnail  [Upload Custom]  or  [Use Video Thumbnail]          │
│                                                                 │
│  PREVIEW:                                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │         [▶ PLAY]  Video Thumbnail Preview                   ││
│  │                                                              ││
│  │  "My Latest Short Film"                                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  💡 This will appear prominently at the top of your profile.   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Animation Specifications

| Element | Animation |
|---------|-----------|
| Gallery drag | Scale 1.05, opacity 0.8, shadow elevation |
| Gallery drop | Spring animation back to position |
| Section drag | Slight lift, background highlight |
| Featured project hover | Glow pulse, slight scale |
| Lightbox open | Fade + scale from center |

---

## Summary

| Category | Details |
|----------|---------|
| Database changes | 4 new columns on profiles, view update |
| New components | 6 (GalleryEditor, SortableGalleryItem, FeaturedProjectEditor, FeaturedProjectShowcase, SectionLayoutEditor, SortableSectionItem) |
| Modified files | 7 (StudentProfile, PublicProfile, usePublicProfile, useProfileGallery, ProfileGallery, index, migration) |
| Dependencies | Uses existing @dnd-kit/core, @dnd-kit/sortable |
| Features | Drag gallery reorder, featured project showcase, custom section order |

This transforms the profile into a truly customizable creative portfolio where filmmakers can highlight their best work prominently, organize their content the way they want, and create a profile that reflects their unique creative identity.

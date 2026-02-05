
# Enhanced Profile: Portfolio Gallery & Course Achievements

## Overview

Transform the public profile into a comprehensive showcase of the student's filmmaking journey by adding:
1. **Portfolio Gallery** - A visual showcase for photos/videos of their work
2. **Course Achievement Badges** - Display completed courses with certifications
3. **Academic Stats Section** - Credits earned, courses completed, quizzes passed

This creates a profile that truly represents their educational progress and creative work.

---

## Current State

| Element | Status |
|---------|--------|
| Cover banner | Exists with visual effects |
| Avatar & bio | Exists with animations |
| Info cards (gear, project, etc.) | Exists with 3D tilt |
| Social links | Exists |
| Profile wall | Exists |
| Portfolio gallery | Missing |
| Course badges | Missing |
| Academic stats | Missing |

---

## Database Changes

### 1. Add Gallery to Profiles Table

```sql
ALTER TABLE public.profiles 
ADD COLUMN portfolio_gallery TEXT[] DEFAULT '{}';
```

This stores an array of image/video URLs for the user's showcase.

### 2. Update profiles_public View

Add the new column to the public view so visitors can see galleries:

```sql
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker=on) AS
SELECT 
  -- existing columns --
  portfolio_gallery
FROM public.profiles;
```

---

## System Architecture

```text
                    ENHANCED PROFILE LAYOUT
┌─────────────────────────────────────────────────────────────────┐
│  ◆━━━━━━━━━━━━━━ COVER BANNER ━━━━━━━━━━━━━━◆                   │
├─────────────────────────────────────────────────────────────────┤
│       [AVATAR]      NAME                                        │
│                     🎬 Filmmaking Style                         │
│                     [Edit Profile] [Share]                      │
├─────────────────────────────────────────────────────────────────┤
│  ❝ Bio quote section ❞                                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ CAMERA GEAR      │  │ CURRENT PROJECT  │  ← 3D tilt cards   │
│  └──────────────────┘  └──────────────────┘                    │
├─────────────────────────────────────────────────────────────────┤
│  ◆ ACADEMIC STATS ◆                                             │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐                     │
│  │ CREDITS   │ │ COURSES   │ │ QUIZZES   │                     │
│  │   12/60   │ │    3/12   │ │    8/12   │                     │
│  └───────────┘ └───────────┘ └───────────┘                     │
├─────────────────────────────────────────────────────────────────┤
│  ◆ COURSE ACHIEVEMENTS ◆                                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │    🏆       │ │    🏆       │ │    🏆       │               │
│  │  CIN-101   │ │  DIR-201   │ │  PRD-101   │               │
│  │ ✓ Certified │ │ ✓ Certified │ │ ✓ Certified │               │
│  │  Mar 2026  │ │  Jan 2026  │ │  Feb 2026  │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
├─────────────────────────────────────────────────────────────────┤
│  ◆ PORTFOLIO GALLERY ◆                         [+ Add Media]   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                   ││
│  │  │ 📷  │ │ 🎬  │ │ 📷  │ │ 📷  │ │ +3  │   ← Masonry grid  ││
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                   ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  ◆ SOCIAL LINKS ◆                                               │
│  [🌐] [📸] [🎬] [🐦]                                            │
├─────────────────────────────────────────────────────────────────┤
│  ◆ WALL ◆                                                       │
│  [Wall posts...]                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## New Components

| File | Purpose |
|------|---------|
| `src/components/profile/ProfileAcademicStats.tsx` | Display credits, courses, quizzes in animated stat cards |
| `src/components/profile/ProfileAchievements.tsx` | Show completed course badges with certificates |
| `src/components/profile/ProfileGallery.tsx` | Portfolio gallery with lightbox viewer |
| `src/hooks/useProfileAchievements.ts` | Fetch completed enrollments for any user (public) |
| `src/hooks/useProfileGallery.ts` | Manage gallery uploads for own profile |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/PublicProfile.tsx` | Add new sections: stats, achievements, gallery |
| `src/hooks/usePublicProfile.ts` | Add portfolio_gallery to interface |
| `src/components/profile/index.ts` | Export new components |
| Database migration | Add portfolio_gallery column, update view |

---

## Implementation Details

### 1. ProfileAcademicStats Component

Animated stat cards showing progress:
- Credits earned / required (with progress ring)
- Courses completed count
- Quizzes passed count

Uses the same 3D tilt effect as ProfileInfoCard for consistency.

### 2. ProfileAchievements Component

Grid of completed course badges:
- Course code and title
- "✓ Certified" stamp badge
- Completion date
- Credits earned
- Shimmer animation overlay
- Uses existing `StampBadge` component

For other users' profiles, fetch their completed enrollments via a new hook.

### 3. ProfileGallery Component

Visual portfolio showcase:
- Masonry-style grid layout
- Support for images and video thumbnails
- Lightbox viewer for full-size viewing
- Owner can add/remove media
- Reuses existing `ImageGallery` component for lightbox
- Uses `useCommunityUploads` for upload functionality
- Maximum 12 gallery items

### 4. useProfileAchievements Hook

```typescript
interface ProfileAchievement {
  course_code: string;
  course_title: string;
  department: string;
  credits: number;
  completed_at: string;
}

export function useProfileAchievements(userId: string) {
  // Fetch enrollments where status = 'completed' for the user
  // Join with courses data to get titles and credits
}
```

### 5. useProfileGallery Hook

```typescript
export function useProfileGallery(isOwnProfile: boolean) {
  // If own profile: upload, delete, reorder capabilities
  // Uses community-uploads bucket (existing)
  // Updates profiles.portfolio_gallery array
}
```

---

## UI Styling Details

### Academic Stats Cards

```text
┌─────────────────────────────┐
│  ┌─────────┐                │
│  │ ◎ 12/60 │  CREDITS      │
│  └─────────┘  EARNED        │
│                             │
│  [Progress bar: 20%]        │
└─────────────────────────────┘
```

- Uses `ProgressRing` component for circular progress
- Gold accent for completed sections
- Stagger entrance animations

### Achievement Badges

```text
┌─────────────────────────┐
│  ┌─────┐ [shimmer]     │
│  │  🏆 │               │
│  └─────┘               │
│  CIN-101               │
│  Intro to Cinema       │
│                        │
│  [✓ CERTIFIED]         │
│                        │
│  Completed Mar 5, 2026 │
│  5 credits earned      │
└─────────────────────────┘
```

- Reuses existing shimmer animation from StudentCenter
- Gold border for completed
- 3D tilt on hover
- Urban stamp badge style

### Gallery Grid

```text
┌────────────────────────────────────────────────┐
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│  │        │ │        │ │   ▶    │ │        │  │
│  │  IMG   │ │  IMG   │ │ VIDEO  │ │  IMG   │  │
│  │        │ │        │ │        │ │        │  │
│  └────────┘ └────────┘ └────────┘ └────────┘  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│  │        │ │        │ │        │ │  +4    │  │
│  │  IMG   │ │  IMG   │ │  IMG   │ │ MORE   │  │
│  │        │ │        │ │        │ │        │  │
│  └────────┘ └────────┘ └────────┘ └────────┘  │
└────────────────────────────────────────────────┘
```

- 4-column grid on desktop, 2-column on mobile
- Videos show play icon overlay
- Click opens lightbox
- Owner sees "Add Media" button

---

## Data Flow

### Viewing Another User's Profile

```text
1. Load profile from profiles_public view
   ↓
2. Fetch enrollments (status='completed') for user_id
   ↓
3. Get course details from courses table/static data
   ↓
4. Display achievements, stats, gallery
```

### Editing Own Gallery

```text
1. Click "Add Media"
   ↓
2. Select files (images/videos)
   ↓
3. Upload to community-uploads bucket
   ↓
4. Update profiles.portfolio_gallery array
   ↓
5. Refetch profile context
```

---

## Security Considerations

| Action | Policy |
|--------|--------|
| View achievements | Anyone can see completed enrollments (public info) |
| View gallery | Anyone can see portfolio_gallery (in profiles_public) |
| Add to gallery | Only own profile (auth.uid() = user_id) |
| Remove from gallery | Only own profile (auth.uid() = user_id) |

RLS for enrollments viewing:
```sql
CREATE POLICY "Users can view completed enrollments"
ON public.enrollments FOR SELECT
USING (
  status = 'completed' OR user_id = auth.uid()
);
```

---

## Section Order on Profile Page

1. Cover Banner (existing)
2. Avatar & Identity (existing)
3. Bio Quote (existing)
4. Info Cards - Gear, Project, etc. (existing)
5. **Academic Stats (NEW)** - Credits, courses, quizzes
6. **Course Achievements (NEW)** - Completed course badges
7. **Portfolio Gallery (NEW)** - Photos/videos of work
8. Social Links (existing)
9. Profile Wall (existing)

---

## Summary

| Category | Details |
|----------|---------|
| Database changes | 1 new column (portfolio_gallery), 1 view update |
| New components | 3 (Stats, Achievements, Gallery) |
| New hooks | 2 (useProfileAchievements, useProfileGallery) |
| Modified files | 4 (PublicProfile, usePublicProfile, index, migration) |
| RLS policies | 1 new policy for public enrollment viewing |
| Storage | Uses existing community-uploads bucket |

This transforms the profile into a true portfolio showcase where students can display their filmmaking journey - from courses completed to work samples - creating a rich, engaging profile experience.

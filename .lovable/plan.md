
# Enhanced Admin Visual Customization System

## Overview

Transform the admin section into a more visually immersive experience by adding:
1. **Background videos** with low opacity for each admin page/tab
2. **Per-tab customization** allowing admins to set unique visuals for each section
3. **Live preview** of the changes in the admin settings

---

## Visual Design Concept

Based on the screenshot reference showing the "MASTER THE CRAFT" section with a dark grid background and gold accents, each admin page will feature:

```text
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐    │
│  │  BACKGROUND VIDEO (10-15% opacity)                   │    │
│  │  ┌─────────────────────────────────────────────────┐│    │
│  │  │  Dark overlay gradient (90% opacity)            ││    │
│  │  │  ┌─────────────────────────────────────────────┐││    │
│  │  │  │  ACTUAL CONTENT                             │││    │
│  │  │  │  - Stats cards with subtle glow             │││    │
│  │  │  │  - Tables with backdrop blur                │││    │
│  │  │  │  - Filters and actions                      │││    │
│  │  │  └─────────────────────────────────────────────┘││    │
│  │  └─────────────────────────────────────────────────┘│    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Features

### For Each Admin Tab
- **Background Video**: Upload a video that plays in low opacity behind the content
- **Fallback Image**: Static image shown while video loads or if no video set
- **Overlay Opacity**: Adjustable dark overlay (default 90%)
- **Live Preview**: See changes immediately in the admin panel

### Admin Pages to Enhance
| Tab | Setting Key | Description |
|-----|-------------|-------------|
| Dashboard | `admin_bg_dashboard` | Overview stats and charts |
| Courses | `admin_bg_courses` | Course management |
| Challenges | `admin_bg_challenges` | Daily challenges |
| Community | `admin_bg_community` | Community moderation |
| Support | `admin_bg_support` | Support tickets |
| Users | `admin_bg_users` | Student management |
| Settings | `admin_bg_settings` | Admin preferences |

---

## Database Changes

Extend the existing `site_settings` table with new entries for each admin page:

```sql
-- No schema changes needed - uses existing site_settings table
-- New entries will be added via upsert:
-- admin_bg_dashboard_video_url
-- admin_bg_dashboard_image_url
-- admin_bg_dashboard_overlay_opacity
-- (repeat for each admin page)
```

---

## Implementation Details

### Phase 1: Update `useSiteSettings` Hook

**File: `src/hooks/useSiteSettings.ts`**

Extend the settings interface and add helper for admin backgrounds:

```typescript
interface SiteSettings {
  // Existing
  login_video_url: string | null;
  login_logo_url: string | null;
  login_music_url: string | null;
  signup_disabled: string | null;
  // New - Admin backgrounds
  admin_bg_dashboard_video: string | null;
  admin_bg_dashboard_overlay: string | null;
  admin_bg_users_video: string | null;
  admin_bg_users_overlay: string | null;
  // ... other admin pages
}
```

### Phase 2: Create Admin Background Component

**New File: `src/components/admin/AdminBackground.tsx`**

A reusable component that:
- Renders a fullscreen video background with configurable opacity
- Includes a dark overlay gradient
- Positions content above the background
- Provides smooth transitions when video changes

```typescript
interface AdminBackgroundProps {
  pageKey: string;  // e.g., "dashboard", "users", "courses"
  children: React.ReactNode;
}
```

### Phase 3: Enhance AdminLayout

**File: `src/components/admin/AdminLayout.tsx`**

Modify to:
- Accept a `pageKey` prop for identifying which background to use
- Wrap content area with `AdminBackground` component
- Fetch page-specific settings from `useSiteSettings`

### Phase 4: Create Admin Background Settings UI

**New File: `src/components/admin/AdminBackgroundSettings.tsx`**

A tabbed interface in Admin Settings allowing per-page customization:

```text
┌──────────────────────────────────────────────────────────────┐
│  Admin Page Backgrounds                                       │
├──────────────────────────────────────────────────────────────┤
│  ┌──────┬─────────┬────────────┬───────────┬─────────┬──────┐│
│  │Dash  │ Courses │ Challenges │ Community │ Support │ Users││
│  └──────┴─────────┴────────────┴───────────┴─────────┴──────┘│
│                                                               │
│  [Dashboard tab selected]                                     │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Video Preview (16:9)                                    │ │
│  │  ┌─────────────────────────────────────────────────────┐│ │
│  │  │                                                     ││ │
│  │  │    [Currently playing video preview]                ││ │
│  │  │                                                     ││ │
│  │  └─────────────────────────────────────────────────────┘│ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  Background Video                                             │
│  [Upload Video]  [Remove]                                     │
│  Accepted: MP4, WebM (max 200MB)                             │
│                                                               │
│  Overlay Opacity                                              │
│  ○───────────●────────○  85%                                 │
│  70%                  100%                                   │
│                                                               │
│  [Preview in Dashboard] [Save Changes]                        │
└──────────────────────────────────────────────────────────────┘
```

### Phase 5: Update Admin Pages

Update each admin page to pass its `pageKey` to `AdminLayout`:

```typescript
// Example: UserManager.tsx
<AdminLayout 
  title="Student Management" 
  description="..." 
  pageKey="users"  // New prop
>
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/admin/AdminBackground.tsx` | Video background component |
| `src/components/admin/AdminBackgroundSettings.tsx` | Per-page background settings UI |

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useSiteSettings.ts` | Add admin background settings to interface |
| `src/components/admin/AdminLayout.tsx` | Add `pageKey` prop, integrate `AdminBackground` |
| `src/pages/admin/AdminSettings.tsx` | Add `AdminBackgroundSettings` component |
| `src/pages/admin/UserManager.tsx` | Pass `pageKey="users"` |
| `src/pages/admin/AdminDashboard.tsx` | Pass `pageKey="dashboard"` |
| `src/pages/admin/CourseManager.tsx` | Pass `pageKey="courses"` |
| `src/pages/admin/ChallengeManager.tsx` | Pass `pageKey="challenges"` |
| `src/pages/admin/CommunityManager.tsx` | Pass `pageKey="community"` |
| `src/pages/admin/SupportManager.tsx` | Pass `pageKey="support"` |

---

## Technical Implementation

### AdminBackground Component Structure

```typescript
export function AdminBackground({ pageKey, children }: AdminBackgroundProps) {
  const { settings } = useSiteSettings();
  
  const videoUrl = settings[`admin_bg_${pageKey}_video`];
  const overlayOpacity = settings[`admin_bg_${pageKey}_overlay`] || "90";
  
  return (
    <div className="relative min-h-full">
      {/* Video Background */}
      {videoUrl && (
        <div className="absolute inset-0 overflow-hidden -z-10">
          <video
            key={videoUrl}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.15 }}
            autoPlay
            loop
            muted
            playsInline
          />
          {/* Dark overlay */}
          <div 
            className="absolute inset-0 bg-background"
            style={{ opacity: parseInt(overlayOpacity) / 100 }}
          />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
```

### Settings UI Tabs

The `AdminBackgroundSettings` component will use Radix UI Tabs to switch between pages, with each tab showing:
- Current video preview (if set)
- Upload/remove buttons
- Overlay opacity slider (70-100%)
- Preview link to see the page with the new background

---

## User Experience Flow

1. Admin goes to **Settings > Site Customization**
2. Scrolls to **"Admin Page Backgrounds"** section
3. Clicks on a tab (e.g., "Users")
4. Uploads a video or sees current video preview
5. Adjusts overlay opacity if needed
6. Clicks **"Preview"** to see the Users page with the background
7. Changes are saved automatically and apply immediately

---

## Visual Effects Added

- **Video backgrounds** at 10-15% opacity for cinematic feel
- **Dark gradient overlay** (configurable 70-100%) for content readability
- **Subtle backdrop blur** on cards for depth
- **Smooth fade transitions** when videos change
- **Consistent with brutalist aesthetic** - dark, dramatic, gold accents

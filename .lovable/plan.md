
# Featured Project Above Creative Info Cards

## Overview

Move the Featured Project video showcase inside the PublicProfileCard component, positioning it directly **after the Bio section** and **before the Creative Info Cards grid**. This keeps it within the profile card flow but ensures it's prominently visible.

---

## New Layout Structure

```text
PublicProfileCard Structure:
┌─────────────────────────────────────────────────────────────────┐
│  [Cover Banner]                                                 │
│  [Avatar & Name & Style]                                        │
│  [Action Buttons: Edit/Share or Add Friend/Message]             │
├─────────────────────────────────────────────────────────────────┤
│  ❝ Bio text here... ❞                                          │
├─────────────────────────────────────────────────────────────────┤
│  ◆ Featured Project                    ← NEW POSITION           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    16:9 Video Embed                         ││
│  │               "Project Title"                               ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │ Camera Gear     │  │ Current Project │  ← Creative Info Cards│
│  └─────────────────┘  └─────────────────┘                       │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │ Influences      │  │ Favorite Films  │                       │
│  └─────────────────┘  └─────────────────┘                       │
├─────────────────────────────────────────────────────────────────┤
│  [Social Links: 🌐 📸 ▶ etc]                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. Update PublicProfileCard.tsx

Add the Featured Project showcase between the Bio section and Creative Info Cards:

```tsx
// After Bio Section (line 236), add:

{/* Featured Project - Above Info Cards */}
{(featured_project_url || featured_project_thumbnail) && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.45 }}
    className="px-4 md:px-6"
  >
    <FeaturedProjectShowcase
      title={featured_project_title || ""}
      url={featured_project_url || ""}
      thumbnail={featured_project_thumbnail}
    />
  </motion.div>
)}

{/* Creative Info Cards - 3D Tilt Grid */}
{infoCards.length > 0 && (...)}
```

### 2. Update Props Interface

Add featured project props to `PublicProfileCardProps`:

```tsx
interface PublicProfileCardProps {
  profile: PublicProfile;
  role: UserRole;
  isOwnProfile: boolean;
  isFriend: boolean;
  onAddFriend?: () => void;
  onMessage?: () => void;
  isAddingFriend?: boolean;
  hasPendingRequest?: boolean;
  onEditProfile?: () => void;
  onShareProfile?: () => void;
}
```

The profile already contains `featured_project_url`, `featured_project_title`, and `featured_project_thumbnail`, so no new props are needed.

### 3. Update PublicProfile.tsx

Remove the standalone Featured Project section from the main content area since it's now inside PublicProfileCard:

```tsx
// REMOVE this block from PublicProfile.tsx:
{(profile.featured_project_url || profile.featured_project_thumbnail) && (
  <motion.div ...>
    <FeaturedProjectShowcase ... />
  </motion.div>
)}

// Keep only:
{sectionOrder.map((sectionId, index) => renderSection(sectionId, index))}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/profile/PublicProfileCard.tsx` | Add FeaturedProjectShowcase between Bio and Info Cards |
| `src/pages/PublicProfile.tsx` | Remove standalone FeaturedProjectShowcase from content area |

---

## Component Hierarchy After Change

```text
PublicProfile.tsx
├── Navigation elements (breadcrumbs, back button)
├── PublicProfileCard
│   ├── ProfileCoverBanner
│   ├── Profile Header (Avatar, Name, Actions)
│   ├── Bio Section
│   ├── FeaturedProjectShowcase  ← MOVED HERE
│   ├── Creative Info Cards grid
│   └── ProfileSocialLinks
└── Reorderable Sections (stats, achievements, gallery, wall)
```

---

## Summary

| Category | Details |
|----------|---------|
| Files modified | 2 (PublicProfileCard.tsx, PublicProfile.tsx) |
| New position | After bio, before Creative Info Cards |
| Component reused | Existing FeaturedProjectShowcase (no changes needed) |
| Reorderable sections | Still fully customizable (stats, achievements, gallery, wall) |

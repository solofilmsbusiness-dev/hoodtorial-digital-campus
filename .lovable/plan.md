
# Compact Featured Project Placement

## Overview

Move the Featured Project showcase from its current full-width position below the profile card to a **compact, inline placement directly under the bio/caption section** within the PublicProfileCard component. The customizable section stack (stats, achievements, gallery, wall) remains fully reorderable.

---

## Current Layout vs Proposed Layout

```text
CURRENT LAYOUT:
┌─────────────────────────────────────────────────────────────────┐
│  [Cover Banner]                                                 │
│  [Avatar & Name & Bio]                                          │
│  [Creative Info Cards]                                          │
│  [Social Links]                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  ◆ FEATURED PROJECT ◆  (FULL WIDTH - BIG)                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    16:9 VIDEO EMBED                         ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  [Reorderable Sections: Stats, Achievements, Gallery, Wall]    │
└─────────────────────────────────────────────────────────────────┘


PROPOSED LAYOUT:
┌─────────────────────────────────────────────────────────────────┐
│  [Cover Banner]                                                 │
│  [Avatar & Name]                                                │
│                                                                 │
│  ❝ Bio/Caption text here... ❞                                  │
│                                                                 │
│  ┌───────────────────────────┐  ← NEW: Compact Featured Project │
│  │  ◆ Featured Project       │     (Smaller, right-aligned or  │
│  │  ┌─────────────────────┐  │      inline with content)       │
│  │  │   Compact Video     │  │                                 │
│  │  │   (Smaller aspect)  │  │                                 │
│  │  └─────────────────────┘  │                                 │
│  │  "Project Title"          │                                 │
│  └───────────────────────────┘                                 │
│                                                                 │
│  [Creative Info Cards]                                          │
│  [Social Links]                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  [Reorderable Sections: Stats, Achievements, Gallery, Wall]    │
│  (Order still customizable by user)                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. Create Compact Featured Project Component

Create a new `FeaturedProjectCompact.tsx` component with:
- Smaller aspect ratio (4:3 or similar compact size)
- Max width constraint (~400px)
- Condensed styling that fits within the profile card flow

```typescript
// src/components/profile/FeaturedProjectCompact.tsx
interface FeaturedProjectCompactProps {
  title: string;
  url: string;
  thumbnail: string | null;
}
```

**Visual Specifications:**
- Max width: 400px on desktop, full width on mobile
- Aspect ratio: 4:3 (more compact than 16:9)
- Smaller title text
- Subtle border with accent color glow on hover
- Positioned directly below the bio quote block

### 2. Update PublicProfileCard.tsx

Move the Featured Project into the PublicProfileCard component, placing it between the bio section and the Creative Info Cards:

```tsx
{/* Bio Section */}
{profile.bio && (
  <motion.div>...</motion.div>
)}

{/* NEW: Compact Featured Project - right under bio */}
{(profile.featured_project_url || profile.featured_project_thumbnail) && (
  <motion.div className="px-4 md:px-6">
    <FeaturedProjectCompact
      title={profile.featured_project_title || ""}
      url={profile.featured_project_url || ""}
      thumbnail={profile.featured_project_thumbnail}
    />
  </motion.div>
)}

{/* Creative Info Cards */}
{infoCards.length > 0 && (...)}
```

### 3. Update PublicProfile.tsx

Remove the Featured Project from the main content area since it's now inside PublicProfileCard:

```tsx
// REMOVE THIS SECTION:
{/* Featured Project - Always first if set */}
{(profile.featured_project_url || profile.featured_project_thumbnail) && (
  <motion.div>
    <FeaturedProjectShowcase ... />
  </motion.div>
)}

// KEEP ONLY THE REORDERABLE SECTIONS:
{sectionOrder.map((sectionId, index) => renderSection(sectionId, index))}
```

---

## New Component: FeaturedProjectCompact

```text
┌─────────────────────────────────────┐
│  ◆ Featured Project                 │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │     Compact Video/Image       │  │
│  │     (4:3 aspect ratio)        │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│  "My Latest Short Film" ↗          │
└─────────────────────────────────────┘
     └── Max 400px width ──┘
```

**Styling:**
- Rounded corners with border
- Accent color glow on hover
- External link icon for non-embed URLs
- Play button overlay for video thumbnails
- Condensed title with external link indicator

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/profile/FeaturedProjectCompact.tsx` | NEW: Compact version of featured project |
| `src/components/profile/PublicProfileCard.tsx` | Add FeaturedProjectCompact after bio section |
| `src/pages/PublicProfile.tsx` | Remove the full-width FeaturedProjectShowcase |
| `src/components/profile/index.ts` | Export new FeaturedProjectCompact component |

---

## Mobile Behavior

On mobile screens:
- Featured Project compact card takes full width
- Maintains compact aspect ratio (4:3)
- Positioned in natural flow under bio

On desktop screens:
- Featured Project constrained to max-width: 400px
- Left-aligned under the bio quote
- Creates visual balance with info cards

---

## What Stays the Same

| Feature | Status |
|---------|--------|
| Section reordering (stats, achievements, gallery, wall) | Unchanged - still fully customizable |
| FeaturedProjectEditor in Edit Profile | Unchanged - same editing experience |
| FeaturedProjectShowcase component | Kept for potential future use, but not used on profile page |

---

## Summary

| Category | Details |
|----------|---------|
| New component | 1 (FeaturedProjectCompact) |
| Modified files | 3 (PublicProfileCard, PublicProfile, index) |
| Layout change | Featured Project moves inside profile card, under bio |
| Size change | Compact (max 400px, 4:3 aspect) instead of full-width 16:9 |
| Reorderable sections | Still fully customizable |

This creates a more integrated profile header where the featured project feels like part of the identity section rather than a separate showcase block, while maintaining the flexibility to customize the order of the main content sections below.

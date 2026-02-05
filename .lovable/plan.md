
# Customizable PublicProfileCard Sections

## Overview

Extend the section reordering feature to include the **internal sections of the PublicProfileCard** (Bio, Featured Project, Info Cards, Social Links), allowing users to fully customize their profile layout from top to bottom.

---

## Current vs Proposed Architecture

```text
CURRENT SYSTEM:
┌─────────────────────────────────────────────────────────────────┐
│  PublicProfileCard (FIXED order inside)                        │
│  ├── Cover Banner            (always first - fixed)            │
│  ├── Avatar & Name           (always second - fixed)           │
│  ├── Bio                     (fixed position)                  │
│  ├── Featured Project        (fixed position)                  │
│  ├── Info Cards              (fixed position)                  │
│  └── Social Links            (fixed position)                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Reorderable Sections (via profile_section_order)              │
│  ├── stats                                                      │
│  ├── achievements                                               │
│  ├── gallery                                                    │
│  └── wall                                                       │
└─────────────────────────────────────────────────────────────────┘


PROPOSED SYSTEM:
┌─────────────────────────────────────────────────────────────────┐
│  PublicProfileCard (Static header only)                         │
│  ├── Cover Banner            (always first - fixed)            │
│  └── Avatar & Name           (always second - fixed)           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Reorderable Card Sections (NEW: card_section_order)            │
│  ├── bio                     (reorderable)                      │
│  ├── featured_project        (reorderable)                      │
│  ├── info_cards              (reorderable)                      │
│  └── social_links            (reorderable)                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Main Profile Sections (via profile_section_order - unchanged)  │
│  ├── stats                                                      │
│  ├── achievements                                               │
│  ├── gallery                                                    │
│  └── wall                                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. Database Migration

Add a new column to store the card section order:

```sql
ALTER TABLE profiles 
ADD COLUMN card_section_order TEXT[] DEFAULT ARRAY['bio', 'featured_project', 'info_cards', 'social_links'];

-- Update the profiles_public view to include this column
CREATE OR REPLACE VIEW profiles_public AS
SELECT 
  user_id,
  display_name,
  -- ... existing columns ...
  profile_section_order,
  card_section_order  -- NEW
FROM profiles;
```

### 2. Create CardSectionLayoutEditor Component

New component for editing the order of sections within the profile card:

```text
┌─────────────────────────────────────────────────────────────────┐
│  📋 Profile Card Layout                                         │
├─────────────────────────────────────────────────────────────────┤
│  Drag sections to reorder within your profile card.            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ≡  📝 Bio                                                   ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ≡  🎬 Featured Project                                      ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ≡  📋 Creative Info Cards                                   ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ≡  🔗 Social Links                                          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  💡 Cover banner and identity section always appear first.     │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Update PublicProfileCard Component

Modify to accept `cardSectionOrder` prop and render sections dynamically:

```tsx
// PublicProfileCard.tsx
interface PublicProfileCardProps {
  profile: PublicProfile;
  // ... existing props
}

export function PublicProfileCard({ profile, ...props }: PublicProfileCardProps) {
  const cardSectionOrder = profile.card_section_order ?? 
    ["bio", "featured_project", "info_cards", "social_links"];

  const renderCardSection = (sectionId: string, index: number) => {
    const delay = 0.4 + index * 0.05;
    
    switch (sectionId) {
      case "bio":
        return profile.bio && <BioSection profile={profile} delay={delay} />;
      case "featured_project":
        return (profile.featured_project_url || profile.featured_project_thumbnail) && 
          <FeaturedProjectSection profile={profile} delay={delay} />;
      case "info_cards":
        return infoCards.length > 0 && <InfoCardsSection ... delay={delay} />;
      case "social_links":
        return <SocialLinksSection profile={profile} delay={delay} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Fixed: Cover Banner */}
      <ProfileCoverBanner ... />

      {/* Fixed: Profile Header - Avatar & Identity */}
      <div className="relative -mt-24 px-4 md:px-6">
        {/* Avatar, Name, Role Badge, Actions - Always here */}
      </div>

      {/* Dynamic: Reorderable sections within card */}
      {cardSectionOrder.map((sectionId, index) => (
        <React.Fragment key={sectionId}>
          {renderCardSection(sectionId, index)}
        </React.Fragment>
      ))}
    </div>
  );
}
```

### 4. Update StudentProfile Edit Page

Add the new CardSectionLayoutEditor alongside the existing SectionLayoutEditor:

```tsx
// StudentProfile.tsx
const [formData, setFormData] = useState({
  // ... existing fields
  profile_section_order: ["stats", "achievements", "gallery", "wall"],
  card_section_order: ["bio", "featured_project", "info_cards", "social_links"], // NEW
});

// In the form:
<CardSectionLayoutEditor
  order={formData.card_section_order}
  onChange={(newOrder) => setFormData(prev => ({ ...prev, card_section_order: newOrder }))}
/>

<SectionLayoutEditor
  order={formData.profile_section_order}
  onChange={handleSectionOrderChange}
/>
```

### 5. Update usePublicProfile Hook

Add the new field to the PublicProfile interface:

```typescript
export interface PublicProfile {
  // ... existing fields
  profile_section_order: string[] | null;
  card_section_order: string[] | null;  // NEW
}
```

---

## Available Card Sections

| Section ID | Label | Icon | Description |
|------------|-------|------|-------------|
| `bio` | Bio | Quote | User's bio/about text |
| `featured_project` | Featured Project | Film | Highlighted video/project |
| `info_cards` | Creative Info | Camera | Camera gear, current project, influences, films |
| `social_links` | Social Links | Link | Portfolio, social media links |

---

## Files to Modify

| File | Changes |
|------|---------|
| Database Migration | Add `card_section_order` column |
| `src/components/profile/CardSectionLayoutEditor.tsx` | NEW: Editor for card section order |
| `src/components/profile/PublicProfileCard.tsx` | Make sections render dynamically based on order |
| `src/components/profile/index.ts` | Export new component |
| `src/pages/StudentProfile.tsx` | Add CardSectionLayoutEditor and form field |
| `src/hooks/usePublicProfile.ts` | Add `card_section_order` to interface |
| `src/integrations/supabase/types.ts` | Will auto-update after migration |

---

## User Experience

### Edit Profile Page

```text
┌─────────────────────────────────────────────────────────────────┐
│  ...existing form sections...                                   │
├─────────────────────────────────────────────────────────────────┤
│  📋 Profile Card Layout                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ≡ Bio                                                    │   │
│  │ ≡ Featured Project                                       │   │
│  │ ≡ Creative Info Cards                                    │   │
│  │ ≡ Social Links                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│  💡 Cover and avatar always appear first.                       │
├─────────────────────────────────────────────────────────────────┤
│  📐 Profile Content Layout                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ≡ Academic Stats                                         │   │
│  │ ≡ Course Achievements                                    │   │
│  │ ≡ Portfolio Gallery                                      │   │
│  │ ≡ Profile Wall                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│  💡 These sections appear after your profile card.              │
└─────────────────────────────────────────────────────────────────┘
```

### Public Profile View

The profile dynamically renders sections in the user's chosen order:

```text
[Cover Banner + Avatar + Name]  ← Always first (fixed)
         ↓
[Bio | Featured Project | Info Cards | Social Links]  ← Customizable order
         ↓
[Stats | Achievements | Gallery | Wall]  ← Customizable order (existing)
```

---

## Summary

| Category | Details |
|----------|---------|
| Database changes | 1 new column (`card_section_order`) |
| New components | 1 (`CardSectionLayoutEditor`) |
| Modified components | 2 (`PublicProfileCard`, `StudentProfile`) |
| Hook updates | 1 (`usePublicProfile`) |
| Total customizable sections | 8 (4 card + 4 content) |

This gives users complete control over their profile layout while keeping the core identity (cover, avatar, name) fixed at the top for consistency.

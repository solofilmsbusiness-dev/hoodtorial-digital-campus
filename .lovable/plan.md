

## Enhance "Looking For" & Restructure Profile Editor

### Part 1: Make "Looking For" Interactive for Collaboration

Currently, "Looking For" is just a list of badges on the public profile. We'll make it actionable:

**On the Public Profile (`PublicProfileCard.tsx`):**
- Turn each "Looking For" badge into a clickable element
- When a visitor's own creative role matches one of the "Looking For" roles, highlight that badge with a glowing accent (e.g., "You match!") 
- Add a **"Offer to Collaborate"** button that appears when viewing someone else's profile who is looking for your role -- clicking it opens a pre-filled message like "Hey! I saw you're looking for a [role]. I'd love to collaborate!"
- Show a small "match" indicator next to the Looking For section title when there's a role match

**On the Profile Editor (`StudentProfile.tsx`):**
- Add a short optional **"Project Brief"** textarea under the Looking For chips (e.g., "Describe what you're working on and what kind of help you need") -- stored in a new `collaboration_brief` column
- This brief shows on the public profile alongside the Looking For badges, giving context to potential collaborators

### Part 2: Restructure the Profile Edit Interface

The current form is a long single-column scroll with 8+ cards. We'll reorganize it using **tabs** to group related fields, making it cleaner and faster to navigate:

**Tab Structure:**
1. **Appearance** -- Cover banner, avatar, theme picker (accent color, border style)
2. **About You** -- Display name, location, bio, creative role, creative style, tools & equipment
3. **Portfolio** -- Featured project, portfolio gallery, favorite films, influences, current project, collaboration brief, looking for collaborators
4. **Links** -- All social/portfolio URLs (portfolio website, IMDb, Vimeo, Instagram, YouTube, Twitter/X, TikTok)
5. **Layout** -- Profile card section order, profile page section order

The sidebar (profile preview + completeness) stays as-is. The save button and unsaved changes indicator remain sticky at the bottom.

### Database Changes

Add one new column:

```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS collaboration_brief text;
```

Update `profiles_public` view to include `collaboration_brief`.

### Technical Details

**Migration:** Add `collaboration_brief` column and rebuild `profiles_public` view.

**File: `src/pages/StudentProfile.tsx`**
- Import `Tabs, TabsContent, TabsList, TabsTrigger` from UI components
- Wrap the form cards in a tabbed interface with 5 tabs
- Add `collaboration_brief` to formData state and profile loading
- Add a textarea for collaboration brief under the Looking For chips
- Move "Tools & Equipment" from Basic Info into the "About You" tab alongside creative role/style
- Move favorite films, influences, current project into "Portfolio" tab

**File: `src/components/profile/PublicProfileCard.tsx`**
- Replace static "Looking For" badges with interactive ones
- Add role-match detection: compare viewer's `creative_role` against the profile's `looking_for` array
- When a match is found, highlight the matching badge and show a "You match!" indicator
- Add a "Offer to Collaborate" button that triggers `onMessage` with a pre-filled collaboration message
- Display `collaboration_brief` text below the Looking For badges when present

**File: `src/hooks/usePublicProfile.ts`**
- Add `collaboration_brief` to `PublicProfile` interface

**File: `src/components/profile/ProfilePreviewCard.tsx`**
- Add `collaboration_brief` display if present

**Files affected:** 1 migration + 4-5 component files


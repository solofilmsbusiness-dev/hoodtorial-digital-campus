

## Make Profiles Inclusive for All Creative Roles

### Problem
The profile is heavily film-camera-centric. The "Camera Gear" field and "Filmmaking Style" dropdown assume everyone is a cinematographer or director. Writers, editors, producers, sound designers, and other creatives don't have a way to represent their craft.

### Solution
Add a **Creative Role** selector and rename/adapt the existing fields to be role-aware:

1. **New "Creative Role" field** -- a multi-select or primary-role picker so users can identify as Writer, Editor, Cinematographer, Director, Producer, Sound Designer, etc.
2. **Rename "Camera Gear" to "Tools & Equipment"** -- with a dynamic placeholder based on role (e.g. "Final Cut Pro, DaVinci Resolve" for editors, "Final Draft, Celtx" for writers)
3. **Rename "Filmmaking Style" to "Creative Style"** -- expand the dropdown options to include writing/editing/production styles alongside the existing film genres
4. **Update public profile display** -- show the creative role prominently and adapt the info card labels

### Database Changes
Add a new column `creative_role` (text, nullable) to the `profiles` table. This will also automatically appear in `profiles_public` view.

No changes needed to `camera_gear` or `filmmaking_style` columns -- they stay as-is in the DB; only the UI labels and placeholder text change.

### Technical Details

**Migration:**
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creative_role text;
```

The `profiles_public` view will need to be updated to include the new column.

**File: `src/pages/StudentProfile.tsx`**
- Add `creative_role` to formData state and profile loading
- Add a Creative Role selector (dropdown or multi-chip picker) with options: Director, Writer, Editor, Cinematographer, Producer, Sound Designer, Production Designer, Animator, Composer, Actor, VFX Artist, Colorist, Other
- Rename "Camera Gear" label to "Tools & Equipment" with role-aware placeholder text
- Rename `FILMMAKING_STYLES` to `CREATIVE_STYLES` and expand options to include: Screenwriting, Documentary, Narrative Fiction, Experimental, Music Video, Commercial, Animation, Horror, Comedy, Drama, Sci-Fi, Post-Production, Sound Design, Visual Effects, Other
- Move the Creative Role selector into the "Creative Identity" card section, above the style picker

**File: `src/components/profile/PublicProfileCard.tsx`**
- Display `creative_role` under the user's name (where filmmaking_style currently shows)
- Show filmmaking_style as a secondary detail
- Update the Camera Gear info card label to "Tools & Equipment"

**File: `src/components/profile/ProfilePreviewCard.tsx`**
- Update to show creative role
- Rename Camera Gear label to "Tools & Equipment"

**File: `src/hooks/usePublicProfile.ts`**
- Add `creative_role` to the `PublicProfile` interface

**File: `src/components/messaging/ContactCardMessage.tsx`**
- Show `creative_role` instead of or alongside `filmmaking_style`

**Files affected:** 1 migration + 5-6 component files modified

### Role-Aware Placeholder Examples
| Creative Role | Tools Placeholder |
|---|---|
| Writer | "Final Draft, Celtx, Highland..." |
| Editor | "DaVinci Resolve, Premiere Pro, FCPX..." |
| Cinematographer | "Sony A7III, Canon R5, Blackmagic..." |
| Sound Designer | "Pro Tools, Logic Pro, Zoom H6..." |
| Director | "Shot lister, storyboard tools..." |
| Default | "Your primary tools and software..." |

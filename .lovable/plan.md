

## Enrich Demo User Profiles with Full Data and Images

### Problem
Demo users currently have minimal profiles: just a name, bio, basic avatar placeholder (from ui-avatars.com), location, and filmmaking style. They lack profile images, cover banners, creative roles, collaboration info, social links, and all other profile fields -- making them look obviously fake and not useful for showcasing the platform.

### Solution
Enhance the `generate-demo-data` edge function to populate every profile field with realistic data, including real-looking avatar photos and cinematic cover banner images from free image services.

### What Changes

**Edge Function: `supabase/functions/generate-demo-data/index.ts`**

Replace the basic profile generation with a rich profile builder that populates:

1. **Avatar Images** -- Use `randomuser.me` API for realistic headshot photos instead of `ui-avatars.com` letter icons
2. **Cover Banners** -- Use `picsum.photos` (Lorem Picsum) for cinematic-looking cover images at 1200x400
3. **Creative Role** -- Randomly assign from the role list (Director, Writer, Editor, Cinematographer, Producer, Sound Designer, etc.)
4. **Tools & Equipment** (`camera_gear`) -- Role-appropriate gear/software (e.g., "DaVinci Resolve, Premiere Pro" for Editors, "Sony A7III, Blackmagic" for Cinematographers)
5. **Looking For** (`looking_for`) -- Random subset of 1-3 complementary roles they're seeking
6. **Collaboration Brief** (`collaboration_brief`) -- AI-generated short project brief describing what help they need
7. **Favorite Films** (`favorite_films`) -- 2-4 films from a curated list
8. **Influences** -- AI-generated or picked from a list of famous filmmakers
9. **Current Project** -- AI-generated brief project description
10. **Social Links** -- Randomized placeholder URLs for portfolio, Instagram, YouTube, Vimeo (some profiles get some links, not all)
11. **Profile Accent Color** -- Random selection from a palette of accent colors
12. **Avatar Border Style** -- Random pick from square, hexagon, glow options

**Data Arrays to Add:**
- `CREATIVE_ROLES` -- matching the roles defined in the profile editor
- `TOOLS_BY_ROLE` -- role-specific gear/software lists
- `FAVORITE_FILMS` -- curated list of ~30 well-known films
- `INFLUENCES` -- list of ~20 famous filmmakers
- `ACCENT_COLORS` -- palette of hex colors
- `BORDER_STYLES` -- ["square", "hexagon", "glow"]
- `SOCIAL_DOMAINS` -- template URLs for social profiles

**AI Generation Enhancements:**
- Update the `generateBioWithAI` prompt to incorporate the user's creative role for more authentic bios
- Add a new `generateCollaborationBriefWithAI` function for the collaboration brief
- Add a new `generateCurrentProjectWithAI` function

**Profile Object Update (line ~323-334):**
The profile insert will go from ~10 fields to ~25 fields, covering the full profile schema.

### Files Affected
- `supabase/functions/generate-demo-data/index.ts` -- the only file that needs changes

### Clear Function
No changes needed to the clear function -- it already deletes all `is_demo` profiles which cascades properly.

### Notes
- Avatar images come from `randomuser.me/api/portraits/` (free, no API key needed, realistic photos)
- Cover banners from `picsum.photos/1200/400` with random seed for variety
- No storage bucket uploads needed -- we use direct URLs from these free services
- The function will take slightly longer due to additional AI calls for collaboration briefs and current projects, but the delay per user should be minimal since we're using the fast `gemini-2.5-flash-lite` model


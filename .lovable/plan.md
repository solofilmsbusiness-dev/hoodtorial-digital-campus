

# Fix: Profile Accent Colors, Avatar Borders, Cover Positioning, and Community Names

## Issues Found

### 1. Accent Color and Border Style Missing in Community
The community feed queries (`useCommunityPosts`, `useCommunityComments`, `useProfileWall`, etc.) only fetch `user_id, display_name, avatar_url` from `profiles_public`. The `profile_accent_color` and `avatar_border_style` fields exist in the view but are never fetched or passed to the `UserProfileLink` component. The `UserProfileLink` component itself has no props for these values -- it renders a plain avatar with no accent styling.

### 2. Cover Image Not Adjustable
The cover banner uploads as a full image but uses `object-cover` with no position control. There is no `cover_banner_position` column in the database, so users cannot reposition the crop focus (e.g., move it up/down to center on their face).

### 3. Display Names Showing Incorrectly
The community queries cast `profiles_public` as `any` and hardcode the select to only `user_id, display_name, avatar_url`. All existing users have display names set, so the issue may be that some queries return stale cached data or the `as any` type casting silently swallows errors. The fix is to remove the `as any` casts and ensure consistent data fetching.

---

## Solution

### Database Changes

**Add `cover_banner_position` column to `profiles` table:**
- Type: `integer` (0-100, representing vertical percentage, default 50 = center)
- Add it to the `profiles_public` view

### Frontend Changes

**1. Update `UserProfileLink` to support accent colors and border styles**

Add optional `accentColor` and `borderStyle` props. When provided, apply the accent color as a border color and glow effect on the avatar.

**2. Update community data fetching hooks to include accent/border data**

Update the `profiles_public` select in these hooks to also fetch `profile_accent_color` and `avatar_border_style`:
- `useCommunityPosts.ts` (post authors + comment preview authors)
- `useCommunityComments.ts` (comment authors)
- `useProfileWall.ts` (wall post authors)
- `useCommunityLeaderboard.ts` (leaderboard users)

Update the `CommunityPost.author` type to include `profile_accent_color` and `avatar_border_style`.

**3. Pass accent data through to `UserProfileLink` in community components**

Update these components to forward the new author fields:
- `TimelinePost.tsx`
- `PostCard.tsx`
- `FeedCard.tsx`
- `CommentThread.tsx`

**4. Add cover banner position control**

- Update `CoverBanner.tsx` (edit mode): Add a vertical slider/drag handle that appears when a banner is uploaded, allowing users to set the Y-position (0-100%)
- Update `ProfileCoverBanner.tsx` (display mode): Apply `object-position: center {position}%` to the banner image
- Save the position value to the `cover_banner_position` column

**5. Fix `as any` type casts on `profiles_public` queries**

Remove the `as any` casts from `useCommunityPosts.ts`, `useCommunityComments.ts`, `useProfileWall.ts`, `useNotifications.ts`, and `useMentions.ts` since `profiles_public` is properly typed in the generated types.

---

## Technical Details

### Files to Modify

| File | Change |
|------|--------|
| `src/components/profile/UserProfileLink.tsx` | Add `accentColor` and `borderStyle` props; apply accent border color |
| `src/hooks/useCommunityPosts.ts` | Fetch `profile_accent_color, avatar_border_style` from profiles_public; update author type; remove `as any` |
| `src/hooks/useCommunityComments.ts` | Same as above |
| `src/hooks/useProfileWall.ts` | Same as above |
| `src/hooks/useCommunityLeaderboard.ts` | Same as above |
| `src/hooks/useNotifications.ts` | Remove `as any` cast |
| `src/hooks/useMentions.ts` | Remove `as any` cast |
| `src/components/community/TimelinePost.tsx` | Pass `accentColor`/`borderStyle` to UserProfileLink |
| `src/components/community/PostCard.tsx` | Pass `accentColor`/`borderStyle` to UserProfileLink |
| `src/components/community/FeedCard.tsx` | Pass `accentColor`/`borderStyle` to UserProfileLink |
| `src/components/community/CommentThread.tsx` | Pass `accentColor`/`borderStyle` to UserProfileLink |
| `src/components/profile/CoverBanner.tsx` | Add vertical position slider for repositioning |
| `src/components/profile/ProfileCoverBanner.tsx` | Apply `object-position` from saved position value |

### Database Migration

```sql
ALTER TABLE public.profiles
  ADD COLUMN cover_banner_position INTEGER DEFAULT 50;

DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT
  user_id, display_name, avatar_url, cover_banner_url,
  bio, filmmaking_style, camera_gear, current_project,
  favorite_films, influences, portfolio_url, imdb_url,
  vimeo_url, instagram_url, youtube_url, twitter_url, tiktok_url,
  profile_accent_color, avatar_border_style, portfolio_gallery,
  featured_project_url, featured_project_title, featured_project_thumbnail,
  profile_section_order, card_section_order, cover_banner_position
FROM profiles;
```

No new RLS policies needed -- the existing profile policies cover this new column.



# Public Profile System Implementation

## Overview

Create a comprehensive public profile viewing system where enrolled students can view other users' profiles. This integrates with the existing social ecosystem (community, friends, messaging) to provide a cohesive networking experience.

---

## Current State Analysis

### Existing Infrastructure
- **profiles_public view** - Currently only exposes: `user_id`, `display_name`, `avatar_url`
- **ProfilePreviewCard** - Shows a preview of profile data (used in edit page)
- **ContactCardMessage** - Rich profile card for messaging (shows bio, gear, social links)
- **FriendCard** - Minimal friend display with avatar and name
- **Community PostCard** - Shows author avatar/name with role badges

### What's Missing
- No dedicated page to view other users' full profiles
- profiles_public view is too limited for networking purposes
- No way to navigate to a user's profile from community/friends
- No profile URL routing (`/profile/:userId`)

---

## System Architecture

```text
                    PUBLIC PROFILE ECOSYSTEM
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐        │
│  │   Community  │   │   Friends    │   │   Messages   │        │
│  │   Posts      │   │   List       │   │   Chat       │        │
│  └──────────────┘   └──────────────┘   └──────────────┘        │
│         │                 │                  │                  │
│         └─────────────────┼──────────────────┘                  │
│                           ▼                                     │
│                   ┌──────────────────┐                          │
│                   │  Click Username  │                          │
│                   │  or Avatar       │                          │
│                   └────────┬─────────┘                          │
│                            ▼                                    │
│                   ┌──────────────────┐                          │
│                   │  /profile/:id    │                          │
│                   │  Public Profile  │                          │
│                   │  Page            │                          │
│                   └────────┬─────────┘                          │
│                            ▼                                    │
│         ┌─────────────────────────────────────┐                 │
│         │   usePublicProfile hook             │                 │
│         │   - Fetches from profiles_public    │                 │
│         │   - Gets user's roles               │                 │
│         │   - Checks friendship status        │                 │
│         └─────────────────────────────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Changes

### Update profiles_public View

Expand the view to include public-safe profile fields while keeping sensitive data protected:

```sql
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
  -- Social/portfolio links (user-provided, public by nature)
  portfolio_url,
  imdb_url,
  vimeo_url,
  instagram_url,
  youtube_url,
  twitter_url,
  tiktok_url,
  -- Visual customization
  profile_accent_color,
  avatar_border_style
FROM profiles;
```

**Fields EXCLUDED (sensitive):**
- `location` (privacy concern)
- `subscription_status`, `subscription_*`, `trial_*` (billing)
- `is_banned`, `banned_*`, `ban_reason` (admin data)
- `terms_accepted_at`, `enrolled_at` (metadata)
- `is_demo`, `degree_path`, `certificate_*`, `recommended_*`, `onboarding_*` (internal)

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/PublicProfile.tsx` | Full public profile page with cover, avatar, bio, links |
| `src/hooks/usePublicProfile.ts` | Fetch public profile data + roles for a given user ID |
| `src/components/profile/PublicProfileCard.tsx` | Reusable component for rendering a full public profile |
| `src/components/profile/UserProfileLink.tsx` | Clickable avatar/name that links to profile page |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/profile/:userId` route |
| `src/components/community/PostCard.tsx` | Make author avatar/name clickable to profile |
| `src/components/friends/FriendCard.tsx` | Make friend avatar/name clickable to profile |
| `src/components/messaging/ConversationItem.tsx` | Make participant avatar clickable |
| `src/components/profile/index.ts` | Export new components |
| Database migration | Update `profiles_public` view |

---

## Implementation Details

### 1. PublicProfile Page

A read-only view of another user's profile featuring:

| Section | Content |
|---------|---------|
| Cover Banner | User's custom banner image |
| Avatar & Name | Styled with user's accent color and border style |
| Role Badge | Admin/Professor/Moderator/Tester if applicable |
| Bio | User's description |
| Creative Identity | Filmmaking style, current project, influences |
| Camera Gear | Equipment list |
| Favorite Films | Tag-style film list |
| Social Links | Instagram, YouTube, Vimeo, Twitter, TikTok |
| Portfolio Links | Portfolio URL, IMDb |
| Action Buttons | Add Friend / Message (if friends) |

### 2. usePublicProfile Hook

```typescript
export function usePublicProfile(userId: string | null) {
  // Returns:
  // - profile: Public profile data
  // - role: Highest role (admin > professor > moderator > tester > student)
  // - loading: boolean
  // - error: Error | null
}
```

### 3. UserProfileLink Component

A reusable component for clickable profile links:

```typescript
interface UserProfileLinkProps {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  showAvatar?: boolean;
  showName?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}
```

Usage in community posts:
```tsx
<UserProfileLink
  userId={post.user_id}
  displayName={post.author?.display_name}
  avatarUrl={post.author?.avatar_url}
/>
```

---

## Security Considerations

| Aspect | Implementation |
|--------|----------------|
| View access | `profiles_public` view with `security_invoker=on` |
| RLS on base table | Existing policy requires `is_enrolled_student(auth.uid())` |
| Sensitive data | Not included in view (billing, ban info, location) |
| Own profile | Redirect to `/student/profile` for editing |
| Unauthenticated | Show login prompt or redirect |

---

## UI Preview

### Public Profile Page Layout

```text
┌─────────────────────────────────────────────────────────────────┐
│  ← Back                                                         │
├─────────────────────────────────────────────────────────────────┤
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ ← Cover
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────┐                                                       │
│  │ 👤   │  John Smith                     [Add Friend] [Message]│
│  └──────┘  🎬 Documentary  |  🎓 Professor Badge               │
│                                                                 │
│  "Passionate filmmaker focused on human stories..."             │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  📷 Camera Gear                                                 │
│  Sony A7S III, Blackmagic Pocket 6K Pro, DJI RS3               │
│                                                                 │
│  🎬 Current Project                                             │
│  "Shadows of Memory" - Documentary feature                      │
│                                                                 │
│  🎥 Favorite Films                                              │
│  [The Godfather] [Parasite] [2001: A Space Odyssey] +2 more    │
│                                                                 │
│  ✨ Influences                                                  │
│  Kubrick, Villeneuve, Spielberg                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  🔗 Connect                                                     │
│  [🌐 Portfolio] [📸 Instagram] [🎬 YouTube] [🎥 Vimeo]         │
│  [🎭 IMDb]                                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Integration Points

### Community → Profile
Clicking an author's name/avatar in posts or comments navigates to their public profile.

### Friends → Profile  
Clicking a friend in the friends list opens their profile (with "Message" button shown).

### Messages → Profile
Clicking the conversation participant's avatar opens their profile.

### Profile → Friends/Messages
From a public profile, users can:
- Send friend request (if not friends)
- Open direct message (if already friends)

---

## Summary

| Category | Changes |
|----------|---------|
| Database | Update `profiles_public` view to include more public fields |
| New Files | 4 (page, hook, 2 components) |
| Modified Files | 5 (App, PostCard, FriendCard, ConversationItem, index) |
| Features | View profiles, click-to-navigate, friend/message actions |
| Security | View-based access, sensitive data excluded, RLS enforced |

This creates a fully connected social ecosystem where users can discover, view, and connect with each other through their public profiles!

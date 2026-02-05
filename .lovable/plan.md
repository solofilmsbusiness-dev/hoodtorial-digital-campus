
# Enhanced Public Profile with Profile Wall

## Overview

Transform the public profile system so that:
1. Users can view their own profile as others see it (with additional owner actions like "Edit Profile")
2. Introduce a "Profile Wall" where visitors can leave comments/posts that appear in the community feed
3. Create a connected ecosystem where profile activity flows into the community

---

## Current State

| Behavior | Current Implementation |
|----------|----------------------|
| Click own avatar in community | Redirects to `/student/profile` (edit mode) |
| View other users | Shows `PublicProfileCard` with public data |
| Profile comments | Not supported |

---

## Proposed Changes

### 1. Remove Auto-Redirect for Own Profile

Update `PublicProfile.tsx` to allow users to view their own public profile instead of redirecting to the edit page. Add an "Edit Profile" button for owners.

### 2. Enhanced PublicProfileCard for Owners

When viewing your own profile, show additional actions:
- "Edit Profile" button (navigates to `/student/profile`)
- "Share Profile" button (copies profile link)
- View counts / analytics (future enhancement)

### 3. Profile Wall System

Create a profile wall where users can post comments on a profile. These wall posts will:
- Link to the user's profile (as a "target")
- Appear in the community feed as a special "profile_wall" post type
- Be visible on the profile page itself

---

## Database Changes

### New Column on community_posts Table

```sql
ALTER TABLE public.community_posts 
ADD COLUMN target_profile_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL;
```

This allows posts to be "about" or "on" a specific user's profile.

### Updated Indexes

```sql
CREATE INDEX idx_community_posts_target_profile ON public.community_posts(target_profile_id) 
WHERE target_profile_id IS NOT NULL;
```

---

## System Architecture

```text
                    PROFILE WALL FLOW
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌─────────────────┐                                           │
│   │  Visit Profile  │                                           │
│   │  /profile/:id   │                                           │
│   └────────┬────────┘                                           │
│            │                                                    │
│            ▼                                                    │
│   ┌─────────────────────────────────────────────────┐          │
│   │              PublicProfileCard                   │          │
│   │  - Cover banner, avatar, bio, links              │          │
│   │  - Owner actions: Edit, Share (if own profile)   │          │
│   └─────────────────────────────────────────────────┘          │
│            │                                                    │
│            ▼                                                    │
│   ┌─────────────────────────────────────────────────┐          │
│   │              Profile Wall Section                │          │
│   │  - "Write on wall" composer                      │          │
│   │  - List of wall posts (filtered by target_id)   │          │
│   └─────────────────────────────────────────────────┘          │
│            │                                                    │
│            ▼                                                    │
│   ┌─────────────────────────────────────────────────┐          │
│   │           Community Feed (filtered)              │          │
│   │  - Profile wall posts show as special type       │          │
│   │  - "Posted on [User]'s profile"                  │          │
│   └─────────────────────────────────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/profile/ProfileWall.tsx` | Wall post composer and post list for profiles |
| `src/hooks/useProfileWall.ts` | Fetch/create wall posts filtered by target profile |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/PublicProfile.tsx` | Remove redirect, add owner actions, add wall section |
| `src/components/profile/PublicProfileCard.tsx` | Add "Edit Profile" and "Share" buttons for owner |
| `src/hooks/useCommunityPosts.ts` | Add `target_profile_id` to CreatePostData interface |
| `src/components/community/TimelinePost.tsx` | Show "Posted on [Name]'s profile" for wall posts |
| `src/components/profile/index.ts` | Export new component |
| Database migration | Add `target_profile_id` column |

---

## Implementation Details

### 1. PublicProfile Page Changes

```typescript
// Remove the auto-redirect
// useEffect(() => {
//   if (isOwnProfile && !isLoading) {
//     navigate("/student/profile", { replace: true });
//   }
// }, [isOwnProfile, isLoading, navigate]);

// Add owner-specific props
<PublicProfileCard
  ...
  isOwnProfile={isOwnProfile}
  onEditProfile={() => navigate("/student/profile")}
  onShareProfile={() => copyProfileLink()}
/>

// Add wall section below profile card
<ProfileWall profileUserId={userId} isOwnProfile={isOwnProfile} />
```

### 2. PublicProfileCard Owner Actions

For owners viewing their own profile:
- Replace "Add Friend" / "Message" with "Edit Profile" and "Share Profile" buttons
- Show a subtle indicator "This is how others see your profile"

### 3. ProfileWall Component

```typescript
interface ProfileWallProps {
  profileUserId: string;
  isOwnProfile: boolean;
}

// Features:
// - Composer for writing wall posts
// - List of wall posts (community_posts where target_profile_id = userId)
// - Each post links back to full community view
```

### 4. Community Feed Integration

When displaying posts in community:
- If `target_profile_id` is set, show "Posted on [Name]'s profile"
- Clicking the target name navigates to that profile

---

## UI Preview

### Own Profile View

```text
┌─────────────────────────────────────────────────────────────────┐
│  ← Back                                                         │
├─────────────────────────────────────────────────────────────────┤
│  [Cover Banner]                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────┐                                                       │
│  │ 👤   │  Your Name                                           │
│  └──────┘  🎬 Documentary                                       │
│                                                                 │
│            [Edit Profile]  [Share Profile]  ← Owner actions     │
│                                                                 │
│  ℹ️ This is how others see your profile                         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  📋 Wall                                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Write something on your wall...                             ││
│  │ [Post]                                                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  [Wall posts appear here - visible in community too]            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Community Feed with Wall Post

```text
┌─────────────────────────────────────────────────────────────────┐
│  👤 Jane Smith → Posted on John's profile                       │
│  "Happy birthday! Can't wait to see your new short film!"       │
│                                                                 │
│  ❤️ 5  💬 2                                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Privacy & Security

| Aspect | Implementation |
|--------|----------------|
| Wall visibility | Public to all enrolled students (same as community) |
| Who can post | Any enrolled student on any profile |
| Wall moderation | Profile owner can delete wall posts on their profile |
| Owner deletion | Users can delete their own wall posts |
| Admin control | Admins can moderate all wall posts |

---

## RLS Policies

### New Policy for Target Profile Deletion

```sql
-- Profile owners can delete wall posts on their profile
CREATE POLICY "Profile owners can delete wall posts"
ON public.community_posts FOR DELETE
USING (
  target_profile_id IS NOT NULL AND
  target_profile_id = auth.uid()
);
```

---

## Summary

| Category | Changes |
|----------|---------|
| Database | Add `target_profile_id` column to community_posts |
| New Files | 2 (ProfileWall component, useProfileWall hook) |
| Modified Files | 6 (PublicProfile, PublicProfileCard, useCommunityPosts, TimelinePost, index, migration) |
| Features | Own profile view, wall posts, community integration |
| Security | Profile owners can moderate their wall |

This creates a fully connected social ecosystem where profile interactions flow into the community, encouraging engagement and discoverability!

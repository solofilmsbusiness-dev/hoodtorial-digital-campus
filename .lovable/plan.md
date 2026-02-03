
# Restrict Profile Data Access - Privacy Enhancement

## Problem

The `profiles` table contains personal information that any enrolled student can query:
- **Location** (city/country)
- **Bio** (personal description)
- **Camera gear** (equipment details)
- **Social media URLs** (Instagram, YouTube, Twitter, TikTok)

The current RLS policy "Enrolled students can view profiles for mentions" allows any enrolled user to access ALL profile fields for ALL other users. This enables potential stalking, harassment, or unwanted contact.

## Solution

Create a database **view** that exposes only the minimal data needed for community features (display name and avatar), then update the RLS policies to:
1. Allow users to see their own full profile
2. Allow admins/moderators to see all profiles (for moderation)
3. Restrict other enrolled students to only see the minimal public view

## Database Changes

### 1. Create Public Profile View

```sql
CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
SELECT 
  user_id,
  display_name,
  avatar_url
FROM public.profiles;
```

This view only exposes:
- `user_id` - for matching/linking
- `display_name` - for @mentions and author display
- `avatar_url` - for avatars in comments/posts

### 2. Update RLS Policies

**Remove the broad policy:**
```sql
DROP POLICY "Enrolled students can view profiles for mentions" ON public.profiles;
```

**Create granular policies:**
```sql
-- Users can view their own full profile
CREATE POLICY "Users can view own full profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all profiles for moderation
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));
```

### 3. Enable RLS on the View

```sql
ALTER VIEW public.profiles_public SET (security_invoker = on);

-- Anyone authenticated can read the limited public data
CREATE POLICY "Enrolled students can view public profiles"
  ON public.profiles_public FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_enrolled_student(auth.uid()));
```

## Frontend Changes

Update four hooks to query from `profiles_public` instead of `profiles`:

| File | Change |
|------|--------|
| `src/hooks/useMentions.ts` | Change `.from('profiles')` to `.from('profiles_public')` |
| `src/hooks/useCommunityPosts.ts` | Change `.from('profiles')` to `.from('profiles_public')` |
| `src/hooks/useCommunityComments.ts` | Change `.from('profiles')` to `.from('profiles_public')` |
| `src/hooks/useNotifications.ts` | Change `.from('profiles')` to `.from('profiles_public')` |

**Note:** `useProfile.ts` continues to use `profiles` for the current user's own profile (editing their settings), and `useAllUsers.ts` is admin-only so it continues to use `profiles` directly.

## Data Access After Fix

| User Type | Can Access |
|-----------|------------|
| Own profile | All fields (location, bio, social links, etc.) |
| Other students' profiles | Only display_name and avatar_url |
| Admins/Moderators | All fields for all users (moderation) |
| Not enrolled | Nothing |

## Security Outcome

- Students can still @mention each other and see names/avatars in community
- Students cannot harvest personal data like locations or social media URLs
- Users retain full control over viewing/editing their own profile
- Admins retain oversight for moderation purposes

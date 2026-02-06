

# Fix: Login Video Not Displaying (RLS Policy Issue)

## Problem Identified

The uploaded login video exists in the database but isn't displaying because of a Row Level Security (RLS) policy issue.

**Current RLS Policy on `site_settings`:**
```sql
-- SELECT policy requires authenticated users
qual: (auth.uid() IS NOT NULL)
```

This blocks **unauthenticated users** (visitors on the login page) from reading the `login_video_url`, `login_logo_url`, and `login_music_url` settings.

**Network Evidence:**
```
Request: GET /site_settings?select=id,value&id=in.(login_video_url,...)
Status: 200
Response Body: []   ← Empty! Policy blocks the read
```

---

## Solution

Create a new RLS policy that allows **anyone** (including unauthenticated visitors) to read specific public site settings needed for the login page.

### Database Migration

```sql
-- Allow public (unauthenticated) access to login-related site settings
CREATE POLICY "Public can read login settings"
  ON public.site_settings
  FOR SELECT
  USING (
    id IN (
      'login_video_url',
      'login_logo_url', 
      'login_music_url',
      'signup_disabled'
    )
  );
```

This policy:
- Only allows reading **specific** login-related settings
- Does NOT expose other sensitive site settings
- Works alongside the existing "Authenticated users can read" policy

---

## Files to Modify

| File | Changes |
|------|---------|
| Database (migration) | Add RLS policy for public login settings access |

---

## Implementation Steps

1. **Add RLS Policy** - Create new policy allowing unauthenticated users to read login-specific settings
2. **Verify** - Refresh the login page and confirm video loads

---

## Expected Behavior After Fix

1. Unauthenticated user visits `/auth`
2. Supabase query for login settings returns the uploaded video URL
3. Video plays as the background instead of the default static file
4. Music and logo also load from uploaded URLs if configured


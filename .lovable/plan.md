

# Admin-Editable Login Page Media

## Overview

Add an admin feature to customize the login page background video and logo image. This will allow admins to change the cinematic visuals on the Auth page without code changes.

## Current State

The Auth page currently uses:
- **Video**: Static import from `src/assets/hero-video.mp4`
- **Logo**: Static import from `src/assets/hero-logo.png`

These are hardcoded at the top of `Auth.tsx`:
```typescript
import heroLogo from "@/assets/hero-logo.png";
import heroVideo from "@/assets/hero-video.mp4";
```

## Solution Architecture

### Database: Create a `site_settings` Table

Store customizable site-wide settings including login page media URLs:

| Column | Type | Purpose |
|--------|------|---------|
| `id` | TEXT | Setting key (e.g., 'login_video_url') |
| `value` | TEXT | The URL or value |
| `updated_at` | TIMESTAMP | Last modification time |
| `updated_by` | UUID | Admin who made the change |

### Storage: Create `site-assets` Bucket

A new public storage bucket for site-wide assets:
- Accepts video files (MP4, WebM) and images (JPEG, PNG, WebP)
- Max file size: 50MB for videos, 10MB for images
- Public access so Auth page can load without authentication

### Admin UI: Site Customization Panel

Add a new section to Admin Settings page with:
1. **Login Video Upload** - Upload/preview/remove background video
2. **Login Logo Upload** - Upload/preview/remove the logo image
3. **Preview button** - Opens login page in new tab to see changes

### Auth Page: Dynamic Media Loading

Update the Auth page to:
1. Fetch settings from `site_settings` table on load
2. Use database URLs if available, fall back to static imports
3. Show loading state while fetching

## Implementation Details

### 1. Database Migration

```sql
-- Create site_settings table
CREATE TABLE public.site_settings (
  id TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default settings
INSERT INTO site_settings (id, value) VALUES
  ('login_video_url', NULL),
  ('login_logo_url', NULL),
  ('login_video_fallback_image', NULL);

-- RLS: Public read, admin write
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.membership_tier = 'admin'
    )
  );
```

### 2. Storage Bucket

```sql
-- Create site-assets bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-assets',
  'site-assets',
  true,
  52428800, -- 50MB for videos
  ARRAY['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp']
);

-- RLS for site-assets bucket
CREATE POLICY "Anyone can view site assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets');

CREATE POLICY "Admins can upload site assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'site-assets'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.membership_tier = 'admin'
    )
  );

CREATE POLICY "Admins can delete site assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'site-assets'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.membership_tier = 'admin'
    )
  );
```

### 3. New Hook: `useSiteSettings`

```typescript
// src/hooks/useSiteSettings.ts
export function useSiteSettings() {
  const [settings, setSettings] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('id, value');
    
    const settingsMap = {};
    data?.forEach(s => settingsMap[s.id] = s.value);
    setSettings(settingsMap);
    setLoading(false);
  };

  const updateSetting = async (key: string, value: string | null) => {
    await supabase
      .from('site_settings')
      .upsert({ id: key, value, updated_at: new Date().toISOString() });
    
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return { settings, loading, fetchSettings, updateSetting };
}
```

### 4. Admin Settings Enhancement

Add "Site Customization" card to `AdminSettings.tsx`:

```text
+------------------------------------------------+
|  Site Customization                            |
|  Customize the login page appearance           |
+------------------------------------------------+
|                                                |
|  Login Background Video                        |
|  ┌────────────────────────────────────────┐   |
|  │                                        │   |
|  │   [Video Preview Thumbnail]            │   |
|  │                                        │   |
|  └────────────────────────────────────────┘   |
|  [Upload Video] [Remove] [Preview Login Page] |
|                                                |
|  Accepted: MP4, WebM (max 50MB)               |
|                                                |
|  ─────────────────────────────────────────    |
|                                                |
|  Login Logo                                    |
|  ┌──────────┐                                 |
|  │  [Logo]  │                                 |
|  └──────────┘                                 |
|  [Upload Logo] [Remove]                        |
|                                                |
|  Accepted: PNG, JPG, WebP (max 10MB)          |
|                                                |
+------------------------------------------------+
```

### 5. Auth Page Updates

```typescript
// src/pages/Auth.tsx
import defaultLogo from "@/assets/hero-logo.png";
import defaultVideo from "@/assets/hero-video.mp4";

export default function Auth() {
  const [mediaLoading, setMediaLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>(defaultVideo);
  const [logoUrl, setLogoUrl] = useState<string>(defaultLogo);

  useEffect(() => {
    const fetchSiteMedia = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('id, value')
        .in('id', ['login_video_url', 'login_logo_url']);
      
      data?.forEach(setting => {
        if (setting.id === 'login_video_url' && setting.value) {
          setVideoUrl(setting.value);
        }
        if (setting.id === 'login_logo_url' && setting.value) {
          setLogoUrl(setting.value);
        }
      });
      setMediaLoading(false);
    };
    fetchSiteMedia();
  }, []);

  // Use videoUrl and logoUrl in JSX instead of static imports
}
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useSiteSettings.ts` | Hook for reading/updating site settings |
| `src/components/admin/SiteCustomization.tsx` | Admin UI for login page customization |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/admin/AdminSettings.tsx` | Add Site Customization section |
| `src/pages/Auth.tsx` | Fetch and use dynamic media URLs |

## User Experience

### For Admins
1. Go to Admin Dashboard > Settings
2. Scroll to "Site Customization" section
3. Upload a new video or logo
4. Click "Preview Login Page" to see changes
5. Changes take effect immediately for all visitors

### For Visitors
1. Visit `/auth` page
2. See the custom video/logo if set by admin
3. See default assets if no custom media is configured
4. No loading delay - defaults show instantly, custom media loads in background

## Edge Cases Handled

- **No custom media**: Falls back to static imports (hero-video.mp4, hero-logo.png)
- **Large video files**: Shows upload progress indicator
- **Invalid file types**: Validation before upload
- **Admin removes media**: Reverts to default assets
- **Slow connection**: Video poster image option for fast initial render


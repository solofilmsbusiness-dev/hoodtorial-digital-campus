

# Creative Student Profile with Avatar Upload

## Overview
Transform the student profile into a creative, expressive space where filmmakers can showcase their identity. This includes:
1. **Profile Photo Upload** - Upload and crop/adjust profile pictures
2. **Cover Banner** - Optional background banner image
3. **Profile Theme Colors** - Choose accent colors for profile personalization
4. **Expanded Creative Fields** - Favorite films, filmmaking style, influences, portfolio links

## Architecture

```text
Profile Page
├── Cover Banner (uploadable, optional)
├── Avatar Section
│   ├── Profile Photo (uploadable with crop/adjust)
│   ├── Border Style Selector
│   └── Accent Color Ring
├── Basic Info (existing)
├── Creative Identity (new)
│   ├── Filmmaking Style
│   ├── Favorite Films
│   ├── Influences
│   └── Current Project
├── Equipment (existing - camera_gear)
├── Social Links (existing)
└── Portfolio Showcase (new)
```

---

## Implementation Steps

### Step 1: Database Changes
Add new columns to the `profiles` table for creative customization:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  cover_banner_url TEXT,
  profile_accent_color TEXT DEFAULT '#D4AF37',
  avatar_border_style TEXT DEFAULT 'solid',
  filmmaking_style TEXT,
  favorite_films TEXT[],
  influences TEXT,
  current_project TEXT,
  portfolio_url TEXT,
  imdb_url TEXT,
  vimeo_url TEXT;
```

### Step 2: Create Storage Bucket for Avatars
Create a dedicated `avatars` storage bucket:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- RLS: Users can upload/update their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

### Step 3: Create Profile Avatar Upload Hook
**New file: `src/hooks/useAvatarUpload.ts`**

Handles avatar image upload and deletion:
- Upload single image to `avatars/{user_id}/avatar.{ext}`
- Delete old avatar before uploading new one
- Return public URL on success
- Update profile.avatar_url automatically

### Step 4: Create Avatar Editor Component
**New file: `src/components/profile/AvatarEditor.tsx`**

Interactive avatar upload component:
- Circular preview with hover overlay
- Click to open file picker
- Drag & drop support
- Upload progress indicator
- Option to remove current photo

### Step 5: Create Profile Theme Picker
**New file: `src/components/profile/ThemePicker.tsx`**

Color accent selector for profile personalization:
- Preset colors matching the brutalist aesthetic (gold, neon purple, neon pink, accent green)
- Custom color input option
- Border style selector (solid, dashed, double, gradient)
- Live preview of changes

### Step 6: Create Cover Banner Component
**New file: `src/components/profile/CoverBanner.tsx`**

Optional profile banner at top of profile:
- Recommended dimensions display
- Upload/remove functionality
- Overlay gradient for text readability

### Step 7: Update StudentProfile Page
**Edit: `src/pages/StudentProfile.tsx`**

Major redesign to feel more creative:
- Add cover banner section at top
- Replace static avatar with AvatarEditor
- Add creative identity card (filmmaking style, favorite films, influences)
- Add portfolio links section (IMDb, Vimeo, personal portfolio)
- Add theme customization section
- Reorganize into visual sections with creative typography

### Step 8: Update useProfile Hook
**Edit: `src/hooks/useProfile.ts`**

- Add uploadAvatar function
- Add uploadCoverBanner function
- Handle new profile fields

### Step 9: Create Favorite Films Input
**New file: `src/components/profile/FavoriteFilmsInput.tsx`**

A tag-style input for listing favorite films:
- Add films as tags
- Remove with X button
- Max 5 films
- Animated tag additions

---

## UI/UX Design Details

### Avatar Section Design
```text
┌─────────────────────────────────────┐
│         [Cover Banner Image]        │
│                                     │
│     ┌───────────┐                   │
│     │  Avatar   │ ← Glowing border  │
│     │  (click   │   with accent     │
│     │  upload)  │   color           │
│     └───────────┘                   │
│                                     │
│     Display Name                    │
│     @location • Membership Badge    │
└─────────────────────────────────────┘
```

### Color Options (Brutalist Palette)
| Name | Hex | CSS Variable |
|------|-----|--------------|
| Gold (default) | #D4AF37 | --primary |
| Neon Purple | #A855F7 | --neon-purple |
| Neon Pink | #EC4899 | --neon-pink |
| Accent Green | #00E5A0 | --accent |
| White | #FFFFFF | -- |
| Custom | User pick | -- |

### Border Styles
- **Solid** - Clean, professional
- **Double** - Classic film aesthetic
- **Dashed** - Playful, creative
- **Glow** - Animated neon glow effect

---

## Files to Create
1. `src/hooks/useAvatarUpload.ts` - Avatar upload logic
2. `src/components/profile/AvatarEditor.tsx` - Avatar upload UI
3. `src/components/profile/ThemePicker.tsx` - Color/style picker
4. `src/components/profile/CoverBanner.tsx` - Banner upload
5. `src/components/profile/FavoriteFilmsInput.tsx` - Film tags input
6. `src/components/profile/index.ts` - Export barrel

## Files to Modify
1. `src/pages/StudentProfile.tsx` - Complete redesign
2. `src/hooks/useProfile.ts` - Add upload functions

## Database Changes
1. Add new columns to `profiles` table
2. Create `avatars` storage bucket with RLS policies

---

## Creative Features Summary

| Feature | Description |
|---------|-------------|
| Avatar Upload | Click-to-upload circular avatar with cropping |
| Avatar Glow | Animated border glow with custom accent color |
| Cover Banner | Wide banner image at top of profile |
| Theme Colors | Choose accent color for profile elements |
| Border Styles | Select avatar border style (solid, dashed, glow) |
| Favorite Films | Tag-based input for 5 favorite films |
| Filmmaking Style | Dropdown or text for style (Documentary, Narrative, etc.) |
| Current Project | Text field for what they're working on |
| Influences | Text area for filmmaking influences |
| Portfolio Links | IMDb, Vimeo, personal portfolio URLs |

## Security Considerations
- Avatar bucket is public (for display) but upload is authenticated
- Users can only modify their own folder (`avatars/{user_id}/`)
- File size limited to 5MB
- Only image MIME types allowed
- Old avatar deleted when new one uploaded to prevent storage bloat


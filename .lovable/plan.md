
# Fix Avatar & Cover Banner Save Issue

## Root Cause

There's a **state synchronization bug** between the upload hook and ProfileContext:

1. When uploading an avatar/banner, `useAvatarUpload` updates the **database** directly
2. It then calls `onAvatarChange(url)` which updates **local component state**
3. BUT the `ProfileContext` still has the **old** `profile.avatar_url` / `profile.cover_banner_url`
4. The `useEffect` in `StudentProfile.tsx` watches `profile` and resets `avatarUrl`/`bannerUrl` from context - overwriting the new URL with the old one

```
Upload Flow (Current - Broken):
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Upload Hook    │────▶│   Database   │     │  ProfileContext │
│  (updates DB)   │     │  (has NEW)   │     │  (has OLD)      │
└─────────────────┘     └──────────────┘     └─────────────────┘
        │                                              │
        ▼                                              ▼
┌─────────────────┐                         ┌─────────────────┐
│ Local State     │◀────────────────────────│ useEffect reads │
│ (shows NEW)     │   Overwrites with OLD!  │ from context    │
└─────────────────┘                         └─────────────────┘
```

## Solution

After a successful upload, **refresh the ProfileContext** so all components see the updated URLs:

```
Upload Flow (Fixed):
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Upload Hook    │────▶│   Database   │────▶│  ProfileContext │
│  (updates DB)   │     │  (has NEW)   │     │  refetch()      │
└─────────────────┘     └──────────────┘     └─────────────────┘
                                                       │
                                                       ▼
                                             ┌─────────────────┐
                                             │ All components  │
                                             │ see NEW URL     │
                                             └─────────────────┘
```

## Implementation Changes

### 1. Update AvatarEditor Component

Pass the `refetch` function from ProfileContext and call it after successful upload:

```typescript
// AvatarEditor.tsx
interface AvatarEditorProps {
  // ... existing props
  onUploadComplete?: () => void; // NEW: callback to refresh context
}

// After successful upload:
const { url, error } = await uploadAvatar(file);
if (url) {
  onAvatarChange?.(url);
  onUploadComplete?.(); // Refresh the context
}
```

### 2. Update CoverBanner Component

Same pattern - add callback for context refresh:

```typescript
// CoverBanner.tsx  
interface CoverBannerProps {
  currentBannerUrl?: string | null;
  onBannerChange?: (url: string | null) => void;
  onUploadComplete?: () => void; // NEW
}

// After successful upload:
if (url) {
  onBannerChange?.(url);
  onUploadComplete?.(); // Refresh the context
}
```

### 3. Update StudentProfile.tsx

Pass the `refetch` function to the upload components:

```typescript
const { profile, loading, updateProfile, refetch } = useProfileContext();

// In the JSX:
<AvatarEditor
  currentAvatarUrl={avatarUrl}
  displayName={formData.display_name}
  accentColor={formData.profile_accent_color}
  borderStyle={formData.avatar_border_style}
  onAvatarChange={setAvatarUrl}
  onUploadComplete={refetch}  // NEW
/>

<CoverBanner
  currentBannerUrl={bannerUrl}
  onBannerChange={setBannerUrl}
  onUploadComplete={refetch}  // NEW
/>
```

### 4. Prevent useEffect from overwriting new uploads

Add a flag to prevent the context sync from overwriting fresh uploads:

```typescript
const [isImageUploading, setIsImageUploading] = useState(false);

// Modified useEffect - skip sync during/right after upload
useEffect(() => {
  if (profile && !isImageUploading) {
    // ... existing logic
    setAvatarUrl(profile.avatar_url);
    setBannerUrl(profile.cover_banner_url);
  }
}, [profile, isImageUploading]);
```

Or simpler: just let the context refetch handle the sync automatically after upload.

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/profile/AvatarEditor.tsx` | Add `onUploadComplete` prop, call after successful upload/remove |
| `src/components/profile/CoverBanner.tsx` | Add `onUploadComplete` prop, call after successful upload/remove |
| `src/pages/StudentProfile.tsx` | Pass `refetch` to upload components |

## Expected Result

1. User uploads new avatar/banner
2. File uploads to storage 
3. Database updates with new URL
4. `onUploadComplete()` triggers `refetch()` in ProfileContext
5. Context now has the NEW URL
6. All components (Navigation, StudentCenter, etc.) show the new image
7. No more reverting to old images

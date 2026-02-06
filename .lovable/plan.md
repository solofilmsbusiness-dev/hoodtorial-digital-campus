
# Fix: Video Preview Not Updating in Site Customization

## Problem Identified

The video preview in the Admin Settings > Site Customization section is not properly updating when a new video is uploaded. The user sees an "old image" instead of the newly uploaded video.

## Root Cause

The `<video>` element in `SiteCustomization.tsx` is missing a `key` prop. Without this prop, React reuses the same video element when the `src` changes, which can cause the browser to show cached content or fail to reload the video.

**Current Code (line 374-381):**
```tsx
<video
  src={settings.login_video_url}
  className="w-full h-full object-cover"
  muted
  loop
  autoPlay
  playsInline
/>
```

**Compare to Auth.tsx (which works correctly):**
```tsx
<video
  autoPlay
  loop
  muted
  playsInline
  className="absolute inset-0 w-full h-full object-cover"
  key={videoUrl}  // Forces re-render when URL changes
>
  <source src={videoUrl} type="video/mp4" />
</video>
```

## Solution

Add a `key` prop to the video element in SiteCustomization.tsx to force React to create a new video element when the URL changes.

---

## Technical Changes

### File: `src/components/admin/SiteCustomization.tsx`

**Change:** Add `key={settings.login_video_url}` to the video element

**Before:**
```tsx
<video
  src={settings.login_video_url}
  className="w-full h-full object-cover"
  muted
  loop
  autoPlay
  playsInline
/>
```

**After:**
```tsx
<video
  key={settings.login_video_url}
  src={settings.login_video_url}
  className="w-full h-full object-cover"
  muted
  loop
  autoPlay
  playsInline
/>
```

---

## Why This Fixes the Issue

1. **React's Reconciliation**: When a `key` prop changes, React treats it as a completely new element
2. **Fresh Video Load**: A new `<video>` element is created with the new source URL
3. **No Cache Issues**: The browser loads the video fresh from the new URL
4. **Consistent Behavior**: This matches how Auth.tsx handles dynamic video URLs

---

## Testing Steps

After the fix:
1. Go to Admin Settings > Site Customization
2. Upload a new video
3. Verify the preview immediately shows the new video (not the old one)
4. Click "Preview Login Page" to confirm the video plays on the actual auth page


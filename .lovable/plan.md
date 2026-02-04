

# Increase Video Upload Limit to 200MB for Homepage

## Overview

Increase the maximum video file size limit from 50MB to 200MB for higher quality video uploads. This applies to the admin Site Customization panel where videos can be uploaded for the login/auth page background.

**Note:** The current homepage video (`hero-video.mp4`) is a static asset bundled in the codebase, not uploaded via admin settings. This change will also extend the system to allow admins to customize the homepage hero video.

## Changes Required

### 1. Update SiteCustomization.tsx

Increase the video file size validation from 50MB to 200MB:

| Current | New |
|---------|-----|
| `50 * 1024 * 1024` (50MB) | `200 * 1024 * 1024` (200MB) |
| "Video must be under 50MB" | "Video must be under 200MB" |
| "max 50MB" | "max 200MB" |

### 2. Add Homepage Video Setting (Optional Enhancement)

To allow the homepage video to also be customizable:

**Database:** Add `homepage_video_url` to site_settings table

**SiteCustomization.tsx:** Add a second video upload section for "Homepage Hero Video"

**Index.tsx:** Fetch and use the custom homepage video URL with fallback to the static asset

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/SiteCustomization.tsx` | Change 50MB limit to 200MB, update help text |

## Optional: Add Homepage Video Customization

If you also want to make the homepage video editable via admin:

| File | Changes |
|------|---------|
| Database migration | Add `homepage_video_url` column to site_settings |
| `src/components/admin/SiteCustomization.tsx` | Add homepage video upload section |
| `src/hooks/useSiteSettings.ts` | Include new setting |
| `src/pages/Index.tsx` | Fetch custom video URL, fallback to static asset |

## Expected Outcome

1. Admins can upload videos up to 200MB for higher quality
2. The UI shows the updated limit text: "max 200MB"
3. (Optional) Homepage hero video can be customized via admin panel


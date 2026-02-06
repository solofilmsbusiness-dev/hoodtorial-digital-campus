

# Fix: Site Crashing on Mobile Phones

## Problem

When users visit hoodtorialuniversity.com on their phones, the site loads briefly then crashes. The site works fine on desktop.

## Root Cause

The login page loads a **full-resolution background video** from the server. On mobile phones with limited memory and slower cellular connections, this large video causes the browser tab to run out of memory and crash. Mobile Safari is especially aggressive about killing tabs that use too much memory for video playback.

## Solution

### 1. Disable background video on mobile devices

On phones, replace the video with a **static gradient or image background** instead. This dramatically reduces memory usage and prevents the crash. The video will still play on desktop/tablet where there's enough memory.

### 2. Add lazy loading for the video

Even on desktop, defer video loading until after the page content has rendered, so users see the login form immediately.

### 3. Add a poster frame fallback

Set a `poster` attribute on the video element so a static image shows while the video loads (for tablets and desktops).

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Conditionally hide background video on mobile; add poster fallback; lazy-load video |
| `src/hooks/use-mobile.tsx` | Already exists, will be reused for mobile detection |

## Technical Details

**Auth.tsx changes:**

```tsx
// Import mobile hook
import { useIsMobile } from "@/hooks/use-mobile";

// Inside the component
const isMobile = useIsMobile();

// Replace the video element with conditional rendering:
{!isMobile && (
  <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute inset-0 w-full h-full object-cover"
    poster="/placeholder.svg"
    key={videoUrl}
  >
    <source src={videoUrl} type="video/mp4" />
  </video>
)}

{/* Mobile-friendly animated gradient background */}
{isMobile && (
  <div className="absolute inset-0 bg-gradient-to-br from-charcoal-dark via-charcoal to-charcoal-dark" />
)}
```

This keeps the cinematic video experience on desktop while preventing the crash on phones. The dark gradient background on mobile maintains the brand aesthetic without the memory cost.

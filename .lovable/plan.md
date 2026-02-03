

# Centered Login with Full-Screen Background Video

## Overview

Redesign the Auth page to feature a full-screen looping background video with the login form centered on top. This creates a more immersive, cinematic experience compared to the current split-screen layout.

## Current vs. New Design

| Aspect | Current | New |
|--------|---------|-----|
| Layout | Split-screen (50/50) | Centered single-column |
| Video | Left side only | Full-screen background |
| Form | Right side | Centered overlay with glass effect |
| Mobile | Compact header video | Full-screen with centered form |

## Visual Design

```text
+----------------------------------------------------------+
|                                                          |
|   ╔════════════════════════════════════════════════════╗ |
|   ║                                                    ║ |
|   ║           [Full-Screen Looping Video]              ║ |
|   ║                                                    ║ |
|   ║          ┌─────────────────────────┐               ║ |
|   ║          │      [Logo]             │               ║ |
|   ║          │                         │               ║ |
|   ║          │   HOODTORIAL            │               ║ |
|   ║          │   UNIVERSITY            │               ║ |
|   ║          │   ─────────────         │               ║ |
|   ║          │                         │               ║ |
|   ║          │   📧 Email              │               ║ |
|   ║          │   🔒 Password           │               ║ |
|   ║          │                         │               ║ |
|   ║          │   [SIGN IN]             │               ║ |
|   ║          │                         │               ║ |
|   ║          │   Don't have account?   │               ║ |
|   ║          └─────────────────────────┘               ║ |
|   ║                                                    ║ |
|   ║          👥👥👥 500+ enrolled                      ║ |
|   ╚════════════════════════════════════════════════════╝ |
+----------------------------------------------------------+
```

## Implementation Details

### Layout Structure Change

```tsx
// New structure
<div className="min-h-screen relative overflow-hidden">
  {/* Full-screen background video */}
  <video className="absolute inset-0 w-full h-full object-cover" />
  
  {/* Dark overlay for readability */}
  <div className="absolute inset-0 bg-background/80" />
  
  {/* Film effects overlay */}
  <FilmOverlay />
  
  {/* Countdown animation */}
  <FilmCountdown />
  
  {/* Centered content */}
  <div className="relative z-20 min-h-screen flex items-center justify-center px-4">
    <div className="w-full max-w-md">
      {/* Logo */}
      {/* Title */}
      {/* Glass form card */}
      {/* Social proof */}
    </div>
  </div>
</div>
```

### Key Changes

1. **Video Positioning**
   - Move video to absolute position covering entire viewport
   - Add darker overlay (`bg-background/80`) for form readability
   - Keep video looping with `autoPlay`, `loop`, `muted`, `playsInline`

2. **Form Centering**
   - Use `flex items-center justify-center` on wrapper
   - Single column layout works for all screen sizes
   - Remove split-screen responsive breakpoints

3. **Film Overlay Adjustments**
   - Modify `FilmOverlay` to work better with centered layout
   - Remove the side-specific gradient (was designed for split-screen)
   - Keep scanlines, grain, lens flare, and neon accents

4. **Glass Card Enhancement**
   - Increase backdrop blur for better readability over video
   - Slightly increase card opacity
   - Keep the animated border glow effect

5. **Remove Duplicate Elements**
   - Remove mobile-specific video hero section (no longer needed)
   - Remove left/right panel logic
   - Simplified single responsive layout

### Updated FilmOverlay

Adjust the overlay to work better for full-screen:

```tsx
export function FilmOverlay() {
  return (
    <>
      {/* Center vignette overlay instead of side gradients */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-background/20 to-background/60 z-10" />
      
      {/* Keep scanlines, grain, lens flare */}
      {/* Remove sprocket holes (they were for split-screen aesthetic) */}
    </>
  );
}
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Auth.tsx` | Restructure to centered layout with full-screen video |
| `src/components/auth/FilmOverlay.tsx` | Adjust overlays for centered design |

## Mobile Experience

The centered design works naturally on mobile:
- Full-screen video background maintains immersion
- Form card centered vertically and horizontally
- Scrollable if content exceeds viewport
- Same experience across all screen sizes

## Preserved Elements

All the cinematic elements from the previous redesign will be kept:
- "3, 2, 1... ACTION!" countdown animation
- Glass-morphism form card with animated border
- Social proof footer
- Dynamic video/logo loading from admin settings
- Film grain and scanline effects (simplified)


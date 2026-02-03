

# Enhanced Homepage with Background Video

## Overview

Transform the homepage into a more immersive, cinematic experience by adding a low-opacity background video in the hero section and enhancing the visual impact of the page. This will make the landing page feel more premium and aligned with the film school brand.

## Key Enhancements

### 1. Background Video in Hero Section

Add a looping, muted, autoplay video behind the hero content with low opacity. The video will:
- Play automatically, muted, and loop continuously
- Have reduced opacity (10-20%) so it doesn't distract from content
- Be covered by a gradient overlay for readability
- Gracefully fall back to the existing animated orbs if video fails to load

### 2. Visual Layout Improvements

| Element | Current | Enhanced |
|---------|---------|----------|
| Hero height | min-h-screen | Full viewport with video |
| Background | Static orbs + grid | Video + orbs + grid layers |
| Logo section | Centered, static | Centered with subtle parallax feel |
| CTA buttons | Standard placement | More prominent with additional glow |

## Implementation Details

### File: `src/pages/Index.tsx`

**Changes:**
1. Add a video element as the first layer in the hero section
2. Use a cinematic stock video URL (royalty-free film/cinema footage)
3. Apply opacity and blend modes for the brutalist aesthetic
4. Add a stronger gradient overlay for text contrast

**New Video Container Structure:**
```tsx
{/* Background Video Layer */}
<video
  autoPlay
  muted
  loop
  playsInline
  className="absolute inset-0 w-full h-full object-cover opacity-15"
  poster="/placeholder.svg"
>
  <source src="VIDEO_URL" type="video/mp4" />
</video>

{/* Dark overlay for contrast */}
<div className="absolute inset-0 bg-background/80" />

{/* Existing grid and orb effects remain */}
```

### Video Source Options

Since the project doesn't have a video file yet, we have two approaches:

**Option A - External URL (Recommended for now):**
Use a royalty-free cinematic video from a CDN like Pexels or Coverr. These are free and high-quality.

**Option B - User Upload:**
Allow the user to provide their own video file to upload to the project.

### File: `src/index.css`

Add new utility class for video overlay effects:
```css
.video-overlay {
  background: linear-gradient(
    to bottom,
    hsl(var(--background) / 0.7),
    hsl(var(--background) / 0.9) 50%,
    hsl(var(--background))
  );
}
```

## Visual Design

```
+------------------------------------------------------------------+
|  [BACKGROUND VIDEO - LOOPING, MUTED]                  opacity 15% |
|                                                                   |
|   +---------------------------------------------------------+     |
|   |  [DARK OVERLAY]                              opacity 80% |     |
|   |                                                          |     |
|   |         [ANIMATED ORBS - subtle glow effects]            |     |
|   |                                                          |     |
|   |              [HERO LOGO]                                 |     |
|   |                                                          |     |
|   |              HOODTORIAL                                  |     |
|   |              UNIVERSITY                                  |     |
|   |                                                          |     |
|   |         Where Hustle Meets Hollywood                     |     |
|   |                                                          |     |
|   |      [START LEARNING]    [VIEW CURRICULUM]               |     |
|   |                                                          |     |
|   +---------------------------------------------------------+     |
|                                                                   |
+------------------------------------------------------------------+
```

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/pages/Index.tsx` | Modify | Add video element and enhanced overlays in hero section |
| `src/index.css` | Modify | Add video overlay gradient utility class |

## Technical Considerations

1. **Performance**: Video uses `playsInline` and `muted` for mobile autoplay support
2. **Fallback**: If video fails to load, the existing animated orbs provide visual interest
3. **Accessibility**: Video is purely decorative, no captions needed
4. **Mobile**: Video will scale with `object-cover` to fill container on all screen sizes
5. **Data usage**: Using a lightweight, compressed video keeps load times fast

## Additional Polish

- Slightly increase the opacity of the animated orbs to create more visual depth
- Add a subtle vignette effect at the edges
- Consider adding a film grain overlay for that authentic cinema look (already exists via `bg-noise`)


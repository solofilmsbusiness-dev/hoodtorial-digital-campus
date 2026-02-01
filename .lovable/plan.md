

# New Home Page with University Logo Hero

## Overview
Redesign the home page to feature the uploaded "Hoodtorial University" graduation cap logo as the centerpiece of a bold, impactful hero section. This creates a more collegiate, branded experience while maintaining the ultra-dark brutalist aesthetic.

---

## What Will Change

### Hero Section Redesign
The current text-heavy hero will be replaced with a logo-centric design:

**Current Hero:**
- "SHOOT BETTER. EDIT SMARTER. GRADUATE DIFFERENT." headline
- Paragraph subheadline
- CTA buttons below text

**New Hero:**
- Large animated university logo as the focal point (the uploaded image)
- Tagline beneath: "WHERE HUSTLE MEETS HOLLYWOOD"
- "Class of 2025" enrollment badge
- CTA buttons
- Subtle background effects (keep existing orbs/grid)

---

## Page Structure

```text
New Home Page Layout:
|
+-- Hero Section (REDESIGNED)
|     - Full-screen height
|     - Centered university logo (large, animated glow)
|     - "HOODTORIAL UNIVERSITY" text treatment
|     - "WHERE HUSTLE MEETS HOLLYWOOD" tagline
|     - "Now Enrolling" sticker badge
|     - CTA buttons: "Start Learning" / "View Curriculum"
|     - Animated scroll indicator
|
+-- Stats Bar (KEEP)
|     - 12 Courses / 60 Credits / 4 Departments / Infinite Potential
|
+-- Features Section (KEEP)
|     - Real Film Training / Scenario Exams / Actual Credentials
|
+-- How It Works (KEEP)
|     - Enroll -> Study -> Create -> Graduate
|
+-- Featured Courses (KEEP)
|
+-- Degree Preview (KEEP)
|
+-- Membership Tiers (KEEP)
|
+-- Email Capture (KEEP)
```

---

## Hero Design Details

### Logo Treatment
- Copy uploaded image to `src/assets/hero-logo.png`
- Display centered at large size (350-400px height on desktop)
- Add subtle pulsing glow effect around the logo
- The logo's black/white design works perfectly on the dark background

### Typography Stack
```text
[University Logo Image - graduation cap with "Class of 2025"]

HOODTORIAL
UNIVERSITY

Where Hustle Meets Hollywood

[Now Enrolling Badge]

[Start Learning CTA]  [View Curriculum CTA]
```

### Animation Sequence
1. Logo fades in with scale effect (0.2s delay)
2. "HOODTORIAL" text reveals from bottom (0.4s delay)
3. "UNIVERSITY" text reveals (0.5s delay)
4. Tagline fades in (0.6s delay)
5. CTAs animate in (0.8s delay)

### Background Effects
- Keep existing animated gradient orbs (gold/purple/pink)
- Keep grid overlay
- Keep noise texture
- Optional: add radial gradient behind logo for depth

---

## Technical Implementation

### Image Setup
1. Copy `user-uploads://BangOUT_university_design_4.PNG` to `src/assets/hero-logo.png`
2. Import as ES6 module in Index.tsx

### Component Changes
Modify `src/pages/Index.tsx`:
- Replace hero headline text with logo image
- Add styled text beneath logo
- Adjust layout to be more visually centered
- Keep all other sections (stats, features, etc.) intact

### Styling Additions
- `.logo-glow` class for the pulsing effect around the logo
- Responsive sizing for the logo (smaller on mobile)

---

## Responsive Behavior

| Breakpoint | Logo Height | Text Size |
|------------|-------------|-----------|
| Mobile (<640px) | 200px | text-4xl |
| Tablet (640-1024px) | 280px | text-5xl |
| Desktop (>1024px) | 380px | text-6xl/7xl |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/assets/hero-logo.png` | Copy uploaded image here |
| `src/pages/Index.tsx` | Replace hero section with logo-centric design |
| `src/index.css` | Add logo glow animation class (optional) |

---

## What Stays the Same

All sections below the hero remain unchanged:
- Stats bar (12 Courses, 60 Credits, etc.)
- Features section (Why HU)
- How It Works (graduation steps)
- Featured Courses grid
- Degree Preview
- Membership Tiers
- Email capture form

The overall ultra-dark, brutalist aesthetic is preserved - the logo simply becomes the new focal point of the hero.


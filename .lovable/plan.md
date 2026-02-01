
# Plan: Add Logo to Login Page

## Overview
Transform the login page into a proper "login home page" with the university logo displayed prominently, giving it the same branded feel as the homepage hero section.

## Current State
- The Auth page uses `PageLayout` which includes navigation header and footer
- No logo is displayed on the login page
- The page has a simple "Welcome Back" heading

## Proposed Design
Create a full-screen login experience with:
- The hero logo displayed above the form
- The "HOODTORIAL UNIVERSITY" branding and tagline
- Dark background with subtle animated effects (matching homepage aesthetic)
- No navigation bar - this is the entry point before seeing the site
- Clean, centered layout

## Changes

### File: `src/pages/Auth.tsx`

1. **Remove PageLayout wrapper** - Replace with a standalone full-screen layout (no nav/footer)

2. **Add logo import and display**:
   - Import `heroLogo` from `@/assets/hero-logo.png`
   - Display the logo above the form with the pulsing glow animation

3. **Add branded header section**:
   - University name with gold gradient
   - "Where Hustle Meets Hollywood" tagline
   - Background effects (grid, gradient orbs) matching homepage

4. **Update layout structure**:
   ```
   ┌─────────────────────────────────────┐
   │         [Animated Background]        │
   │                                      │
   │          [University Logo]           │
   │                                      │
   │       HOODTORIAL UNIVERSITY          │
   │    Where Hustle Meets Hollywood      │
   │                                      │
   │     ┌────────────────────────┐       │
   │     │     [Login Form]       │       │
   │     │                        │       │
   │     │   Email / Password     │       │
   │     │      [Sign In]         │       │
   │     └────────────────────────┘       │
   │                                      │
   └─────────────────────────────────────┘
   ```

## Technical Details

### Imports to Add
```typescript
import heroLogo from "@/assets/hero-logo.png";
```

### Remove
- `PageLayout` wrapper (since we want a standalone login screen)

### Layout Structure
- Full-screen container with `min-h-screen`
- Background effects: noise texture, grid overlay, gradient orbs
- Centered content with logo, branding, and form card
- Same animation classes used on homepage: `animate-reveal`, `animate-logo-pulse`, `text-gold-gradient`

## User Experience
1. User navigates to `/auth` (or is redirected after sign out)
2. Sees the full university branding with animated logo
3. Form is centered below the branding
4. After successful login, they are taken into the site with full navigation

## Files to Modify
- `src/pages/Auth.tsx` - Complete redesign of the page layout

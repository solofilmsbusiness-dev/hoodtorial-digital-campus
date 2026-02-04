
# Resize Logo and Overlap onto University Text

## Overview

Two adjustments to the logo:
1. **Make logo 35% smaller** - reduce from current size to approximately 65% of original
2. **Overlap 30% onto text** - logo descends into "Hoodtorial University" title

## Size Calculations

### Current vs New Logo Size

| Breakpoint | Current | 35% Smaller | Tailwind Class |
|------------|---------|-------------|----------------|
| Mobile | `h-72` (288px) | ~187px | `h-48` (192px) |
| Desktop | `h-96` (384px) | ~250px | `h-64` (256px) |

### Overlap Calculations

With the new smaller sizes, 30% overlap means:
- Mobile: 192px × 30% = ~58px → `-mb-14` (56px)
- Desktop: 256px × 30% = ~77px → `md:-mb-20` (80px)

## Changes Required

### src/pages/Auth.tsx

**Line 212** - Add negative margin for overlap:
```tsx
// Current
className="text-center mt-12 mb-2"

// New  
className="text-center mt-12 -mb-14 md:-mb-20 relative z-10"
```

**Line 217** - Reduce logo size:
```tsx
// Current
className="h-72 md:h-96 w-auto mx-auto animate-logo-pulse"

// New
className="h-48 md:h-64 w-auto mx-auto animate-logo-pulse"
```

## Visual Layout

```text
Before:                          After:
                                 
┌──────────────────┐             ┌────────────┐
│                  │             │   LOGO     │  ← 35% smaller
│   LARGE LOGO     │             │  (smaller) │
│                  │             └─────┬──────┘
└──────────────────┘                   │ 30% overlap
        ↓                              ↓
   HOODTORIAL                     HOODTORIAL
   UNIVERSITY                     UNIVERSITY
```

## Technical Summary

| Property | Current | New |
|----------|---------|-----|
| Logo height (mobile) | `h-72` (288px) | `h-48` (192px) |
| Logo height (desktop) | `h-96` (384px) | `h-64` (256px) |
| Bottom margin | `mb-2` | `-mb-14 md:-mb-20` |
| Z-index | none | `z-10` |

## Expected Outcome

1. Logo is approximately 35% smaller than before
2. Logo overlaps the university text by ~30%
3. Creates a cohesive, layered brand header
4. Maintains responsive sizing and animations

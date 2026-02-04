

# Make Login Logo Much Bigger

## Overview

The current logo size (`h-40 md:h-48` = 160px/192px) is still not prominent enough. Let's make it significantly larger to dominate the screen as the hero element.

## Current vs New Size

| Property | Current | New |
|----------|---------|-----|
| Height (mobile) | `h-40` (160px) | `h-56` (224px) |
| Height (desktop) | `h-48` (192px) | `h-72` (288px) |

This makes the logo approximately **50% larger** than the current size and **3x larger** than the original.

## Changes Required

### src/pages/Auth.tsx (Line 217)

Update the logo image className:

```tsx
// Current
className="h-40 md:h-48 w-auto mx-auto animate-logo-pulse"

// New  
className="h-56 md:h-72 w-auto mx-auto animate-logo-pulse"
```

## Visual Comparison

```text
Before (h-40/h-48):          After (h-56/h-72):
                             
   ┌────────────┐               ┌──────────────────┐
   │   LOGO     │               │                  │
   │  160-192px │               │      LOGO        │
   └────────────┘               │    224-288px     │
                                │                  │
                                └──────────────────┘
```

## Expected Outcome

1. Logo is much more commanding and eye-catching
2. Creates a powerful first impression when it fades in
3. Responsive sizing maintains proportions across devices
4. Maintains the pulsing glow animation


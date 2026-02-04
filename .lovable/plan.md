
# Position Logo Directly Above University Text

## Overview

Remove the spacing between the logo and the "Hoodtorial University" text so they appear as a unified header element, with the logo sitting directly on top of the title.

## Current Issue

The logo has `mt-8 mb-6` spacing which creates a gap between it and the university name, making them feel like separate elements.

## Changes Required

### src/pages/Auth.tsx

**Line 212** - Remove top margin and reduce bottom margin to bring logo closer to text:
```tsx
// Current
className="text-center mt-8 mb-6"

// New
className="text-center mb-2"
```

This removes the `mt-8` (which pushed the logo down) and changes `mb-6` to `mb-2` (tighter spacing to the text below).

## Visual Layout

```text
Before:                          After:
                                 
     ┌────────────┐                  ┌────────────┐
     │   LOGO     │                  │   LOGO     │
     └────────────┘                  └────────────┘
           ↓                              ↓
     (mb-6 = 24px gap)              (mb-2 = 8px gap)
           ↓                              ↓
       HOODTORIAL                     HOODTORIAL
       UNIVERSITY                     UNIVERSITY
                                 
    (feels separate)              (feels unified)
```

## Technical Details

| Property | Current | New |
|----------|---------|-----|
| Top margin | `mt-8` (32px) | None |
| Bottom margin | `mb-6` (24px) | `mb-2` (8px) |

## Expected Outcome

1. Logo appears directly above the text as a unified header
2. Logo and title feel like one cohesive brand element
3. Maintains the large logo size (h-72 / h-96)
4. Preserves the staggered fade-in animations

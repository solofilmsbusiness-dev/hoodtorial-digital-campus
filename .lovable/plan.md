
# Overlap Logo onto University Text by 35%

## Overview

Make the logo overlap/sit on top of the "Hoodtorial University" text by approximately 35% of its height, creating a layered, unified brand header where the logo descends into the text.

## Approach

Use a negative bottom margin on the logo container to pull it down and overlap the text below. With the logo being `h-72` (288px) on mobile and `h-96` (384px) on desktop, a 35% overlap means:

- Mobile: 288px × 35% = ~100px overlap → `-mb-24` to `-mb-28`
- Desktop: 384px × 35% = ~135px overlap → `md:-mb-36`

## Changes Required

### src/pages/Auth.tsx

**Line 212** - Add negative bottom margin for overlap:
```tsx
// Current
className="text-center mt-12 mb-2"

// New
className="text-center mt-12 -mb-24 md:-mb-36 relative z-10"
```

The `relative z-10` ensures the logo stays on top of the text layer.

## Visual Layout

```text
Before:                          After:
                                 
     ┌────────────┐              ┌────────────┐
     │   LOGO     │              │   LOGO     │
     └────────────┘              │            │
          ↓                      └──────┬─────┘
     (small gap)                        │ 35% overlap
          ↓                             ↓
       HOODTORIAL                    HOODTORIAL
       UNIVERSITY                    UNIVERSITY
                                 
    (stacked)                    (overlapping)
```

## Technical Details

| Property | Current | New |
|----------|---------|-----|
| Bottom margin | `mb-2` (8px) | `-mb-24 md:-mb-36` (~100-144px overlap) |
| Z-index | none | `z-10` (logo on top) |
| Position | static | `relative` (for z-index) |

## Expected Outcome

1. Logo descends ~35% into the university text
2. Creates a dramatic, layered brand header effect
3. Logo appears to "crown" the text below
4. Maintains responsive behavior on mobile/desktop

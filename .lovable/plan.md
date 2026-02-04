

# Make Login Logo 50% Page Width and 5% Lower

## Current State

The logo on the login page uses fixed height sizing:
- `h-48` on mobile (192px)
- `md:h-64` on desktop (256px)
- `w-auto` (width adjusts automatically based on aspect ratio)
- `mt-12` top margin (-48px)

## Changes Required

### src/pages/Auth.tsx

**Line 296** - Update the container margin to add 5% vertical offset:
```tsx
// Before
className="text-center mt-12 -mb-14 md:-mb-20 relative z-10"

// After  
className="text-center mt-[5vh] -mb-14 md:-mb-20 relative z-10"
```

**Lines 298-302** - Update the image to be 50% page width:
```tsx
// Before
<img 
  src={logoUrl}
  alt="Hoodtorial University" 
  className="h-48 md:h-64 w-auto mx-auto animate-logo-pulse"
/>

// After
<img 
  src={logoUrl}
  alt="Hoodtorial University" 
  className="w-1/2 max-w-md h-auto mx-auto animate-logo-pulse"
/>
```

## Technical Details

| Property | Before | After |
|----------|--------|-------|
| Width | `w-auto` (based on height) | `w-1/2` (50% of container) |
| Height | `h-48 md:h-64` (fixed) | `h-auto` (maintains aspect ratio) |
| Top margin | `mt-12` (48px fixed) | `mt-[5vh]` (5% of viewport height) |
| Max width | None | `max-w-md` (prevents oversizing on large screens) |

## Visual Impact

- Logo will scale responsively to 50% of its container width
- Logo will be positioned 5% of the viewport height from its original position
- Aspect ratio is preserved with `h-auto`
- Added `max-w-md` cap prevents the logo from becoming too large on wide screens


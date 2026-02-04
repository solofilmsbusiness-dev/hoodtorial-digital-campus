
# Lower Logo Position and Increase Size

## Overview

Make the logo even larger and add more top margin to lower its position on the screen, creating a more impactful hero presence.

## Current vs New

| Property | Current | New |
|----------|---------|-----|
| Height (mobile) | `h-56` (224px) | `h-72` (288px) |
| Height (desktop) | `h-72` (288px) | `h-96` (384px) |
| Top spacing | None (`mb-6` only) | `mt-8` added |

This makes the logo approximately **33% larger** and positions it lower on the screen.

## Changes Required

### src/pages/Auth.tsx

**Line 212** - Add top margin to lower the logo:
```tsx
// Current
className="text-center mb-6"

// New
className="text-center mt-8 mb-6"
```

**Line 217** - Increase logo size:
```tsx
// Current
className="h-56 md:h-72 w-auto mx-auto animate-logo-pulse"

// New
className="h-72 md:h-96 w-auto mx-auto animate-logo-pulse"
```

## Visual Layout

```text
┌─────────────────────────────────────┐
│                                     │
│           ↓ Extra spacing (mt-8)    │
│                                     │
│    ┌─────────────────────────┐      │
│    │                         │      │
│    │      MASSIVE LOGO       │      │  ← 288-384px tall
│    │        (bigger)         │      │
│    │                         │      │
│    └─────────────────────────┘      │
│                                     │
│          HOODTORIAL                 │
│          UNIVERSITY                 │
│                                     │
│      ┌─────────────────────┐        │
│      │   Login Form Card   │        │
│      └─────────────────────┘        │
└─────────────────────────────────────┘
```

## Expected Outcome

1. Logo is significantly larger (384px on desktop)
2. Logo positioned lower on the screen with added top margin
3. Creates a powerful, commanding first impression
4. Maintains responsive sizing and pulsing animation

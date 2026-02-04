

# Increase Login Page Logo Size

## Overview

Make the logo on the login screen significantly larger and more prominent to create a stronger visual impact when the page loads.

## Current vs New Size

| Property | Current | New |
|----------|---------|-----|
| Height | `h-24` (96px) | `h-40 md:h-48` (160px / 192px on desktop) |
| Width | `w-auto` | `w-auto` (maintains aspect ratio) |

The logo will be approximately **2x larger** on mobile and **2.5x larger** on desktop, making it a commanding presence as the first element that fades in.

## Changes Required

### src/pages/Auth.tsx (Line 217)

Update the logo image className:

```tsx
// Current
className="h-24 w-auto mx-auto animate-logo-pulse"

// New
className="h-40 md:h-48 w-auto mx-auto animate-logo-pulse"
```

## Visual Impact

The larger logo creates a more cinematic reveal sequence:

```text
┌─────────────────────────────────────┐
│                                     │
│         [  LARGE LOGO  ]            │  ← 160-192px tall
│                                     │
│           HOODTORIAL                │
│           UNIVERSITY                │
│                                     │
│      ┌─────────────────────┐        │
│      │   Login Form Card   │        │
│      └─────────────────────┘        │
│                                     │
└─────────────────────────────────────┘
```

## Expected Outcome

1. Logo is immediately eye-catching when it fades in
2. Creates stronger brand presence
3. Responsive sizing (slightly smaller on mobile, larger on desktop)
4. Maintains the pulsing glow animation


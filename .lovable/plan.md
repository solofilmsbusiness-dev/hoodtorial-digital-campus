

# Remove Camera/Film Icon Flash on Login Screen Startup

## Problem Identified

A camera/film-related image briefly appears on the login screen during startup. Based on code analysis, this is likely the **Film icon** from lucide-react that may be rendering briefly before animations complete, or the first frame of the video element.

## Root Cause Analysis

The Auth.tsx page imports and uses the `Film` icon from lucide-react:
- **Import (line 9)**: `import { Eye, EyeOff, Mail, Lock, User, Film, Volume2, VolumeX } from "lucide-react";`
- **Usage (lines 432-435)**: Used only in the submit button loading state:
  ```tsx
  {loading ? (
    <span className="flex items-center justify-center gap-2">
      <Film className="w-4 h-4 animate-spin" />
      Rolling...
    </span>
  ) : (
    isSignUp ? "Create Account" : "Sign In"
  )}
  ```

The Film icon resembles a movie camera/clapperboard which could be what you're seeing flash briefly.

## Solution

Replace the `Film` icon with a more neutral loading indicator that won't look like a camera. Use a simple spinner or the Loader2 icon instead.

## Changes Required

### src/pages/Auth.tsx

**Line 9** - Update import to use Loader2 instead of Film:
```tsx
// Before
import { Eye, EyeOff, Mail, Lock, User, Film, Volume2, VolumeX } from "lucide-react";

// After
import { Eye, EyeOff, Mail, Lock, User, Loader2, Volume2, VolumeX } from "lucide-react";
```

**Lines 432-435** - Replace Film icon with Loader2:
```tsx
// Before
<Film className="w-4 h-4 animate-spin" />
Rolling...

// After
<Loader2 className="w-4 h-4 animate-spin" />
Signing in...
```

## Visual Impact

| State | Before | After |
|-------|--------|-------|
| Loading icon | Film clapperboard (camera-like) | Rotating spinner |
| Loading text | "Rolling..." | "Signing in..." |

## Expected Outcome

1. No camera/film icon will appear on the login screen
2. Loading state uses a neutral spinning loader instead
3. Text is clearer ("Signing in..." vs "Rolling...")


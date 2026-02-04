

# Remove Countdown and Add Slower Fade-In for Login Page

## Overview

Remove the film countdown animation and make the login section fade in more slowly to allow users to enjoy the intro video longer before the UI appears.

## Current Behavior

| Element | Current Delay | Duration |
|---------|--------------|----------|
| Countdown | Shows immediately | ~4.6 seconds total |
| Logo | 3.5s delay | 0.5s fade |
| University name | 3.7s delay | 0.5s fade |
| Form card | 3.9s delay | 0.5s fade |

## New Behavior

| Element | New Delay | New Duration |
|---------|----------|--------------|
| Countdown | **REMOVED** | - |
| Logo | 2.5s delay | 1.5s fade |
| University name | 3.0s delay | 1.5s fade |
| Form card | 3.5s delay | 1.5s fade |

This gives ~3.5 seconds of pure video viewing before the form starts slowly fading in, with a longer 1.5s fade duration for a more cinematic reveal.

## Changes Required

### 1. Remove FilmCountdown from Auth.tsx

- Remove the `<FilmCountdown />` component from the page
- Remove the import statement

### 2. Update Animation Timings

Adjust the Framer Motion transitions on each element:
- Increase fade-in duration from 0.5s to 1.5s
- Adjust delays to start at 2.5s and stagger 0.5s apart
- Add easing for smoother cinematic feel

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Auth.tsx` | Remove FilmCountdown, update animation delays and durations |

## Visual Timeline

```text
0s                    2.5s        3.0s        3.5s        5s
|------ Video Only ----|--- Logo ---|-- Title --|-- Form --|
                       └── 1.5s fade in each ──┘
```

## Expected Outcome

1. No countdown animation when page loads
2. Video plays unobstructed for ~2.5 seconds
3. Logo, title, and form fade in slowly over 1.5 seconds each
4. More cinematic, elegant reveal of the login interface


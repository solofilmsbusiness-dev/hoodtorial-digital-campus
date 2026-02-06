
# Fix: "Start Course" Links in Learning Journey

## Problem

The course action buttons (Start Course, Continue, Review) in the Learning Journey view link to `/courses/{code}`, but the actual route defined in the app is `/course/{code}` (without the "s"). This causes a 404 "Page not found" error when clicking any course button.

## Root Cause

A typo in `src/components/journey/JourneyCourseCard.tsx` -- all three `Link` components use `/courses/` instead of `/course/`.

## Fix

Update three lines in `src/components/journey/JourneyCourseCard.tsx`:

| Line | Current | Fixed |
|------|---------|-------|
| 135 | `/courses/${code}` | `/course/${code}` |
| 143 | `/courses/${code}` | `/course/${code}` |
| 151 | `/courses/${code}` | `/course/${code}` |

That's it -- a one-file, three-line fix.



# Interactive Walkthrough System for Hoodtorial University

## Overview

Build a guided walkthrough system that helps new students understand how to navigate the platform, choose a degree path, enroll in courses, and complete coursework. The system combines two approaches: an **interactive step-by-step tour** with spotlight highlights, and a **welcome tour modal** for first-time visitors.

---

## How It Works

When a student arrives at the Student Center for the first time (after completing the assessment and choosing a degree path), they will see a **Welcome Tour** -- a multi-step modal that walks them through the key areas of the platform. Each step highlights a specific part of the page with a spotlight effect and provides clear, friendly explanations.

Students can also re-trigger the tour at any time from a "Take Tour" button in the Quick Links section.

---

## Tour Steps

The walkthrough will cover 6 key steps:

1. **Active Courses** -- "These are your enrolled courses. You start with up to 3 courses auto-enrolled from your degree path."
2. **Course Slots** -- "You have a limited number of course slots. Complete or drop a course to free up space for new ones."
3. **Course Progress** -- "Each course has lessons and quizzes. Complete them all to earn credits toward your degree."
4. **Browse Courses** -- "Visit Academics to explore all 16 courses. Click any course to see details and enroll."
5. **Degree Progress** -- "Track how close you are to graduating. Credits, courses, and quizzes all count."
6. **Quick Links** -- "Use these shortcuts to access your grades, profile, community, and more."

---

## Technical Changes

### New Files

**1. `src/components/walkthrough/WalkthroughOverlay.tsx`**
- Full-screen overlay component with a spotlight cutout effect
- Renders a tooltip/card next to the highlighted element
- Supports Next/Back/Skip/Finish navigation
- Uses `framer-motion` for smooth transitions between steps
- Positions tooltip dynamically based on the target element's bounding rect

**2. `src/components/walkthrough/WalkthroughStep.tsx`**
- Individual step card component with step number, title, description, and navigation buttons
- Shows progress dots (e.g., step 3 of 6)

**3. `src/components/walkthrough/index.ts`**
- Barrel export file

**4. `src/hooks/useWalkthrough.ts`**
- Manages walkthrough state (current step, active/inactive, completed)
- Persists completion status in `localStorage` (key: `walkthrough_completed`)
- Provides `startTour()`, `nextStep()`, `prevStep()`, `skipTour()` methods
- Auto-triggers on first visit when `localStorage` flag is not set

### Modified Files

**5. `src/pages/StudentCenter.tsx`**
- Add `data-tour="step-name"` attributes to key sections (Active Courses card, slots indicator, Quick Links card, Degree Progress card)
- Import and render the `WalkthroughOverlay` component
- Add a "Take a Tour" button in Quick Links section
- Connect the walkthrough hook

---

## Architecture

The walkthrough system is entirely client-side with no database changes:
- Tour step definitions are stored as a static config array
- Completion state persists in `localStorage` so it only shows once automatically
- The overlay uses CSS `clip-path` or `box-shadow` with a large spread to create the spotlight effect around the target element
- `getBoundingClientRect()` is used to position the tooltip relative to the highlighted element
- The system is reusable -- new tours for other pages (Academics, Course Detail) can be added later using the same components

---

## Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/components/walkthrough/WalkthroughOverlay.tsx` | Create | Main overlay with spotlight + tooltip |
| `src/components/walkthrough/WalkthroughStep.tsx` | Create | Step card UI component |
| `src/components/walkthrough/index.ts` | Create | Barrel exports |
| `src/hooks/useWalkthrough.ts` | Create | State management + localStorage persistence |
| `src/pages/StudentCenter.tsx` | Modify | Add `data-tour` attributes, render overlay, add "Take Tour" button |

No database migrations or backend changes required. This is a pure frontend feature using existing UI patterns and animation utilities.


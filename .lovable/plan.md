

# Auto-Enroll Courses When a User Picks a Degree Path

## Overview

When a user selects a degree path (on the Degrees page), the first 3 courses in that path will be automatically enrolled as active courses. When those are completed, the next batch of courses auto-enrolls. This keeps the Student Center populated and the experience seamless.

## How It Works

```text
User picks package (Checkout)
        |
        v
User selects degree path (Degrees page)
        |
        v
System auto-enrolls first 3 courses from path
        |
        v
Courses appear in Student Center as "Active"
        |
        v
User completes a course
        |
        v
System checks for open slots, auto-enrolls next course in path
```

## Changes

### 1. Auto-Enroll on Degree Path Selection

**File: `src/hooks/useDegreeSelection.ts`**

After successfully saving the degree path to the profile, automatically enroll the user in the first 3 courses from that path's course list. This uses the existing `pathConfigs` course code lists (from `useJourneyData.ts`) and inserts enrollment records directly.

- Import the path-to-course-code mapping
- After the profile update succeeds, query existing enrollments to avoid duplicates
- Insert up to 3 new "active" enrollments for the first courses in the path that aren't already enrolled
- Show a toast like "Auto-enrolled in 3 courses!"

### 2. Auto-Enroll Next Courses on Course Completion

**File: `src/hooks/useEnrollments.ts`**

In the `completeCourse` function, after marking a course as completed:

- Read the user's degree path and certificate department from their profile
- Determine which courses are in the path's curriculum
- Count current active enrollments
- Find the next un-enrolled course in the path sequence
- If there's an open slot (under the 3-course limit), auto-enroll the next course
- Show a toast: "Next course auto-enrolled: [Course Title]"

### 3. Shared Path Config

**File: `src/lib/degreePathCourses.ts`** (new file)

Extract the path-to-course-codes mapping into a shared utility so both `useDegreeSelection` and `useEnrollments` can reference the same ordered course lists without circular imports:

```typescript
export const DEGREE_PATH_COURSES = {
  associate: ["HU-101", "HU-102", "HU-103", "HU-104", "HU-105", "HU-106"],
  bachelor: [
    "HU-101", "HU-102", "HU-103", "HU-104", "HU-105", "HU-106",
    "HU-201", "HU-202", "HU-203", "HU-204",
    "HU-301", "HU-302", "HU-303", "HU-304",
  ],
  certificate: ["HU-101", "HU-102", "HU-201"],
};
```

For certificate paths with a department, also use the `DEPARTMENT_CONFIG` courses from `useDegreeProgress.ts`.

### 4. Update useJourneyData to Use Shared Config

**File: `src/hooks/useJourneyData.ts`**

Replace the inline `pathConfigs` course code arrays with imports from the new shared file to keep everything in sync.

## Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| User already enrolled in some courses | Skip those, only enroll new ones |
| User changes degree path | Auto-enroll first 3 of the new path (respecting slot limits) |
| Certificate path | Uses department-specific course list |
| Trial user (2-slot limit) | Only auto-enrolls up to 2 courses |
| All courses in path already enrolled | No action taken |
| Course completed but slots full | Waits until a slot opens (won't exceed limit) |

## Files Summary

| File | Action |
|------|--------|
| `src/lib/degreePathCourses.ts` | New -- shared course code mapping |
| `src/hooks/useDegreeSelection.ts` | Add auto-enrollment after path selection |
| `src/hooks/useEnrollments.ts` | Add auto-enroll-next on course completion |
| `src/hooks/useJourneyData.ts` | Import shared config instead of inline |


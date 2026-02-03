

# Sync Course Status to Academics Page

## Problem
When an admin changes a course to "Coming Soon" in the admin panel, the change is stored in the database, but the **Academics page still displays courses from static data** (`src/data/courses.ts`). This means:
- The static data has no `is_locked` or `is_published` properties
- Students don't see which courses are coming soon vs. available
- Database changes have no effect on the public-facing course catalog

---

## Current Architecture

### Academics Page (`src/pages/Academics.tsx`)
```typescript
import { courses, departments } from "@/data/courses";  // Static data only!
```

The page imports directly from static files and never queries the database.

### Course Components
- `CourseCard` and `CourseListItem` don't have props for `isLocked` or `isComingSoon`
- They always render as fully available courses
- No visual distinction for "Coming Soon" courses

---

## Solution Overview

1. **Create a hook** to fetch course status from the database and merge with static data
2. **Update Academics page** to use database status instead of static-only data
3. **Update CourseCard and CourseListItem** to show "Coming Soon" state
4. **Handle locked course behavior** - prevent navigation or show lock overlay

---

## Implementation Details

### Phase 1: Create useCourseStatus Hook

**New File: `src/hooks/useCourseStatus.ts`**

This hook will:
- Fetch all course statuses from the `courses` table (is_published, is_locked)
- Merge database status with static course data
- Filter out unpublished courses for students
- Mark locked courses as "Coming Soon"

```typescript
export interface CourseWithStatus {
  code: string;
  title: string;
  // ... all existing fields
  isPublished: boolean;
  isComingSoon: boolean;  // is_locked from DB
}
```

### Phase 2: Update Course Cards

**Modify `src/components/cards/CourseCard.tsx`:**
- Add `isComingSoon?: boolean` prop
- When true:
  - Add "Coming Soon" badge overlay
  - Apply muted/grayscale styling
  - Change link behavior (prevent navigation or show toast)
  - Replace arrow icon with lock icon

**Modify `src/components/cards/CourseListItem.tsx`:**
- Same changes as CourseCard for list view

Visual treatment for Coming Soon:
```text
+------------------------------------------+
|  HU-301  [Coming Soon]     [Advanced]    |
|                                          |
|  Cinematic Lens Language                 |
|  CINEMATOGRAPHY                          |
|                                          |
|  (dimmed description text)               |
|                                          |
|  ⏳ Lessons  📅 Duration                  |
|------------------------------------------|
|  Credits           5  🔒                 |
+------------------------------------------+
```

### Phase 3: Update Academics Page

**Modify `src/pages/Academics.tsx`:**

1. Import the new `useCourseStatus` hook
2. Replace static `courses` import with hook data
3. Filter out `is_published: false` courses (hidden from public)
4. Pass `isComingSoon` prop to CourseCard/CourseListItem
5. Keep departments from static data (no status needed)

```typescript
// Before
const filteredCourses = courses.filter(course => { ... });

// After
const { courses: coursesWithStatus, isLoading } = useCourseStatus();
const filteredCourses = coursesWithStatus.filter(course => {
  // Only show published courses
  if (!course.isPublished) return false;
  // ... existing filters
});
```

### Phase 4: Handle Course Navigation

**Option A - Block Access (Recommended):**
When clicking a "Coming Soon" course:
- Prevent navigation to `/course/[code]`
- Show toast: "This course is coming soon! Stay tuned."

**Option B - Allow Preview:**
- Allow navigation but show locked content on CourseDetail page
- Would require updating CourseDetail page as well

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useCourseStatus.ts` | Create | Hook to fetch and merge course status |
| `src/components/cards/CourseCard.tsx` | Modify | Add Coming Soon visual state |
| `src/components/cards/CourseListItem.tsx` | Modify | Add Coming Soon visual state |
| `src/pages/Academics.tsx` | Modify | Use database status, filter hidden courses |

---

## Fallback Behavior

If database has no courses yet (not initialized):
- Fall back to static data with all courses as published/unlocked
- This ensures the page works before admin clicks "Initialize Courses"

---

## Data Flow

```text
Admin Panel                    Database                     Academics Page
+--------------+              +----------+                  +---------------+
| Toggle       |  ─────────>  | courses  |  <─────────────  | useCourseStatus|
| Coming Soon  |              | is_locked|                  | hook           |
+--------------+              +----------+                  +---------------+
                                                                   │
                                                                   ▼
                                                            +---------------+
                                                            | CourseCard    |
                                                            | isComingSoon  |
                                                            +---------------+
```

---

## Summary

This implementation ensures:
1. Admin status changes sync in real-time to the public catalog
2. Hidden courses are completely invisible to students
3. Coming Soon courses are visible but clearly marked and inaccessible
4. Graceful fallback when database isn't initialized
5. Consistent styling across grid and list views


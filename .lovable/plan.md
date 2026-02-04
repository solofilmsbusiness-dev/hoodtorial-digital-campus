
# Enrollment Access Controls & Course Swap System

## Overview

This plan implements strict enrollment-based course access and adds a course swap/drop system with limits. Students will only be able to access full course content for courses they are enrolled in, while non-enrolled courses show only the summary and intro video. A swap system allows students to change courses within defined limits.

---

## Current State Analysis

| Aspect | Current Behavior |
|--------|------------------|
| Course Access | Any user with subscription can view any course detail page with full content |
| Enrollment | Enrollments limit how many courses a user can "activate" but don't gate content |
| Course Detail | Shows full lessons/quizzes to anyone who navigates to the page |
| Dropping Courses | Not currently implemented |
| Swapping Courses | Not currently implemented |

---

## Proposed Changes

### Part 1: Strict Enrollment-Based Course Access

**Goal**: Non-enrolled users can only see course summary + intro video. Full content requires enrollment.

#### 1.1 Database Changes

Add columns to track swap/drop limits:

```sql
ALTER TABLE public.enrollments
ADD COLUMN swaps_used integer NOT NULL DEFAULT 0,
ADD COLUMN dropped_at timestamp with time zone;
```

#### 1.2 Course Detail Page Changes (`CourseDetail.tsx`)

Current flow allows viewing all content. New flow:

| User State | What They See |
|------------|---------------|
| Not enrolled | Course header, description, stats, intro video, enrollment card, "Content Locked" message |
| Enrolled (active) | Full course content (lessons, quizzes, progress) |
| Enrolled (completed) | Full course content with completion badge |

The existing code structure already has this pattern (lines 547-740), but we need to ensure the intro video is always shown regardless of enrollment status.

#### 1.3 Academics Page Course Cards

Update `CourseCard.tsx` to show enrollment status indicator:
- Badge showing "Enrolled" if user has active enrollment
- Visual distinction between enrolled vs. available courses

---

### Part 2: Drop/Swap System

#### 2.1 Swap Rules

| Rule | Value |
|------|-------|
| Max swaps per enrollment | 2 |
| Grace period for free drop | 24 hours after enrollment |
| Swap during grace period | Does not count toward limit |

#### 2.2 New Hook: `useEnrollments` Extensions

Add new methods to the existing hook:

```typescript
// Drop a course (removes enrollment entirely)
const dropCourse = async (courseCode: string) => {
  // Check if within 24h grace period
  // Update status to "dropped" and set dropped_at
};

// Swap a course for another
const swapCourse = async (fromCode: string, toCode: string) => {
  // Validate swap limits
  // Drop old course, enroll in new one
  // Increment swaps_used if outside grace period
};

// Get remaining swaps for an enrollment
const getRemainingSwaps = (courseCode: string) => number;

// Check if enrollment is in grace period
const isInGracePeriod = (courseCode: string) => boolean;
```

#### 2.3 Student Center UI Components

Add new "Manage Enrollments" section in StudentCenter with:

1. **Course Cards with Actions**:
   - "Drop Course" button
   - "Swap Course" button
   - Shows remaining swaps (e.g., "2 swaps remaining")
   - Grace period indicator (e.g., "Free drop available for 12 more hours")

2. **Drop Confirmation Dialog**:
   - Warning about progress being kept (not deleted)
   - Shows if this uses a swap or is free (grace period)
   - Confirm/Cancel buttons

3. **Swap Course Dialog**:
   - Dropdown to select new course
   - Only shows courses not already enrolled
   - Shows swap count status
   - Preview of new course info

---

## Implementation Files

| File | Changes |
|------|---------|
| `supabase/migrations/` | Add `swaps_used` and `dropped_at` columns to enrollments |
| `src/hooks/useEnrollments.ts` | Add `dropCourse`, `swapCourse`, `getRemainingSwaps`, `isInGracePeriod` |
| `src/pages/CourseDetail.tsx` | Ensure intro video shows for all users; enforce enrollment gating |
| `src/pages/StudentCenter.tsx` | Add enrollment management section with drop/swap UI |
| `src/components/enrollment/DropCourseDialog.tsx` | New confirmation dialog component |
| `src/components/enrollment/SwapCourseDialog.tsx` | New swap selection dialog component |
| `src/components/enrollment/EnrollmentManagementCard.tsx` | New card component for each active enrollment |
| `src/components/cards/CourseCard.tsx` | Add enrollment status badge |

---

## User Experience Flows

### Viewing a Non-Enrolled Course

```text
User clicks course in Academics
        |
        v
CourseDetail page loads
        |
        v
┌─────────────────────────────────────────────────┐
│ [Course Header with stats]                      │
├─────────────────────────────────────────────────┤
│ [Intro Video - Always visible]                  │
├─────────────────────────────────────────────────┤
│ [Enrollment Card]                               │
│ • Slot indicator: 1/3 used                      │
│ • [Enroll in Course] button                     │
├─────────────────────────────────────────────────┤
│ 🔒 Course Content Locked                        │
│ "Enroll to access all lessons and quizzes"      │
│ • 4 Modules                                     │
│ • 12 Lessons                                    │
│ • 5 Quizzes                                     │
└─────────────────────────────────────────────────┘
```

### Dropping a Course (Grace Period)

```text
Student Center → Active Courses → Click "..."
        |
        v
Select "Drop Course"
        |
        v
┌──────────────────────────────────────┐
│  Drop Course                         │
│  ────────────                        │
│  You're within the 24-hour grace     │
│  period. This drop is FREE and won't │
│  count against your swap limit.      │
│                                      │
│  ⚠️ Your progress will be saved.     │
│                                      │
│  [Cancel]  [Drop Course]             │
└──────────────────────────────────────┘
```

### Swapping a Course (After Grace Period)

```text
Student Center → Active Courses → Click "..."
        |
        v
Select "Swap Course"
        |
        v
┌──────────────────────────────────────┐
│  Swap Course                         │
│  ────────────                        │
│  Replace HU-101 with another course  │
│                                      │
│  Swaps remaining: 2 of 2             │
│                                      │
│  Select new course:                  │
│  ┌────────────────────────────────┐  │
│  │ HU-205 - Advanced Lighting  ▼  │  │
│  └────────────────────────────────┘  │
│                                      │
│  ⚠️ This will use 1 swap.            │
│  ⚠️ Progress on HU-101 will be kept. │
│                                      │
│  [Cancel]  [Confirm Swap]            │
└──────────────────────────────────────┘
```

---

## Database Schema Update

```sql
-- Add swap tracking to enrollments
ALTER TABLE public.enrollments
ADD COLUMN swaps_used integer NOT NULL DEFAULT 0,
ADD COLUMN dropped_at timestamp with time zone;

-- Index for efficient queries
CREATE INDEX idx_enrollments_dropped ON public.enrollments(dropped_at) 
WHERE dropped_at IS NOT NULL;
```

---

## Visual Indicators in Student Center

```text
┌─────────────────────────────────────────────────┐
│ 📚 Active Courses (2/3 slots)                   │
├─────────────────────────────────────────────────┤
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ HU-101 • Fundamentals of Cinematography     │ │
│ │ ─────────────────────────────────────────── │ │
│ │ 📊 Progress: 45%    Enrolled: 2 hours ago   │ │
│ │ 🔄 Swaps: 2 remaining                       │ │
│ │ ⏰ Free drop: 22 hours left                 │ │
│ │                                             │ │
│ │ [Continue] [···]                            │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ HU-205 • Advanced Lighting                  │ │
│ │ ─────────────────────────────────────────── │ │
│ │ 📊 Progress: 10%    Enrolled: 5 days ago    │ │
│ │ 🔄 Swaps: 1 remaining (1 used)              │ │
│ │                                             │ │
│ │ [Continue] [···]                            │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐ │
│ │ + Add Course (1 slot available)            │ │
│ └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Technical Implementation Notes

1. **Course Detail Access Control**
   - The current code already has an `enrolled` check that determines UI
   - Ensure `isEnrolled` check is applied consistently
   - Intro video section should render BEFORE the `enrolled` conditional

2. **Swap Limit Enforcement**
   - Check `swaps_used < 2` before allowing swap
   - Grace period check: `Date.now() - enrolled_at < 24 hours`
   - During grace period, swaps don't increment `swaps_used`

3. **Status Transitions**
   - Active -> Dropped (via drop)
   - Active -> Active (via swap: drop old + enroll new)
   - Active -> Completed (unchanged, via course completion)

4. **Progress Preservation**
   - Dropping a course does NOT delete `user_progress` or `quiz_results`
   - If user re-enrolls later, their progress is still there

---

## Security Considerations

1. **RLS Policy Updates**
   - Ensure users can only drop/swap their own enrollments
   - Validate swap limits server-side via database function if needed

2. **Rate Limiting**
   - Swap operations should be rate-limited to prevent abuse
   - Consider adding a cooldown between swaps

---

## Summary

This implementation ensures:
- Students only access content for courses they're enrolled in
- Non-enrolled users see course info + intro video to help them decide
- Students can drop courses freely within 24 hours
- Each enrollment allows 2 lifetime swaps
- All progress is preserved even after dropping
- Clear UI indicators show swap limits and grace periods

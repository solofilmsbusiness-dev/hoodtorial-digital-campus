
# Quiz Results with Course Names & Enrollment-Gated Course Access

## Overview

This plan implements two improvements:

1. **Student Center Quiz Results** - Display course title alongside course code in the Recent Quiz Results section
2. **Course Detail Access Control** - Restrict course content visibility so non-enrolled users only see the course overview description and intro video, not the full module list

---

## Part 1: Quiz Results with Course Name

### Current State

In `StudentCenter.tsx`, the Recent Quiz Results section shows:
```
HU-101
Jan 15, 2025                           8/10  PASSED
```

### Proposed State

Show the course title for context:
```
HU-101 • The Art of Storytelling
Jan 15, 2025                           8/10  PASSED
```

### Implementation

#### File: `src/pages/StudentCenter.tsx`

1. Import the `courses` data array which contains all course info
2. Create a helper function to look up course title by code:
   ```typescript
   const getCourseTitle = (courseCode: string) => {
     const course = courses.find((c) => c.code === courseCode);
     return course?.title || courseCode;
   };
   ```

3. Update the quiz results display (around line 252) to show both code and title:
   ```tsx
   <p className="font-bold text-foreground">
     {result.course_code} • {getCourseTitle(result.course_code)}
   </p>
   ```

---

## Part 2: Enrollment-Gated Course Access

### Current State

On the Course Detail page, non-enrolled users can see:
- Full course header with title, description, credits, stats
- Intro video (if available)
- **All module names and lesson titles in the sidebar**
- Enrollment card prompt

The module list reveals the entire course structure before enrollment.

### Proposed State

Non-enrolled users should only see:
- Course header (title, description, level, credits, stats) - **visible**
- Intro video (if available) - **visible**
- Enrollment card with CTA - **visible**
- Module/lesson list - **hidden until enrolled**

### Implementation

#### File: `src/pages/CourseDetail.tsx`

Update the Course Content section (starting around line 544) to conditionally render the modules sidebar based on enrollment status.

**Before (current):**
```tsx
<Section className="py-8">
  <SubscriptionGate>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Video Player Area - lg:col-span-2 */}
      {/* ... enrollment card, lesson content ... */}
      
      {/* Course Modules Sidebar */}
      <div className="space-y-4">
        <h3>Course Content</h3>
        {course.modules.map(...)}  // Always visible
      </div>
    </div>
  </SubscriptionGate>
</Section>
```

**After (new):**
```tsx
<Section className="py-8">
  <SubscriptionGate>
    {enrolled ? (
      {/* Full enrolled view with video player and modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video player content */}
        {/* Course modules sidebar */}
      </div>
    ) : (
      {/* Non-enrolled teaser view */}
      <div className="max-w-2xl mx-auto text-center">
        <EnrollmentCard ... />
        <div className="mt-8 p-8 border-2 border-dashed border-border">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="heading-4 mb-2">Course Content Locked</h3>
          <p className="text-muted-foreground mb-4">
            Enroll in this course to access {course.modules.length} modules 
            and {totalLessons} lessons.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {/* Show module count badges without revealing titles */}
            <Badge>📚 {course.modules.length} Modules</Badge>
            <Badge>🎬 {totalLessons} Lessons</Badge>
            <Badge>✅ {totalQuizzes} Quizzes</Badge>
          </div>
        </div>
      </div>
    )}
  </SubscriptionGate>
</Section>
```

This approach:
- Keeps the header and intro video always visible (for marketing/preview purposes)
- Shows the enrollment card prominently
- Hides the actual module/lesson list from non-enrolled users
- Shows aggregate stats (X modules, Y lessons) without revealing content details
- Creates urgency to enroll

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/StudentCenter.tsx` | Add course title lookup and display in quiz results |
| `src/pages/CourseDetail.tsx` | Restructure content section to gate modules behind enrollment |

---

## Visual Summary

### Quiz Results (Before vs After)

| Before | After |
|--------|-------|
| `HU-101` | `HU-101 • The Art of Storytelling` |
| `HU-203` | `HU-203 • Advanced Lighting Techniques` |

### Course Detail (Non-Enrolled View)

```text
┌────────────────────────────────────────────┐
│  ← Back to Courses                         │
│                                            │
│  [HU-101]  [Beginner]                      │
│                                            │
│  THE ART OF STORYTELLING                   │
│  Learn narrative structure and visual...    │
│                                            │
│  [12 Lessons] [5 Quizzes] [3 hrs] [4 Cr]   │
├────────────────────────────────────────────┤
│  Course Introduction                        │
│  [▶ Intro Video Player]                    │
├────────────────────────────────────────────┤
│       ┌───────────────────────┐            │
│       │  ENROLL TO UNLOCK     │            │
│       │  3 slots available    │            │
│       │  [Enroll Now Button]  │            │
│       └───────────────────────┘            │
│                                            │
│       ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐            │
│       │  🔒 Course Content    │            │
│       │     Locked            │            │
│       │                       │            │
│       │  📚 4 Modules         │            │
│       │  🎬 12 Lessons        │            │
│       │  ✅ 5 Quizzes         │            │
│       └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘            │
└────────────────────────────────────────────┘
```

---

## Technical Notes

- The `courses` import from `src/data/courses.ts` provides static course data for lookup
- For database-only courses not in static data, the code will gracefully fall back to showing just the course code
- Test mode users continue to see full content as they're treated as enrolled
- The intro video remains visible to all users as it serves a marketing/preview purpose

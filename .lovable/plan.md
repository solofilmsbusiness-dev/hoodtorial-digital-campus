
# Add Completed Courses Achievements Section

## Overview

Display completed courses (100% progress) as celebratory badges/awards in a dedicated section of the Student Center. This creates a sense of accomplishment and showcases the student's earned credentials.

---

## Design

### New "Achievements" Section

Add a new section between "Active Courses" and "Quick Stats" that displays completed courses as award badges:

```text
┌─────────────────────────────────────────────────────────────────────┐
│  🏆 Achievements                                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   🎬         │  │   🎥         │  │   🎞️         │              │
│  │              │  │              │  │              │              │
│  │   CIN-101    │  │   DIR-201    │  │   PRO-301    │              │
│  │   Intro to   │  │   Scene      │  │   Advanced   │              │
│  │   Cinema     │  │   Direction  │  │   Production │              │
│  │              │  │              │  │              │              │
│  │ ✓ CERTIFIED  │  │ ✓ CERTIFIED  │  │ ✓ CERTIFIED  │              │
│  │ Jan 15, 2025 │  │ Jan 20, 2025 │  │ Feb 1, 2025  │              │
│  │   3 credits  │  │   4 credits  │  │   5 credits  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
│  "You've earned 12 credits from 3 completed courses!"               │
└─────────────────────────────────────────────────────────────────────┘
```

### Badge Design

Each completed course badge will feature:
- Urban "CERTIFIED" stamp (using the existing `StampBadge` component)
- Course code prominently displayed
- Course title
- Completion date (`completed_at` from enrollment)
- Credits earned
- Green/gold accent styling for celebration
- Trophy or award icon

---

## Implementation

### File: `src/pages/StudentCenter.tsx`

**Changes:**

1. **Import StampBadge component** for the certification stamp styling

2. **Create completedCourseDetails array** (similar to activeCourseDetails):
   ```typescript
   const completedCourseDetails = completedEnrollments
     .map((e) => {
       const course = getCourse(e.course_code);
       return course ? { ...course, enrollment: e } : null;
     })
     .filter(Boolean);
   ```

3. **Add new "Achievements" Card section** after "Active Courses":
   - Trophy icon header with "Your Achievements" title
   - Grid of completed course badges
   - Each badge shows:
     - Course code in a tag
     - Course title
     - "CERTIFIED" stamp badge (rotated, urban style)
     - Completion date formatted nicely
     - Credits earned
   - Summary text showing total credits earned from completed courses
   - Empty state: "Complete your first course to earn an achievement badge!"

4. **Style the badges** with:
   - Gold/green gradient border or accent
   - Celebratory shimmer animation (similar to EnrollmentManagementCard)
   - Urban brutalist styling consistent with the app

---

## Component Structure

```tsx
{/* Achievements Section - Completed Courses */}
{completedEnrollments.length > 0 && (
  <Card className="card-urban mb-8">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        Your Achievements
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {completedCourseDetails.map((courseData) => (
          <div 
            key={courseData!.code}
            className="relative p-4 border-2 border-primary/50 bg-primary/5 rounded-lg text-center overflow-hidden"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-[shimmer_3s_ease-in-out_infinite] pointer-events-none" />
            
            {/* Badge content */}
            <Award className="h-8 w-8 text-primary mx-auto mb-2" />
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
              {courseData!.code}
            </span>
            <h4 className="font-bold text-sm mt-2 line-clamp-2">
              {courseData!.title}
            </h4>
            
            {/* Certification stamp */}
            <StampBadge variant="filled" className="mt-3">
              ✓ Certified
            </StampBadge>
            
            {/* Completion date */}
            <p className="text-xs text-muted-foreground mt-2">
              {formatDate((courseData as any).enrollment.completed_at)}
            </p>
            
            {/* Credits */}
            <p className="text-xs font-bold text-primary mt-1">
              {courseData!.credits} credits earned
            </p>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          You've earned <span className="font-bold text-primary">
            {completedCourseDetails.reduce((sum, c) => sum + c!.credits, 0)} credits
          </span> from {completedEnrollments.length} completed {completedEnrollments.length === 1 ? 'course' : 'courses'}!
        </p>
      </div>
    </CardContent>
  </Card>
)}
```

---

## Summary of Changes

| File | Changes |
|------|---------|
| `src/pages/StudentCenter.tsx` | Import `StampBadge`, create `completedCourseDetails` array, add new "Achievements" section with celebratory badge cards |

---

## Technical Notes

- Uses existing `completedEnrollments` from `useEnrollments()` hook (already has `completed_at` timestamp)
- Leverages `getCourse()` helper to get full course data from merged database + static list
- Applies consistent urban brutalist styling with shimmer animations
- Conditionally renders only when there are completed courses
- Shows empty state in Quick Stats to encourage completion


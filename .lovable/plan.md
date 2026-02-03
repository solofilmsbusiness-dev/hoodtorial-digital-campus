

# Admin Student Management Enhancement

## Overview
Transform the Admin Users page into a comprehensive student management hub showing detailed student information including their profile data, enrolled courses, quiz results, assessment results, and subscription status.

---

## Current State
The existing UserManager page shows:
- Display name and user ID
- Roles (admin, moderator, student)
- Enrollment date
- Role management actions (add/remove admin/moderator)

## Proposed Enhancements

### 1. Enhanced Data Hook
**New File: `src/hooks/useAdminStudents.ts`**

Fetch comprehensive student data including:
- Profile info (avatar, bio, location, membership tier, subscription status)
- Course enrollments with course titles
- Quiz results (passed/failed counts, scores)
- Assessment results (experience level, interests, total score)
- Progress statistics (lessons completed, courses in progress)

```text
Data Structure:
StudentDetails {
  id: string
  displayName: string
  avatarUrl: string
  bio: string
  location: string
  membershipTier: string
  subscriptionStatus: string
  trialEndsAt: string
  enrolledAt: string
  roles: AppRole[]
  enrollments: Array<{courseCode, courseTitle, enrolledAt, status}>
  quizStats: {passed, failed, totalAttempts}
  assessmentResult: {experienceLevel, interests, totalScore}
  lessonsCompleted: number
}
```

### 2. Redesigned User List with Expandable Details
**Edit: `src/pages/admin/UserManager.tsx`**

Transform the table into an expandable list with:

**Collapsed Row (Summary View):**
- Avatar with subscription status indicator
- Display name / location
- Membership tier badge
- Role badges
- Enrolled courses count
- Quiz pass rate
- Enrolled date
- Expand/collapse button

**Expanded Row (Detail View):**
- Full profile information section
- Enrolled courses list with status
- Assessment results summary
- Quiz performance breakdown
- Quick actions (view profile, manage roles)

### 3. Student Detail Sheet/Dialog
**New File: `src/components/admin/StudentDetailSheet.tsx`**

A slide-out sheet showing complete student information:

```text
+------------------------------------------+
| [Avatar]  Display Name                   |
|           @location | member since       |
|           [tier badge] [role badges]     |
+------------------------------------------+
| SUBSCRIPTION                             |
| Status: Trial | Ends: Feb 6, 2026        |
+------------------------------------------+
| ASSESSMENT RESULTS                       |
| Experience: Semi-Professional            |
| Score: 78/100                            |
| Interests: Directing, Cinematography     |
+------------------------------------------+
| ENROLLED COURSES (3)                     |
| [x] HU-202: Color Grading - Active       |
| [x] HU-303: Advanced Directing - Active  |
| [x] HU-205: Production Planning - Active |
+------------------------------------------+
| QUIZ PERFORMANCE                         |
| 5 Passed | 2 Failed | 70% Pass Rate      |
+------------------------------------------+
| ACTIONS                                  |
| [Manage Roles] [View Public Profile]     |
+------------------------------------------+
```

### 4. Filtering and Sorting
Add filter options:
- By subscription status (trial, paid, expired)
- By membership tier
- By role (admin, moderator, student)
- By course enrollment
- Search by name or location

Add sorting:
- By enrollment date (newest/oldest)
- By name (A-Z, Z-A)
- By quiz pass rate
- By courses enrolled count

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useAdminStudents.ts` | Create | Comprehensive data hook for student details |
| `src/pages/admin/UserManager.tsx` | Major Edit | Redesign with expandable rows and filters |
| `src/components/admin/StudentDetailSheet.tsx` | Create | Slide-out sheet for full student details |
| `src/components/admin/StudentFilters.tsx` | Create | Filter/sort controls component |
| `src/components/admin/index.ts` | Edit | Export new components |

---

## Implementation Details

### Data Fetching Strategy
Fetch data in batches to avoid performance issues:
1. Initial load: Profiles + roles + enrollment counts
2. On expand/detail view: Full enrollments, quiz results, assessment data

### Query Structure
```typescript
// Main query - lightweight list data
const { data: students } = useQuery({
  queryKey: ["admin-students"],
  queryFn: async () => {
    // Fetch profiles with enrollment counts
    const profiles = await supabase.from("profiles").select("*");
    const roles = await supabase.from("user_roles").select("*");
    const enrollmentCounts = await supabase.rpc("get_enrollment_counts");
    // Combine and return
  }
});

// Detail query - on demand
const { data: studentDetail } = useQuery({
  queryKey: ["admin-student-detail", userId],
  queryFn: async () => {
    // Fetch full enrollments with course info
    // Fetch quiz results
    // Fetch assessment results
    // Fetch user_progress for lesson completion
  },
  enabled: !!selectedUserId
});
```

### UI Component Structure
```text
UserManager
├── Header (title, stats, add filters button)
├── StudentFilters (search, filter dropdowns)
├── StudentTable
│   ├── TableHeader
│   └── TableBody
│       ├── StudentRow (collapsed)
│       │   └── StudentRowExpanded (when expanded)
│       └── ...
└── StudentDetailSheet (when user clicks "View Details")
```

---

## Sample UI Wireframe

```text
+------------------------------------------------------------------+
| USER MANAGEMENT                               4 students          |
+------------------------------------------------------------------+
| [Search...           ] [Status ▾] [Tier ▾] [Role ▾] [Sort ▾]     |
+------------------------------------------------------------------+
| USER                  | COURSES | QUIZZES | TIER     | JOINED    |
|------------------------------------------------------------------|
| [👤] Solo Admin       | 3       | 1/2     | freshman | Jan 31    |
|      Cincinnati       |         | 50%     | [admin]  |     [⋮]   |
|------------------------------------------------------------------|
| [👤] Ja'Van          | 0       | 1/1     | freshman | Feb 1     |
|      Cincinnati, USA  |         | 100%    | [student]|     [⋮]   |
|  └ [Click to expand for details]                                 |
|------------------------------------------------------------------|
| [👤] Jardani         | 0       | 0/0     | freshman | Feb 1     |
|      —               |         | —       | [student]|     [⋮]   |
+------------------------------------------------------------------+
```

---

## Data Queries Required

1. **Profiles** - Already accessible via admin RLS policy
2. **User Roles** - Already accessible via admin RLS policy  
3. **Enrollments** - Need to verify admin can access all (RLS allows admin SELECT)
4. **Quiz Results** - Admin can view all via existing policy
5. **Assessment Results** - Admin can view all via existing policy
6. **User Progress** - Admin can view all via existing policy

All required RLS policies are already in place for admin access.

---

## Summary
This enhancement transforms the basic user list into a full student management system where admins can:
- See at-a-glance student statistics
- Filter and sort students by various criteria
- View detailed student profiles, enrollments, and performance
- Manage roles directly from the interface
- Track subscription and trial status


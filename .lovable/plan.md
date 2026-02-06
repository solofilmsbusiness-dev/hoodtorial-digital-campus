

# Fix: Community Access for New Users & Add View Profile to Admin

## Issues Identified

### Issue 1: Community Blocking New Users

**Location:** `src/pages/Community.tsx` (lines 149-167)

**Current Behavior:**
The Community page requires at least one active enrollment to access. New users who have completed their assessment but haven't enrolled in any courses are redirected to `/academics` with the message:
> "The Student Community is available to enrolled students only."

**Problem:**
This is too restrictive. New users should be able to browse the community, view posts, and engage with the platform even before enrolling in courses. This creates a poor onboarding experience.

### Issue 2: Missing "View Profile" in Admin User Management

**Location:** `src/components/admin/StudentDetailSheet.tsx`

**Current Behavior:**
When viewing a student's details in the admin panel, there's no way to navigate to their public profile page.

**Expected Behavior:**
Admins should be able to click "View Profile" to see the student's public profile at `/profile/:userId`.

---

## Solution

### Part 1: Remove Enrollment Requirement from Community

**File:** `src/pages/Community.tsx`

Remove or modify the enrollment check that blocks access:

```diff
- if (!hasActiveEnrollment) {
-   return (
-     <PageLayout>
-       <div className="min-h-[60vh] flex items-center justify-center">
-         ...
-         <Button asChild className="btn-brutal">
-           <a href="/academics">Browse Courses</a>
-         </Button>
-       </div>
-     </PageLayout>
-   );
- }
```

**Alternative (recommended):** Instead of removing the check entirely, allow viewing but restrict posting:

- Allow all authenticated users to view the community feed
- Show a subtle prompt to enroll if they want to create posts
- Keep the ability to like/comment open (builds engagement)

### Part 2: Add "View Profile" to StudentDetailSheet

**File:** `src/components/admin/StudentDetailSheet.tsx`

Add a "View Profile" button in the profile header section that navigates to the public profile:

```typescript
import { Link } from "react-router-dom";

// In the Profile Header section (around line 325-365):
<div className="flex items-start gap-4">
  <Avatar className="h-16 w-16">
    ...
  </Avatar>
  <div className="flex-1 min-w-0">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-lg truncate">
        {student.displayName || "Unnamed Student"}
      </h3>
      <Button variant="outline" size="sm" asChild>
        <Link to={`/profile/${student.id}`}>
          <ExternalLink className="h-4 w-4 mr-1.5" />
          View Profile
        </Link>
      </Button>
    </div>
    ...
  </div>
</div>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Community.tsx` | Remove enrollment gate or make it show-only for non-enrolled users |
| `src/components/admin/StudentDetailSheet.tsx` | Add "View Profile" button linking to `/profile/:userId` |

---

## Implementation Details

### Community.tsx Changes

1. Remove the early return that blocks non-enrolled users
2. Keep the `hasActiveEnrollment` variable for conditional UI (e.g., disabling post creation)
3. Show a "Join a course to start posting" banner instead of blocking access entirely

### StudentDetailSheet.tsx Changes

1. Import `Link` from `react-router-dom`
2. Add a "View Profile" button next to the student's name in the header
3. Use the `ExternalLink` icon (already imported) to indicate it opens in a new context

---

## Expected Behavior After Fix

**For New Users (Community):**
1. Complete assessment and select degree path
2. Navigate to Community
3. Can view all posts, daily challenges, and leaderboard
4. Can like and comment on posts
5. See subtle prompt: "Enroll in a course to create your first post" (optional enhancement)

**For Admins (View Profile):**
1. Go to Admin > User Management
2. Click on any user to open the detail sheet
3. See "View Profile" button in the header
4. Click to navigate to `/profile/:userId` and see the student's public profile


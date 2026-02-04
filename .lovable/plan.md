

# Redirect to Student Center After Enrollment

## The Issue

Currently, when you enroll in a course from the Course Detail page, you stay on the same page. This means you don't see your newly enrolled course in the Student Center's "Active Courses" section without manually navigating there.

## The Solution

After successfully enrolling in a course, automatically redirect you to the Student Center with the Active Courses section highlighted/scrolled into view, along with a visual indication of which course was just added.

---

## Implementation Details

### 1. Update Course Detail Page - Add Navigation After Enrollment

**File: `src/pages/CourseDetail.tsx`**

Modify the `handleEnroll` function to:
- Wait for the enrollment to complete successfully
- Navigate to the Student Center with a query parameter indicating the newly enrolled course
- Example: `/student?enrolled=CIN-123`

```text
Current flow:
User clicks "Enroll" → Enrollment saves → User stays on course page

New flow:
User clicks "Enroll" → Enrollment saves → Redirect to /student?enrolled=COURSE_CODE
```

### 2. Update Student Center - Highlight New Enrollment

**File: `src/pages/StudentCenter.tsx`**

Add logic to:
- Read the `enrolled` query parameter from the URL
- Scroll to the Active Courses section automatically
- Briefly highlight the newly enrolled course card with an animation
- Clear the query parameter from the URL after showing the highlight

### 3. Add Visual Feedback

The newly enrolled course card will have:
- A brief pulse/glow animation to draw attention
- The card will be scrolled into view if not already visible

---

## Technical Approach

### Changes to `src/pages/CourseDetail.tsx`

1. Import `useNavigate` from `react-router-dom`
2. Update `handleEnroll`:
   - Check if enrollment was successful (no error returned)
   - If successful, navigate to `/student?enrolled={courseCode}`

### Changes to `src/pages/StudentCenter.tsx`

1. Import `useSearchParams` from `react-router-dom`
2. Add a `useEffect` that:
   - Reads `enrolled` query parameter
   - Finds the corresponding course card element
   - Scrolls it into view with smooth scrolling
   - Adds a temporary highlight class
   - Clears the query parameter from URL using `searchParams.delete()` + `setSearchParams()`

### Changes to `src/components/enrollment/EnrollmentManagementCard.tsx`

1. Add an optional `isHighlighted` prop
2. When `isHighlighted` is true, apply a pulsing border/glow animation that fades after 2-3 seconds

---

## User Experience

| Before | After |
|--------|-------|
| Click Enroll → Stay on course page | Click Enroll → Go to Student Center |
| Toast shows "Enrolled!" | Toast shows "Enrolled!" + Redirect |
| Manually navigate to see course | Course card visible and highlighted |
| No visual confirmation | Pulsing highlight on new course |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/CourseDetail.tsx` | Add `useNavigate`, update `handleEnroll` to redirect on success |
| `src/pages/StudentCenter.tsx` | Add `useSearchParams`, scroll + highlight logic |
| `src/components/enrollment/EnrollmentManagementCard.tsx` | Add `isHighlighted` prop with animation |


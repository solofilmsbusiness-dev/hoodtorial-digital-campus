

# Sort Courses: Available First, Coming Soon Last

## What This Change Does

When you visit the Academics page, all available courses will appear at the top of the list, and all "Coming Soon" courses will be grouped at the bottom. This applies to both grid and list view modes.

## How It Works

After filtering courses by department and search, the results will be sorted so that:
- **Available courses** (isComingSoon = false) appear first
- **Coming Soon courses** (isComingSoon = true) appear last

The original order within each group will be preserved.

---

## Technical Details

**File:** `src/pages/Academics.tsx`

**Change:** Add a sort step after the existing filter logic

```typescript
// Current code (lines 27-36)
const filteredCourses = courses.filter(course => {
  const matchesDepartment = activeFilter === "all" || course.departmentId === activeFilter;
  const query = searchQuery.toLowerCase();
  const matchesSearch = !query || 
    course.code.toLowerCase().includes(query) ||
    course.title.toLowerCase().includes(query) ||
    course.description.toLowerCase().includes(query) ||
    course.department.toLowerCase().includes(query);
  return matchesDepartment && matchesSearch;
});

// NEW: Sort to show available courses first, coming soon last
const sortedCourses = [...filteredCourses].sort((a, b) => {
  if (a.isComingSoon === b.isComingSoon) return 0;
  return a.isComingSoon ? 1 : -1;
});
```

Then use `sortedCourses` instead of `filteredCourses` for rendering the course grid/list.

**Lines affected:** 27-36 (filter), 225-247 (grid/list rendering), 137-147 (course count and stats)


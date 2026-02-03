
# Enhanced Admin Course Manager

## Overview
Add search, level filtering, and improved toggle controls to the admin course manager page for easier course discovery and quick status management.

---

## Current State
The existing CourseManager page has:
- Basic table with columns: Code, Title, Department, Level, Credits, Published (switch), Locked (switch), Actions
- No search functionality
- No filtering by level or department
- Toggles are small switches in table cells - not very prominent

---

## Proposed Enhancements

### 1. Add Search and Filter Bar
Add a filter bar above the table with:
- **Search input**: Filter by course code, title, or department
- **Level filter dropdown**: All Levels / Beginner / Intermediate / Advanced
- **Status filter dropdown**: All / Published / Coming Soon (locked) / Hidden (unpublished)
- **Department filter dropdown**: All Departments / Cinematography / Post-Production / etc.

### 2. Improve Toggle Visibility
Replace the small switches in table cells with more prominent toggle buttons:
- **Published status**: Badge-style toggle (green "Published" / gray "Hidden")
- **Coming Soon status**: Badge-style toggle (amber "Coming Soon" / transparent when not set)
- Click to toggle - more intuitive than small switches

### 3. Quick Stats Header
Add summary stats showing:
- Total courses
- Published count
- Coming Soon count  
- Hidden count

---

## UI Wireframe

```text
+------------------------------------------------------------------+
| COURSE MANAGER                           24 total | 20 pub | 2 CS |
+------------------------------------------------------------------+
| [Search courses...    ] [Level ▾] [Status ▾] [Dept ▾] [+ Add]    |
+------------------------------------------------------------------+
| CODE    | TITLE                | DEPT  | LEVEL  | STATUS         |
|---------|----------------------|-------|--------|----------------|
| HU-101  | iPhone Cinematography| Cine  | Begin  | [Published] [ ]|
| HU-102  | Lighting for Mobile  | Cine  | Begin  | [Published] [ ]|
| HU-201  | Advanced Camera Move | Cine  | Inter  | [ Hidden ] [CS]|
| HU-301  | Cinematic Lens Lang  | Cine  | Adv    | [Published] [ ]|
+------------------------------------------------------------------+

Legend: [Published] = green badge, [Hidden] = gray badge
        [CS] = Coming Soon amber badge, [ ] = empty/not coming soon
```

---

## Implementation Details

### New Component: CourseFilters
Create a filter component similar to `StudentFilters`:

```typescript
interface CourseFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  levelFilter: "all" | "Beginner" | "Intermediate" | "Advanced";
  onLevelChange: (value: LevelFilter) => void;
  statusFilter: "all" | "published" | "coming-soon" | "hidden";
  onStatusChange: (value: StatusFilter) => void;
  departmentFilter: string;
  onDepartmentChange: (value: string) => void;
}
```

### Status Toggle Badges
Replace switches with clickable badge components:

```text
Published Badge:
- Green background when published
- Gray background when hidden
- Click toggles is_published

Coming Soon Badge:
- Amber/orange when is_locked = true
- Transparent/outline when is_locked = false
- Click toggles is_locked
```

### Filter Logic
```typescript
const filteredCourses = courses.filter((course) => {
  // Search filter
  const matchesSearch = !searchQuery || 
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.department_id.toLowerCase().includes(searchQuery.toLowerCase());
  
  // Level filter
  const matchesLevel = levelFilter === "all" || course.level === levelFilter;
  
  // Status filter
  const matchesStatus = 
    statusFilter === "all" ||
    (statusFilter === "published" && course.is_published && !course.is_locked) ||
    (statusFilter === "coming-soon" && course.is_locked) ||
    (statusFilter === "hidden" && !course.is_published);
  
  // Department filter
  const matchesDept = departmentFilter === "all" || course.department_id === departmentFilter;
  
  return matchesSearch && matchesLevel && matchesStatus && matchesDept;
});
```

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/admin/CourseFilters.tsx` | Create | New filter component for courses |
| `src/pages/admin/CourseManager.tsx` | Major Edit | Add filters, stats header, badge toggles |
| `src/components/admin/index.ts` | Edit | Export CourseFilters |

---

## Toggle Badge Design

**Published Toggle:**
```text
ON:  [●  Published] - bg-green-600 text-white
OFF: [○  Hidden   ] - bg-muted text-muted-foreground
```

**Coming Soon Toggle:**
```text
ON:  [🔒 Coming Soon] - bg-amber-600 text-white
OFF: [  —  ]          - invisible/empty
```

Both badges are clickable buttons that toggle on click.

---

## Summary
This enhancement provides:
1. Quick search by course code, title, or department
2. Easy filtering by level (Beginner/Intermediate/Advanced)
3. Status filtering (Published/Coming Soon/Hidden)
4. Department filtering
5. Prominent, easy-to-use toggle badges for visibility status
6. At-a-glance stats in the header

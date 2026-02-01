

# Plan: Add Search to Academics Page

## Overview
Add a search input to the Academics page that allows students to quickly find courses by typing course codes, titles, descriptions, or keywords.

## Current State
- The page already has department filtering buttons
- There's a toolbar area with course counts and view mode toggle
- Courses are filtered by `activeFilter` state (department ID)

## Proposed Design
Add a search bar in the toolbar section alongside the existing view controls. The search will filter courses in real-time as users type.

### Layout Update
```
┌──────────────────────────────────────────────────────────────────┐
│  Showing X courses                                               │
│                                                                  │
│  ┌────────────────────────────────┐   Credits: X  Lessons: X     │
│  │ 🔍 Search courses...           │   [Grid] [List]              │
│  └────────────────────────────────┘                              │
└──────────────────────────────────────────────────────────────────┘
```

## Technical Details

### Search Fields
The search will match against:
- **Course code** (e.g., "HU-101", "201")
- **Course title** (e.g., "iPhone", "Lighting")
- **Course description** (e.g., "cinematography", "grading")
- **Department name** (e.g., "Post-Production")

### Implementation Steps

1. **Add search state**
   ```typescript
   const [searchQuery, setSearchQuery] = useState("");
   ```

2. **Update filtering logic**
   ```typescript
   const filteredCourses = courses.filter(course => {
     // Department filter
     const matchesDepartment = activeFilter === "all" || course.departmentId === activeFilter;
     
     // Search filter
     const query = searchQuery.toLowerCase();
     const matchesSearch = !query || 
       course.code.toLowerCase().includes(query) ||
       course.title.toLowerCase().includes(query) ||
       course.description.toLowerCase().includes(query) ||
       course.department.toLowerCase().includes(query);
     
     return matchesDepartment && matchesSearch;
   });
   ```

3. **Add search input in toolbar**
   - Import `Search` and `X` icons from lucide-react
   - Add Input component from UI library
   - Include clear button when search has text
   - Style to match the brutal/urban aesthetic

4. **Show "no results" state**
   - Display helpful message when search returns no courses
   - Suggest clearing the search or trying different terms

## Files to Modify

### `src/pages/Academics.tsx`
- Add `searchQuery` state
- Import `Search`, `X` icons and `Input` component
- Update `filteredCourses` logic to include search
- Add search input in the toolbar section
- Add empty state for no search results

## User Experience
1. User types in search box
2. Results filter instantly as they type
3. Clear button appears to reset search
4. "No courses found" message if no matches
5. Search works in combination with department filter


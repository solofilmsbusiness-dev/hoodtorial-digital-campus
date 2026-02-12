

## Fix Broken Links on Academics Page and Site-Wide

### Issue Found
The "Enroll Now" / "Start Learning" CTA buttons link to `/enroll`, which **does not exist** as a route. The correct route is `/enrollment`. Clicking these buttons sends users to the 404 Not Found page -- a dead end.

### Affected Files and Locations

| File | Line | Current Link | Fix |
|------|------|-------------|-----|
| `src/pages/Academics.tsx` | 325 | `/enroll` | `/enrollment` |
| `src/pages/Index.tsx` | 169 | `/enroll` | `/enrollment` |
| `src/components/cards/TierCard.tsx` | 26 | `/enroll` (default prop) | `/enrollment` |

### Other Elements Checked (All Working)
- Department filter buttons (All, Cinematography, etc.) -- work correctly, toggle filter state
- Grid/List view toggle -- works correctly
- Search input with clear button -- works correctly
- Course cards -- link to `/course/:code` (valid route), Coming Soon cards show toast and prevent navigation
- "View Degree Paths" CTA -- links to `/degrees` (valid route)
- Footer links (All Courses, Degree Paths, Faculty, Student Center, Shop, Community, About) -- all valid routes
- Navigation bar links (Academics, Degrees, Faculty, About, Shop) -- all valid routes
- Dropdown menu links (Profile, Student Hub, Community, Friends, Messages, Admin) -- all valid routes

### Fix
Simple 1-line change in each of the 3 files: replace `/enroll` with `/enrollment`.


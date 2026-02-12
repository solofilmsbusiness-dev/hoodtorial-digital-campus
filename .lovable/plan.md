

## Improve Student Hub Layout and UX

### Current Issues
1. **Excessive blank space** at the bottom -- the page ends with a sparse 2-column grid that doesn't fill the viewport
2. **Redundant content** -- Degree Progress ring in the sidebar duplicates the Credits Earned stat card above
3. **Missing Journey card** -- The `JourneyProgressCard` component exists but isn't used on this page, despite being designed specifically for the Student Center
4. **Quick Links section is bloated** -- 7-8 links stacked vertically feel like a settings page, not a hub
5. **Stats cards feel disconnected** -- floating between sections without visual cohesion
6. **No visual warmth** -- everything is the same card style with no hierarchy

### Solution: Reorganized, Tighter Layout

**1. Integrate the Journey Progress Card** (replaces the redundant Degree Progress ring)
- Add the existing `JourneyProgressCard` component to the sidebar, replacing the standalone Degree Progress card
- This gives the sidebar real purpose: journey tracking + recommendations

**2. Compact Quick Links into a horizontal strip**
- Convert from a tall stacked list to a compact 2-column grid of smaller link chips
- Move "Take a Tour" and "Need Help?" into a subtle footer row
- This dramatically reduces vertical space

**3. Merge Stats into the header area**
- Move the 3 stat cards (Credits, Courses, Quizzes) into compact inline badges within the header section instead of being a separate row
- This removes an entire section of vertical space

**4. Tighten the bottom grid**
- Quiz Results stays as the main content area (full width on mobile)
- Sidebar: Journey Progress Card at top, then compact Quick Links, then Recommended Courses
- Remove the standalone Degree Progress card (covered by Journey card)

**5. Remove bottom padding / add a motivational footer**
- Replace the blank space with a small motivational banner or "What's Next" prompt at the bottom

### New Layout Structure

```text
+--------------------------------------------------+
| [Avatar]  Welcome back, Name                     |
|           Freshman  |  5cr  |  1 course  |  2 quiz|
|                              [Edit] [View Profile]|
+--------------------------------------------------+
| ACTIVE COURSES (full width card with grid)        |
|  [Course 1] [Course 2] [+ Add Course]            |
+--------------------------------------------------+
| ACHIEVEMENTS (if any, full width)                 |
+--------------------------------------------------+
| RECENT QUIZ RESULTS (2/3)  | JOURNEY CARD (1/3)  |
|  result rows...            | path + progress      |
|                            | next course           |
|                            +----------------------+
|                            | QUICK LINKS (compact) |
|                            | [Community] [Courses] |
|                            | [Grades]   [Profile]  |
|                            | [Assessment] [Help]   |
|                            +----------------------+
|                            | RECOMMENDED (if any)  |
+--------------------------------------------------+
```

### Technical Changes

**Modified: `src/pages/StudentCenter.tsx`**

1. **Header stats inline**: Move Credits/Courses/Quizzes into small badge-style counters next to the membership badge in the header, removing the separate 3-card stats row (~30 lines removed)

2. **Import and add JourneyProgressCard**: Place it at the top of the sidebar column, replacing the Degree Progress card at the bottom

3. **Compact Quick Links**: Change from `space-y-2` stacked full-width links to a `grid grid-cols-2 gap-2` with smaller padding (`p-3` instead of `p-4`), smaller text. Move Tour and Help to a separate subtle row below

4. **Remove Degree Progress card**: The ring chart at the bottom of the sidebar is fully replaced by the JourneyProgressCard which shows the same data plus more

5. **Reduce outer padding**: Change `py-12` to `py-8` and `mb-12` gaps to `mb-6` for tighter spacing

6. **Add bottom CTA**: A small "Keep going!" motivational line or a link to the Journey page at the very bottom, replacing dead space

### Files

| File | Action |
|------|--------|
| `src/pages/StudentCenter.tsx` | Reorganize layout, inline stats, add JourneyProgressCard, compact quick links, remove degree progress ring |


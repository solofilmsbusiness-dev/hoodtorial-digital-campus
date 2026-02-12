

## Visual Layout Editor with Live Preview

### Problem
The current Layout tab shows two plain drag-and-drop lists with text labels and icons. Users can't see what the sections actually look like, making it hard to understand what they're rearranging.

### Solution
Replace the abstract list-based editors with a **visual mini-preview layout** that shows a simplified representation of each section (like a wireframe/blueprint). As users drag sections, the preview updates in real-time so they can immediately see the result.

---

### Design Approach

Each section gets a small visual "block" preview instead of a plain text row:

**Profile Card sections** (bio, featured project, info cards, social links):
- **Bio block**: Shows a quote icon with gray placeholder lines mimicking text
- **Featured Project block**: Shows a film/play icon with a thumbnail-style rectangle
- **Info Cards block**: Shows a 2x2 grid of small card outlines
- **Social Links block**: Shows a row of circular social media icon placeholders

**Page sections** (stats, achievements, gallery, wall):
- **Academic Stats block**: Shows a mini bar-chart style graphic with numbers
- **Achievements block**: Shows trophy icons in a row with badge shapes
- **Gallery block**: Shows a grid of small image placeholder squares
- **Wall block**: Shows stacked message bubble outlines

Each block is ~80px tall, draggable, and styled with the section's accent color when active. A subtle "numbered position" badge (1, 2, 3, 4) appears in the corner of each block.

### Side-by-Side Layout
On desktop, the Layout tab will show a **two-column layout**:
- Left column: The interactive drag-and-drop blocks
- Right column: A combined "profile page preview" wireframe that reflects the current order in real-time

On mobile, only the drag blocks are shown (the sidebar ProfilePreviewCard already serves as a general preview).

---

### Technical Changes

**Modified: `src/components/profile/SectionLayoutEditor.tsx`**
- Replace `SortableSectionItem` with new `SortableVisualBlock` component
- Each block renders a small visual representation of its section content
- Add numbered position badges
- Add a mini wireframe preview column on the right

**Modified: `src/components/profile/CardSectionLayoutEditor.tsx`**
- Same treatment: replace text items with visual blocks
- Each card section gets a miniature visual representation

**New: `src/components/profile/SortableVisualBlock.tsx`**
- New drag-and-drop item component with:
  - Section icon and label at top
  - Visual wireframe preview area (~60px) showing what the section looks like
  - Position number badge
  - Drag handle
  - Highlighted border with accent color on drag

**Modified: `src/components/profile/SortableSectionItem.tsx`**
- Keep as-is (other parts of the app may use it), but the layout editors will use the new visual block

**Modified: `src/pages/StudentProfile.tsx`** (Layout tab only, lines 902-912)
- Pass accent color and profile data to layout editors so previews can reflect real content
- Add descriptive header with explanation

---

### Visual Block Previews (what each block renders)

| Section | Visual Representation |
|---------|----------------------|
| Bio | Quote mark icon + 3 gray lines (text placeholder) |
| Featured Project | 16:9 rectangle with play button triangle in center |
| Info Cards | 2x2 grid of small rounded rectangles with tiny icons |
| Social Links | Row of 4 small circles (social icon placeholders) |
| Academic Stats | 3 vertical bars (chart) with numbers below |
| Achievements | 3 trophy/star shapes in a row |
| Gallery | 2x3 grid of small square image placeholders |
| Wall | 3 stacked rounded message bubble outlines |

### Files Summary

| File | Action |
|------|--------|
| `src/components/profile/SortableVisualBlock.tsx` | New -- visual drag item with wireframe preview |
| `src/components/profile/SectionLayoutEditor.tsx` | Update to use visual blocks + add live preview column |
| `src/components/profile/CardSectionLayoutEditor.tsx` | Update to use visual blocks + add live preview column |
| `src/pages/StudentProfile.tsx` | Pass accent color to layout editors |
| `src/components/profile/index.ts` | Export new component if needed |


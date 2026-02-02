
# Fix Skill Tree Layout Clipping Issues

## Problem Analysis

The skill tree nodes and labels are being cut off due to several issues:

1. **Hexagonal clip-path** - The `.hex-node` CSS class clips content outside the hexagon shape, cutting off:
   - Skill Points badges (positioned outside the node bounds)
   - Course code badges (positioned below nodes)
   - Hover tooltips

2. **Node structure issue** - All node content (badges, labels) is inside the clipped button element when they need to be outside or use overflow handling.

3. **Level indicators positioning** - The "100", "200", "300" level numbers may not align correctly with node rows.

4. **Canvas overflow** - The SVG and container may not properly handle elements that extend beyond their bounds.

---

## Solution

### 1. Restructure SkillNodeHex Component

Change the component structure so badges and labels are NOT affected by the hexagon clip-path:

```text
BEFORE (clipped):
+----------------------------------+
| <button clip-path=hex>           |
|   [icon]                         |
|   [SP badge - CLIPPED!]          |
|   [course code - CLIPPED!]       |
| </button>                        |
+----------------------------------+

AFTER (fixed):
+----------------------------------+
| <div wrapper>                    |
|   <button clip-path=hex>         |
|     [icon only]                  |
|   </button>                      |
|   [SP badge - visible]           |
|   [course code - visible]        |
|   [tooltip - visible]            |
| </div>                           |
+----------------------------------+
```

### 2. Remove Clip-Path from Main Button

Instead of using `clip-path` on the entire button (which clips children), apply the hexagon shape using:
- A nested `<div>` inside with the clip-path for the visual shape
- Keep badges and labels as siblings outside the clipped area

### 3. Add Overflow Handling

Ensure the canvas container allows content to overflow visibly:
- Add `overflow: visible` to the node positioning wrapper
- Update SVG to use `style={{ overflow: "visible" }}` (already present but verify)

### 4. Fix Level Indicators in DepartmentLane

Adjust the Y-positioning formula to match actual node positions:
- Current: `80 + level * 160 + 80` = 160, 320, 480
- Node positions: `headerOffset (80) + level * levelHeight (160) + levelHeight/2 (80)` = 160, 320, 480
- These should match, but verify alignment and ensure text is not cut off by lane background

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/skill-tree/SkillNodeHex.tsx` | Restructure to wrap button with outer div; move badges outside clipped element |
| `src/index.css` | Optionally adjust hex-node class or add utility classes for overflow |

---

## Detailed Changes

### SkillNodeHex.tsx Restructure

1. Wrap the entire node in an outer `<div>` that handles absolute positioning
2. Move the button's outer styling (position, transform) to the wrapper
3. Keep the hex clip-path only on the inner visual container
4. Place SP badge, course code badge, and tooltip as siblings of the clipped element

### Key Structure Change

```typescript
// Outer wrapper (handles positioning, NOT clipped)
<div className="absolute" style={{ left, top, transform: "translate(-50%, -50%)" }}>
  
  // Inner button with hex shape (clipped, just the visual)
  <motion.button className="hex-node ...">
    [icon content]
  </motion.button>
  
  // Badges OUTSIDE the clip (visible)
  <div className="absolute -top-1 -right-1">SP Badge</div>
  <div className="absolute -bottom-6">Course Code</div>
  <div className="absolute top-full">Tooltip</div>
  
</div>
```

### Additional CSS Adjustment

Add to the wrapper to ensure visible overflow:
```css
.skill-node-wrapper {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## Expected Outcome

After these changes:
- Skill Point badges (30, 40, 50 SP) will be fully visible in the top-right corner
- Course codes (HU-101, HU-102, etc.) will show below each node
- Hover tooltips will display without clipping
- Level indicators (100, 200, 300) will be properly aligned and visible
- The overall tree layout remains unchanged

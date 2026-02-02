
# Skill Tree Redesign: Fun & Interactive Experience

## Overview

A complete visual overhaul of the skill tree system, transforming it from a basic grid layout into an immersive, game-inspired progression map. The new design will feel like a cinematic journey through filmmaking mastery, with animated pathways, glowing nodes, particle effects, and department-themed visual lanes.

## Design Concept

The redesigned skill tree draws inspiration from RPG skill trees and metro/transit maps, creating a visually stunning "Film Academy Universe" where each department is a distinct visual lane with its own color identity. Students will feel like they're navigating a neon-lit cityscape of knowledge.

```text
+------------------------------------------------------------------+
|                     SKILL TREE HEADER                            |
|  [Back] Bachelor of Film         SP: 120/850   Credits: 12/60    |
|  ================ Progress Bar (20%) ================            |
+------------------------------------------------------------------+
|                                                                   |
|  CINEMATOGRAPHY LANE (Gold)     POST-PRODUCTION LANE (Purple)    |
|  ~~~~~~~~~~~~~~~~~~~~~~~~       ~~~~~~~~~~~~~~~~~~~~~~~~~~       |
|       [101]----[102]                  [103]----[104]             |
|          \        \                      \        \              |
|           [201]    \                      [202]    \             |
|              \      \                        \      \            |
|               [301]--+------------------------[302]-+            |
|                       \                             /            |
|  DIRECTING LANE        \     PRODUCTION LANE       /             |
|  ~~~~~~~~~~~~~~         \    ~~~~~~~~~~~~~~~      /              |
|      [105]               \       [106]           /               |
|         \                 \         \           /                |
|          [203]             \        [204]      /                 |
|             \               \          \      /                  |
|              [303]           \         [304] /                   |
|                  \            \           \ /                    |
|                   +-----------[CAPSTONE]---+                     |
|                                  [*]                             |
+------------------------------------------------------------------+
```

## Technical Implementation

### 1. New SkillNode Component (Complete Redesign)

**Visual Features:**
- Hexagonal shape for courses, circular for milestones, star-burst for capstone
- Department-specific color gradients and glow effects
- Animated inner ring showing course progress
- Floating skill point badges with bounce animation
- Title labels that appear on hover with glass-morphism effect
- Particle trail effect when node unlocks

**Status States:**
- **Locked**: Grayscale, slight blur, chain-link overlay icon
- **Available**: Pulsing glow, "ready" indicator animation
- **In Progress**: Animated progress ring, partial fill
- **Completed**: Full color, checkmark stamp, earned XP sparkle

### 2. Connection Pathways (SVG-Based Animated Paths)

**Visual Features:**
- Curved bezier paths instead of straight lines
- Animated "energy flow" effect using stroke-dashoffset
- Gradient strokes matching department colors
- Glowing dots that travel along completed paths
- Dimmed paths for locked connections

### 3. Layout Engine (Department Lanes)

**Structure:**
- Organize nodes into vertical department "lanes"
- Each lane has its own background gradient strip
- Courses flow downward with branching connections
- Cross-department connections create visual bridges

**Spacing:**
- Fixed vertical spacing between levels (100, 200, 300 series)
- Department lanes with consistent horizontal gaps
- Special treatment for capstone at the bottom center

### 4. Interactive Container

**Features:**
- Smooth zoom with momentum (0.5x to 2.5x)
- Inertial panning with rubber-band edges
- Minimap in corner showing viewport position
- Click-to-focus on any node
- Keyboard navigation (arrow keys)
- Double-click to zoom to node

### 5. Enhanced Header

**New Stats Display:**
- Animated skill point counter with level indicator
- XP bar that fills with particle effects
- Department completion badges (color-coded)
- Current "rank" based on progress

### 6. Node Detail Panel (Slide-In Modal)

**Redesigned Features:**
- Full-width bottom sheet on mobile
- Side panel on desktop with parallax background
- Course thumbnail/icon display
- Animated stats counters
- Prerequisites shown as mini skill tree
- "Start Course" button with loading state

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/skill-tree/SkillNodeHex.tsx` | Create | New hexagonal node component with all visual states |
| `src/components/skill-tree/SkillPathway.tsx` | Create | SVG-based animated connection paths |
| `src/components/skill-tree/SkillTreeCanvas.tsx` | Create | New main container with department lanes |
| `src/components/skill-tree/SkillTreeMinimap.tsx` | Create | Corner minimap for navigation |
| `src/components/skill-tree/SkillTreeStats.tsx` | Create | Animated header stats component |
| `src/components/skill-tree/DepartmentLane.tsx` | Create | Visual lane background for each department |
| `src/components/skill-tree/NodeDetailSheet.tsx` | Create | Redesigned detail panel |
| `src/hooks/useSkillTreeLayout.ts` | Create | New layout algorithm for department lanes |
| `src/components/skill-tree/SkillTreeView.tsx` | Replace | Completely rewritten with new components |
| `src/components/skill-tree/SkillNode.tsx` | Delete | Replaced by SkillNodeHex |
| `src/components/skill-tree/SkillTreeConnector.tsx` | Delete | Replaced by SkillPathway |
| `src/components/skill-tree/SkillNodeDetail.tsx` | Delete | Replaced by NodeDetailSheet |
| `src/hooks/useSkillTree.ts` | Modify | Add department grouping to node data |
| `src/index.css` | Modify | Add new animations and glow effects |

## Technical Details

### Department Lane Layout Algorithm

```typescript
// Each department gets a vertical lane
const departmentOrder = [
  "cinematography",    // Lane 1 (Gold)
  "post-production",   // Lane 2 (Purple)  
  "directing",         // Lane 3 (Cyan)
  "production"         // Lane 4 (Pink)
];

// Courses positioned by:
// x = laneIndex * laneWidth + laneOffset
// y = courseLevel * levelHeight + headerOffset
```

### Animation Keyframes

New CSS animations for:
- `@keyframes node-pulse` - Breathing glow for available nodes
- `@keyframes path-flow` - Energy traveling along connections
- `@keyframes unlock-burst` - Particle explosion on unlock
- `@keyframes sp-pop` - Skill point badge bounce
- `@keyframes progress-ring` - Circular progress animation

### SVG Path Generation

Curved connections using quadratic bezier curves:
```typescript
// Path from node A to node B with curve
const midX = (fromX + toX) / 2;
const midY = (fromY + toY) / 2;
const controlY = midY - 30; // Curve upward

return `M ${fromX} ${fromY} Q ${midX} ${controlY} ${toX} ${toY}`;
```

## Visual Polish

### Color System by Department

| Department | Primary | Glow | Lane BG |
|------------|---------|------|---------|
| Cinematography | Gold (#D4AF37) | Gold/30% | Gold/5% |
| Post-Production | Purple (#A855F7) | Purple/30% | Purple/5% |
| Directing | Cyan (#00E5CC) | Cyan/30% | Cyan/5% |
| Production | Pink (#FF66B2) | Pink/30% | Pink/5% |

### Node Size Hierarchy

- Regular courses: 64x64px (mobile), 80x80px (desktop)
- Milestone exams: 72x72px (mobile), 88x88px (desktop)
- Capstone: 96x96px (mobile), 120x120px (desktop)

## Implementation Order

1. Create new layout hook with department grouping
2. Build SkillNodeHex component with all visual states
3. Build SkillPathway SVG component
4. Create DepartmentLane background component
5. Build SkillTreeCanvas container
6. Add SkillTreeMinimap
7. Create NodeDetailSheet
8. Create SkillTreeStats header
9. Wire everything together in SkillTreeView
10. Add CSS animations to index.css
11. Clean up old components

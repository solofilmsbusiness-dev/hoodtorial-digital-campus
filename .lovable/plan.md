
# Complete Redesign: Learning Journey / Curriculum Roadmap

## Problem Summary

The current skill tree has usability issues:
- Complex pan/zoom SVG canvas is awkward to navigate
- Hexagonal nodes with department lanes feel abstract
- Minimap adds complexity without clarity
- Poor mobile experience
- Nodes don't show actual course content or lesson progress
- Disconnect between degree path selection and visualization

---

## New Design: "Your Learning Journey"

Replace the skill tree with a **scrollable, card-based curriculum roadmap** that feels more like a structured learning path and less like a video game skill tree.

```text
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: Progress stats + Level indicator + XP bar             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ LEVEL 1: FOUNDATIONS                          ▼ Expand  │   │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 2/4 courses │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│    │ ★ HU-101    │  │ ★ HU-102    │  │ 🔒 HU-103   │        │
│    │ iPhone Cine │  │ Lighting    │  │ Editing     │        │
│    │             │  │             │  │             │        │
│    │ ██████████  │  │ ████░░░░░░  │  │ Locked      │        │
│    │ COMPLETE    │  │ 45% done    │  │ Prereq: 102 │        │
│    │ +30 SP ✓    │  │ 40 SP       │  │             │        │
│    └──────────────┘  └──────────────┘  └──────────────┘        │
│                              │                                  │
│                              ▼ (visual connector)               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ LEVEL 2: INTERMEDIATE                        ▼ Expand   │   │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0/4 courses │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ LEVEL 3: ADVANCED                            ▼ Expand   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ★ CAPSTONE: Your Final Film                  🔒 Locked  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Design Principles

### 1. Vertical Scroll Instead of Pan/Zoom
- Natural scrolling behavior everyone understands
- No learning curve for navigation
- Works perfectly on mobile

### 2. Collapsible Level Sections
- Group courses by level (100/200/300 series)
- Each level can expand/collapse to show courses
- Shows level completion status at a glance

### 3. Rich Course Cards
- Show course title, code, and department color
- Display real progress (% of lessons watched, quizzes passed)
- Clear locked/available/in-progress/complete states
- Skill points earned or available

### 4. Visual Level Connectors
- Simple vertical line or chevron connectors between levels
- Shows progression flow without complex bezier curves
- Animated "energy" flowing down as levels complete

### 5. Gamification Preserved
- XP/Skill Points system kept in header
- Level badges (Level 1, 2, 3...)
- Rank titles based on progress
- Celebration animations on completion

---

## Component Architecture

### New Components

| Component | Purpose |
|-----------|---------|
| `JourneyView.tsx` | Main container replacing SkillTreeView |
| `JourneyHeader.tsx` | Stats bar with XP, credits, level, rank |
| `JourneyLevelSection.tsx` | Collapsible section for each level |
| `JourneyCourseCard.tsx` | Individual course card with progress |
| `JourneyConnector.tsx` | Visual connectors between levels |
| `JourneyMilestone.tsx` | Special milestone/capstone cards |

### Updated Hook

| Hook | Changes |
|------|---------|
| `useJourneyData.ts` | New hook replacing useSkillTree, organized by levels instead of node positions |

---

## JourneyHeader Component

```text
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Degrees           Bachelor of Film                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ LEVEL 3      │  │ 450 / 600 SP │  │ 28 / 60      │      │
│  │ Intermediate │  │ Skill Points │  │ Credits      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  ████████████████████░░░░░░░░  75% Complete                │
│                                                             │
│  Current Rank: SENIOR DIRECTOR                             │
└─────────────────────────────────────────────────────────────┘
```

---

## JourneyLevelSection Component

Each level section:
- Has a header showing level name and completion count
- Collapses/expands with smooth animation
- Shows department-colored courses in a responsive grid
- Displays a "Level Complete!" badge when all courses done
- Has a subtle glow/animation when level is active (in progress)

```text
Level States:
- LOCKED: Grey, collapsed, shows prerequisite
- AVAILABLE: Colored, expanded by default, pulsing border
- IN_PROGRESS: Colored, expanded, shows active courses
- COMPLETE: Gold border, completion badge, can collapse
```

---

## JourneyCourseCard Component

Replaces SkillNodeHex with a full card design:

```text
┌────────────────────────────────────────┐
│ [Dept Color Bar]                       │
│                                        │
│ HU-201                    ⚡ 50 SP     │
│ Advanced Camera Movement               │
│ Cinematography                         │
│                                        │
│ ██████████░░░░░░░░░░░░░ 45%           │
│ 5/12 lessons • 2/4 quizzes             │
│                                        │
│ [Continue Course →]                    │
└────────────────────────────────────────┘
```

States:
- **Locked**: Greyed out, shows "Complete X to unlock"
- **Available**: Pulsing border, "Start Course" button
- **In Progress**: Shows progress bar, "Continue" button
- **Complete**: Checkmark, gold accent, "Review" button

---

## JourneyMilestone Component

For exams, projects, and capstone:

```text
┌─────────────────────────────────────────────────────────────┐
│ ⭐ SCENARIO EXAM 1                                         │
│ Test your skills with a real-world filmmaking challenge    │
│                                                             │
│ Requires: Complete Level 1 courses                         │
│                                                             │
│ [🔒 Locked]                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Organization

### useJourneyData Hook

Returns data organized for the new UI:

```typescript
interface JourneyLevel {
  id: string;
  name: string;
  number: number;
  status: 'locked' | 'available' | 'in_progress' | 'complete';
  courses: JourneyCourse[];
  requiredToUnlock: string[];
  milestone?: JourneyMilestone;
}

interface JourneyCourse {
  code: string;
  title: string;
  department: DepartmentId;
  departmentColor: string;
  credits: number;
  skillPoints: number;
  status: 'locked' | 'available' | 'in_progress' | 'complete';
  progress: {
    lessonsCompleted: number;
    lessonsTotal: number;
    quizzesPassed: number;
    quizzesTotal: number;
    percentage: number;
  };
  prerequisites: string[];
}
```

---

## Mobile Experience

The card-based design is mobile-first:
- Single column layout on mobile
- Full-width course cards
- Touch-friendly tap targets
- Collapsible sections reduce scroll length
- No complex gestures required

---

## Visual Styling

Maintain the brutalist/urban aesthetic:
- Dark backgrounds with department-colored accents
- Bold typography for level headers
- Card borders with subtle glow effects
- Gold primary color for progress/completion
- Department colors: Gold (cine), Purple (post), Cyan (directing), Pink (production)

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/journey/JourneyView.tsx` | Main view container |
| `src/components/journey/JourneyHeader.tsx` | Stats and progress header |
| `src/components/journey/JourneyLevelSection.tsx` | Collapsible level group |
| `src/components/journey/JourneyCourseCard.tsx` | Course card with progress |
| `src/components/journey/JourneyConnector.tsx` | Visual level connectors |
| `src/components/journey/JourneyMilestone.tsx` | Exam/project/capstone cards |
| `src/components/journey/index.ts` | Barrel exports |
| `src/hooks/useJourneyData.ts` | Data hook for journey view |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/SkillTree.tsx` | Use new JourneyView instead of SkillTreeView |
| `src/pages/Degrees.tsx` | Update links to use new journey page |

---

## Animation Details

- **Level unlock**: Cascade reveal animation when prerequisites met
- **Course completion**: Confetti burst, skill points fly to header
- **Progress update**: Smooth bar fill animation
- **Level complete**: Gold shimmer effect on section header
- **Rank up**: Full-screen celebration moment

---

## Comparison: Before vs After

| Aspect | Current Skill Tree | New Journey View |
|--------|-------------------|------------------|
| Navigation | Pan/zoom canvas | Natural scroll |
| Mobile | Awkward | Native feel |
| Progress visibility | Abstract nodes | Clear percentages |
| Course info | Hidden in sheet | Visible on cards |
| Learning curve | High | None |
| Accessibility | Poor | Good |
| Performance | Heavy SVG | Light cards |
| Gamification | Preserved | Enhanced |

---

## Optional: Keep Skill Tree as Alternative View

Could add a toggle to switch between:
- "Journey View" (default, card-based)
- "Classic View" (original skill tree)

This preserves the work done while making the default more accessible.

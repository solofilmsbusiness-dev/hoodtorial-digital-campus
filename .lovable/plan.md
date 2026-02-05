
# Redesign: Functional Degree Programs Page

## Problem Analysis

The current Degrees page has several issues:

1. **All three paths lead to nearly identical skill trees** - The associate, bachelor, and certificate paths share most of the same courses, just with different totals
2. **Certificate program is generic** - It doesn't offer department specializations despite claiming to be "focused specialization in one department"
3. **No persistence** - User's degree choice isn't saved anywhere in their profile
4. **Disconnected from Student Center** - Progress shown on degrees page doesn't reflect actual user data
5. **Static content** - The "Sample Progress" section shows hardcoded fake data instead of real user progress
6. **Requirements section only covers Bachelor's** - Doesn't dynamically update based on user's chosen path

---

## Solution Overview

Transform the Degrees page into a functional degree program selector that:

1. **Connects to user's profile** - Stores their selected degree path in the database
2. **Shows real progress** - Displays actual credits, courses, quizzes completed
3. **Makes Certificate meaningful** - Allows users to choose a department specialization
4. **Creates truly distinct paths** - Each degree has unique course requirements mapped to real courses
5. **Integrates with Student Center** - Shows degree progress on dashboard

---

## Database Changes

### Add to profiles table

```sql
ALTER TABLE public.profiles 
ADD COLUMN degree_path TEXT DEFAULT NULL,
ADD COLUMN certificate_department TEXT DEFAULT NULL;
```

| Column | Type | Purpose |
|--------|------|---------|
| degree_path | TEXT | 'associate', 'bachelor', or 'certificate' |
| certificate_department | TEXT | Department ID for certificate specialization (e.g., 'cinematography') |

---

## New Degree Structure

### Associate of Film (30 credits, 3-6 months)
- **6 courses**: Foundation courses from any 2 departments
- **6 quizzes**: One per course module
- **1 scenario exam**: Practical test
- **2 projects**: Hands-on assignments

### Bachelor of Film (60 credits, 6-12 months)  
- **14 courses**: All courses across all 4 departments
- **12+ quizzes**: All course quizzes
- **3 scenario exams**: One per skill level (100/200/300)
- **6 projects**: Major practical assignments
- **1 capstone**: Final short film

### Certificate (15 credits, 1-3 months)
- **User chooses ONE department** to specialize in
- **3-4 courses**: All courses within that department
- **3-4 quizzes**: Department-specific
- **1 project**: Department-focused practical

---

## Page Redesign

### Section 1: Hero with User Context (if logged in)

```text
+------------------------------------------+
|  EARN YOUR DEGREE                        |
|                                          |
|  [Current Path Badge if selected]        |
|  Your current progress: 45% complete     |
|  15/30 credits earned                    |
+------------------------------------------+
```

### Section 2: Degree Path Cards (Interactive)

```text
+-------------+  +-------------+  +-------------+
| ASSOCIATE   |  | BACHELOR    |  | CERTIFICATE |
|             |  | * Popular * |  |             |
| 30 credits  |  | 60 credits  |  | 15 credits  |
| 6 courses   |  | 14 courses  |  | Pick a Dept |
|             |  |             |  |             |
| [Details ▼] |  | [Details ▼] |  | [Details ▼] |
| [Start]     |  | [Start]     |  | [Choose]    |
+-------------+  +-------------+  +-------------+
```

### Section 3: Certificate Department Picker (Conditional)

When "Certificate" is selected, show department options:

```text
Choose Your Specialization:

[Cinematography]  [Post-Production]  [Directing]  [Production]
     Gold              Purple           Cyan         Pink
   4 courses          4 courses       3 courses    3 courses
```

### Section 4: Dynamic Requirements Breakdown

Shows requirements for the **selected** degree path (not just Bachelor's):

```text
WHAT IT TAKES TO GRADUATE (Associate of Film)

[6 Courses]  [6 Quizzes]  [1 Exam]  [2 Projects]  [Certificate]
```

### Section 5: Real User Progress (if logged in & path selected)

Replace hardcoded progress with actual data:

```text
YOUR PROGRESS

[=============>      ] 45%

Courses:  4/6   ████████░░░░
Quizzes:  3/6   ██████░░░░░░
Exams:    0/1   ░░░░░░░░░░░░
Projects: 1/2   █████░░░░░░░

Credits: 15/30
```

### Section 6: Graduation Benefits (keep existing)

---

## Component Architecture

### New/Modified Files

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/Degrees.tsx` | Major rewrite | Interactive degree selection |
| `src/hooks/useDegreeProgress.ts` | Create | Fetch/calculate progress for selected path |
| `src/hooks/useDegreeSelection.ts` | Create | Manage degree path selection in profile |
| `src/components/degrees/DegreePathCard.tsx` | Create | Interactive degree card with expand/select |
| `src/components/degrees/DepartmentPicker.tsx` | Create | Certificate specialization selector |
| `src/components/degrees/DegreeProgressSection.tsx` | Create | Real-time progress display |
| `src/components/degrees/index.ts` | Create | Barrel exports |

### Database Migration

Add columns to profiles table for persisting degree selection.

---

## User Flow

### New User (Not Logged In)
1. View degree options
2. Click "Start This Path" redirects to enrollment/auth
3. After signup, redirected back to select degree

### Logged In User (No Path Selected)
1. View degree options with interactive cards
2. Expand cards to see course requirements
3. Click "Choose This Path" to select
4. For Certificate: pick department first
5. Selection saved to profile
6. Redirected to skill tree for their path

### Logged In User (Path Selected)
1. See current path highlighted
2. View real progress data
3. "Continue Journey" button goes to skill tree
4. Option to "Change Path" (with confirmation if progress exists)

---

## Integration with Student Center

Add degree progress card to Student Center dashboard:

```text
+-----------------------------------+
| YOUR DEGREE TRACK                 |
|                                   |
| Bachelor of Film                  |
| [===========               ] 45%  |
|                                   |
| 28/60 credits                     |
| [View Skill Tree →]               |
+-----------------------------------+
```

---

## Technical Implementation Details

### useDegreeProgress Hook

```typescript
// Calculates progress based on:
// - enrollments (completed courses)
// - quiz_results (passed quizzes)
// - user_progress (for credits)
// Returns: { courses, quizzes, exams, projects, credits, percentage }
```

### useDegreeSelection Hook

```typescript
// - getDegreeSelection(): { path, department }
// - setDegreeSelection(path, department?): Promise
// - Uses profile context
```

### Certificate Courses by Department

```text
Cinematography: HU-101, HU-102, HU-201, HU-301 (17 credits)
Post-Production: HU-103, HU-104, HU-202, HU-302 (16 credits)
Directing: HU-105, HU-203, HU-303 (13 credits)
Production: HU-106, HU-204, HU-304 (12 credits)
```

---

## Visual Design

- Maintain brutalist aesthetic with gold/neon accents
- Selected degree card has gold border glow
- Certificate departments use their department colors
- Progress bars match course completion style in Student Center
- Animations for card expansion and selection

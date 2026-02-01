

# Entry Assessment Test Implementation

## Overview
Create a comprehensive onboarding assessment that evaluates new students' existing knowledge across filmmaking disciplines and their areas of interest. Based on results, the system will recommend personalized course paths.

---

## Flow Structure

```text
Step 1: Interest Selection
- Student selects 2-3 areas they want to focus on
- Options: Cinematography, Post-Production, Directing, Production, Photography, Camera Systems

Step 2: Experience Level
- Complete beginner, hobbyist, semi-professional, professional

Step 3: Knowledge Assessment (25-30 questions)
- Questions from each department based on selected interests
- Mix of beginner to intermediate difficulty
- Adaptive weighting based on interest selections

Step 4: Results & Recommendations
- Score breakdown by department
- Personalized course recommendations
- Suggested starting path
```

---

## What Will Be Built

### New Page: Entry Assessment
**Route:** `/assessment`

A multi-step assessment wizard with:
- Interest selection cards for each department
- Experience level selector
- Timed quiz section with progress tracking
- Results dashboard with department scores
- Recommended courses list with "Enroll" buttons

### Assessment Quiz Questions
**New File:** `src/data/quizzes/assessment.ts`

- 50+ placement questions across all departments
- Mix of difficulties to gauge knowledge level
- Questions tagged by department and difficulty

### Database Table: Assessment Results
Store completed assessments with:
- User ID
- Selected interests (array)
- Experience level
- Scores per department
- Recommended courses
- Completion timestamp

### Integration Points
- After sign-up, redirect new users to `/assessment`
- Link from Student Center for retaking
- Course recommendations shown on dashboard

---

## User Experience

### Step 1: Welcome & Interests
Large visual cards for each department (Cinematography, Post-Production, Directing, Production, Photography, Camera Systems). Students select 2-3 that interest them most. Each card shows the department icon, name, and brief tagline.

### Step 2: Experience Level
Four options presented as styled cards:
- **Complete Beginner** - Never touched a camera
- **Hobbyist** - Made videos for fun
- **Semi-Professional** - Paid work experience
- **Professional** - Full-time filmmaker

### Step 3: Assessment Questions
- 25-30 questions total
- 5-6 questions per selected interest area
- Progress bar showing completion
- Timer tracking time taken
- Questions weighted by interests

### Step 4: Results Dashboard
- Overall readiness score (percentage)
- Radar chart showing strengths per department
- Top 3-5 recommended courses with brief descriptions
- "Start Your Journey" button leading to first recommended course
- Option to retake assessment

---

## Technical Implementation

### Files to Create

**src/pages/Assessment.tsx**
- Multi-step wizard component
- State management for steps, answers, and timing
- Interest selection with checkbox-style cards
- Quiz player adapted for assessment format
- Results view with recommendations engine

**src/data/quizzes/assessment.ts**
- 50+ assessment questions across departments
- Structure: `{ id, question, options, correctAnswer, department, difficulty }`
- Beginner and intermediate level questions

**src/hooks/useAssessmentResults.ts**
- Fetch user's assessment history
- Save new assessment results
- Calculate recommendations based on scores

**src/components/assessment/InterestCard.tsx**
- Selectable card component for department interests
- Shows icon, name, tagline
- Visual selected state

**src/components/assessment/ResultsChart.tsx**
- Radar/bar chart showing department scores
- Visual representation of strengths/weaknesses

### Files to Modify

**src/App.tsx**
- Add route for `/assessment`

**src/pages/Auth.tsx**
- After sign-up success, redirect to `/assessment` instead of `/student/profile`
- Check if user has completed assessment

**src/pages/StudentCenter.tsx**
- Show recommended courses section if assessment completed
- Add "Retake Assessment" link

### Database Migration

New table: `assessment_results`
```sql
CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interests TEXT[] NOT NULL,
  experience_level TEXT NOT NULL,
  department_scores JSONB NOT NULL,
  recommended_courses TEXT[] NOT NULL,
  total_score INTEGER NOT NULL,
  time_taken_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own results"
  ON assessment_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own results"
  ON assessment_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Recommendation Algorithm

```text
1. Score each department based on correct answers
2. Weight scores by selected interests (1.5x multiplier)
3. Filter courses by:
   - Departments matching interests
   - Difficulty level based on scores
4. Rank courses by relevance score
5. Return top 5-7 recommendations
```

**Score thresholds:**
- 0-40%: Recommend beginner courses
- 41-70%: Recommend beginner + some intermediate
- 71-100%: Skip beginner, start with intermediate

---

## Question Distribution

### Assessment Questions (50 total)

**Cinematography (10 questions)**
- Frame rates and resolution (beginner)
- Composition rules (beginner)
- Camera movement techniques (intermediate)
- Lens selection psychology (intermediate)

**Post-Production (8 questions)**
- Basic editing cuts (beginner)
- Timeline workflow (beginner)
- Color grading basics (intermediate)
- Sound design principles (intermediate)

**Directing (8 questions)**
- Story structure fundamentals (beginner)
- Working with actors (beginner)
- Shot planning (intermediate)
- Visual storytelling (intermediate)

**Production (8 questions)**
- Pre-production basics (beginner)
- Budgeting concepts (beginner)
- Scheduling (intermediate)
- Team management (intermediate)

**Photography (8 questions)**
- Exposure triangle (beginner)
- Composition (beginner)
- Lighting basics (intermediate)
- Portrait techniques (intermediate)

**Camera Systems (8 questions)**
- Camera types (beginner)
- Codec basics (beginner)
- Log profiles (intermediate)
- Lens adaptation (intermediate)

---

## Visual Design

### Interest Selection Cards
- 2-column grid on mobile, 3-column on desktop
- Department icon prominently displayed
- Checkbox indicator when selected
- Border highlight on selection (department color)
- Minimum 2, maximum 3 selections enforced

### Quiz Interface
- Clean, focused question display
- Large answer buttons
- Progress bar at top
- Question counter
- Subtle timer display

### Results Dashboard
- Celebratory header with overall score
- Department breakdown bars or radar chart
- Course recommendation cards with thumbnails
- Clear call-to-action buttons


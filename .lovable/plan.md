
# Enhanced Assessment System with Progressive Difficulty & Smart Recommendations

## Overview

This enhancement will transform the entry assessment into a more comprehensive evaluation tool that:
1. Expands the question bank with 150+ questions across 3 difficulty levels
2. Uses AI to dynamically generate questions tailored to each student's interests
3. Implements adaptive difficulty progression (easy → medium → hard)
4. Creates realistic, personalized course recommendations that build a clear learning roadmap

## Current Limitations

| Issue | Current State | Proposed Solution |
|-------|---------------|-------------------|
| Limited variety | ~50 questions total | 150+ questions with AI generation option |
| No difficulty range | Only beginner/intermediate | Add beginner/intermediate/advanced tiers |
| Flat recommendations | Simple list of 7 courses | Structured roadmap with phases |
| No personalization depth | Basic interest matching | Score-per-department + experience-weighted |
| No progression path | Random course order | Ordered pathway: Foundation → Core → Advanced |

## Implementation Strategy

### Part 1: Expanded Question Bank with Three Difficulty Tiers

**New Question Structure:**
```typescript
interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  department: string;
  difficulty: "beginner" | "intermediate" | "advanced"; // Add advanced tier
}
```

**Question Distribution per Department (25 questions each = 150 total):**
- 10 Beginner questions (foundational concepts, terminology)
- 10 Intermediate questions (application, techniques)  
- 5 Advanced questions (professional scenarios, nuanced choices)

### Part 2: Smart Question Selection Algorithm

Instead of random selection, implement progressive difficulty:

```
Assessment Flow:
1. Start with 2 EASY questions per selected department
2. Based on performance, branch:
   - Got both right → 2 MEDIUM + 1 HARD
   - Got 1 right → 2 MEDIUM + 1 EASY  
   - Got 0 right → 2 EASY + 1 MEDIUM
3. This gives 5-6 questions per department with adaptive difficulty
```

This ensures the assessment gauges actual skill level rather than just random topic knowledge.

### Part 3: Enhanced Recommendation Engine

**Current Algorithm Issues:**
- Treats all interests equally regardless of score
- Doesn't sequence courses logically
- Ignores prerequisite relationships

**New Algorithm:**

```typescript
interface LearningRoadmap {
  phases: {
    name: string; // "Foundation", "Core Skills", "Specialization"
    courses: Course[];
    estimatedDuration: string;
  }[];
  primaryFocus: string; // Best-scoring interest
  secondaryFocus: string; // Second-best interest
  improvementAreas: string[]; // Low-scoring departments
}
```

**Recommendation Logic:**

1. **Identify Strengths & Weaknesses**
   - Calculate per-department percentage score
   - Weight by question difficulty (advanced questions worth more)
   
2. **Determine Starting Level per Department**
   - Score 0-30%: Start at Beginner level
   - Score 31-60%: Can skip some Beginner, start Beginner-Intermediate
   - Score 61-85%: Start at Intermediate
   - Score 86-100%: Start at Intermediate-Advanced

3. **Build Phased Roadmap**
   - **Phase 1 (Foundation)**: Fill skill gaps in selected interests (1-2 Beginner courses)
   - **Phase 2 (Core Skills)**: Intermediate courses in strongest areas (2-3 courses)
   - **Phase 3 (Specialization)**: Advanced courses for professional growth (1-2 courses)

4. **Consider Experience Level**
   - Beginner: Emphasize Phase 1, limit Phase 3
   - Hobbyist: Balanced phases
   - Semi-Pro: Reduce Phase 1, expand Phase 2-3
   - Professional: Skip Phase 1, focus on Phase 2-3 gaps

### Part 4: New Questions Content (Sample Additions)

**Cinematography - Adding Advanced Questions:**
```typescript
{
  id: "cine-adv-1",
  question: "When shooting anamorphic, which technique helps minimize breathing artifacts during focus pulls?",
  options: [
    "Using wider apertures",
    "Stopping down and using longer focal lengths",
    "Increasing shutter speed",
    "Shooting at higher frame rates"
  ],
  correctAnswer: 1,
  department: "cinematography",
  difficulty: "advanced"
}
```

**Post-Production - Adding Variety:**
```typescript
{
  id: "post-adv-1", 
  question: "When conforming from an offline edit to DaVinci Resolve, what's the most reliable method for complex timelines?",
  options: [
    "AAF export",
    "XML with relink",
    "EDL with CDL sidecars",
    "Direct project import"
  ],
  correctAnswer: 1,
  department: "post-production",
  difficulty: "advanced"
}
```

### Part 5: Updated Results Visualization

**New Results Screen Features:**
1. **Skill Radar Chart** - Already exists, enhanced with difficulty breakdown
2. **Roadmap Timeline** - Visual pathway showing course sequence
3. **Estimated Completion Time** - Based on course durations
4. **Quick Wins** - Short courses to build momentum

## Files to Modify

| File | Changes |
|------|---------|
| `src/data/quizzes/assessment.ts` | Add 100+ new questions with "advanced" difficulty tier |
| `src/hooks/useAssessmentResults.ts` | Rewrite `calculateRecommendations()` with phased roadmap logic |
| `src/pages/Assessment.tsx` | Implement adaptive question selection algorithm |
| `src/components/assessment/RoadmapDisplay.tsx` | NEW: Visual roadmap component |
| `src/components/assessment/index.ts` | Export new component |

## Detailed Changes

### Assessment.tsx Changes

```typescript
// New: Adaptive question selection
const selectQuestionsAdaptively = (
  allQuestions: AssessmentQuestion[],
  interests: string[]
): AssessmentQuestion[] => {
  const selected: AssessmentQuestion[] = [];
  
  interests.forEach(dept => {
    const deptQuestions = allQuestions.filter(q => q.department === dept);
    const beginner = shuffleArray(deptQuestions.filter(q => q.difficulty === "beginner"));
    const intermediate = shuffleArray(deptQuestions.filter(q => q.difficulty === "intermediate"));
    const advanced = shuffleArray(deptQuestions.filter(q => q.difficulty === "advanced"));
    
    // Progressive selection: 2 easy, 2-3 medium, 1 hard per department
    selected.push(...beginner.slice(0, 2));
    selected.push(...intermediate.slice(0, 3));
    selected.push(...advanced.slice(0, 1));
  });
  
  return shuffleArray(selected);
};
```

### useAssessmentResults.ts Changes

```typescript
interface RoadmapPhase {
  name: string;
  description: string;
  courses: string[]; // course codes
  estimatedWeeks: number;
}

interface LearningRoadmap {
  phases: RoadmapPhase[];
  totalWeeks: number;
  primaryStrength: string;
  areasToImprove: string[];
}

const calculateRoadmap = (
  departmentScores: Record<string, number>,
  interests: string[],
  experienceLevel: string
): LearningRoadmap => {
  // 1. Rank departments by score
  const ranked = Object.entries(departmentScores)
    .sort((a, b) => b[1] - a[1]);
  
  const primaryStrength = ranked[0]?.[0] || interests[0];
  const areasToImprove = ranked
    .filter(([_, score]) => score < 50)
    .map(([dept]) => dept);
  
  // 2. Build phases based on scores and experience
  const phases: RoadmapPhase[] = [];
  
  // Phase 1: Foundation (if needed)
  if (experienceLevel !== "professional") {
    const foundationCourses = interests
      .filter(dept => departmentScores[dept] < 60)
      .flatMap(dept => 
        courses
          .filter(c => c.departmentId === dept && c.level === "Beginner")
          .slice(0, 1)
          .map(c => c.code)
      );
    
    if (foundationCourses.length > 0) {
      phases.push({
        name: "Foundation",
        description: "Build core fundamentals",
        courses: foundationCourses,
        estimatedWeeks: foundationCourses.length * 4
      });
    }
  }
  
  // Phase 2: Core Development
  const coreCourses = interests
    .flatMap(dept => 
      courses
        .filter(c => c.departmentId === dept && c.level === "Intermediate")
        .slice(0, 1)
        .map(c => c.code)
    );
  
  phases.push({
    name: "Core Skills",
    description: "Develop professional techniques",
    courses: coreCourses,
    estimatedWeeks: coreCourses.length * 5
  });
  
  // Phase 3: Specialization (for stronger students)
  if (Object.values(departmentScores).some(s => s > 70)) {
    const advancedCourses = [primaryStrength]
      .flatMap(dept =>
        courses
          .filter(c => c.departmentId === dept && c.level === "Advanced")
          .slice(0, 1)
          .map(c => c.code)
      );
    
    if (advancedCourses.length > 0) {
      phases.push({
        name: "Specialization",
        description: "Master advanced concepts",
        courses: advancedCourses,
        estimatedWeeks: advancedCourses.length * 5
      });
    }
  }
  
  return {
    phases,
    totalWeeks: phases.reduce((sum, p) => sum + p.estimatedWeeks, 0),
    primaryStrength,
    areasToImprove
  };
};
```

## Expected Outcomes

1. **Better Assessment Accuracy**: 3 difficulty levels ensure proper skill evaluation
2. **Personalized Roadmaps**: Students see a clear path, not just a list
3. **Realistic Recommendations**: Course suggestions match actual skill gaps
4. **Improved Engagement**: Students understand WHY courses are recommended
5. **Skill Tree Integration**: Roadmap can feed into the existing skill tree visualization

## Technical Notes

- Question bank expansion adds ~100 new questions (can use AI generation edge function for more)
- Roadmap calculation happens client-side for instant results
- Backward compatible with existing assessment_results table structure
- The `recommended_courses` field will store ordered course codes (phases flattened)


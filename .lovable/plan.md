

# Unified Onboarding Journey: Assessment + Degree Path Integration

## Current State Analysis

Right now, there are **three disconnected systems**:

1. **Assessment** - Users take an entry quiz that evaluates their skills across departments and generates a "Learning Roadmap" with Foundation, Core Skills, and Specialization phases
2. **Degree Selection** - A completely separate page where users pick Associate, Bachelor, or Certificate paths
3. **Journey/Skill Tree** - Shows courses based on the degree path, but ignores assessment results entirely

**The disconnect:**
- Assessment recommends courses like HU-101, HU-102 based on skill gaps
- User picks Bachelor degree, which has its own fixed course list
- These two lists may conflict - assessment might say "start with Directing" but Bachelor starts everyone the same way
- Users feel like they did the assessment for nothing

---

## Solution: Unified Onboarding Flow

### New User Journey (Step-by-Step)

```text
Sign Up → Welcome → Assessment → Degree Path Recommendation → Journey View
                         ↓                    ↓
               (Evaluates skills)    (AI suggests best path)
                         ↓                    ↓
              Stores interests +    User confirms or changes
              department scores            path
                         ↓                    ↓
                   Personalized roadmap courses merge with
                   degree requirements for unified journey
```

### Key Integration Points

1. **Assessment results inform degree recommendation**
   - Experience level + total score suggests path:
     - Beginner + low score → Associate (foundations focus)
     - Intermediate + moderate score → Bachelor (full curriculum)
     - Professional + high in one area → Certificate (quick specialization)

2. **Primary interest becomes certificate department**
   - If user chooses Certificate, auto-suggest department based on their strongest assessment area

3. **Roadmap phases map to journey levels**
   - Foundation phase → Level 1 courses (prioritized)
   - Core Skills phase → Level 2 courses
   - Specialization phase → Level 3 courses

4. **Recommended course order influences journey**
   - Courses from assessment roadmap appear first within each level
   - Other courses still available but de-emphasized

---

## Database Changes

### Add to profiles table

```sql
ALTER TABLE public.profiles
ADD COLUMN recommended_degree_path TEXT DEFAULT NULL,
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
```

| Column | Purpose |
|--------|---------|
| recommended_degree_path | AI-suggested path based on assessment |
| onboarding_completed | Flag to track if user finished full onboarding |

---

## Component Changes

### 1. Assessment Results Page Redesign

After completing assessment, instead of showing generic "Start Your Journey" button, show:

```text
┌─────────────────────────────────────────────────────────────┐
│  YOUR PERSONALIZED DEGREE RECOMMENDATION                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Based on your assessment:                                  │
│  • Experience: Beginner                                     │
│  • Strongest Area: Cinematography (78%)                     │
│  • Overall Score: 62%                                       │
│                                                             │
│  We recommend:                                              │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ★ ASSOCIATE OF FILM                                   │  │
│  │                                                       │  │
│  │ Perfect for building strong foundations before        │  │
│  │ advancing to specialized courses.                     │  │
│  │                                                       │  │
│  │ • 6 courses tailored to your skill gaps               │  │
│  │ • 3-6 months to complete                              │  │
│  │ • Start with: Cinematography (your strength!)         │  │
│  │                                                       │  │
│  │ [Choose This Path]                                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Or explore other options:                                  │
│  [Bachelor of Film]  [Certificate in Cinematography]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Assessment Page Flow Update

Add a new step after "results":
- `step: "welcome" | "interests" | "experience" | "quiz" | "results" | "degree-recommendation" | "review"`

The "degree-recommendation" step:
- Shows assessment summary
- Displays AI-recommended degree path
- Explains why this path fits their profile
- Lets user confirm or choose different path
- On confirm: saves to profile and redirects to Journey View

### 3. New Component: DegreeRecommendation

`src/components/assessment/DegreeRecommendation.tsx`

Props:
- `assessmentResult` - scores, interests, experience level
- `onSelectPath` - callback when user picks a path
- `onSkip` - callback to skip and explore manually

Logic to determine recommendation:
```typescript
function getRecommendedPath(
  totalScore: number,
  experienceLevel: string,
  primaryStrength: string,
  strengthScore: number
): { path: DegreePath; reason: string; department?: CertificateDepartment } {
  // Professional with 70%+ in one area → Certificate
  if (experienceLevel === "professional" && strengthScore >= 70) {
    return {
      path: "certificate",
      department: primaryStrength as CertificateDepartment,
      reason: "You already have strong skills. A focused certificate will add credentials quickly.",
    };
  }
  
  // Semi-pro or intermediate with 50%+ overall → Bachelor
  if (
    (experienceLevel === "semi-professional" || experienceLevel === "intermediate") &&
    totalScore >= 50
  ) {
    return {
      path: "bachelor",
      reason: "You have a solid foundation. The full Bachelor program will take you to mastery.",
    };
  }
  
  // Default: Associate for everyone else
  return {
    path: "associate",
    reason: "Build a strong foundation first. You can always upgrade to Bachelor later.",
  };
}
```

### 4. Journey View Enhancement

Update `useJourneyData.ts` to:
- Accept optional `recommendedCourses` from assessment
- Prioritize those courses within each level
- Add visual indicator for "AI Recommended" courses

```text
Level 1: Foundations
┌──────────────────────┐  ┌──────────────────────┐
│ ★ HU-101            │  │ HU-102               │
│ Cinematography      │  │ Lighting             │
│ ✨ Recommended      │  │                      │
│ for you             │  │                      │
└──────────────────────┘  └──────────────────────┘
```

### 5. Student Center Integration

Add unified progress card showing:
- Degree path name
- Assessment-based starting point
- Current progress
- Next recommended course

```text
┌─────────────────────────────────────────────────────────┐
│ YOUR LEARNING JOURNEY                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Bachelor of Film                    Level 2 / 3        │
│ ████████████████░░░░░░░░░░░░░░░░░░  45%               │
│                                                         │
│ Primary Focus: Cinematography                           │
│ Areas to Improve: Post-Production                       │
│                                                         │
│ Next Recommended: HU-202 Advanced Editing               │
│                                                         │
│ [Continue Journey →]                                    │
└─────────────────────────────────────────────────────────┘
```

---

## Updated Onboarding Flow

### Route Guard Update

Modify `AssessmentRequiredRoute` to also check for degree path:

```typescript
// Current: Only checks hasCompletedAssessment
// New: Check both assessment AND degree selection
if (!hasCompletedAssessment) {
  return <Navigate to="/assessment" />;
}
if (!profile?.degree_path && !profile?.onboarding_completed) {
  // They finished assessment but skipped degree selection
  // Assessment page will show degree recommendation step
  return <Navigate to="/assessment?step=degree-recommendation" />;
}
```

### Assessment Page Query Params

Support `?step=degree-recommendation` to jump directly to that step for users who completed assessment but not degree selection.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/assessment/DegreeRecommendation.tsx` | AI degree suggestion component |
| `src/components/assessment/OnboardingProgress.tsx` | Unified step indicator |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Assessment.tsx` | Add degree-recommendation step, update flow |
| `src/hooks/useAssessmentResults.ts` | Add `getRecommendedDegreePath()` function |
| `src/hooks/useJourneyData.ts` | Accept/prioritize recommended courses |
| `src/components/auth/AssessmentRequiredRoute.tsx` | Check degree path selection |
| `src/pages/StudentCenter.tsx` | Add unified journey progress card |
| `src/pages/Degrees.tsx` | Show assessment-based recommendation if available |
| `src/components/assessment/index.ts` | Export new components |

## Database Migration

Add columns to track recommendation and onboarding completion.

---

## User Experience Flow Summary

### New User (Complete Flow)

1. **Sign up** → Auth page
2. **Redirected to Assessment** → "Welcome to Your Assessment"
3. **Select interests** → Pick 2-3 departments
4. **Select experience** → Beginner/Intermediate/etc
5. **Take quiz** → 60 sec/question, adaptive difficulty
6. **View results** → Scores, strengths, weaknesses
7. **NEW: Degree Recommendation** → AI suggests path based on results
8. **Confirm or change** → User picks their path
9. **Redirected to Journey** → See personalized roadmap with their courses

### Returning User (Already Has Assessment)

1. **Login** → Redirected to Student Center
2. **See unified journey card** → Shows degree + assessment insights together
3. **Click "Continue Journey"** → Goes to Journey View with recommended courses highlighted

---

## Visual Design Notes

- Assessment-recommended courses get a subtle sparkle icon
- Degree recommendation card uses primary gold gradient
- Onboarding progress bar persists across Assessment and Degree pages
- Journey header shows both degree info AND primary strength from assessment

---

## Technical Notes

- Store `recommended_degree_path` separate from `degree_path` so we can track if user took our suggestion
- `onboarding_completed` flag prevents redirect loops
- Assessment results already stored in `assessment_results` table - we just need to use them more
- Roadmap phases from assessment can be persisted or recalculated on-the-fly


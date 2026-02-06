
# Admin Quick Navigation + Student Assessment Details

## 1. Quick "Back to Site" Links in Admin Header

Add a dropdown menu in the admin header bar (next to the command palette) with direct links to key student-facing pages:

**File: `src/components/admin/AdminLayout.tsx`**
- Add a dropdown button (e.g., "View Site" with an ExternalLink icon) in the header toolbar area
- Links to: Home (/), Courses (/academics), Community (/community), Student Center (/student), Shop (/shop)
- Opens in same tab so admin can quickly check the student experience

## 2. Expanded Assessment Data in Student Detail Sheet

Currently the admin can only see experience level, total score, and interests. This will be expanded to show the full assessment picture.

### Data Changes

**File: `src/hooks/useAdminStudents.ts`**
- Expand the `assessment_results` query in `useStudentDetails` to fetch all columns: `department_scores`, `recommended_courses`, `time_taken_seconds`, `created_at`, `completed_at`
- Update the `AssessmentResult` interface to include these new fields
- Update the `StudentDetails` mapping to pass this data through

### UI Changes

**File: `src/components/admin/StudentDetailSheet.tsx`**

Replace the minimal assessment section with a rich, expandable view showing:

- **Department Scores**: A visual breakdown of scores per department (e.g., Cinematography: 75%, Directing: 45%) using small progress bars
- **Recommended Courses**: List of course codes the assessment recommended
- **Time Taken**: How long the student spent on the assessment
- **Completion Date**: When they finished
- **Experience Level + Interests**: Already shown, kept as-is

All within the existing "Assessment Results" section, no new pages needed.

## Technical Details

### Updated `AssessmentResult` interface (in `useAdminStudents.ts`):
```typescript
export interface AssessmentResult {
  experienceLevel: string;
  interests: string[];
  totalScore: number;
  departmentScores: Record<string, number>;
  recommendedCourses: string[];
  timeTakenSeconds: number | null;
  completedAt: string | null;
}
```

### Updated query (line ~245):
Change from:
```typescript
.select("experience_level, interests, total_score")
```
To:
```typescript
.select("*")
```

### Assessment UI in StudentDetailSheet:
- Department scores shown as labeled progress bars sorted highest to lowest
- Recommended courses as a row of Badge components
- Time taken formatted as "X min Y sec"
- Assessment date formatted nicely

## Files Summary

| File | Change |
|------|--------|
| `src/components/admin/AdminLayout.tsx` | Add "View Site" dropdown with links to student pages |
| `src/hooks/useAdminStudents.ts` | Expand assessment query + update interface |
| `src/components/admin/StudentDetailSheet.tsx` | Rich assessment details UI with department scores, recommendations, timing |

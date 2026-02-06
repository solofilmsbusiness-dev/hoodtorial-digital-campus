

# Make Skill Tree Levels and Progression Flow Logically

## Problem

The Learning Journey uses generic level names ("Foundations", "Intermediate", "Advanced") and rank titles ("Newcomer", "Apprentice", etc.) that don't match the academic structure of a film school. The naming should reflect traditional academic years and make sense for each degree path.

## Changes

### 1. Academic-Year Level Names Per Degree Path

Update level naming in `src/hooks/useJourneyData.ts` to use contextually appropriate names:

| Degree Path | Level 100 | Level 200 | Level 300 |
|-------------|-----------|-----------|-----------|
| **Associate** | Freshman | Sophomore | -- (no 300-level courses) |
| **Bachelor** | Freshman | Sophomore | Senior |
| **Certificate** | Core Studies | -- | -- (only 100/200 courses) |

### 2. Academic Rank Titles

Update the `getRank()` function in `useJourneyData.ts` to use film-school-appropriate academic ranks:

| Progress | Current | New |
|----------|---------|-----|
| 0% | NEWCOMER | FRESHMAN |
| 10% | APPRENTICE | SOPHOMORE |
| 20% | JUNIOR FILMMAKER | JUNIOR |
| 40% | ASSOCIATE PRODUCER | SENIOR |
| 60% | LEAD CREATIVE | HONORS STUDENT |
| 80% | SENIOR DIRECTOR | DEAN'S LIST |
| 100% | MASTER FILMMAKER | GRADUATE |

### 3. Header Level Name Sync

Update the `levelNames` array in `src/components/journey/JourneyHeader.tsx` to dynamically derive level labels from the `pathName` prop rather than a hardcoded array. Pass the actual level names from the journey data so the header stays in sync.

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useJourneyData.ts` | Update level name configs per path and rank titles |
| `src/components/journey/JourneyHeader.tsx` | Accept dynamic level name from journey data |
| `src/components/journey/JourneyView.tsx` | Pass current level name to header |

## Technical Details

**useJourneyData.ts** -- Replace the static `levelConfigs` block (line 228) with a path-aware mapping:

```typescript
const levelNamesByPath: Record<DegreePath, Record<number, string>> = {
  associate: { 1: "Freshman", 2: "Sophomore" },
  bachelor:  { 1: "Freshman", 2: "Sophomore", 3: "Senior" },
  certificate: { 1: "Core Studies", 2: "Specialization" },
};
```

Use `levelNamesByPath[path][levelConfig.number]` when building each level object.

Update `getRank()`:

```typescript
function getRank(percentage: number): string {
  if (percentage >= 100) return "GRADUATE";
  if (percentage >= 80) return "DEAN'S LIST";
  if (percentage >= 60) return "HONORS STUDENT";
  if (percentage >= 40) return "SENIOR";
  if (percentage >= 20) return "JUNIOR";
  if (percentage >= 10) return "SOPHOMORE";
  return "FRESHMAN";
}
```

**JourneyView.tsx** -- Compute `currentLevelName` from `levels` and pass it to `JourneyHeader`:

```typescript
const currentLevelName = levels.find(l => l.status !== "complete")?.name || "Graduate";
```

**JourneyHeader.tsx** -- Accept a `currentLevelName` prop and display it instead of looking up from a hardcoded array.


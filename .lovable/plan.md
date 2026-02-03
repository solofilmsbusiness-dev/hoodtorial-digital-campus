
# Cheat-Proof Quiz System

## Overview
Make quizzes and assessments cheat-resistant by implementing time limits, question randomization, and answer order randomization. This prevents students from sharing answers or taking unlimited time to look up answers.

---

## Current State
- Quizzes track elapsed time but have no enforced time limit
- Questions are served in a fixed order defined in `src/data/quizzes/*.ts`
- Answer options are in a fixed order per question
- Students could share exact answers by position (e.g., "Q1=B, Q2=A, Q3=C")

---

## Anti-Cheat Features to Implement

### 1. Countdown Timer with Auto-Submit
- Add a configurable time limit per quiz (in minutes)
- Display countdown timer instead of elapsed time
- Visual warning when time is running low (red, flashing)
- Auto-submit quiz when time expires
- Store time limit in Quiz interface

### 2. Question Randomization
- Shuffle question order at quiz start
- Each student gets questions in a different sequence
- Prevents "Q1 is B" type answer sharing

### 3. Answer Option Randomization
- Shuffle the order of answer options for each question
- Track the shuffled mapping to correctly grade
- Store original correct answer index, but display shuffled options
- Prevents "the second option is correct" sharing

### 4. Anti-Tab-Switching Warning (Optional Enhancement)
- Detect when user leaves the quiz tab
- Show warning on return
- Log tab switches for admin review

---

## Implementation Details

### Phase 1: Update Quiz Interface

**Modify `src/data/courses.ts`:**

```typescript
export interface Quiz {
  id: string;
  title: string;
  questions: number;
  passingScore: number;
  timeLimitMinutes?: number; // NEW: Time limit in minutes (default: 1 min per question)
}
```

### Phase 2: Randomization Utilities

**Create `src/lib/quizUtils.ts`:**

```typescript
// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[], seed?: number): T[] { ... }

// Shuffle questions for a quiz
function getRandomizedQuestions(questions: QuizQuestion[]): QuizQuestion[] { ... }

// Shuffle answer options and track correct answer mapping
interface ShuffledQuestion {
  ...originalQuestion,
  shuffledOptions: string[];
  shuffledCorrectAnswer: number; // New index after shuffle
}

function shuffleQuestionOptions(question: QuizQuestion): ShuffledQuestion { ... }
```

### Phase 3: Quiz Player Timer Enhancement

**Modify `src/components/course/QuizPlayer.tsx`:**

```text
Current Timer Display:
+------------------------------------------+
| Q 3/10                         Time: 2:34 |
+------------------------------------------+

New Countdown Timer:
+------------------------------------------+
| Q 3/10               Time Remaining: 7:26 |
+------------------------------------------+

Warning State (< 2 mins left):
+------------------------------------------+
| Q 3/10        ⚠️ Time Remaining: 1:45    |
|              (red text, subtle pulse)     |
+------------------------------------------+

Expired State:
+------------------------------------------+
|          TIME'S UP!                       |
|    Your quiz has been auto-submitted      |
+------------------------------------------+
```

**Key Changes:**
- Replace `elapsedTime` with `remainingTime` countdown
- Add `timeLimit` calculation (from quiz data or default)
- Auto-submit when timer reaches 0
- Warning state when < 2 minutes remain
- Disable "Check Answer" during timed quizzes (no peeking at correct answers)

### Phase 4: Integrate Randomization into Quiz Player

**Flow:**
1. On quiz start, shuffle questions array
2. For each question, shuffle its options
3. Track shuffled correct answer index
4. Grade using shuffled mappings
5. Store original question IDs and user's selections (unmapped) in database

---

## UI Wireframe: Updated Quiz Intro

```text
+--------------------------------------------------+
|                    [Trophy Icon]                  |
|                                                   |
|           LIGHTING BASICS QUIZ                    |
|                                                   |
|   Test your knowledge with 6 questions.           |
|   You need 80% to pass.                          |
|                                                   |
|   +------------+  +------------+  +------------+ |
|   |     6      |  |    80%     |  |   6 min    | |
|   | Questions  |  |  To Pass   |  | Time Limit | |
|   +------------+  +------------+  +------------+ |
|                                                   |
|   ⚠️ Note: Questions and answers are randomized  |
|   to ensure assessment integrity.                 |
|                                                   |
|   [Cancel]                    [Start Quiz]        |
+--------------------------------------------------+
```

---

## Default Time Limits

| Quiz Type | Default Time | Calculation |
|-----------|--------------|-------------|
| Module Quiz (5-8 Q) | 1 min per question | 5-8 minutes total |
| Final Exam (20-35 Q) | 1 min per question | 20-35 minutes total |
| Assessment | 45 seconds per question | ~12-18 minutes |

Admins can override per-quiz in the course data.

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/lib/quizUtils.ts` | Create | Randomization utilities |
| `src/data/courses.ts` | Modify | Add `timeLimitMinutes` to Quiz interface |
| `src/components/course/QuizPlayer.tsx` | Major Edit | Timer countdown, randomization, auto-submit |
| `src/pages/Assessment.tsx` | Modify | Add countdown timer and randomization |
| `src/data/quizzes/*.ts` | Optional | Add explicit time limits per quiz |

---

## Grading with Randomization

**Important:** Store answers referencing original question IDs:

```typescript
// When saving to database
const answersToSave = questions.map((originalQ, originalIndex) => {
  const shuffledQ = shuffledQuestions.find(sq => sq.id === originalQ.id);
  const userSelectedShuffledIndex = userAnswers[shuffledQ.id];
  
  // Map back to original option index
  const originalOptionIndex = shuffledQ.optionMapping[userSelectedShuffledIndex];
  
  return {
    questionId: originalQ.id,
    selectedAnswer: originalOptionIndex, // Store in original order
    isCorrect: originalOptionIndex === originalQ.correctAnswer,
  };
});
```

This ensures:
- Admin review shows consistent question/answer references
- Historical data remains comparable
- No confusion between shuffled vs. original positions

---

## Edge Cases

1. **Browser crash/refresh**: Quiz progress is lost (by design - prevents cheating)
2. **Tab switching**: Show warning but don't penalize (accessibility concerns)
3. **Time expires mid-question**: Auto-submit with current answers
4. **No answers given**: Submit as 0% score

---

## Summary

This implementation makes quizzes significantly more cheat-resistant by:

1. **Time Pressure**: Countdown timer prevents unlimited research time
2. **Question Shuffle**: Each student sees questions in random order
3. **Answer Shuffle**: Option positions are randomized per question
4. **Fair Grading**: Answers mapped back to original positions for consistent grading
5. **Auto-Submit**: Time expiration triggers automatic submission

Students cannot simply share "Q1=B, Q2=C" as every quiz session has unique ordering.

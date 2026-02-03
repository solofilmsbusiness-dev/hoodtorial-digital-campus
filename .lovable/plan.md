
# Fix Test Mode Quiz Behavior

## Problem
Currently, when Test Mode is active with "Auto-Pass Quizzes" enabled:
- The `saveQuizResult` function **overrides** the actual quiz score to force a pass
- This means even if you answer questions incorrectly, your result is changed to 100%
- The admin cannot test the real quiz experience

The user wants Test Mode to give **full access** to all content while still allowing them to **take quizzes normally** (answer questions, see real scores, experience the quiz flow as a student would).

## Current Behavior

```text
Admin takes quiz → Answers 5/10 correctly → saveQuizResult called
        ↓
shouldAutoPassQuiz = true
        ↓
Score overridden: { passed: true, score: 10 } ← WRONG!
        ↓
Admin sees 100% but actually got 50%
```

## Desired Behavior

```text
Admin takes quiz → Answers 5/10 correctly → saveQuizResult called
        ↓
shouldAutoPassQuiz = true (but only for instant-pass buttons)
        ↓
Actual score saved: { passed: false, score: 5 }
        ↓
Admin sees real 50% result
        ↓
Test Mode unlocks next content anyway (no blocking)
```

---

## Solution

### Step 1: Separate "Instant Pass" from "Regular Quiz"
The `shouldAutoPassQuiz` flag should **only** affect the instant-pass buttons, not the normal quiz-taking flow.

**Edit: `src/hooks/useQuizResults.ts`**
- Remove the auto-pass override from `saveQuizResult`
- Keep `shouldAutoPassQuiz` for the `instantPassQuiz` function only
- Save actual quiz results when admin takes a quiz normally

### Step 2: Test Mode Unlocks Content Regardless of Quiz Result
In Test Mode, content should be unlocked regardless of whether quizzes are passed.

**Edit: `src/hooks/useLessonProgress.ts`**
- Already handles this with `isTestModeEnabled` check in `isContentUnlocked`
- Verify `isQuizPassed` still shows real pass/fail status for display

### Step 3: Remove Attempt Limit in Test Mode (Already Done)
- The `getAttemptCount` already returns 0 in test mode, allowing unlimited retries

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useQuizResults.ts` | Remove auto-pass override from `saveQuizResult()` - save actual results |

---

## Technical Details

### Current `saveQuizResult` (lines 59-62):
```typescript
// In test mode with auto-pass, override the passed status
const finalResult = shouldAutoPassQuiz
  ? { ...result, passed: true, score: result.total_questions }
  : result;
```

### Fixed `saveQuizResult`:
```typescript
// Always save actual results - auto-pass is only for instant buttons
const finalResult = result;
```

The `instantPassQuiz` function already handles the "skip quiz" behavior for Quick Complete buttons.

---

## What Stays the Same
- Test Mode still bypasses subscription, enrollment, and progression locks
- "Quick Complete" buttons still work for lessons
- "Auto-Pass Exam" buttons still instantly pass quizzes via `instantPassQuiz()`
- Unlimited quiz attempts in Test Mode

## What Changes
- When admin actually takes a quiz (answers questions), their real score is saved
- Admin can experience the full quiz flow: intro → questions → results → review
- If they fail, content is still unlocked (Test Mode) but they see the real feedback

---

## User Experience Summary

| Action | Test Mode Behavior |
|--------|-------------------|
| Click "Auto-Pass Exam" button | Instantly passes quiz, saves 100% |
| Click "Start Quiz" and answer questions | Takes real quiz, saves actual score |
| Fail quiz in Test Mode | Shows failure feedback, but next content still unlocked |
| Retry quiz | Unlimited attempts (no 3-attempt limit) |

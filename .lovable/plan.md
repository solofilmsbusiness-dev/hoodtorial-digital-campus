

# Fix Course Crash & Add Per-Question Quiz Timing

## Issue 1: Course Selection Crash - Root Cause Analysis

**Error**: `Rendered more hooks than during the previous render`

The crash occurs in `CourseDetail.tsx` because React's Rules of Hooks are being violated:

```text
Component Flow:
1. First render (loading): isLoadingCourse = true
   - Hooks 1-10 are called
   - Early return at line 211 (loading UI)
   - useMemo at line 362 is NEVER called

2. Second render (loaded): isLoadingCourse = false, course exists
   - Hooks 1-10 are called
   - NO early return
   - useMemo at line 362 IS called <- NEW HOOK!
   
Result: React detects more hooks on second render = CRASH
```

**Problem Location**: Line 362 has a `useMemo` hook placed AFTER early returns at lines 211-238

```typescript
// Line 211-222: Early return for loading state
if (isLoadingCourse) {
  return <Loading />;  // useMemo on line 362 never runs
}

// Line 224-239: Early return for missing course
if (!course) {
  return <NotFound />;  // useMemo on line 362 never runs
}

// Line 362-368: This useMemo only runs if NOT loading and course EXISTS
const isFinalExamUnlocked = useMemo(() => { ... }, [course, getModuleProgress]);
```

**Fix**: Move the `isFinalExamUnlocked` useMemo BEFORE the early returns, adding null safety.

---

## Issue 2: Per-Question Timing for Quizzes

Currently, quizzes have a global timer (e.g., 10 minutes for 10 questions). The request is to implement per-question timing where each question has its own countdown.

**Current Timer Behavior** (QuizPlayer.tsx):
- Global `timeLimitSeconds` calculated once at quiz start
- Single `remainingTime` countdown for entire quiz
- When time expires, quiz auto-submits all answers

**New Per-Question Timer Behavior**:
- Each question gets individual time (e.g., 60 seconds per question)
- Timer resets when moving to next question
- If question timer expires:
  - Current question is marked as unanswered (or current selection is locked)
  - Auto-advance to next question
- Final question timeout triggers quiz submission

---

## Implementation Plan

### Phase 1: Fix CourseDetail.tsx Hook Order Bug

**File**: `src/pages/CourseDetail.tsx`

**Changes**:
1. Move `isFinalExamUnlocked` useMemo to line ~186 (before early returns)
2. Add null check for `course` inside the useMemo
3. Ensure all hooks run on every render, regardless of loading state

**Before** (buggy):
```typescript
// Lines 186-208: useMemo for courseProgress
const courseProgress = useMemo(() => { ... }, [course, isLessonCompleted, isQuizPassed]);

// Lines 211-238: Early returns
if (isLoadingCourse) return <Loading />;
if (!course) return <NotFound />;

// Line 362: useMemo AFTER early returns - BUG!
const isFinalExamUnlocked = useMemo(() => { ... }, [course, getModuleProgress]);
```

**After** (fixed):
```typescript
// Lines 186-208: useMemo for courseProgress
const courseProgress = useMemo(() => { ... }, [course, isLessonCompleted, isQuizPassed]);

// NEW: Move isFinalExamUnlocked here, BEFORE early returns
const isFinalExamUnlocked = useMemo(() => {
  if (!course?.finalExam) return false;
  return course.modules.every((module) => {
    const progress = getModuleProgress(module);
    return progress.percent === 100;
  });
}, [course, getModuleProgress]);

// Lines 211-238: Early returns (hooks already executed)
if (isLoadingCourse) return <Loading />;
if (!course) return <NotFound />;
```

---

### Phase 2: Add Per-Question Timer to QuizPlayer

**Files to modify**:
- `src/components/course/QuizPlayer.tsx`
- `src/lib/quizUtils.ts`
- `src/data/courses.ts` (Quiz interface)

**New Quiz Properties**:
```typescript
export interface Quiz {
  id: string;
  title: string;
  questions: number;
  passingScore: number;
  timeLimitMinutes?: number;      // Total quiz time (existing)
  perQuestionSeconds?: number;    // NEW: Time per question (default 60s)
  usePerQuestionTimer?: boolean;  // NEW: Enable per-question mode
}
```

**QuizPlayer State Changes**:
```typescript
// Existing state
const [remainingTime, setRemainingTime] = useState<number>(0);

// NEW: Per-question timer state
const [questionRemainingTime, setQuestionRemainingTime] = useState<number>(0);
const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);

// Determine timer mode
const usePerQuestionMode = quiz.usePerQuestionTimer ?? false;
const perQuestionTime = quiz.perQuestionSeconds ?? 60; // Default 60 seconds
```

**Timer Logic Changes**:

Current single-timer useEffect becomes conditional:
```typescript
useEffect(() => {
  if (state !== "playing" || !startTime) return;
  
  if (usePerQuestionMode) {
    // Per-question timer
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - questionStartTime!) / 1000);
      const remaining = Math.max(0, perQuestionTime - elapsed);
      setQuestionRemainingTime(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        handleQuestionTimeout(); // Auto-advance or lock answer
      }
    }, 1000);
    return () => clearInterval(interval);
  } else {
    // Global quiz timer (existing behavior)
    const interval = setInterval(() => { ... });
    return () => clearInterval(interval);
  }
}, [state, startTime, questionStartTime, usePerQuestionMode]);
```

**New Handler - Question Timeout**:
```typescript
const handleQuestionTimeout = useCallback(() => {
  // Lock current answer (keep whatever is selected, or -1 if none)
  if (currentQuestion && answers[currentQuestion.id] === undefined) {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: -1 })); // Mark as skipped
  }
  
  // Auto-advance to next question
  if (currentIndex < shuffledQuestions.length - 1) {
    setCurrentIndex(prev => prev + 1);
    setQuestionStartTime(Date.now()); // Reset timer
    setQuestionRemainingTime(perQuestionTime);
  } else {
    // Last question - finish quiz
    handleFinishQuiz();
  }
}, [currentQuestion, currentIndex, shuffledQuestions.length, perQuestionTime, answers, handleFinishQuiz]);
```

**Reset Timer on Navigation**:
```typescript
const handleNext = useCallback(() => {
  setShowExplanation(false);
  if (currentIndex < shuffledQuestions.length - 1) {
    setCurrentIndex(prev => prev + 1);
    if (usePerQuestionMode) {
      setQuestionStartTime(Date.now());
      setQuestionRemainingTime(perQuestionTime);
    }
  } else {
    handleFinishQuiz();
  }
}, [currentIndex, shuffledQuestions.length, handleFinishQuiz, usePerQuestionMode, perQuestionTime]);
```

**UI Updates - Display Per-Question Timer**:
```typescript
// In header, show appropriate timer
{state === "playing" && (
  <div className={cn("flex items-center gap-2", isTimeWarning && "text-destructive animate-pulse")}>
    <Clock className="w-4 h-4" />
    {usePerQuestionMode 
      ? `${formatTimeRemaining(questionRemainingTime)} / question`
      : formatTimeRemaining(remainingTime)
    }
  </div>
)}
```

**Visual Indicator - Question Timer Progress Ring**:
```typescript
// Optional: circular progress indicator around timer
<div className="relative">
  <svg className="w-10 h-10 transform -rotate-90">
    <circle
      cx="20" cy="20" r="16"
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
      className="text-muted"
    />
    <circle
      cx="20" cy="20" r="16"
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
      strokeDasharray={100}
      strokeDashoffset={100 - (questionRemainingTime / perQuestionTime) * 100}
      className={cn(
        "transition-all duration-1000",
        questionRemainingTime <= 10 ? "text-destructive" : "text-primary"
      )}
    />
  </svg>
  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
    {questionRemainingTime}
  </span>
</div>
```

---

## Database Changes

No database migration needed - the new fields are optional and stored in the static quiz configuration. Existing quizzes will continue using the global timer (backward compatible).

For dynamically created quizzes (via admin panel), the quiz table already supports adding new fields. A future enhancement could add `per_question_seconds` column.

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/CourseDetail.tsx` | Modify | Move useMemo before early returns to fix hooks crash |
| `src/components/course/QuizPlayer.tsx` | Modify | Add per-question timer mode with auto-advance |
| `src/lib/quizUtils.ts` | Modify | Add helper for per-question time calculation |
| `src/data/courses.ts` | Modify | Extend Quiz interface with per-question timer fields |

---

## Quiz Intro Screen Update

When per-question mode is enabled, show different info:

```text
+-----------------------------------------+
|         [Trophy Icon]                   |
|         Module 1 Quiz                   |
|                                         |
|  +--------+  +--------+  +--------+     |
|  |   10   |  |  80%   |  |  60s   |     |
|  |Questions|  |To Pass |  |/Question|   |
|  +--------+  +--------+  +--------+     |
|                                         |
|  [!] Each question has a 60-second      |
|      time limit. Unanswered questions   |
|      will auto-advance.                 |
|                                         |
|       [Cancel]  [Start Quiz]            |
+-----------------------------------------+
```

---

## Expected Outcome

1. **Bug Fix**: Students can now select courses without crashing
2. **Per-Question Timer**: Quizzes can be configured with individual question time limits
3. **Backward Compatible**: Existing quizzes with global timers continue working
4. **Enhanced UX**: Visual countdown per question creates urgency and engagement
5. **Auto-Advance**: Unanswered questions are skipped when time runs out


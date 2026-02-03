

# Add 60-Second Per-Question Timer to Assessment

## Overview

Add a per-question timer to the entry assessment where each question has its own 60-second countdown. When time expires on a question, it auto-advances to the next question (marking the current as skipped if unanswered).

## Current Implementation

The assessment currently uses a **global timer**:
- Total time = 45 seconds x number of questions
- Single countdown for the entire quiz
- Auto-submits when global time expires

```typescript
// Current: lines 94-98
const timeLimitSeconds = useMemo(() => {
  const minutes = getDefaultTimeLimit(baseQuestions.length, true); // 45s per Q
  return minutes * 60;
}, [baseQuestions.length]);
```

## Proposed Changes

### Timer Behavior

| Aspect | Current | New |
|--------|---------|-----|
| Timer scope | Global (entire quiz) | Per-question |
| Time per question | ~45 seconds (averaged) | 60 seconds each |
| On time expire | Auto-submit entire quiz | Auto-advance to next question |
| Display | Single countdown | Resets each question |
| Skipped questions | N/A | Marked as unanswered |

### Visual Design

```text
+--------------------------------------------------+
|  Question 3 of 18                    ⏱️ 0:45     |
|  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━        |
|                                                  |
|  [Progress bar for question timer - depleting]   |
|                                                  |
|  ┌────────────────────────────────────────────┐  |
|  │ CINEMATOGRAPHY                              │  |
|  │                                             │  |
|  │ What is the 180-degree rule?                │  |
|  │                                             │  |
|  │ [ A. Screen direction continuity... ]       │  |
|  │ [ B. Lighting angle principle...   ]        │  |
|  │ [ C. Camera movement guideline...  ]        │  |
|  │ [ D. Lens selection formula...     ]        │  |
|  └────────────────────────────────────────────┘  |
|                                                  |
|  [< Previous]                          [Next >]  |
+--------------------------------------------------+
```

When time is running low (under 10 seconds), the timer will pulse red to create urgency.

## Implementation Details

### 1. New State Variables

```typescript
// Per-question timer state
const [questionTimeRemaining, setQuestionTimeRemaining] = useState(60);
const [questionStartTime, setQuestionStartTime] = useState<number>(0);
const PER_QUESTION_SECONDS = 60;
```

### 2. Reset Timer on Question Change

```typescript
// Reset timer when question changes
useEffect(() => {
  if (step === "quiz") {
    setQuestionStartTime(Date.now());
    setQuestionTimeRemaining(PER_QUESTION_SECONDS);
  }
}, [step, currentQuestionIndex]);
```

### 3. Per-Question Countdown

```typescript
// Per-question countdown timer
useEffect(() => {
  if (step !== "quiz" || questionStartTime === 0) return;
  
  const interval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
    const remaining = Math.max(0, PER_QUESTION_SECONDS - elapsed);
    setQuestionTimeRemaining(remaining);
    
    if (remaining <= 0) {
      clearInterval(interval);
      handleQuestionTimeExpired();
    }
  }, 1000);
  
  return () => clearInterval(interval);
}, [step, questionStartTime, currentQuestionIndex]);
```

### 4. Auto-Advance on Timeout

```typescript
const handleQuestionTimeExpired = useCallback(() => {
  // If on last question, finish the quiz
  if (currentQuestionIndex === shuffledQuestions.length - 1) {
    handleFinishQuiz();
  } else {
    // Auto-advance to next question
    setCurrentQuestionIndex(prev => prev + 1);
  }
}, [currentQuestionIndex, shuffledQuestions.length]);
```

### 5. Update Timer Display

```typescript
// In the quiz step JSX
<div className={cn(
  "flex items-center gap-2 px-3 py-1 text-sm font-bold transition-colors rounded",
  questionTimeRemaining <= 10 
    ? "text-destructive bg-destructive/10 border border-destructive/50 animate-pulse" 
    : "text-muted-foreground"
)}>
  {questionTimeRemaining <= 10 && <AlertTriangle className="w-4 h-4" />}
  <Clock className="w-4 h-4" />
  {formatTimeRemaining(questionTimeRemaining)}
</div>
```

### 6. Add Timer Progress Bar

Add a visual progress bar showing time depletion:

```typescript
// Below the question counter
<Progress
  value={(questionTimeRemaining / PER_QUESTION_SECONDS) * 100}
  className={cn(
    "h-1 mb-2",
    questionTimeRemaining <= 10 && "bg-destructive/20 [&>div]:bg-destructive"
  )}
/>
```

### 7. Update Assessment Info Text

Update the info card in the experience step:

```typescript
<li className="flex items-center gap-2">
  <Clock className="w-4 h-4 text-muted-foreground" />
  60 seconds per question
</li>
<li>• Questions auto-advance when time expires</li>
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Assessment.tsx` | Replace global timer with per-question timer logic |

## Edge Cases Handled

- **Last question timeout**: Triggers `handleFinishQuiz()` instead of advancing
- **Unanswered questions**: Counted as incorrect in scoring (already handled)
- **Manual navigation**: Timer resets when moving between questions
- **Going back**: Can revisit previous questions, timer resets

## Expected User Experience

1. User starts quiz
2. Each question shows a 60-second countdown
3. Timer resets when advancing to next question
4. If timer hits 0, question is skipped and auto-advances
5. Last 10 seconds: timer turns red and pulses
6. User can still navigate back to previous questions
7. On last question timeout: quiz auto-submits


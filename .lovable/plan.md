

# Quiz Completion UX & Cooldown System

## Overview

Enhance the quiz completion experience with:
1. **Centered congratulations** for passing students with celebratory styling
2. **Urban-style motivational messaging** for failed attempts
3. **One free retake** then a **30-minute cooldown** before being able to retake (forces material review)
4. Clear messaging about the retake policy

---

## Technical Implementation

### 1. Enhanced Results Screen (QuizPlayer.tsx)

**Passing State - Centered Celebration:**
- Keep existing centered layout with Trophy icon
- Add celebratory styling with text glow effects
- Display encouraging "mission accomplished" urban-style message

**Failing State - Urban Motivation:**
Replace generic "KEEP PRACTICING" with rotating motivational messages in an urban, hustle-mentality style:

```typescript
const failureMessages = [
  { headline: "NAH, YOU GOT THIS!", subtext: "Every master was once a disaster. Get back in there." },
  { headline: "NOT TODAY... BUT SOON!", subtext: "Legends ain't built in a day. Review that material and run it back." },
  { headline: "LEVELS TO THIS!", subtext: "You ain't where you wanna be yet, but you closer than yesterday." },
  { headline: "STAY IN THE FIGHT!", subtext: "Real ones don't quit. Hit the books and come back stronger." },
  { headline: "GRIND DON'T STOP!", subtext: "Take this L, learn from it, and flip it into a W." },
];
```

### 2. Retake Logic with 30-Minute Cooldown

**New Logic:**
- First attempt: Always allowed
- After first fail: **One immediate retake** available
- After second fail: **30-minute cooldown** before next attempt

**Database Check:**
The `quiz_results` table already has `created_at` timestamps. We can calculate cooldown based on the last attempt time.

**Add to `useQuizResults.ts`:**

```typescript
const getCooldownStatus = useCallback((quizId: string) => {
  // Get all attempts for this quiz (excluding passed)
  const attempts = results.filter(r => r.quiz_id === quizId);
  const failedAttempts = attempts.filter(r => !r.passed).length;
  
  // If passed or first attempt, no cooldown
  const hasPassed = attempts.some(r => r.passed);
  if (hasPassed || failedAttempts === 0) {
    return { canAttempt: true, cooldownEndsAt: null, attemptsUntilCooldown: 2 };
  }
  
  // First fail = immediate retake allowed
  if (failedAttempts === 1) {
    return { canAttempt: true, cooldownEndsAt: null, attemptsUntilCooldown: 1 };
  }
  
  // 2+ fails = check 30-minute cooldown from last attempt
  const lastAttempt = attempts[0]; // Already sorted by created_at desc
  const cooldownEnd = new Date(lastAttempt.created_at);
  cooldownEnd.setMinutes(cooldownEnd.getMinutes() + 30);
  
  const now = new Date();
  if (now < cooldownEnd) {
    return { 
      canAttempt: false, 
      cooldownEndsAt: cooldownEnd,
      minutesRemaining: Math.ceil((cooldownEnd.getTime() - now.getTime()) / 60000)
    };
  }
  
  return { canAttempt: true, cooldownEndsAt: null, attemptsUntilCooldown: 1 };
}, [results]);
```

### 3. Results Screen States

**Passed (Centered Celebration):**
```text
    ┌─────────────────────────────────────┐
    │              🏆                     │
    │                                     │
    │     YOU DID THAT!                   │
    │     CERTIFIED!                      │
    │                                     │
    │          85%                        │
    │    (glowing gold text)              │
    │                                     │
    │   17 of 20 correct                  │
    │                                     │
    │   ✓ Your result has been saved      │
    │                                     │
    │   [ Review Answers ]                │
    └─────────────────────────────────────┘
```

**Failed - First Attempt (Immediate Retake Available):**
```text
    ┌─────────────────────────────────────┐
    │              ✗                      │
    │                                     │
    │     NAH, YOU GOT THIS!              │
    │                                     │
    │   Every master was once a disaster. │
    │   Get back in there.                │
    │                                     │
    │          45%                        │
    │    (red text)                       │
    │                                     │
    │   9 of 20 correct                   │
    │   Need 70% to pass                  │
    │                                     │
    │   ⚡ 1 immediate retake available   │
    │                                     │
    │ [ Review Answers ] [ Retake Now ]   │
    └─────────────────────────────────────┘
```

**Failed - Second Attempt (Cooldown Triggered):**
```text
    ┌─────────────────────────────────────┐
    │              ⏰                     │
    │                                     │
    │     GRIND DON'T STOP!               │
    │                                     │
    │   Take this L, learn from it,       │
    │   and flip it into a W.             │
    │                                     │
    │          52%                        │
    │                                     │
    │   Time to review the material!      │
    │   Cooldown: 30:00 remaining         │
    │                                     │
    │   Go back and watch the lessons     │
    │   before your next attempt.         │
    │                                     │
    │ [ Review Answers ] [ Back to Course ]│
    └─────────────────────────────────────┘
```

### 4. LockedQuizCard Updates

Add cooldown state display when student is in cooldown:

```typescript
interface LockedQuizCardProps {
  // ... existing props
  cooldownStatus?: {
    canAttempt: boolean;
    cooldownEndsAt: Date | null;
    minutesRemaining?: number;
  };
}
```

Display cooldown timer in the card when applicable.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/course/QuizPlayer.tsx` | Enhance results screen with urban messaging, centered celebration, cooldown display |
| `src/hooks/useQuizResults.ts` | Add `getCooldownStatus()` function |
| `src/components/course/LockedQuizCard.tsx` | Add cooldown timer display and messaging |
| `src/lib/quizUtils.ts` | Add `getRandomMotivationalMessage()` helper |

---

## Urban Motivational Messages

**For Failures:**
- "NAH, YOU GOT THIS!" / "Every master was once a disaster. Get back in there."
- "NOT TODAY... BUT SOON!" / "Legends ain't built in a day. Review that material and run it back."
- "LEVELS TO THIS!" / "You ain't where you wanna be yet, but you closer than yesterday."
- "STAY IN THE FIGHT!" / "Real ones don't quit. Hit the books and come back stronger."
- "GRIND DON'T STOP!" / "Take this L, learn from it, and flip it into a W."
- "IT'S A MARATHON!" / "Ain't about how hard you fall, it's about how fast you get up."

**For Cooldown State:**
- "USE THIS TIME WISELY" / "Go back through the lessons. Knowledge is power."
- "THE GRIND CONTINUES" / "Review the material. Come back ready to dominate."

**For Passing:**
- "YOU DID THAT!" / "Knowledge unlocked. On to the next level."
- "CERTIFIED!" / "You put in the work, now you got the results."
- "THAT'S A W!" / "All that studying paid off. Keep this energy."

---

## Cooldown Countdown Timer

When in cooldown, show a live countdown timer that updates every second:

```typescript
const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null);

useEffect(() => {
  if (!cooldownEndsAt) return;
  
  const interval = setInterval(() => {
    const remaining = Math.max(0, cooldownEndsAt.getTime() - Date.now());
    setCooldownRemaining(remaining);
    
    if (remaining <= 0) {
      // Refresh to allow retry
      refreshCooldownStatus();
    }
  }, 1000);
  
  return () => clearInterval(interval);
}, [cooldownEndsAt]);

// Display as MM:SS
const formatCooldown = (ms: number) => {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

---

## Summary

1. **Passing students** see a centered celebration with urban-style "YOU DID THAT!" messaging and gold glow effects
2. **Failed first attempt** gets motivational urban messaging plus immediate retake option
3. **Failed second attempt** triggers 30-minute cooldown with countdown timer and encouragement to review course material
4. **Cooldown period** shows remaining time and links back to course content
5. **All messaging** uses an urban, hustle-mentality tone that fits the "WHERE HUSTLE MEETS HOLLYWOOD" brand


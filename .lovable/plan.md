

# Admin Test Mode for Courses

## Overview
Add an admin-only toggle in the admin dashboard that enables "Test Mode" for the current admin user. When enabled, this bypasses all content completion requirements, allowing admins to instantly access and complete any video lesson or quiz without watching videos or answering questions correctly.

## How It Works

When Test Mode is active for an admin:
- All videos are treated as 100% watched (bypass 90% requirement)
- All lessons show as unlocked regardless of progression
- Quizzes can be instantly passed without answering questions
- All content becomes accessible for testing the course flow

```text
Admin Dashboard → Toggle "Test Mode" ON
        ↓
useLessonProgress hook checks if admin + test mode enabled
        ↓
Returns all content as unlocked, videos as complete
        ↓
Admin can freely navigate and test entire course
```

---

## Implementation Steps

### Step 1: Create Test Mode Context
**New file: `src/contexts/TestModeContext.tsx`**

A React context to manage test mode state:
- `isTestModeEnabled`: Boolean indicating if test mode is active
- `toggleTestMode`: Function to enable/disable
- Persists to localStorage for session continuity
- Only available to users with admin role

### Step 2: Add Test Mode Toggle to Admin Dashboard
**Edit: `src/pages/admin/AdminDashboard.tsx`**

Add a new card section for "Testing Tools":
- Toggle switch for "Enable Test Mode"
- Visual indicator when test mode is active
- Warning text explaining what test mode does
- Option to auto-pass quizzes

### Step 3: Create Custom Hook for Test Mode
**New file: `src/hooks/useTestMode.ts`**

Provides easy access to test mode state:
- `isTestModeEnabled`: Current state
- `canUseTestMode`: Checks if user is admin
- `toggleTestMode`: Enable/disable function
- `bypassVideoProgress`: Returns 100% for videos when enabled
- `bypassQuizCheck`: Returns passed=true when enabled

### Step 4: Update Lesson Progress Hook
**Edit: `src/hooks/useLessonProgress.ts`**

Modify the `isContentUnlocked` function:
- Check if test mode is enabled for admin
- If enabled, always return `true` for unlocked
- Add bypass for `isLessonCompleted` check
- Add bypass for quiz passing requirements

### Step 5: Update Video Progress Hook
**Edit: `src/hooks/useVideoProgress.ts`**

When test mode is active:
- Report `watchPercentage` as 100%
- Set `isCompleted` to true immediately
- Skip database progress tracking in test mode

### Step 6: Update Quiz Results Hook
**Edit: `src/hooks/useQuizResults.ts`**

Add test mode bypass:
- Allow instant quiz completion
- Skip attempt count limits
- Mark quiz as passed immediately

### Step 7: Add Quick Complete Button
**Edit: `src/pages/CourseDetail.tsx`**

When test mode is active:
- Show "Quick Complete" button for videos
- Show "Auto-Pass Quiz" button for quizzes
- Visual indicator that test mode is active

### Step 8: Add Visual Test Mode Indicator
**New file: `src/components/admin/TestModeBanner.tsx`**

A persistent banner shown when test mode is active:
- Displayed at top of course pages
- Shows "TEST MODE ACTIVE" warning
- Quick toggle to disable
- Makes it clear this is not normal student view

### Step 9: Wrap App with Test Mode Provider
**Edit: `src/App.tsx`**

Add the TestModeContext provider to the app:
- Placed inside AuthProvider
- Available throughout the application

---

## Technical Details

### Test Mode State Structure
```typescript
interface TestModeState {
  enabled: boolean;
  autoPassQuizzes: boolean;
  bypassVideoProgress: boolean;
}
```

### LocalStorage Key
```typescript
const TEST_MODE_KEY = "hu-admin-test-mode";
```

### Admin Check in Hooks
```typescript
const { isAdmin } = useAdminAuth();
const { isTestModeEnabled } = useTestMode();

// In isContentUnlocked:
if (isAdmin && isTestModeEnabled) {
  return true; // All content unlocked
}
```

---

## Files to Create
1. `src/contexts/TestModeContext.tsx` - Context provider for test mode state
2. `src/hooks/useTestMode.ts` - Hook for accessing test mode
3. `src/components/admin/TestModeBanner.tsx` - Visual indicator banner

## Files to Modify
1. `src/pages/admin/AdminDashboard.tsx` - Add test mode toggle UI
2. `src/hooks/useLessonProgress.ts` - Add bypass logic for content unlocking
3. `src/hooks/useVideoProgress.ts` - Add bypass for video completion
4. `src/hooks/useQuizResults.ts` - Add bypass for quiz completion
5. `src/pages/CourseDetail.tsx` - Add quick complete buttons
6. `src/App.tsx` - Add TestModeContext provider
7. `src/components/admin/index.ts` - Export new banner component

---

## Security Considerations
- Test mode only activates for users with verified admin role (via `has_role` RPC)
- State stored in localStorage but checked server-side on each action
- Test mode does not affect database records unless explicitly saving
- Other users cannot see or activate test mode
- Admin role is verified via database function, not client-side

## User Experience
- Clear visual indicator when test mode is active
- Easy toggle from admin dashboard
- Persistent across page refreshes
- Non-intrusive for normal admin work
- One-click access to any content


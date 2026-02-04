

# Fix Admin Student Details & Enhance Test Mode

## Problems Identified

### 1. Admin Student Details Not Loading/Working
The admin panel cannot perform certain student management actions due to missing RLS policies:

| Action | Table | Missing Policy |
|--------|-------|----------------|
| Reset All Progress | user_progress | Admins cannot DELETE |
| Ban/Unban User | profiles | Admins cannot UPDATE |

### 2. Test Mode Limited Functionality
Currently, Test Mode only provides:
- Toggle via Command Palette (Cmd+K)
- Auto-pass quizzes
- Bypass video progress

Missing features:
- No dedicated settings panel in Admin Settings
- No visibility into what features are bypassed
- No quick actions for common test scenarios

---

## Solution

### Part 1: Fix RLS Policies for Admin Student Management

Add missing policies to enable admin control:

```sql
-- Allow admins to delete user progress (for reset functionality)
CREATE POLICY "Admins can delete user progress"
  ON user_progress FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update profiles (for ban/unban functionality)
CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));
```

### Part 2: Enhanced Test Mode Panel in Admin Settings

Add a dedicated "Test Mode" card in Admin Settings with:

1. **Master Toggle** - Enable/disable test mode
2. **Feature Toggles**:
   - Auto-Pass Quizzes (skip quiz questions)
   - Bypass Video Progress (mark videos complete instantly)
   - Bypass Enrollment Check (access any course without enrolling)
   - Bypass Subscription Check (access paid content without subscription)
3. **Quick Actions**:
   - Reset My Progress (clear current admin's test data)
   - Simulate Student View (see what students see)

### Part 3: Improved Test Mode Context

Extend the context to support new bypass options:

```typescript
interface TestModeState {
  enabled: boolean;
  autoPassQuizzes: boolean;
  bypassVideoProgress: boolean;
  bypassEnrollmentCheck: boolean;  // NEW
  skipProgressionLocks: boolean;   // NEW
}
```

---

## Implementation Details

### File 1: Database Migration
Add RLS policies for admin student management

### File 2: `src/contexts/TestModeContext.tsx`
- Add new bypass options to state
- Update localStorage key structure
- Add new setter functions

### File 3: `src/hooks/useTestMode.ts`
- Expose new bypass helpers
- Add computed values for new features

### File 4: `src/pages/admin/AdminSettings.tsx`
- Add new "Test Mode" card section
- Include master toggle with warning indicator
- Feature toggles with descriptions
- Visual indicator showing test mode is active

### File 5: `src/components/admin/TestModeBanner.tsx`
- Show which features are currently bypassed
- Add quick disable button for each feature

---

## UI Design for Test Mode Settings Card

```text
┌─────────────────────────────────────────────┐
│  🧪 Test Mode                       [ACTIVE]│
│  Bypass content restrictions for testing    │
├─────────────────────────────────────────────┤
│                                             │
│  ⚠️ Test Mode Active                        │
│  Content restrictions are currently bypassed│
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  Features:                                  │
│                                             │
│  Auto-Pass Quizzes              [  ON  ]    │
│  Skip quiz questions and auto-pass          │
│                                             │
│  Bypass Video Progress          [  ON  ]    │
│  Mark videos complete instantly             │
│                                             │
│  Bypass Enrollment Check        [  OFF ]    │
│  Access courses without enrolling           │
│                                             │
│  Skip Progression Locks         [  OFF ]    │
│  Access all content regardless of progress  │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Change |
|------|--------|
| Database Migration | Add 2 new RLS policies for user_progress and profiles |
| `src/contexts/TestModeContext.tsx` | Add new bypass options and setters |
| `src/hooks/useTestMode.ts` | Expose new bypass helpers |
| `src/pages/admin/AdminSettings.tsx` | Add Test Mode settings card |
| `src/components/admin/TestModeBanner.tsx` | Show active bypasses and quick toggles |

---

## Security Considerations

- RLS policies use `has_role()` function which is `SECURITY DEFINER` to prevent recursion
- Test mode state is stored in localStorage with admin check on load
- Test mode automatically disables if user loses admin status
- All test mode features require verified admin role from database, not client storage


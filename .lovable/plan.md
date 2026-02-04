
# Enhanced Admin User Controls & AI Learning Analytics

## Overview

This plan adds comprehensive admin controls for managing students and AI-powered learning insights to help administrators understand if students are truly learning and get personalized improvement recommendations.

---

## Part 1: User Management Enhancements

### 1.1 Ban/Suspend User System

**Database Changes:**
Add a `is_banned` column and `banned_at`/`banned_by`/`ban_reason` fields to the `profiles` table to track user account status.

```sql
-- Add ban columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN is_banned boolean NOT NULL DEFAULT false,
ADD COLUMN banned_at timestamp with time zone,
ADD COLUMN banned_by uuid REFERENCES auth.users(id),
ADD COLUMN ban_reason text;
```

**Frontend Changes:**
- Add "Ban User" and "Unban User" options to the UserManager dropdown menu
- Add ban confirmation dialog with reason input
- Display banned status badge in student list
- Show ban info in StudentDetailSheet

### 1.2 Remove All Enrollments (Expel from All Classes)

**New Action:**
Add a "Remove All Enrollments" button that unenrolls a student from all their active courses at once.

```typescript
// Add to useAdminQuizManagement hook
const deleteAllEnrollments = async (userId: string) => {
  const { error } = await supabase
    .from("enrollments")
    .delete()
    .eq("user_id", userId);
  // ...
};
```

### 1.3 Reset All Progress

**New Action:**
Add ability to reset all lesson progress for a student (separate from quiz results).

```typescript
const deleteAllProgress = async (userId: string) => {
  const { error } = await supabase
    .from("user_progress")
    .delete()
    .eq("user_id", userId);
  // ...
};
```

---

## Part 2: Learning Analytics Dashboard

### 2.1 Enhanced Student Detail Sheet

Add new analytics sections showing:

| Metric | Description |
|--------|-------------|
| Average Watch % | How much of videos they actually watch |
| Completion Rate | Lessons completed vs. enrolled lessons |
| Quiz Score Trend | Are scores improving over time? |
| Time Spent | Total learning time (based on video progress) |
| Engagement Score | Calculated score based on multiple factors |
| Last Activity | When they last interacted with content |

**Data Structure:**
```typescript
interface LearningMetrics {
  avgWatchPercentage: number;      // 0-100
  lessonCompletionRate: number;    // 0-100
  quizScoreTrend: "improving" | "declining" | "stable";
  totalWatchTimeMinutes: number;
  engagementScore: number;         // 0-100
  lastActivityAt: string | null;
  coursesWithNoProgress: string[]; // List of enrolled but idle courses
  averageQuizScore: number;
  quizAttemptFrequency: number;    // Days between attempts
}
```

### 2.2 Engagement Score Calculation

Weighted scoring based on real learning behaviors:

```
Engagement Score = (
  (avgWatchPercentage × 0.30) +      // 30% - Are they watching videos fully?
  (lessonCompletionRate × 0.25) +    // 25% - Are they completing lessons?
  (quizPassRate × 0.25) +            // 25% - Are they passing quizzes?
  (activityRecency × 0.10) +         // 10% - Are they active recently?
  (quizAttemptConsistency × 0.10)    // 10% - Are they taking quizzes regularly?
)
```

### 2.3 Visual Analytics in Student Detail

```text
┌─────────────────────────────────────────────────┐
│ 📊 Learning Analytics                           │
├─────────────────────────────────────────────────┤
│                                                 │
│  Engagement Score    ████████░░  78/100         │
│                      "Active Learner"           │
│                                                 │
│  ┌──────────┬──────────┬──────────┐            │
│  │ Watch %  │ Complete │ Quiz Avg │            │
│  │   85%    │   60%    │   72%    │            │
│  │ ██████░░ │ █████░░░ │ ██████░░ │            │
│  └──────────┴──────────┴──────────┘            │
│                                                 │
│  Last Active: 2 days ago                       │
│  Total Watch Time: 4h 32m                      │
│  Quiz Trend: ↗ Improving                       │
│                                                 │
│  ⚠️ Idle Courses: HU-303, HU-401               │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Part 3: AI Improvement Tips

### 3.1 New Edge Function: `student-insights`

Create a new backend function that analyzes student data and generates personalized recommendations using AI.

**Endpoint:** `POST /functions/v1/student-insights`

**Request:**
```json
{
  "userId": "uuid",
  "studentName": "John",
  "metrics": {
    "avgWatchPercentage": 45,
    "lessonCompletionRate": 30,
    "quizPassRate": 60,
    "quizScoreTrend": "declining",
    "lastActivityDaysAgo": 5,
    "enrolledCourses": ["HU-101", "HU-205"],
    "coursesWithNoProgress": ["HU-205"],
    "weakAreas": ["lighting", "color theory"]
  }
}
```

**Response:**
```json
{
  "summary": "John shows initial enthusiasm but engagement is declining...",
  "riskLevel": "medium",
  "insights": [
    {
      "category": "engagement",
      "observation": "Video watch percentage is below 50%",
      "recommendation": "Consider reaching out to check if content is too basic or too advanced"
    },
    {
      "category": "progression",
      "observation": "Started HU-205 but hasn't made progress in 2 weeks",
      "recommendation": "Send encouragement or unlock a preview of upcoming content"
    }
  ],
  "suggestedActions": [
    "Send personalized check-in message",
    "Recommend revisiting Module 2 of HU-101",
    "Offer quiz retake for low-scoring attempts"
  ]
}
```

### 3.2 AI Analysis UI Component

Add a "Get AI Insights" button in the StudentDetailSheet that:
1. Aggregates the student's learning data
2. Calls the `student-insights` edge function
3. Displays personalized recommendations

```text
┌─────────────────────────────────────────────────┐
│ 🤖 AI Learning Insights                         │
│ ───────────────────────────                     │
│                                                 │
│ Risk Level: 🟡 Medium                           │
│                                                 │
│ Summary:                                        │
│ "John started strong but engagement has        │
│ dropped. Quiz scores are declining and video   │
│ completion is inconsistent..."                 │
│                                                 │
│ 💡 Recommendations:                             │
│                                                 │
│ 1. Video Engagement                            │
│    ⚠️ Only watching 45% of videos on average   │
│    → Consider shorter lesson formats or        │
│      check if content matches their level      │
│                                                 │
│ 2. Course Progress                             │
│    ⚠️ HU-205 enrolled but no activity          │
│    → Send reminder or check if stuck           │
│                                                 │
│ ✨ Suggested Actions:                           │
│ • [ ] Send check-in message                    │
│ • [ ] Recommend HU-101 Module 2 review         │
│ • [ ] Reset quiz for fresh attempt             │
│                                                 │
│ [Refresh Insights]                             │
└─────────────────────────────────────────────────┘
```

---

## Part 4: Bulk Actions in User List

### 4.1 Selection and Bulk Operations

Add checkboxes to the student table for bulk operations:

- **Bulk Message** - Send announcement to selected students
- **Bulk Export** - Export selected students to CSV
- **Bulk Remove Enrollments** - Remove specific course from selected students

---

## Implementation Files

| File | Changes |
|------|---------|
| `supabase/migrations/` | Add `is_banned`, `banned_at`, `banned_by`, `ban_reason` columns |
| `src/hooks/useAdminQuizManagement.ts` | Add `banUser`, `unbanUser`, `deleteAllEnrollments`, `deleteAllProgress` |
| `src/hooks/useStudentAnalytics.ts` | New hook for learning metrics calculations |
| `src/components/admin/StudentDetailSheet.tsx` | Add Learning Analytics section, AI Insights, ban controls |
| `src/components/admin/StudentAnalyticsCard.tsx` | New component for analytics visualization |
| `src/components/admin/AIInsightsPanel.tsx` | New component for AI recommendations |
| `src/pages/admin/UserManager.tsx` | Add ban/unban to dropdown, banned status badge |
| `supabase/functions/student-insights/index.ts` | New edge function for AI analysis |
| `src/integrations/supabase/types.ts` | Auto-updated with new columns |

---

## Database Migration Summary

```sql
-- 1. Add ban columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN is_banned boolean NOT NULL DEFAULT false,
ADD COLUMN banned_at timestamp with time zone,
ADD COLUMN banned_by uuid,
ADD COLUMN ban_reason text;

-- 2. Create index for quick banned user filtering
CREATE INDEX idx_profiles_is_banned ON public.profiles(is_banned) WHERE is_banned = true;

-- 3. Add RLS policy for admins to update ban status
CREATE POLICY "Admins can update ban status" ON public.profiles
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

---

## Security Considerations

1. **Ban enforcement** - The `is_banned` flag must be checked:
   - In `ProtectedRoute` to block banned users from accessing the app
   - In RLS policies to prevent banned users from creating content

2. **AI Insights** - Only admins can call the `student-insights` endpoint (verify admin role in function)

3. **Audit trail** - Ban actions are logged with `banned_by` and `banned_at` for accountability

---

## User Experience Flow

### Banning a User

```text
Admin clicks "..." → "Ban User"
         ↓
┌──────────────────────────────┐
│  Ban Student                 │
│  ─────────────               │
│  Are you sure you want to    │
│  ban "John Doe"?             │
│                              │
│  Reason (required):          │
│  ┌────────────────────────┐  │
│  │ Violated community...  │  │
│  └────────────────────────┘  │
│                              │
│  ⚠️ This will:               │
│  • Block access to platform  │
│  • Preserve their data       │
│                              │
│  [Cancel]  [Ban User]        │
└──────────────────────────────┘
```

### Viewing AI Insights

```text
Admin opens StudentDetailSheet
         ↓
Scrolls to Learning Analytics
         ↓
Clicks "Get AI Insights"
         ↓
Loading... (calls edge function)
         ↓
Displays personalized recommendations
```

---

## Technical Notes

- Learning metrics are calculated client-side from existing data (no new tables needed)
- AI insights use the Lovable AI gateway (same as question generation)
- Ban status is enforced at the route/RLS level
- All admin actions require confirmation dialogs
- Progress/enrollment deletions are logged for audit purposes

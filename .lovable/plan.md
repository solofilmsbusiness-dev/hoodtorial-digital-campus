
# Transform Community into Social Media Platform with Daily Challenges

## Overview

Redesign the Community section to feel more like a modern creative social media platform (think Instagram for filmmakers) with daily mini-projects that reward students with bonus credits for participating.

## Current State

- Basic forum-style community with categories (General, Courses, Projects, Critique)
- Standard post cards with like/follow/comment features
- Text-heavy layout without visual focus
- No gamification or credit incentives for participation

## New Features

### 1. Daily Challenges System

A rotating system of mini film projects that refresh daily, encouraging consistent creative practice.

**Challenge Examples:**
- "Film a 15-second transition using only natural light" (0.5 credits)
- "Capture 3 shots that tell a story without dialogue" (0.5 credits)
- "Create a cinematic B-roll of your morning routine" (0.5 credits)

**Database Schema (New Tables):**

```sql
-- Daily challenges table
CREATE TABLE daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  prompt TEXT NOT NULL,
  difficulty TEXT DEFAULT 'beginner', -- beginner, intermediate, advanced
  credits_reward DECIMAL(3,1) DEFAULT 0.5,
  category TEXT DEFAULT 'general', -- lighting, composition, movement, storytelling
  active_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Challenge submissions tracking
CREATE TABLE challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  credits_awarded DECIMAL(3,1),
  awarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id) -- One submission per challenge per user
);
```

### 2. Visual Feed Redesign

Transform from forum cards to a more visual, Instagram-style grid/feed layout.

**New Layout Options:**
- **Grid View**: 3-column masonry grid showing media previews
- **Feed View**: Full-width single column with larger media display
- **Stories Bar**: Horizontal scrollable row of recent challenge submissions

**Visual Changes:**
- Larger image/video previews (hero media)
- Author avatar overlays on media
- Quick action buttons (like, comment) visible on hover
- Floating "New Challenge" banner at top

### 3. Challenge Submission Flow

**New Post Type: "Challenge Response"**
- When posting, users can tag their submission as a challenge response
- System auto-links to the active daily challenge
- Upon submission, credits are awarded automatically
- Badge appears on post: "Daily Challenge 0.5cr"

### 4. Enhanced Feed Component

```text
+------------------------------------------+
|  TODAY'S CHALLENGE                   0.5cr |
|  "Film a 15-second transition..."    [GO] |
+------------------------------------------+
|  [Grid] [Feed] [Following]    [+ Post]   |
+------------------------------------------+
| +--------+ +--------+ +--------+          |
| |  Img   | |  Img   | |  Img   |          |
| | @user1 | | @user2 | | @user3 |          |
| | 24 ♥   | | 12 ♥   | | 8 ♥    |          |
| +--------+ +--------+ +--------+          |
| +--------+ +--------+ +--------+          |
| |  Img   | |  Img   | |  Img   |          |
| |Challenge| |  Img   | |  Img   |          |
| | 0.5cr  | | @user5 | | @user6 |          |
| +--------+ +--------+ +--------+          |
+------------------------------------------+
```

### 5. Leaderboard & Streaks

**Weekly Leaderboard:**
- Top 10 students by challenge completions
- Top 10 by engagement (likes received)
- Streak counter (consecutive days with submissions)

**Streak System:**
- Track consecutive days of challenge completion
- Bonus credits at milestones (7-day: +0.5cr, 30-day: +2cr)

### 6. Quick Camera Upload

**Mobile-First Features:**
- Large "Create" floating action button
- Camera quick-launch option
- Story-style quick post for challenge responses

---

## Implementation Plan

### Phase 1: Database Setup

**New Tables:**
| Table | Purpose |
|-------|---------|
| `daily_challenges` | Store challenge prompts with dates and rewards |
| `challenge_submissions` | Track who completed which challenges |

**Schema Updates:**
- Add `challenge_id` column to `community_posts` (nullable FK)
- Add `is_challenge_response` boolean to `community_posts`

### Phase 2: New Components

| Component | Purpose |
|-----------|---------|
| `DailyChallengeCard.tsx` | Hero banner showing today's challenge |
| `ChallengeSubmissionForm.tsx` | Simplified post form for challenges |
| `FeedGrid.tsx` | Visual grid layout for posts |
| `FeedCard.tsx` | Compact visual-first post card |
| `StreakBadge.tsx` | Shows user's current streak |
| `Leaderboard.tsx` | Weekly top participants |
| `ViewToggle.tsx` | Grid/Feed/Following toggle |

### Phase 3: New Hooks

| Hook | Purpose |
|------|---------|
| `useDailyChallenges.ts` | Fetch active challenge, submit responses |
| `useChallengeStreak.ts` | Track and display user streaks |
| `useCommunityLeaderboard.ts` | Fetch weekly top users |

### Phase 4: UI Overhaul

**Community.tsx Changes:**
1. Add Daily Challenge banner at top (sticky)
2. Replace TabsList with visual ViewToggle
3. Add grid layout option for posts
4. Implement infinite scroll
5. Add floating "Create" button (mobile)

**PostCard.tsx Enhancements:**
1. Larger media preview (16:9 aspect ratio)
2. Avatar overlay on bottom-left of media
3. Challenge badge if applicable
4. Credits earned indicator
5. Hover effects with quick actions

### Phase 5: Admin Features

**New Admin Section: Challenge Manager**
- Create/edit daily challenges
- Schedule challenges in advance
- View submission analytics
- Award bonus credits manually

---

## Files to Create

| File | Description |
|------|-------------|
| `src/components/community/DailyChallengeCard.tsx` | Today's challenge hero |
| `src/components/community/ChallengeSubmissionForm.tsx` | Quick submit for challenges |
| `src/components/community/FeedGrid.tsx` | Grid layout container |
| `src/components/community/FeedCard.tsx` | Visual post card for grid |
| `src/components/community/StreakBadge.tsx` | Streak counter display |
| `src/components/community/Leaderboard.tsx` | Weekly rankings |
| `src/components/community/ViewToggle.tsx` | Grid/Feed toggle |
| `src/hooks/useDailyChallenges.ts` | Challenge data & submissions |
| `src/hooks/useChallengeStreak.ts` | Streak tracking |
| `src/hooks/useCommunityLeaderboard.ts` | Leaderboard data |
| `src/pages/admin/ChallengeManager.tsx` | Admin challenge CRUD |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Community.tsx` | Complete redesign with new layout |
| `src/components/community/PostCard.tsx` | Visual-first redesign |
| `src/components/community/CreatePostForm.tsx` | Add challenge linking |
| `src/hooks/useCommunityPosts.ts` | Add challenge filtering |
| `src/components/community/index.ts` | Export new components |

---

## Credit System Integration

When a user submits a challenge response:
1. Create community post with `challenge_id` set
2. Insert row into `challenge_submissions`
3. Increment user's credits via `user_progress` table
4. Show celebration toast with confetti
5. Update streak counter

**Credit Amounts:**
- Daily challenge completion: 0.5 credits
- 7-day streak bonus: +0.5 credits
- 14-day streak bonus: +1 credit
- 30-day streak bonus: +2 credits
- Featured by instructor: +1 credit

---

## Mobile Experience

**Touch-Optimized Features:**
- Swipe between grid and feed views
- Pull-to-refresh for new content
- Bottom sheet for creating posts
- Full-screen media viewer
- Double-tap to like

---

## Sample Daily Challenges Seed Data

```sql
INSERT INTO daily_challenges (title, prompt, difficulty, credits_reward, category, active_date) VALUES
('Light Study', 'Film a 15-second clip using only available light. Focus on shadows.', 'beginner', 0.5, 'lighting', CURRENT_DATE),
('Three-Shot Story', 'Tell a complete story in exactly 3 shots. No dialogue.', 'intermediate', 0.5, 'storytelling', CURRENT_DATE + 1),
('Motion Blur', 'Create intentional motion blur that enhances your subject.', 'intermediate', 0.5, 'movement', CURRENT_DATE + 2),
('Reflections', 'Use reflections (mirrors, water, glass) creatively in your shot.', 'beginner', 0.5, 'composition', CURRENT_DATE + 3),
('One Take Wonder', 'Film a 30-second continuous take with camera movement.', 'advanced', 0.5, 'movement', CURRENT_DATE + 4);
```

---

## Expected Outcome

The transformed Community section will:
1. Feel more like Instagram/TikTok for filmmakers
2. Encourage daily creative practice through challenges
3. Reward participation with bonus credits (0.5cr per challenge)
4. Create healthy competition via leaderboards
5. Build habits with streak tracking
6. Prioritize visual content over text discussions
7. Work beautifully on mobile devices

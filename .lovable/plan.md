

# Admin Demo Mode: Simulated Platform Population

## Overview

Create a powerful admin feature called "Demo Mode" that populates the platform with realistic AI-generated users, community content, and activity data. This allows admins to see what a fully active platform looks like without real users, ideal for testing, demos, and showcasing the platform to stakeholders.

---

## Architecture

The demo mode will work by:
1. Creating temporary "demo users" in the auth system with a special flag
2. Generating realistic community posts, comments, likes, and progress data
3. All demo data is isolated and can be cleared with a single toggle
4. Demo data is clearly marked to prevent confusion with real users

### Key Principle: Non-Destructive

- Demo data uses a special `is_demo` flag in all tables
- Clearing demo mode only deletes `is_demo = true` records
- Real user data is never affected
- Demo mode can be toggled on/off without impacting production

---

## Database Changes

### 1. Add `is_demo` Column to Relevant Tables

Add a boolean `is_demo` column (default `false`) to:

| Table | Purpose |
|-------|---------|
| `profiles` | Mark demo user profiles |
| `community_posts` | Mark demo posts |
| `community_comments` | Mark demo comments |
| `post_likes` | Mark demo likes |
| `comment_likes` | Mark demo comment likes |
| `challenge_submissions` | Mark demo challenge submissions |
| `user_progress` | Mark demo progress |
| `quiz_results` | Mark demo quiz results |
| `enrollments` | Mark demo enrollments |

### 2. RLS Policy Updates

Update RLS policies to allow admins to:
- Insert demo data on behalf of other users
- Delete demo data in bulk

```sql
-- Example: Allow admins to insert demo posts
CREATE POLICY "Admins can insert demo posts"
  ON community_posts FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) 
    AND is_demo = true
  );

-- Example: Allow admins to delete demo data
CREATE POLICY "Admins can delete demo posts"
  ON community_posts FOR DELETE
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    AND is_demo = true
  );
```

### 3. Demo Settings Table

```sql
CREATE TABLE demo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active boolean NOT NULL DEFAULT false,
  demo_user_count integer NOT NULL DEFAULT 25,
  demo_post_count integer NOT NULL DEFAULT 50,
  last_generated_at timestamp with time zone,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamp with time zone DEFAULT now()
);
```

---

## Backend: Edge Function for Demo Data Generation

### `supabase/functions/generate-demo-data/index.ts`

This edge function uses AI to generate realistic:
- User names and bios
- Community post content (filmmaking discussions)
- Comments and critiques
- Profile pictures (using placeholder avatar services)

**Capabilities:**
- Generate 10-50 demo users with realistic filmmaker profiles
- Create 25-100 community posts with media URLs
- Add 50-200 comments on posts
- Generate random likes and follows
- Create progress data showing students at various stages
- Generate quiz attempts with realistic scores

**AI Integration:**
- Uses Lovable AI (gemini-2.5-flash) to generate:
  - Realistic filmmaker display names
  - Profile bios with filmmaking interests
  - Post titles and content about cinematography, directing, etc.
  - Constructive comments and critiques

---

## Frontend Components

### 1. Demo Mode Settings Card

**File:** `src/components/admin/DemoModeSettingsCard.tsx`

Location: Admin Settings page (next to Test Mode card)

**Features:**
- Master toggle to enable/disable demo mode
- Status indicator showing demo data counts
- Configuration sliders:
  - Number of demo users (10-50)
  - Number of demo posts (25-100)
  - Number of demo comments (50-200)
- Generate button with progress indicator
- Clear all demo data button (with confirmation)
- Last generated timestamp

**UI Design:**
```text
┌────────────────────────────────────────────────────┐
│  🎭 Demo Mode                              [OFF]   │
│  Populate the platform with simulated users        │
├────────────────────────────────────────────────────┤
│                                                    │
│  Demo Data Status                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Users   │ │  Posts   │ │ Comments │           │
│  │    25    │ │    50    │ │   120    │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│                                                    │
│  Configuration                                     │
│  Demo Users:    [====|====] 25                     │
│  Demo Posts:    [====|====] 50                     │
│  Demo Comments: [====|====] 120                    │
│                                                    │
│  [ 🔄 Generate Demo Data ]  [ 🗑️ Clear All ]      │
│                                                    │
│  Last generated: 5 minutes ago                     │
└────────────────────────────────────────────────────┘
```

### 2. Demo Mode Banner

**File:** `src/components/admin/DemoModeBanner.tsx`

A subtle banner shown when demo mode is active:
- Yellow/amber color to distinguish from test mode (red)
- Shows count of demo users/posts visible
- Quick toggle to hide demo data (filter it out)
- Link to manage demo settings

### 3. Demo User Indicator

Small badge/icon shown on demo user profiles and posts:
- 🎭 icon or "Demo" badge
- Visible only to admins
- Helps distinguish demo content from real content

---

## Context & Hooks

### 1. Demo Mode Context

**File:** `src/contexts/DemoModeContext.tsx`

```typescript
interface DemoModeState {
  isActive: boolean;           // Demo mode enabled
  showDemoData: boolean;       // Whether to show demo data in UI
  demoUserCount: number;       // Current demo user count
  demoPostCount: number;       // Current demo post count
  isGenerating: boolean;       // Generation in progress
  lastGeneratedAt: Date | null;
}

interface DemoModeContextType {
  ...DemoModeState;
  toggleDemoMode: () => void;
  generateDemoData: (config: DemoConfig) => Promise<void>;
  clearDemoData: () => Promise<void>;
  toggleShowDemoData: () => void;
  refreshStats: () => void;
}
```

### 2. Demo Mode Hook

**File:** `src/hooks/useDemoMode.ts`

Provides easy access to demo mode state and actions throughout the app.

---

## Demo Data Generation Strategy

### Phase 1: Generate Demo Profiles

1. Use AI to generate 25 realistic filmmaker names and bios
2. Assign random avatar URLs from UI Avatars or similar service
3. Create profiles with varied `subscription_status` (trial, active, expired)
4. Assign random course enrollments

### Phase 2: Generate Community Content

1. Create demo posts across all categories:
   - General discussions (30%)
   - Course discussions (25%)
   - Project submissions (25%)
   - Feedback/critique requests (15%)
   - Challenge submissions (5%)

2. Generate realistic content using AI prompts:
   ```text
   Generate a community post from a film student discussing:
   - Topic: [lighting/camera movement/composition/story]
   - Tone: [seeking advice/sharing work/celebrating progress]
   - Length: 2-4 paragraphs
   ```

3. Add placeholder images from Unsplash (film/camera category)

### Phase 3: Generate Engagement

1. Randomly distribute likes across posts (avg 5-15 per post)
2. Generate AI comments using critique format
3. Create threaded replies
4. Add post follows

### Phase 4: Generate Progress Data

1. Random lesson completion (0-100% per user)
2. Quiz attempts with realistic score distributions
3. Challenge submissions for recent challenges

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| Database Migration | Create | Add `is_demo` columns, demo_settings table, RLS policies |
| `supabase/functions/generate-demo-data/index.ts` | Create | Edge function for AI-powered data generation |
| `src/contexts/DemoModeContext.tsx` | Create | React context for demo mode state |
| `src/hooks/useDemoMode.ts` | Create | Hook for demo mode access |
| `src/components/admin/DemoModeSettingsCard.tsx` | Create | Admin settings card UI |
| `src/components/admin/DemoModeBanner.tsx` | Create | Demo mode active banner |
| `src/components/admin/DemoUserBadge.tsx` | Create | Badge component for demo users |
| `src/pages/admin/AdminSettings.tsx` | Modify | Add DemoModeSettingsCard |
| `src/App.tsx` | Modify | Add DemoModeProvider |
| `src/hooks/useCommunityPosts.ts` | Modify | Filter out demo posts when `showDemoData = false` |
| `src/hooks/useAllUsers.ts` | Modify | Filter out demo users when `showDemoData = false` |

---

## Security Considerations

1. **Admin-Only Access**: Demo mode toggles require verified admin role
2. **RLS Protection**: Demo data operations only work with `is_demo = true`
3. **Isolated Data**: Demo users cannot interact with real users
4. **Clear Audit Trail**: `last_generated_at` and `updated_by` tracked
5. **Rate Limiting**: Edge function limited to prevent abuse

---

## Example Generated Demo Data

### Demo User Profile
```json
{
  "display_name": "Alex Rivera",
  "bio": "Aspiring cinematographer with a passion for natural lighting. Currently working on my first short documentary about urban wildlife.",
  "avatar_url": "https://ui-avatars.com/api/?name=Alex+Rivera&background=random",
  "location": "Los Angeles, CA",
  "filmmaking_style": "Documentary, Nature",
  "is_demo": true
}
```

### Demo Community Post
```json
{
  "title": "First time using a slider - feedback appreciated!",
  "content": "Just completed my first shot using a camera slider for a short film project. I went for a slow reveal of my subject against a sunset background. Would love feedback on the movement speed and framing choices...",
  "category": "feedback_critique",
  "media_urls": ["https://images.unsplash.com/photo-1516035069371-..."],
  "is_demo": true
}
```

---

## Implementation Phases

### Phase 1: Database Setup
- Add `is_demo` columns to all relevant tables
- Create demo_settings table
- Add RLS policies for admin demo operations

### Phase 2: Edge Function
- Create generate-demo-data function
- Implement AI-powered content generation
- Add clear demo data functionality

### Phase 3: Frontend Integration
- Create DemoModeContext and hook
- Build DemoModeSettingsCard component
- Add demo badges/indicators

### Phase 4: Polish
- Add DemoModeBanner
- Update community hooks to filter demo data
- Add loading states and error handling


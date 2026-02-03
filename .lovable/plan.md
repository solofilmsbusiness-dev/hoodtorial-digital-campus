

# Facebook-Style Timeline Community Feed

## Overview

Transform the community feed from its current Instagram-inspired grid/feed layout into a more visual Facebook-style timeline. This will feature a single-column centered timeline with rich post cards, inline media previews, and a more engaging social experience.

## Current vs. New Design

| Aspect | Current | New Facebook-Style |
|--------|---------|-------------------|
| Layout | Grid (Instagram-style) | Single-column timeline |
| Post cards | Minimal, media-focused | Rich cards with full content preview |
| Media display | Square thumbnails | Inline images/videos in feed |
| Content visibility | Title only in grid | Full post content visible |
| Interactions | Hidden on hover | Always visible action bar |
| Comments preview | None | Show 2 most recent comments |
| Create post | Separate form | Inline "What's on your mind?" prompt |

## Visual Design

```text
+----------------------------------------------------------+
|  ┌────────────────────────────────────────────────────┐  |
|  │  [Avatar] What's on your mind?        [📷] [Post]  │  |
|  └────────────────────────────────────────────────────┘  |
|                                                          |
|  ┌────────────────────────────────────────────────────┐  |
|  │  [Avatar] John Smith           · 2h  [Category]    │  |
|  │  ─────────────────────────────────────────────     │  |
|  │  My latest short film project!                     │  |
|  │                                                    │  |
|  │  Just wrapped up editing on my cinematography      │  |
|  │  assignment. Would love feedback on the lighting   │  |
|  │  choices in the third act...                       │  |
|  │                                                    │  |
|  │  ┌────────────────────────────────────────────┐   │  |
|  │  │                                            │   │  |
|  │  │            [Large Image/Video]             │   │  |
|  │  │                                            │   │  |
|  │  └────────────────────────────────────────────┘   │  |
|  │                                                    │  |
|  │  ❤️ 24 likes   💬 8 comments   🔖 Save              │  |
|  │  ─────────────────────────────────────────────     │  |
|  │   [❤️ Like]    [💬 Comment]    [🔖 Save]            │  |
|  │  ─────────────────────────────────────────────     │  |
|  │                                                    │  |
|  │  [Avatar] Sarah: Great work on the lighting! 🔥    │  |
|  │  [Avatar] Mike: The color grading is chef's kiss   │  |
|  │                                                    │  |
|  │  View all 8 comments                               │  |
|  └────────────────────────────────────────────────────┘  |
|                                                          |
|  ┌────────────────────────────────────────────────────┐  |
|  │            [Next Post Card...]                     │  |
|  └────────────────────────────────────────────────────┘  |
+----------------------------------------------------------+
```

## Implementation Details

### 1. New Component: TimelinePost

Create a rich Facebook-style post card:

```typescript
// src/components/community/TimelinePost.tsx
interface TimelinePostProps {
  post: CommunityPost;
  onLike: () => void;
  onComment: () => void;
  onSave: () => void;
  onClick: () => void;
  previewComments?: Comment[];
}
```

**Features:**
- Full author header with avatar, name, timestamp, and category badge
- Complete post content visible (expandable for long posts)
- Large inline media display (images in 1:1 or 16:9 ratio, video thumbnails)
- Image carousel for multiple images
- Engagement stats bar (likes, comments count)
- Action buttons row (Like, Comment, Save)
- Preview of 2 most recent comments
- "View all X comments" link

### 2. New Component: CreatePostPrompt

Inline post creation prompt (Facebook-style):

```typescript
// src/components/community/CreatePostPrompt.tsx
interface CreatePostPromptProps {
  onOpen: () => void;
  userAvatar?: string;
  userName?: string;
}
```

**Features:**
- User avatar on left
- "What's on your mind?" placeholder text
- Quick action buttons (Photo, Video)
- Clicking opens the full CreatePostForm

### 3. Update FeedGrid Component

Add a new "timeline" variant:

```typescript
// Updated FeedGrid.tsx
type FeedVariant = 'grid' | 'feed' | 'timeline';

if (variant === 'timeline') {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {posts.map((post) => (
        <TimelinePost 
          post={post}
          previewComments={/* fetch 2 recent comments */}
          // ...
        />
      ))}
    </div>
  );
}
```

### 4. Update ViewToggle

Replace current options with more descriptive Facebook-style naming:

```typescript
const options = [
  { value: 'timeline', icon: <Newspaper />, label: 'Timeline' },
  { value: 'grid', icon: <LayoutGrid />, label: 'Gallery' },
  { value: 'following', icon: <Users />, label: 'Following' },
];
```

### 5. Update Community.tsx

- Default to "timeline" view mode
- Add CreatePostPrompt above the feed
- Fetch comment previews for timeline view

### 6. Enhance Hooks

Update `useCommunityPosts` to optionally fetch preview comments:

```typescript
// Add comment preview fetching
const fetchWithCommentPreviews = async () => {
  // Fetch posts
  // For each post, fetch 2 most recent comments
  // Return enriched posts
};
```

## File Changes

| File | Action | Purpose |
|------|--------|---------|
| `src/components/community/TimelinePost.tsx` | Create | Main Facebook-style post card |
| `src/components/community/CreatePostPrompt.tsx` | Create | Inline "What's on your mind?" prompt |
| `src/components/community/FeedGrid.tsx` | Modify | Add timeline variant |
| `src/components/community/ViewToggle.tsx` | Modify | Update view mode options |
| `src/components/community/index.ts` | Modify | Export new components |
| `src/pages/Community.tsx` | Modify | Default to timeline, add prompt |
| `src/hooks/useCommunityPosts.ts` | Modify | Add comment preview fetching |

## TimelinePost Card Structure

```text
┌─────────────────────────────────────────────────────┐
│ HEADER                                              │
│  [Avatar] Author Name  ·  2 hours ago   [Category]  │
├─────────────────────────────────────────────────────┤
│ CONTENT                                             │
│  Post title (bold, larger)                          │
│  Post body text (expandable if > 3 lines)           │
│  [Read more] link for long posts                    │
├─────────────────────────────────────────────────────┤
│ MEDIA                                               │
│  ┌───────────────────────────────────────────────┐  │
│  │  Large image preview (16:9 or 4:3 ratio)      │  │
│  │  Or video thumbnail with play button          │  │
│  │  Carousel dots if multiple images             │  │
│  └───────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│ ENGAGEMENT STATS                                    │
│  ❤️ 24    💬 8 comments                             │
├─────────────────────────────────────────────────────┤
│ ACTION BUTTONS                                      │
│  [❤️ Like]       [💬 Comment]       [🔖 Save]        │
├─────────────────────────────────────────────────────┤
│ COMMENT PREVIEW                                     │
│  [Avatar] User1: Great work! This is amazing...     │
│  [Avatar] User2: Love the cinematography here       │
│                                                     │
│  View all 8 comments                                │
└─────────────────────────────────────────────────────┘
```

## Media Display Rules

| Media Type | Display |
|------------|---------|
| Single image | Full width, maintain aspect ratio (max 16:9) |
| 2 images | Side by side, 50% width each |
| 3+ images | First large, rest in grid below |
| Video (YouTube) | Embedded player with poster |
| Video (other) | Thumbnail with play overlay |
| No media | Text-only card (slightly more compact) |

## Styling Notes

- Cards use the existing `card-urban` style with enhanced padding
- Maintain the gold (#D4AF37) and neon accent colors
- Action buttons use subtle hover states
- Like button animates when clicked (heart fill animation)
- Smooth expand/collapse for "Read more" on long posts
- Image lightbox on click (existing ImageGallery component)

## Expected User Experience

1. User arrives at /community and sees a clean timeline
2. "What's on your mind?" prompt encourages posting
3. Rich post cards show full content without clicking
4. Media displays inline and large for visual impact
5. Comment previews encourage engagement
6. Action buttons always visible for quick interaction
7. Toggle to Gallery view for visual browsing mode


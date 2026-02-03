
# Enforcing Content Completion Requirements

## Problem Statement
Currently, students can mark lessons complete by clicking a button without actually watching videos. The progression system has the logic to track video progress, but the video player doesn't report watch time back to the system.

## Current State Analysis
- **Database**: Already has `watch_percentage`, `watched_seconds`, `video_duration_seconds` columns in `user_progress` table
- **Hook Logic**: `useLessonProgress.ts` has `updateWatchProgress()` function and 90% threshold logic
- **Video Player**: Does NOT track playback time - just displays embedded videos
- **Quiz System**: Already properly enforces completion (must pass to proceed)
- **Manual Override**: "Mark Complete" button allows bypassing video watching

## Solution Architecture

```text
Video Playback → Track Time → Update Progress → Auto-Complete at 90%
                     ↓
                Database stores:
                - watched_seconds
                - video_duration_seconds  
                - watch_percentage
                - completed (auto-set at 90%)
```

---

## Implementation Steps

### Step 1: Create Video Progress Tracker Component
**New file: `src/components/course/VideoProgressTracker.tsx`**

A wrapper component that tracks video playback:
- For **direct video files (.mp4)**: Use HTML5 video events (`timeupdate`, `durationchange`, `ended`)
- For **YouTube/Vimeo**: Use their respective Player APIs via postMessage
- Reports progress every 5 seconds to avoid excessive database writes
- Shows visual progress indicator below video

### Step 2: Update VideoPlayer Component
**Edit: `src/components/course/VideoPlayer.tsx`**

- Accept new props: `onProgress`, `onComplete`, `lessonId`
- For direct videos: Add event listeners for `timeupdate` and `loadedmetadata`
- For YouTube: Use YouTube IFrame API to get `getCurrentTime()` and `getDuration()`
- For Vimeo: Use Vimeo Player SDK to track progress
- Call `onProgress(watchedSeconds, durationSeconds)` periodically

### Step 3: Create Video Progress Hook
**New file: `src/hooks/useVideoProgress.ts`**

Manages video progress state and persistence:
- Debounces progress updates (every 5 seconds)
- Loads initial progress from database on mount
- Calculates completion percentage
- Auto-triggers completion when 90% watched
- Provides resume position for continuing where user left off

### Step 4: Update CourseDetail Page
**Edit: `src/pages/CourseDetail.tsx`**

- Remove or modify "Mark Complete" button behavior
- For video lessons: Button shows watch progress percentage
- Button only enabled when 90%+ watched OR lesson type is not video
- For reading/practice lessons: Keep manual completion available
- Pass progress handlers to VideoPlayer

### Step 5: Update LockedLessonCard Display
**Edit: `src/components/course/LockedLessonCard.tsx`**

- Already accepts `watchPercentage` prop (currently unused)
- Ensure progress bar displays correctly for in-progress videos
- Show "X% watched" indicator for partial completion

### Step 6: Add Visual Progress Overlay to Video
**Edit: `src/components/course/VideoPlayer.tsx`**

Add UI elements:
- Progress bar at bottom of video showing watch completion
- "Resume from X:XX" indicator if returning to partially watched video
- Checkmark overlay when 90%+ complete

---

## Technical Details

### Video Progress Tracking Strategy

**Direct Video (.mp4, .webm):**
```typescript
// Use native video element events
videoRef.current.addEventListener('timeupdate', () => {
  const watched = videoRef.current.currentTime;
  const duration = videoRef.current.duration;
  onProgress(watched, duration);
});
```

**YouTube (via postMessage API):**
```typescript
// Listen for YouTube player state changes
window.addEventListener('message', (e) => {
  if (e.data.event === 'infoDelivery') {
    const { currentTime, duration } = e.data.info;
    onProgress(currentTime, duration);
  }
});
```

**Vimeo (via Vimeo Player SDK):**
```typescript
// Use @vimeo/player package
const player = new Player(iframeRef);
player.on('timeupdate', (data) => {
  onProgress(data.seconds, data.duration);
});
```

### Completion Requirements by Lesson Type

| Lesson Type | Completion Requirement |
|-------------|------------------------|
| Video | 90%+ of video watched |
| Reading | Manual "Mark Complete" click |
| Practice | Manual "Mark Complete" click |
| Quiz | Must pass (existing logic) |

### Database Update Frequency
- Progress saved every 5 seconds during playback
- Final save on video pause/end
- Debounced to prevent excessive writes

---

## Files to Create
1. `src/hooks/useVideoProgress.ts` - Video progress state management
2. `src/components/course/VideoProgressTracker.tsx` - Progress tracking wrapper

## Files to Modify
1. `src/components/course/VideoPlayer.tsx` - Add progress tracking events
2. `src/pages/CourseDetail.tsx` - Connect progress system, update "Mark Complete" logic
3. `src/components/course/LockedLessonCard.tsx` - Ensure progress display works

## Dependencies to Consider
- May need to add `@vimeo/player` package for Vimeo tracking
- YouTube tracking works via postMessage (no package needed)

---

## User Experience Flow

1. **Student opens lesson** → Video loads, resumes from last position if applicable
2. **Student watches video** → Progress bar fills up, percentage updates in sidebar
3. **At 90% watched** → Lesson auto-marked complete, next content unlocks
4. **For non-video lessons** → "Mark Complete" button available immediately
5. **For quizzes** → Must pass to unlock next module (existing behavior)

## Edge Cases Handled
- Seeking/skipping: Track actual watched time, not just current position
- Browser refresh: Resume from last saved position
- Slow connection: Debounced saves prevent data loss
- Multiple devices: Latest progress wins

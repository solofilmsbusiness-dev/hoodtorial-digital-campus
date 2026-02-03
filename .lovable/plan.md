

# Fix Video Progress Tracking for Students

## Problem Analysis

Video watch progress is not being saved to the database for students. After investigation, I found that:

1. **The video is YouTube-based** and uses the YouTube IFrame API for tracking
2. **The database shows 0% progress** even after watching (record exists but `watched_seconds: 0`, `watch_percentage: 0`)
3. **The YouTube Player initialization has race conditions** that cause the progress tracking to fail silently

## Root Causes

### Issue 1: YT.Player initialization race condition
The current code has a problematic pattern:
```javascript
if (window.YT && window.YT.Player) {
  onYouTubeReady();  // Called immediately
} else {
  window.onYouTubeIframeAPIReady = onYouTubeReady;  // Callback
}
```
- If the YouTube API is partially loaded, `window.YT` exists but `window.YT.Player` might not be ready
- If multiple components mount, they overwrite `onYouTubeIframeAPIReady`

### Issue 2: No validation that player is ready
- The `onReady` event might never fire if the player fails to attach
- There's no fallback or error handling

### Issue 3: iframe ID assignment timing
- The iframe ID is assigned inside `onYouTubeReady`, but the iframe needs the ID before `new YT.Player()` is called
- React may have already rendered a different iframe by then

## Solution

### 1. Refactor YouTube Player Initialization

Use a more robust initialization pattern that:
- Waits for iframe to be loaded before attaching player
- Uses proper API ready state checking
- Adds error handling and fallback

### 2. Add postMessage-based Fallback

As a backup, listen to YouTube's `postMessage` events for playback state, which works even if the JS API fails to initialize.

### 3. Add Debugging/Logging

Add console logging during development to track when progress updates are attempted.

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/course/VideoPlayer.tsx` | Fix YouTube player initialization with proper API ready checking, add iframe load event listener, improve error handling |
| `src/hooks/useVideoProgress.ts` | Add debug logging for save operations |

## Implementation Details

### VideoPlayer.tsx Changes

```typescript
// 1. Assign iframe ID immediately (before useEffect)
const iframeId = useMemo(() => 
  `yt-player-${lesson.id.replace(/[^a-zA-Z0-9]/g, '')}`, 
  [lesson.id]
);

// 2. Use proper API ready detection
useEffect(() => {
  if (videoType !== "youtube" || !onProgress) return;
  
  let player: YT.Player | null = null;
  let isDestroyed = false;
  
  const initPlayer = () => {
    if (isDestroyed) return;
    
    try {
      player = new window.YT.Player(iframeId, {
        events: {
          onReady: (event) => {
            console.log("[VideoPlayer] YouTube player ready");
            // ... start polling
          },
          onError: (event) => {
            console.error("[VideoPlayer] YouTube player error:", event.data);
          },
          onStateChange: (event) => {
            // Also track on state change for more reliable updates
            if (player && event.data === window.YT.PlayerState.PLAYING) {
              // Ensure polling is running
            }
          }
        },
      });
    } catch (err) {
      console.error("[VideoPlayer] Failed to init YouTube player:", err);
    }
  };
  
  // Robust API loading
  const checkAPIReady = () => {
    if (window.YT && window.YT.Player && typeof window.YT.Player === 'function') {
      initPlayer();
    } else {
      // Load API if not present
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
      // Wait for API with polling (more reliable than callback)
      const pollId = setInterval(() => {
        if (window.YT && window.YT.Player && typeof window.YT.Player === 'function') {
          clearInterval(pollId);
          initPlayer();
        }
      }, 100);
      
      // Cleanup poll on unmount
      return () => clearInterval(pollId);
    }
  };
  
  // Wait for iframe to be in DOM
  const waitForIframe = setInterval(() => {
    if (document.getElementById(iframeId)) {
      clearInterval(waitForIframe);
      checkAPIReady();
    }
  }, 50);
  
  return () => {
    isDestroyed = true;
    clearInterval(waitForIframe);
    if (youtubeIntervalRef.current) {
      clearInterval(youtubeIntervalRef.current);
    }
  };
}, [videoType, onProgress, iframeId, initialTime]);
```

### Key Improvements

1. **Stable iframe ID**: Generate ID based on lesson.id so it's consistent
2. **Wait for iframe in DOM**: Don't try to attach player until iframe exists
3. **Poll for API ready**: More reliable than overwriting the global callback
4. **Error handling**: Catch and log errors during player initialization
5. **onStateChange listener**: Additional tracking opportunity
6. **isDestroyed flag**: Prevent operations after unmount

### useVideoProgress.ts Changes

Add logging to help debug save operations:

```typescript
const saveProgress = useCallback(
  async (watchedSeconds: number, durationSeconds: number, forceComplete = false) => {
    if (!user || !lessonId || durationSeconds <= 0) {
      console.log("[VideoProgress] Skip save:", { user: !!user, lessonId, durationSeconds });
      return;
    }

    const watchPercentage = Math.round((watchedSeconds / durationSeconds) * 100);
    console.log("[VideoProgress] Saving:", { watchedSeconds, durationSeconds, watchPercentage });
    
    try {
      const { error } = await supabase.from("user_progress").upsert(
        // ... existing code
      );
      
      if (error) {
        console.error("[VideoProgress] Save error:", error);
      } else {
        console.log("[VideoProgress] Saved successfully");
      }
    } catch (err) {
      console.error("[VideoProgress] Save exception:", err);
    }
  },
  [user, courseCode, lessonId, onComplete]
);
```

## Expected Outcome

After these fixes:
- YouTube videos will reliably track watch progress
- Progress will be saved to the database every 5 seconds
- Lessons will auto-complete when 90% watched
- Console logs will help identify any remaining issues


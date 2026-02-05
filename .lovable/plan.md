
# Add Profile Navigation to Community Components

## Overview

Update the remaining community components to use the existing `UserProfileLink` component, allowing users to click on avatars and names to navigate to that user's public profile page.

---

## Current State

| Component | Status | Location |
|-----------|--------|----------|
| PostCard.tsx | Already uses UserProfileLink | Lines 77-92 |
| TimelinePost.tsx | Missing profile links | Header (86-106), Comment previews (305-315) |
| FeedCard.tsx | Missing profile links | Feed header (45-54), Grid overlay (228-236) |
| CommentThread.tsx | Missing profile links | Comment authors (91-109) |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/community/TimelinePost.tsx` | Replace Avatar/name with UserProfileLink in header and comment previews |
| `src/components/community/FeedCard.tsx` | Replace Avatar/name with UserProfileLink in both feed and grid variants |
| `src/components/community/CommentThread.tsx` | Replace Avatar/name with UserProfileLink for comment authors |

---

## Implementation Details

### 1. TimelinePost.tsx

**Header section (lines 84-102):**
- Replace the Avatar with UserProfileLink (showName=false)
- Replace the author name text with UserProfileLink (showAvatar=false)
- Keep the AddFriendButton hover behavior on the avatar wrapper

**Comment preview section (lines 304-320):**
- Replace the small Avatar/name with UserProfileLink for each preview comment author

### 2. FeedCard.tsx

**Feed variant header (lines 44-65):**
- Replace Avatar with UserProfileLink (showName=false, size="lg")
- Replace author name paragraph with UserProfileLink (showAvatar=false)

**Grid variant author overlay (lines 225-238):**
- Replace Avatar/name span with UserProfileLink (size="sm")

### 3. CommentThread.tsx

**CommentItem component (lines 90-110):**
- Replace the Avatar with UserProfileLink (showName=false)
- Replace the author name span with UserProfileLink (showAvatar=false)

---

## Technical Considerations

- The `UserProfileLink` component already includes `onClick={(e) => e.stopPropagation()}` to prevent triggering parent click handlers (like opening post detail)
- The component uses the existing `/profile/:userId` route that was already set up
- Styling classes from `UserProfileLink` can be customized via `avatarClassName` and `nameClassName` props to match existing designs

---

## Summary

| Category | Count |
|----------|-------|
| Files to modify | 3 |
| Total profile link locations | 6 (1 in TimelinePost header, 1 in TimelinePost comments, 2 in FeedCard, 2 in CommentThread) |
| New files | 0 |
| Database changes | None |

This completes the profile navigation ecosystem by making all user avatars and names throughout the community section clickable links to their public profiles.

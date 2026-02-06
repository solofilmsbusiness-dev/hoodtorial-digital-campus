

# Fix: Community Likes, Comments, Messaging, and Friends -- Smooth and Simple

## Root Cause Found: RLS Policy Mismatch

The biggest issue is a **database policy mismatch**. The SELECT (read) policies on `community_posts`, `post_likes`, `comment_likes`, and `community_comments` require `is_enrolled_student()` -- which checks for **paid access AND active course enrollment**. But the INSERT (write) policies use `has_community_access()` -- which only checks for **paid access**.

This means:
- A user with paid access but no enrollment can create posts, like, and comment -- but **cannot see** the posts, likes, or comments (including their own)
- Likes appear to not work because the like is inserted but the SELECT query can't read it back
- Comments get posted but don't show up in the thread

This was supposed to be fixed when community access was opened to all paid users, but the SELECT policies were never updated to match.

## Changes

### 1. Database Migration: Fix RLS SELECT policies (4 tables)

Update SELECT policies on these tables to use `has_community_access()` instead of `is_enrolled_student()`:

- **`community_posts`** -- "Enrolled students can view posts" -> use `has_community_access`
- **`post_likes`** -- "Enrolled students can view likes" -> use `has_community_access`
- **`comment_likes`** -- "Enrolled students can view comment likes" -> use `has_community_access`
- **`community_comments`** -- "Enrolled students can view comments" -> use `has_community_access`

This single migration fixes the core issue where likes/comments silently fail from the user's perspective.

### 2. Optimistic Updates for Post Likes (`src/hooks/useCommunityPosts.ts`)

Currently, clicking "Like" fires a mutation, waits for the server, then refetches all posts. This causes a noticeable delay. Add optimistic updates:

- On like click, immediately update `user_has_liked` and `likes_count` in the local query cache
- If the server call fails, roll back to the previous state
- This makes likes feel instant

### 3. Optimistic Updates for Comment Likes (`src/hooks/useCommunityComments.ts`)

Same pattern for comment likes:

- Immediately toggle `user_has_liked` and update `likes_count` in the cached comments tree
- Roll back on error

### 4. Simplify Comment Form for Non-Project Posts (`src/components/community/CritiqueCommentForm.tsx`)

The current comment form is wrapped in a heavy Card with structured feedback fields and image uploaders -- even for simple general posts. Simplify it:

- For non-project posts, show an inline text input with a send button (like a chat input), no Card wrapper
- Keep the structured critique form only when `isProjectPost` is true
- Remove the image uploader section for regular comments (keep it for project critiques)
- This makes commenting feel as easy as typing and hitting Enter

### 5. URL-Based Post Deep Linking (`src/pages/Community.tsx`)

The user is on `/community?post=e87e92ec-...` but the Community page doesn't read URL params. Add:

- Read `?post=` search param on mount
- If present, find and auto-select that post to show its detail view
- If not found in loaded posts, fetch it directly from the database

### 6. Inline Comment on Timeline Posts (`src/components/community/TimelinePost.tsx`)

Add a simple inline comment input directly on the timeline feed (like Facebook/Instagram):

- Below the comment previews, add a small text input: "Write a comment..."
- On Enter, submit the comment directly without navigating to the post detail
- This lets users comment without leaving the feed

### 7. Messaging Scroll Fix (`src/components/messaging/ChatWindow.tsx`)

The ScrollArea ref may not scroll properly because `ScrollArea` wraps the content in a viewport div. Fix:

- Use a div ref inside the scroll area content (not on the ScrollArea itself)
- Ensure auto-scroll targets the inner content container

## Files Summary

| File | Change |
|------|--------|
| Database migration | Fix 4 SELECT RLS policies to use `has_community_access` |
| `src/hooks/useCommunityPosts.ts` | Add optimistic updates to `toggleLike` mutation |
| `src/hooks/useCommunityComments.ts` | Add optimistic updates to `toggleCommentLike` mutation |
| `src/components/community/CritiqueCommentForm.tsx` | Simplify to inline input for non-project posts |
| `src/pages/Community.tsx` | Handle `?post=` URL param for deep linking |
| `src/components/community/TimelinePost.tsx` | Add inline comment input on timeline cards |
| `src/components/messaging/ChatWindow.tsx` | Fix scroll-to-bottom behavior |

## What This Fixes

- Likes now work reliably and feel instant (optimistic + RLS fix)
- Comments appear immediately after posting (RLS fix)
- Commenting is simple: type and press Enter right from the feed
- Deep links to posts work (URL param handling)
- Messages scroll to bottom properly
- Friends and messaging systems remain stable (no structural issues found there)

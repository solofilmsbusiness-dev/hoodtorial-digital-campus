

# Fix Profile Image Uploads and Improve Friends/Messaging System

## Issues Identified

### 1. Profile Image Upload Failures
The console logs show repeated "Failed to auto-fix profile: TypeError: Failed to fetch" errors. The storage bucket and RLS policies for `avatars` appear correctly configured (public bucket, upload/update/delete policies keyed to `auth.uid()`). The "Failed to fetch" errors suggest a network-level issue, likely caused by the Supabase client attempting requests that fail silently. The upload code itself in `useAvatarUpload.ts` is functional, but there are reliability improvements needed:
- **No error feedback to user on network failures** -- the upload silently fails
- **No retry logic** for transient network errors
- **Cache-busting URLs may cause stale references** in the profile context

### 2. Friends System -- Limited Discoverability
Currently, the only way to add a friend is via:
- A small hover-only `AddFriendButton` on community timeline posts
- There is **no user search/discovery page** to find and add other students
- The Friends page only shows existing friends and pending requests, with no way to find new people
- Sent requests show minimal info (no avatar, no cancel button)

### 3. Messaging System -- Missing Features
The messaging system works but is bare-bones:
- **No way to start a new conversation** from the Messages page itself -- you must go to Friends, find someone, then click Message
- **No user search within Messages** to find existing conversations
- **No image/media sharing** in messages
- **No online status indicator** on chat headers
- **No empty state guidance** for new users

---

## Plan

### Part 1: Fix Profile Image Uploads (reliability)

**File: `src/hooks/useAvatarUpload.ts`**
- Add try/catch around individual storage operations with user-facing error messages
- Add a toast notification on network failure so users know the upload failed
- Ensure the `onUploadComplete` -> `refetch()` chain in `StudentProfile.tsx` properly updates the UI after successful upload

**File: `src/components/profile/AvatarEditor.tsx`**
- No changes needed -- already handles errors from `uploadAvatar` correctly

**File: `src/components/profile/CoverBanner.tsx`**
- No changes needed -- already handles errors correctly

The core upload logic and storage policies are sound. The "Failed to fetch" errors in the console are from a profile auto-fix routine, not the upload itself. We should locate and fix that auto-fix code path so it handles network errors gracefully rather than spamming the console.

### Part 2: Add User Discovery to Friends System

**New File: `src/components/friends/UserSearch.tsx`**
- A search input that queries `profiles_public` by `display_name` (case-insensitive `ilike`)
- Displays matching users with avatar, name, and an `AddFriendButton` for each
- Excludes the current user from results
- Debounced search (300ms) to avoid excessive queries

**File: `src/pages/Friends.tsx`**
- Add a 4th tab: "Find Friends" with a search icon
- Embed the new `UserSearch` component in this tab
- This gives users a clear path to discover and add other students

**File: `src/components/friends/FriendCard.tsx`**
- Add online status dot (using existing `useOnlineUsers` hook)
- Show "Last seen" or "Online" text

**Sent Requests Tab Improvements (in `src/pages/Friends.tsx`)**
- Show avatar and display name for each sent request
- Add a "Cancel Request" button using the existing `cancelFriendRequest` function from `useFriendships`

### Part 3: Improve Messaging System

**File: `src/pages/Messages.tsx`**
- Add a "New Message" button that opens a friend-picker dialog
- Add a search/filter input above the conversation list to find existing conversations

**New File: `src/components/messaging/NewConversationDialog.tsx`**
- A dialog that lists the user's friends (from `useFriendships`)
- Clicking a friend creates/opens a conversation via `getOrCreateConversation`
- Includes a search filter to find friends quickly

**File: `src/components/messaging/ConversationList.tsx`**
- Add search filtering for conversations by display name
- Show online status dot next to user avatars

**File: `src/components/messaging/ChatWindow.tsx`**
- Add online status indicator in the chat header next to the user's name
- Improve empty state with a call-to-action to start a new conversation

**File: `src/components/messaging/MessageComposer.tsx`**
- Add image attachment support using the existing `community-uploads` storage bucket
- Add an image button (paperclip/image icon) that opens a file picker
- Upload selected image to storage, then send as a message with `message_type: 'image'`

**File: `src/components/messaging/MessageBubble.tsx`**
- Handle rendering of image-type messages (display inline image with click-to-expand)

---

## Technical Details

### Database Changes
- **No schema changes required** -- existing tables (`profiles_public`, `friendships`, `friend_requests`, `conversations`, `direct_messages`) support all planned features
- The `direct_messages` table already has a `message_type` column that can store 'image'
- The `community-uploads` bucket is already public and has existing RLS policies

### Files to Create
1. `src/components/friends/UserSearch.tsx` -- friend discovery search component
2. `src/components/messaging/NewConversationDialog.tsx` -- start new conversation dialog

### Files to Modify
1. `src/hooks/useAvatarUpload.ts` -- improve error handling
2. `src/pages/Friends.tsx` -- add "Find Friends" tab, improve "Sent" tab
3. `src/components/friends/FriendCard.tsx` -- add online status
4. `src/pages/Messages.tsx` -- add new conversation button, search
5. `src/components/messaging/ChatWindow.tsx` -- online status in header, better empty state
6. `src/components/messaging/MessageComposer.tsx` -- image attachment support
7. `src/components/messaging/MessageBubble.tsx` -- render image messages

### Estimated Scope
- 2 new files
- 7 modified files
- No database migrations needed




## Profile, Messaging & Safety Improvements

### Overview
This plan adds three major features: a profile customization guided tour for new editors, user blocking/reporting for safety, and messaging UX improvements. The existing profile editor is already well-structured, so the focus is on discoverability and safety rather than restructuring.

### Part 1: Profile Customization Walkthrough Tour

Add a guided tour that auto-triggers the first time a user visits their profile editor, highlighting the key sections they should customize.

**New file: `src/hooks/useProfileWalkthrough.ts`**
- 5-step tour targeting: Cover/Avatar area, Theme Picker, Bio fields, Portfolio tab, Layout tab
- Persists completion via a `profile_editor_toured` field in `profiles` table
- Auto-triggers once, can be replayed via a "Retake Tour" button
- Reuses the existing `WalkthroughOverlay` and `WalkthroughStep` components

**Modified file: `src/pages/StudentProfile.tsx`**
- Add `data-tour` attributes to key sections (cover/avatar card, theme picker, bio card, portfolio tab trigger, layout tab trigger)
- Add a small "Take the Tour" button in the header for replaying
- Initialize the walkthrough hook with profile state

**Database migration:**
- Add `profile_editor_toured boolean DEFAULT false` to `profiles` table

Tour steps:
1. "Your Look" -- Cover banner and avatar upload area
2. "Pick Your Vibe" -- Theme/accent color picker
3. "Tell Your Story" -- Bio, role, and creative identity fields
4. "Showcase Your Work" -- Portfolio tab with gallery and featured project
5. "Arrange Your Page" -- Layout tab for drag-and-drop section ordering

---

### Part 2: Block & Report Users

**Database migration -- two new tables:**

`user_blocks` table:
- `id` (uuid PK), `blocker_id` (uuid, references auth.users), `blocked_id` (uuid, references auth.users), `created_at` (timestamptz)
- Unique constraint on (blocker_id, blocked_id)
- RLS: Users can see/manage only their own blocks

`user_reports` table:
- `id` (uuid PK), `reporter_id` (uuid, references auth.users), `reported_id` (uuid, references auth.users), `reason` (text -- harassment, spam, abuse, inappropriate content, other), `details` (text, nullable), `status` (text DEFAULT 'pending'), `created_at` (timestamptz)
- RLS: Users can create reports and see their own; admins can see all

**New file: `src/hooks/useUserSafety.ts`**
- `blockUser(userId)` / `unblockUser(userId)` mutations
- `reportUser(userId, reason, details)` mutation
- `blockedUserIds` -- reactive set of blocked user IDs
- `isBlocked(userId)` check

**New file: `src/components/safety/BlockUserDialog.tsx`**
- Confirmation modal: "Block [name]? They won't be able to message you or see your profile."
- Unblock option for already-blocked users

**New file: `src/components/safety/ReportUserDialog.tsx`**
- Reason selector (Harassment, Spam, Abuse, Inappropriate Content, Other)
- Optional details textarea
- Confirmation with "Thank you for reporting" toast

**Modified files:**
- `src/pages/PublicProfile.tsx` -- Add Block/Report buttons (dropdown menu) on other users' profiles
- `src/components/messaging/ChatWindow.tsx` -- Add Block/Report option in header; show "You have blocked this user" state; hide composer when blocked
- `src/hooks/useConversations.ts` -- Filter out conversations with blocked users
- `src/hooks/useDirectMessages.ts` -- Prevent sending messages to blocked users
- `src/pages/admin/UserManager.tsx` -- Show reports count, ability to view and resolve reports

---

### Part 3: Messaging Improvements

The delete-own-message feature already exists. This section improves the UX:

**Modified file: `src/components/messaging/MessageBubble.tsx`**
- Show "Message deleted" placeholder (gray italic text) for deleted messages instead of removing them entirely -- this provides context in conversations
- This requires a soft-delete approach

**Modified file: `src/hooks/useDirectMessages.ts`**
- Change `deleteMessage` from hard delete to soft delete (update `is_deleted = true` instead of deleting the row)
- Filter display: show deleted messages as "[Message deleted]" instead of hiding them

**Database migration:**
- Add `is_deleted boolean DEFAULT false` to `direct_messages` table

**Modified file: `src/components/messaging/MessageActions.tsx`**
- Already has delete for own messages with confirmation -- no changes needed
- Add delete option for received messages (hides from your view only) -- this uses a separate `hidden_messages` approach or simply skips rendering

---

### Technical Summary

| File | Action |
|------|--------|
| Database migration | Add `profile_editor_toured` to profiles, create `user_blocks` and `user_reports` tables, add `is_deleted` to `direct_messages` |
| `src/hooks/useProfileWalkthrough.ts` | New -- 5-step profile editor tour |
| `src/hooks/useUserSafety.ts` | New -- block/report mutations and state |
| `src/components/safety/BlockUserDialog.tsx` | New -- block confirmation modal |
| `src/components/safety/ReportUserDialog.tsx` | New -- report form with reasons |
| `src/pages/StudentProfile.tsx` | Add tour data attributes and replay button |
| `src/pages/PublicProfile.tsx` | Add block/report dropdown |
| `src/components/messaging/ChatWindow.tsx` | Block/report in header, blocked state |
| `src/components/messaging/MessageBubble.tsx` | Soft-delete display |
| `src/hooks/useDirectMessages.ts` | Soft delete instead of hard delete |
| `src/hooks/useConversations.ts` | Filter blocked users |
| `src/pages/admin/UserManager.tsx` | View/resolve reports |




# Student Community Friend & Messaging Ecosystem

## Overview

This plan creates a complete social ecosystem within the student community where users can:
1. **Add friends** via friend requests (send, accept, decline, cancel)
2. **View a friends list** and see friend profiles
3. **Send private messages** (DMs) to friends in real-time
4. **Share contact cards** (the "How others see you" profile preview)

---

## System Architecture

```text
                         FRIEND SYSTEM
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  User A ──────────────────> Friend Request ────────> User B    │
│           [Send Request]                  [Accept/Decline]      │
│                   │                            │                │
│                   ▼                            ▼                │
│           friend_requests              friendships              │
│           (pending state)              (accepted pairs)         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

                        MESSAGING SYSTEM
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  User A ────────> Conversation ────────> Messages ────> User B  │
│           [Start Chat]      [Real-time]    [DMs]                │
│                                                                 │
│  conversations (between two users, unique pair)                 │
│  direct_messages (content, sender, conversation_id)             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

                        CONTACT CARD SHARING
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Profile Preview Card ────────> Special Message Type            │
│  (How others see you)           [Sent as DM attachment]         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### New Tables

#### 1. `friendships`
Stores accepted friend relationships (bidirectional pair stored once).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | First user (always lower UUID lexicographically) |
| friend_id | uuid | Second user |
| created_at | timestamp | When friendship was established |

**Unique constraint**: `(user_id, friend_id)` - prevents duplicates

#### 2. `friend_requests`
Stores pending friend requests.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| sender_id | uuid | Who sent the request |
| receiver_id | uuid | Who receives the request |
| status | text | 'pending', 'accepted', 'declined' |
| created_at | timestamp | When request was sent |
| responded_at | timestamp | When request was answered |

**Unique constraint**: `(sender_id, receiver_id)` - one pending request per pair

#### 3. `conversations`
Stores direct message conversation metadata.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| participant_1 | uuid | First user (lower UUID) |
| participant_2 | uuid | Second user |
| created_at | timestamp | When conversation started |
| last_message_at | timestamp | For sorting conversations |

**Unique constraint**: `(participant_1, participant_2)` - one conversation per pair

#### 4. `direct_messages`
Stores individual messages.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| conversation_id | uuid | FK to conversations |
| sender_id | uuid | Who sent the message |
| content | text | Message text |
| message_type | text | 'text', 'contact_card' |
| contact_card_data | jsonb | Profile snapshot for contact cards |
| is_read | boolean | Read receipt tracking |
| created_at | timestamp | When sent |

### RLS Policies

```text
friendships:
- Users can view their own friendships (either user_id or friend_id = auth.uid())
- Users can insert if they are user_id or friend_id AND both users are enrolled
- Users can delete (unfriend) their own friendships

friend_requests:
- Users can view requests they sent or received
- Users can insert (send) if they are sender_id AND enrolled
- Users can update (accept/decline) if they are receiver_id
- Users can delete (cancel) if they are sender_id

conversations:
- Users can view if they are participant_1 or participant_2
- Users can insert if they are a participant AND friends with other participant

direct_messages:
- Users can view if they are in the conversation
- Users can insert if they are sender AND in the conversation
- Users can update (mark read) if they are recipient
```

### Realtime Subscriptions
Enable realtime for:
- `friend_requests` (new request notifications)
- `direct_messages` (instant message delivery)
- `conversations` (update last_message_at)

---

## Feature Breakdown

### 1. Friend Requests System

**User Actions:**
- **Send Request**: Click "Add Friend" button on user's avatar/profile in community posts or search
- **View Incoming Requests**: Badge count in navigation, list in dedicated panel
- **Accept/Decline**: Quick actions on request cards
- **Cancel Pending**: Cancel requests you've sent

**UI Locations:**
- Community post cards - "Add Friend" button on author avatar hover
- User search/browse page (new page)
- Friend requests panel (in navigation dropdown or sidebar)

### 2. Friends List

**Features:**
- View all accepted friends with avatars and names
- Quick actions: Message, View Profile, Unfriend
- Online/offline status using Supabase Presence
- Search/filter friends

**UI Location:**
- New "Friends" section in Student Center sidebar or dedicated page
- Accessible from navigation dropdown

### 3. Direct Messaging (DMs)

**Features:**
- Real-time messaging between friends
- Conversation list with unread counts
- Typing indicators using Supabase Presence
- Message history with infinite scroll
- Read receipts

**UI Components:**
- **Messages Page** (`/messages`) - Full messaging interface
- **Conversation List** - Left sidebar with all chats
- **Chat Window** - Right side with messages and input
- **Floating Chat Widget** - Optional mini-chat like the existing AI widget

### 4. Contact Card Sharing

**Features:**
- In DM composer, button to "Share My Contact Card"
- Sends a special message type containing profile snapshot
- Recipient sees a rich preview card they can save/expand

**Data Structure:**
```json
{
  "message_type": "contact_card",
  "contact_card_data": {
    "user_id": "uuid",
    "display_name": "John Doe",
    "avatar_url": "...",
    "bio": "Filmmaker from LA",
    "filmmaking_style": "Documentary",
    "camera_gear": "Sony A7III",
    "portfolio_url": "...",
    "social_links": {...}
  }
}
```

---

## New Files

### Hooks
| File | Purpose |
|------|---------|
| `src/hooks/useFriendships.ts` | CRUD for friendships, request management |
| `src/hooks/useConversations.ts` | Fetch/create conversations, real-time updates |
| `src/hooks/useDirectMessages.ts` | Send/receive messages, read receipts, real-time |
| `src/hooks/useFriendPresence.ts` | Online status using Supabase Presence |

### Components

#### Friends
| File | Purpose |
|------|---------|
| `src/components/friends/AddFriendButton.tsx` | Triggers friend request from any context |
| `src/components/friends/FriendRequestCard.tsx` | Incoming request with accept/decline |
| `src/components/friends/FriendRequestsPanel.tsx` | List all pending requests |
| `src/components/friends/FriendsList.tsx` | Display all friends with actions |
| `src/components/friends/FriendCard.tsx` | Single friend with avatar, status, actions |
| `src/components/friends/index.ts` | Barrel export |

#### Messaging
| File | Purpose |
|------|---------|
| `src/components/messaging/ConversationList.tsx` | Sidebar with all conversations |
| `src/components/messaging/ConversationItem.tsx` | Single conversation preview |
| `src/components/messaging/ChatWindow.tsx` | Message history and composer |
| `src/components/messaging/MessageBubble.tsx` | Single message display |
| `src/components/messaging/MessageComposer.tsx` | Input with send button and attachments |
| `src/components/messaging/ContactCardMessage.tsx` | Render shared contact cards |
| `src/components/messaging/ShareContactButton.tsx` | Button to share profile card |
| `src/components/messaging/TypingIndicator.tsx` | Shows when friend is typing |
| `src/components/messaging/MessagesWidget.tsx` | Floating chat button with unread count |
| `src/components/messaging/index.ts` | Barrel export |

### Pages
| File | Purpose |
|------|---------|
| `src/pages/Messages.tsx` | Full messaging page with sidebar + chat |
| `src/pages/Friends.tsx` | Friends list and request management |

---

## Modified Files

| File | Changes |
|------|---------|
| `src/App.tsx` | Add routes for `/messages` and `/friends` |
| `src/components/layout/Navigation.tsx` | Add Messages icon with unread badge, Friends link |
| `src/pages/Community.tsx` | Add "Add Friend" button on post author avatars |
| `src/components/community/TimelinePost.tsx` | Add friend action on author click |
| `src/components/community/PostCard.tsx` | Add friend action |
| `src/pages/StudentCenter.tsx` | Add Friends section or link |
| `src/pages/StudentProfile.tsx` | Add "Share Contact Card" button in preview section |
| `src/components/profile/ProfilePreviewCard.tsx` | Add share functionality |

---

## User Experience Flows

### Adding a Friend
1. User sees a post in Community feed
2. Hovers/clicks on author's avatar
3. Sees "Add Friend" button (if not already friends)
4. Clicks button → Request sent → Toast confirmation
5. Recipient gets notification badge
6. Recipient opens requests panel, sees request
7. Clicks Accept → Both are now friends → Notification sent to sender

### Sending a Message
1. User goes to Friends list
2. Clicks "Message" on a friend
3. Opens conversation (creates if new)
4. Types message in composer
5. Hits send → Message appears instantly (optimistic update)
6. Friend receives real-time notification
7. Friend opens conversation, sees message
8. Message marked as read → Sender sees read receipt

### Sharing Contact Card
1. In DM conversation, user clicks "Share Card" button
2. Sees preview of their contact card
3. Confirms → Special message sent
4. Recipient sees rich card in chat
5. Can tap to view full profile or save contact info

---

## Navigation Updates

Add to user dropdown menu:
- **Friends** - Link to `/friends` with pending request count badge
- **Messages** - Link to `/messages` with unread message count badge

Add floating widget (like ChatWidget):
- Messages bubble in bottom-right corner
- Shows unread count
- Quick access to recent conversations

---

## Real-time Implementation

### Friend Request Notifications
```typescript
supabase.channel('friend-requests-{userId}')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'friend_requests',
    filter: `receiver_id=eq.${userId}`
  }, handleNewRequest)
  .subscribe()
```

### Direct Messages
```typescript
supabase.channel('dm-{conversationId}')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'direct_messages',
    filter: `conversation_id=eq.${conversationId}`
  }, handleNewMessage)
  .subscribe()
```

### Typing Indicators
```typescript
const channel = supabase.channel(`typing-${conversationId}`)
channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState()
  // Show typing indicator if other user is typing
})
channel.track({ typing: true, user_id: currentUserId })
```

---

## Database Migration Summary

1. Create `friendships` table with RLS
2. Create `friend_requests` table with RLS
3. Create `conversations` table with RLS
4. Create `direct_messages` table with RLS
5. Add realtime publication for all new tables
6. Create helper functions:
   - `get_or_create_conversation(user1_id, user2_id)` - Returns conversation ID
   - `are_friends(user1_id, user2_id)` - Returns boolean
   - `get_unread_message_count(user_id)` - Returns count

---

## Implementation Priority

### Phase 1: Friend System (Core)
1. Database tables + RLS for friendships and requests
2. `useFriendships` hook
3. Friend request components (send, view, accept/decline)
4. Friends list page
5. Integration in Community posts

### Phase 2: Direct Messaging
1. Database tables + RLS for conversations and messages
2. `useConversations` and `useDirectMessages` hooks
3. Messages page with conversation list and chat window
4. Real-time subscriptions
5. Navigation integration with unread counts

### Phase 3: Enhanced Features
1. Contact card sharing
2. Online/offline presence
3. Typing indicators
4. Floating messages widget
5. Read receipts UI

---

## Security Considerations

- **Friend-only messaging**: Users can only message accepted friends
- **Request spam prevention**: Rate limit friend requests, one pending request per user pair
- **Block functionality** (future): Allow users to block others
- **Report abuse** (future): Flag inappropriate messages for admin review
- **RLS enforcement**: All queries filtered to user's own data


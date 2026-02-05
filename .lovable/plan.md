
# Add Testing Messages & AI Message Generator

## Overview

This feature adds:
1. **Test Message Generation** - Admin can generate 4 sample messages from each user to the admin for testing the messaging system
2. **AI Message Button** - A new card in Admin Settings to trigger message generation with one click

---

## System Architecture

```text
                    AI MESSAGE GENERATOR
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Admin Settings ─────> "Generate Test Messages" Button          │
│                              │                                  │
│                              ▼                                  │
│                    For each user in system:                     │
│                    1. Create friendship with admin              │
│                    2. Create conversation                       │
│                    3. Insert 4 test messages                    │
│                              │                                  │
│                              ▼                                  │
│                    Admin sees messages in /messages             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### New Component: TestMessagesCard

A new settings card that will appear in the Admin Settings page with:

| Feature | Description |
|---------|-------------|
| Generate Button | Creates friendships + conversations + 4 messages per user |
| Clear Button | Removes all test conversations and messages |
| Stats Display | Shows current message/conversation counts |
| Progress Indicator | Shows generation progress |

### Message Content

The 4 test messages per user will be varied and realistic:

```text
Message 1: "Hey! I'm having trouble with the video player in the cinematography course."
Message 2: "The lesson on lighting techniques was really helpful, thanks!"
Message 3: "Quick question - when will the new editing module be available?"
Message 4: "Just wanted to say the platform looks great! Keep up the good work."
```

### Database Operations

For each non-admin user:
1. **Check/Create Friendship** - Ensure friendship exists between user and admin
2. **Check/Create Conversation** - Get or create conversation using existing RPC
3. **Insert Messages** - Add 4 varied test messages from user to admin

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/admin/TestMessagesCard.tsx` | New settings card with generate/clear buttons |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/admin/AdminSettings.tsx` | Import and add TestMessagesCard component |
| `src/components/admin/index.ts` | Export new TestMessagesCard |

---

## TestMessagesCard Component Structure

```typescript
// Key features:
// 1. Fetch all non-admin users from profiles
// 2. Get current admin user ID
// 3. For each user:
//    - Create friendship (if not exists)
//    - Get or create conversation
//    - Insert 4 test messages with varied content
// 4. Show progress and completion toast

// UI Elements:
// - Card with MessageSquare icon
// - "Test Messages" title
// - Description: "Generate sample messages for testing"
// - Stats: conversation count, message count
// - Generate button with loading state
// - Clear button with confirmation dialog
```

### Message Templates

```typescript
const messageTemplates = [
  "Hey! I'm having trouble with the video player in the cinematography course. The video keeps buffering.",
  "The lesson on lighting techniques was really helpful, thanks for putting this together!",
  "Quick question - when will the new editing module be available? I'm excited to learn about color grading.",
  "Just wanted to say the platform looks great! The new design is much easier to navigate.",
];
```

---

## User Experience Flow

### Generating Test Messages
1. Admin navigates to Admin Settings
2. Finds "Test Messages" card below Demo Mode settings
3. Clicks "Generate Test Messages" button
4. Progress bar shows: "Creating messages for user 1 of 8..."
5. On completion: Toast "Generated X messages across Y conversations"
6. Admin can now go to /messages to see all test conversations

### Clearing Test Messages
1. Admin clicks "Clear" button (trash icon)
2. Confirmation dialog appears
3. All test messages and conversations are deleted
4. Toast confirms: "Cleared all test messages"

---

## Technical Implementation

### Step 1: Get Admin User
```typescript
// Get admin user from user_roles table
const { data: adminRoles } = await supabase
  .from("user_roles")
  .select("user_id")
  .eq("role", "admin")
  .limit(1);

const adminId = adminRoles?.[0]?.user_id;
```

### Step 2: Get All Non-Admin Users
```typescript
// Get all users except admin
const { data: users } = await supabase
  .from("profiles")
  .select("id, display_name")
  .neq("id", adminId);
```

### Step 3: Create Friendships & Conversations
```typescript
for (const user of users) {
  // Create friendship (upsert to avoid duplicates)
  const [lower, higher] = [user.id, adminId].sort();
  await supabase.from("friendships").upsert({
    user_id: lower,
    friend_id: higher,
  }, { onConflict: "user_id,friend_id" });

  // Get or create conversation
  const { data: conversationId } = await supabase.rpc(
    "get_or_create_conversation",
    { _user1_id: user.id, _user2_id: adminId }
  );

  // Insert 4 test messages
  const messages = messageTemplates.map((content, i) => ({
    conversation_id: conversationId,
    sender_id: user.id, // Message FROM user TO admin
    content: content,
    message_type: "text",
    is_read: false,
    created_at: new Date(Date.now() - (4 - i) * 60000).toISOString(),
  }));

  await supabase.from("direct_messages").insert(messages);
}
```

---

## UI Preview

```text
┌─────────────────────────────────────────────────────────────────┐
│ 💬 Test Messages                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Generate sample messages from all users to the admin            │
│ for testing the messaging system.                               │
│                                                                 │
│ ┌─────────────┬─────────────┐                                  │
│ │     8       │     32      │                                  │
│ │ Conversations│  Messages  │                                  │
│ └─────────────┴─────────────┘                                  │
│                                                                 │
│ Each user will send 4 test messages to the admin account.       │
│                                                                 │
│ [🔄 Generate Test Messages]                    [🗑️]             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Considerations

- Only admins can access Admin Settings page (already protected by AdminRoute)
- Uses existing RLS policies for friendships, conversations, and messages
- Messages are inserted with proper sender_id (the user, not admin)
- Friendships are created bidirectionally using sorted UUIDs

---

## Summary

| Change | Description |
|--------|-------------|
| New Component | `TestMessagesCard.tsx` - Generate/clear test messages UI |
| Modified | `AdminSettings.tsx` - Add new card to settings page |
| Modified | `admin/index.ts` - Export new component |

No database migrations needed - uses existing tables and RLS policies.

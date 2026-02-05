

# Full Messaging Ecosystem Enhancement

## Overview

Transform the messaging system into a complete communication ecosystem with:
1. **Contact Cards Visibility** - Ensure contact cards display properly in messages
2. **Message Deletion** - Users can delete their own messages
3. **Typing Indicators** - Show when someone is typing
4. **Read Receipts** - Visual indicator when messages are read
5. **Message Reactions** - Quick emoji reactions to messages
6. **Delete Conversations** - Ability to remove entire conversations

---

## System Architecture

```text
                    MESSAGING ECOSYSTEM
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐        │
│  │   Messages   │   │   Typing     │   │   Reactions  │        │
│  │   CRUD       │   │   Indicator  │   │   (emoji)    │        │
│  └──────────────┘   └──────────────┘   └──────────────┘        │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Supabase Realtime                          │    │
│  │   - postgres_changes for messages                       │    │
│  │   - presence for typing indicators                      │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. Message Deletion

Add a delete button/menu for own messages with confirmation.

| Feature | Description |
|---------|-------------|
| Delete Button | Trash icon appears on hover for own messages |
| Confirmation | Alert dialog to confirm deletion |
| RLS Policy | Only sender can delete their messages |
| Realtime | Messages removed from UI in real-time |

### 2. Typing Indicator

Using Supabase Presence to show real-time typing status.

| Feature | Description |
|---------|-------------|
| Detection | Fires when user types in composer |
| Display | "User is typing..." with animated dots |
| Timeout | Clears after 2 seconds of no typing |
| Presence | Uses Supabase channel presence API |

### 3. Read Receipts

Visual confirmation when messages have been read.

| Feature | Description |
|---------|-------------|
| Single Check | Message sent |
| Double Check | Message read (blue checkmarks) |
| Update | Marks as read when conversation is viewed |

### 4. Message Reactions

Quick emoji reactions to any message.

| Feature | Description |
|---------|-------------|
| Quick Reactions | Heart, thumbs up, laugh, fire, sad |
| Display | Small emoji badges under messages |
| Multiple | Same user can add multiple reactions |

### 5. Delete Conversation

Remove entire conversation from user's view.

| Feature | Description |
|---------|-------------|
| Menu Option | In conversation header or list |
| Confirmation | Alert dialog before deletion |
| Soft Delete | Only removes for requesting user |

---

## Database Changes Required

### New RLS Policy for Message Deletion
```sql
-- Allow users to delete their own messages
CREATE POLICY "Users can delete their own messages"
ON direct_messages FOR DELETE
USING (auth.uid() = sender_id);
```

### New Table: Message Reactions
```sql
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES direct_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- RLS: Users can manage their own reactions
-- Users can view reactions on messages they can see
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/messaging/TypingIndicator.tsx` | Animated typing dots component |
| `src/components/messaging/MessageActions.tsx` | Delete, react dropdown for messages |
| `src/components/messaging/ReactionPicker.tsx` | Emoji reaction selector popup |
| `src/components/messaging/MessageReactions.tsx` | Display reactions on a message |
| `src/hooks/useTypingIndicator.ts` | Presence-based typing detection hook |
| `src/hooks/useMessageReactions.ts` | CRUD for message reactions |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/messaging/MessageBubble.tsx` | Add delete button, reactions, read receipts |
| `src/components/messaging/MessageComposer.tsx` | Add typing indicator trigger |
| `src/components/messaging/ChatWindow.tsx` | Show typing indicator at bottom |
| `src/components/messaging/ConversationItem.tsx` | Add delete conversation option |
| `src/hooks/useDirectMessages.ts` | Add deleteMessage function, handle DELETE events |

---

## UI Preview

### Message with Actions
```text
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ┌──────────────────────────┐  ┌───┐         │
│                    │ Hey! How's filming going?│  │ 🗑 │ <- hover│
│                    └──────────────────────────┘  └───┘         │
│                    ❤️ 2  👍 1           3:45 PM ✓✓             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 📇 Contact Card                                           │  │
│  │ ┌────────────────────────────────────────────────────────┐│  │
│  │ │ 👤 John Smith                                          ││  │
│  │ │    Cinematographer                                     ││  │
│  │ │    📷 RED Komodo, Sony A7S III                        ││  │
│  │ │    [📸] [🎬] [🐦]          [View Portfolio]           ││  │
│  │ └────────────────────────────────────────────────────────┘│  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ 💭 Alex is typing...                                       ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ 💳 │ Type a message...                      │  📤   │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Reaction Picker
```text
┌──────────────────────────────────────┐
│  React:  ❤️  👍  😂  🔥  😢  ➕     │
└──────────────────────────────────────┘
```

---

## Technical Implementation

### Typing Indicator Hook
```typescript
// useTypingIndicator.ts
export function useTypingIndicator(conversationId: string | null) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  // Use Supabase Presence to track typing
  useEffect(() => {
    if (!conversationId) return;
    
    const channel = supabase.channel(`typing:${conversationId}`);
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typing = Object.values(state)
          .flat()
          .filter(p => p.is_typing && p.user_id !== currentUserId)
          .map(p => p.display_name);
        setTypingUsers(typing);
      })
      .subscribe();
      
    return () => supabase.removeChannel(channel);
  }, [conversationId]);
  
  const setTyping = (isTyping: boolean) => {
    channel.track({ user_id, display_name, is_typing: isTyping });
  };
  
  return { typingUsers, setTyping };
}
```

### Delete Message Function
```typescript
// In useDirectMessages.ts
const deleteMessage = async (messageId: string) => {
  const { error } = await supabase
    .from("direct_messages")
    .delete()
    .eq("id", messageId)
    .eq("sender_id", user.id); // Extra safety
    
  if (error) throw error;
};
```

### Read Receipts Display
```typescript
// In MessageBubble.tsx
{isOwn && (
  <span className="text-xs text-muted-foreground">
    {message.is_read ? (
      <CheckCheck className="h-3 w-3 text-primary" />
    ) : (
      <Check className="h-3 w-3" />
    )}
  </span>
)}
```

---

## Implementation Order

| Step | Task | Priority |
|------|------|----------|
| 1 | Add DELETE RLS policy for messages | High |
| 2 | Add deleteMessage to hook + realtime DELETE event | High |
| 3 | Add delete button to MessageBubble with confirmation | High |
| 4 | Create TypingIndicator component | Medium |
| 5 | Add useTypingIndicator hook with Presence | Medium |
| 6 | Integrate typing into Composer + ChatWindow | Medium |
| 7 | Add read receipt icons to messages | Medium |
| 8 | Create message_reactions table + RLS | Low |
| 9 | Build reaction picker + display components | Low |
| 10 | Add delete conversation option | Low |

---

## Summary

| Category | Changes |
|----------|---------|
| Database | 1 new RLS policy, 1 new table (reactions) |
| New Files | 5 components, 2 hooks |
| Modified Files | 5 messaging components/hooks |
| Features | Delete messages, typing indicator, read receipts, reactions |

This creates a full-featured messaging experience similar to modern chat apps!


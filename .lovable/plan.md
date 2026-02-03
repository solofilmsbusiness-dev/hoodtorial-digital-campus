

# User-to-Admin Support Messaging System

## Overview

Create a support messaging system that allows authenticated users to send help requests directly to admins. Messages will appear in a dedicated section of the admin panel, where admins can view, respond to, and manage support tickets.

## Architecture

```text
+---------------------------+      +---------------------------+
|    USER INTERFACE         |      |    ADMIN INTERFACE        |
|---------------------------|      |---------------------------|
| - Help button in          |      | - New "Support" link in   |
|   Student Center          |      |   admin sidebar           |
| - Contact Admin sheet     |      | - Support Messages page   |
|   with message form       |      |   with conversation view  |
| - View conversation       |      | - Reply functionality     |
|   history                 |      | - Mark as resolved        |
+---------------------------+      +---------------------------+
            |                                  |
            v                                  v
+-----------------------------------------------------------+
|              DATABASE (support_tickets table)              |
|-----------------------------------------------------------|
| - id, user_id, subject, status (open/resolved)            |
| - created_at, updated_at, resolved_at, resolved_by        |
+-----------------------------------------------------------+
                            |
                            v
+-----------------------------------------------------------+
|              DATABASE (support_messages table)             |
|-----------------------------------------------------------|
| - id, ticket_id, sender_id, content, is_admin             |
| - created_at                                               |
+-----------------------------------------------------------+
```

## Key Features

### For Users
1. "Need Help?" button in the Student Center quick links section
2. Sheet/dialog to compose and send messages to admins
3. View conversation history for their support tickets
4. See ticket status (open/resolved)

### For Admins
1. New "Support" menu item in admin sidebar with unread badge
2. Dedicated support messages page (/admin/support)
3. List of all support tickets with filters (open/resolved)
4. Click into ticket to view full conversation
5. Reply to users directly
6. Mark tickets as resolved
7. Real-time updates when new messages arrive

## Database Schema

### Table: support_tickets
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | References profiles |
| subject | text | Ticket subject/title |
| status | text | 'open' or 'resolved' |
| created_at | timestamptz | When created |
| updated_at | timestamptz | Last activity |
| resolved_at | timestamptz | When resolved |
| resolved_by | uuid | Admin who resolved |

### Table: support_messages
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| ticket_id | uuid | References support_tickets |
| sender_id | uuid | Who sent the message |
| content | text | Message content |
| is_admin | boolean | True if sent by admin |
| created_at | timestamptz | When sent |

### RLS Policies
- Users can read/create tickets where user_id = auth.uid()
- Users can read/create messages for their own tickets
- Admins (via has_role) can read/update all tickets and messages

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/pages/admin/SupportManager.tsx` | Create | Admin page to manage support tickets |
| `src/components/admin/SupportTicketList.tsx` | Create | List component for tickets |
| `src/components/admin/SupportConversation.tsx` | Create | Conversation view component |
| `src/components/support/ContactAdminSheet.tsx` | Create | User-facing help sheet |
| `src/components/support/SupportHistory.tsx` | Create | User's ticket history view |
| `src/hooks/useSupportTickets.ts` | Create | Hook for ticket CRUD operations |
| `src/hooks/useAdminSupport.ts` | Create | Admin-specific support hook |
| `src/components/admin/AdminSidebar.tsx` | Modify | Add Support nav item with badge |
| `src/pages/StudentCenter.tsx` | Modify | Add "Need Help?" quick link |
| `src/App.tsx` | Modify | Add /admin/support route |
| `src/components/admin/index.ts` | Modify | Export new components |

## Implementation Details

### User Contact Form (ContactAdminSheet)
- Sheet component that slides in from the right
- Subject field (required)
- Message textarea (required)
- Submit button that creates a new ticket with initial message
- Shows existing open tickets with option to continue conversation

### Admin Support Page (SupportManager)
- Uses AdminLayout for consistent styling
- Tabs: "Open" and "Resolved"
- Table with: User avatar/name, Subject, Last message preview, Time since last activity
- Click to open conversation in side sheet
- Reply input at bottom of conversation
- "Mark as Resolved" button

### Admin Sidebar Badge
- Show count of open tickets
- Use existing notification badge styling (red circle)

### Real-time Updates
- Subscribe to support_tickets and support_messages tables
- Auto-refresh when new messages arrive

## Technical Considerations

1. **Security**: RLS policies ensure users only see their own tickets, admins see all
2. **Performance**: Paginate ticket list, limit message history to last 100
3. **UX**: Show loading states, success/error toasts
4. **Mobile**: Responsive design following existing patterns
5. **Accessibility**: Proper labels, focus management in sheets


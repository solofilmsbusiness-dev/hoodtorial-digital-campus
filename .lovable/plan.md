
# Waitlist System for Pre-Launch Enrollment

## Overview

Build a complete waitlist system that replaces the sign-up button when signups are disabled. Prospective students can join the waitlist, and admins can review, approve, or reject applicants from a dedicated admin panel.

---

## User Experience Flow

```text
PROSPECTIVE STUDENT:                       ADMIN:
┌─────────────────────┐                   ┌─────────────────────────────┐
│ Visit /auth page    │                   │ Admin → Waitlist Manager    │
│ (signup disabled)   │                   │                             │
│                     │                   │ ┌─────────────────────────┐ │
│ ┌─────────────────┐ │                   │ │ Pending: 24 applicants  │ │
│ │ Already on list?│ │                   │ │                         │ │
│ │    [Log In]     │ │                   │ │ Name │ Email │ Status   │ │
│ └─────────────────┘ │                   │ │ Alex │ a@... │ [Approve]│ │
│                     │                   │ │ Sam  │ s@... │ [Reject] │ │
│ ┌─────────────────┐ │                   │ └─────────────────────────┘ │
│ │ Join Waitlist   │ │                   │                             │
│ │                 │ │                   │ Approved applicants get     │
│ │ [Name]          │ │  ─── Approval ──► │ email with signup link      │
│ │ [Email]         │ │                   │                             │
│ │ [Why join?]     │ │                   │ Rejected applicants can     │
│ │                 │ │                   │ be notified or silently     │
│ │ [Join Waitlist] │ │                   │ removed                     │
│ └─────────────────┘ │                   └─────────────────────────────┘
└─────────────────────┘
```

---

## Features

### For Prospective Students
- Waitlist form appears on `/auth` page when signups are disabled
- Collects: Name, Email, Optional message (why they want to join)
- Shows confirmation after submission
- Can check their waitlist status via email lookup
- Receives approval email with special signup link when approved

### For Admins
- New "Waitlist" section in Admin sidebar with badge showing pending count
- Full waitlist management page at `/admin/waitlist`
- View all applicants with filtering (pending/approved/rejected)
- Search by name or email
- Approve: Sends invitation email with unique signup link
- Reject: Optionally notify applicant
- Bulk actions for efficiency
- Export waitlist to CSV
- View submission details (when applied, message, etc.)

---

## Database Design

### New Table: `waitlist`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email | text | Applicant email (unique) |
| name | text | Applicant display name |
| message | text | Why they want to join (optional) |
| status | enum | `pending`, `approved`, `rejected` |
| invite_token | text | Unique token for signup link (nullable) |
| invite_sent_at | timestamp | When approval email was sent |
| invite_expires_at | timestamp | When invite link expires (7 days) |
| reviewed_by | uuid | Admin who approved/rejected |
| reviewed_at | timestamp | When decision was made |
| created_at | timestamp | When applied |
| ip_address | text | For spam prevention (optional) |

### New Enum: `waitlist_status`
```sql
CREATE TYPE waitlist_status AS ENUM ('pending', 'approved', 'rejected');
```

### RLS Policies
- Public can INSERT (to join waitlist) - with rate limiting consideration
- Only admins can SELECT/UPDATE/DELETE
- Authenticated users can check their own status by email

---

## Implementation Details

### Phase 1: Database & Backend

1. **Create waitlist table** with proper schema and RLS policies
2. **Create edge function** `send-waitlist-invite` to send approval emails via Resend
3. **Create helper function** `get_pending_waitlist_count()` for admin sidebar badge

### Phase 2: Auth Page Changes

**File: `src/pages/Auth.tsx`**

When `signupDisabled` is true, show waitlist form instead of hiding signup:
- Waitlist form with Name, Email, Message fields
- Submit handler inserts into waitlist table
- Success state shows confirmation message
- Status check allows users to enter email and see their application status

### Phase 3: Admin Waitlist Manager

**New Files:**
- `src/pages/admin/WaitlistManager.tsx` - Main waitlist management page
- `src/hooks/useWaitlist.ts` - Hook for waitlist CRUD operations
- `src/components/admin/WaitlistFilters.tsx` - Filter controls
- `src/components/admin/WaitlistTable.tsx` - Table with actions

**Update Files:**
- `src/components/admin/AdminSidebar.tsx` - Add Waitlist nav item with badge
- `src/App.tsx` - Add `/admin/waitlist` route

### Phase 4: Invitation Flow

1. Admin clicks "Approve" on applicant
2. System generates unique invite token
3. Edge function sends branded email via Resend with:
   - Personalized welcome message
   - Unique signup link: `/auth?invite={token}`
   - 7-day expiration notice
4. Auth page recognizes invite token:
   - Pre-fills email (read-only)
   - Validates token hasn't expired
   - On successful signup, marks invite as used

### Phase 5: Edge Function

**File: `supabase/functions/send-waitlist-invite/index.ts`**

Sends branded invitation emails:
- Uses existing RESEND_API_KEY secret
- Hoodtorial-branded template
- Includes personalized signup link
- Handles errors gracefully

---

## File Changes Summary

| Action | File | Purpose |
|--------|------|---------|
| Create | `supabase/migrations/[timestamp].sql` | Create waitlist table and enum |
| Create | `supabase/functions/send-waitlist-invite/index.ts` | Send invitation emails |
| Create | `src/pages/admin/WaitlistManager.tsx` | Admin waitlist management page |
| Create | `src/hooks/useWaitlist.ts` | Waitlist data operations |
| Create | `src/components/admin/WaitlistTable.tsx` | Waitlist applicant table |
| Modify | `src/pages/Auth.tsx` | Add waitlist form when signups disabled |
| Modify | `src/components/admin/AdminSidebar.tsx` | Add Waitlist nav item |
| Modify | `src/App.tsx` | Add `/admin/waitlist` route |
| Modify | `supabase/config.toml` | Register new edge function |

---

## Email Template Preview

```text
Subject: You're In! 🎬 Your Invitation to Hoodtorial University

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         HOODTORIAL UNIVERSITY
         Where Hustle Meets Hollywood
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hey [Name]! 👋

Your spot at Hoodtorial University is ready.

You've been approved to join the next generation of 
mobile filmmakers. Click below to create your account 
and start your journey:

       [ CREATE MY ACCOUNT ]

This link expires in 7 days.

See you on set,
The Hoodtorial Team 🎥
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Security Considerations

1. **Rate Limiting**: Consider adding rate limit on waitlist submissions (IP-based)
2. **Email Validation**: Validate email format before insertion
3. **Token Security**: Use secure random tokens for invites
4. **RLS Policies**: Strict admin-only access for management operations
5. **Invite Expiration**: Tokens expire after 7 days

---

## Admin UI Preview

The Waitlist Manager will include:
- Stats cards: Pending, Approved (this month), Total applicants
- Filter tabs: All / Pending / Approved / Rejected
- Search bar for name/email
- Sortable table with columns: Name, Email, Applied, Status, Actions
- Bulk select for mass approve/reject
- Export to CSV button
- Click row to view full application details in a sheet/dialog

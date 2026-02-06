
# Complete Waitlist Approval Flow with Email & Auto-Account Creation

## Overview

When users join the waitlist, they'll provide their desired username. When an admin approves them, an acceptance letter email is sent and the user's account is automatically created so they can log in immediately.

---

## Current State

| Component | Status |
|-----------|--------|
| Waitlist table | Has: id, email, name, status, notes, created_at, updated_at |
| Waitlist signup form | Collects: email, name (optional) |
| Admin approval | Updates status only, no email sent |
| Email infrastructure | **Not set up** (no RESEND_API_KEY) |

---

## Required Changes

### 1. Database: Add Username Field to Waitlist

Add a `desired_username` column so admins have all info needed to create accounts:

```sql
ALTER TABLE public.waitlist 
ADD COLUMN desired_username text;

ALTER TABLE public.waitlist
ADD COLUMN password_token text;

ALTER TABLE public.waitlist
ADD COLUMN approved_at timestamp with time zone;
```

### 2. Waitlist Signup Form Update

**File:** `src/pages/Auth.tsx`

Add a required "Desired Username" field to the waitlist form:
- Add state: `waitlistUsername`
- Add input field with validation (required, 3+ chars, alphanumeric + underscores)
- Update insert to include `desired_username`

### 3. Email Infrastructure Setup

**Secret Required:** `RESEND_API_KEY`

You'll need to:
1. Create a Resend account at https://resend.com
2. Verify your email domain at https://resend.com/domains
3. Generate an API key at https://resend.com/api-keys

### 4. New Edge Function: `approve-waitlist`

**File:** `supabase/functions/approve-waitlist/index.ts`

This function will:
1. Verify admin authentication
2. Create the user account in Supabase Auth
3. Create their profile with the approved username
4. Send the branded acceptance email with login link
5. Update waitlist status to "approved"

```text
┌──────────────────────┐
│   Admin clicks       │
│   "Approve" button   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  approve-waitlist    │
│   edge function      │
├──────────────────────┤
│ 1. Create auth user  │
│ 2. Create profile    │
│ 3. Send acceptance   │
│    email via Resend  │
│ 4. Update waitlist   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  User receives       │
│  acceptance letter   │
│  with login link     │
└──────────────────────┘
```

### 5. Acceptance Letter Email Template

Branded "Hoodtorial University Acceptance Letter" email featuring:
- Hoodtorial logo
- Gold accents matching brand
- Personalized greeting with their name
- Their username
- Temporary password (or magic link)
- Direct login link to the platform
- Urban "Hood" personality tone

### 6. Update Admin WaitlistManager

**File:** `src/pages/admin/WaitlistManager.tsx`

- Display username column in table
- Change approve button to call the new edge function
- Show loading state during approval
- Handle success/error feedback

### 7. Update useWaitlist Hook

**File:** `src/hooks/useWaitlist.ts`

- Add `desired_username` to the interface
- Update mutation to call edge function instead of direct update
- Add approval-specific loading state

---

## Files to Create/Modify

| File | Action |
|------|--------|
| Database migration | Create - Add columns to waitlist |
| `supabase/functions/approve-waitlist/index.ts` | Create - Handle approval + user creation + email |
| `supabase/config.toml` | Modify - Add function config |
| `src/pages/Auth.tsx` | Modify - Add username field to waitlist form |
| `src/pages/admin/WaitlistManager.tsx` | Modify - Show username, use edge function |
| `src/hooks/useWaitlist.ts` | Modify - Add username, approval mutation |

---

## User Flow After Implementation

### Waitlist Signup
1. User visits login page (with signup disabled)
2. Clicks "Join Waiting List"
3. Enters: Name, Desired Username, Email
4. Submits → "You're on the list!" confirmation

### Admin Approval
1. Admin goes to `/admin/waitlist`
2. Sees pending entries with email, name, desired username
3. Clicks approve button
4. System automatically:
   - Creates auth account
   - Creates profile with display name & username
   - Sends acceptance email
   - Updates status to approved

### User Login
1. User receives acceptance email
2. Clicks login link or uses provided credentials
3. Signs in with their email + temp password
4. Gets prompted to complete profile/change password (optional)

---

## Technical Details

### Email Content Structure

```text
Subject: 🎬 Welcome to Hoodtorial University - You're IN!

Body:
- Logo header
- "ACCEPTANCE LETTER" title
- "Congratulations, [Name]!"
- "The wait is over. You've been accepted to Hoodtorial University."
- Username: @[username]
- Your temporary password: [password]
- [LOGIN NOW] button
- "Where Hustle Meets Hollywood" tagline
- Footer with links
```

### Password Strategy

Two options:
1. **Temporary password** - Generate random password, include in email, prompt reset on first login
2. **Magic link** - Send passwordless login link (cleaner UX)

Recommendation: Temporary password with reset prompt for the "official letter" feel

### Security Considerations
- Edge function validates admin role before processing
- Temporary passwords are cryptographically random
- Email is sent before marking as approved (atomic operation)
- RLS prevents unauthorized waitlist access



# Email Notifications for Mentions and Welcome Emails

## Overview

Implement email notifications that are sent when:
1. **Users are tagged/mentioned** in posts or comments - sends an email notification
2. **Users first sign up** - sends a welcome email

This requires setting up Resend for email delivery and creating edge functions with database triggers.

## Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                            │
├────────────────────────────┬────────────────────────────────────┤
│     NEW USER SIGNUP        │        @MENTION IN POST/COMMENT    │
│            ↓               │                  ↓                 │
│    auth.users INSERT       │      notifications INSERT          │
│            ↓               │                  ↓                 │
│   Database Trigger         │         Database Trigger           │
│            ↓               │                  ↓                 │
│   pg_net HTTP call         │         pg_net HTTP call           │
│            ↓               │                  ↓                 │
├────────────────────────────┴────────────────────────────────────┤
│                     EDGE FUNCTIONS                              │
├────────────────────────────┬────────────────────────────────────┤
│   send-welcome-email       │     send-mention-notification      │
│            ↓               │                  ↓                 │
│     Resend API             │           Resend API               │
│            ↓               │                  ↓                 │
│      Welcome Email         │     "You were mentioned" Email     │
└────────────────────────────┴────────────────────────────────────┘
```

## Requirements

### Resend API Key

You'll need to provide a **RESEND_API_KEY** from [resend.com](https://resend.com):
1. Sign up at resend.com if you don't have an account
2. Verify your email domain at https://resend.com/domains
3. Create an API key at https://resend.com/api-keys

## Implementation Details

### 1. Create Storage Bucket for Email Assets

Upload the logo for use in email templates.

### 2. Create Email Template Components

Build React Email templates for consistent, branded emails:

**Welcome Email Template:**
```text
┌────────────────────────────────────────┐
│           [Hoodtorial Logo]            │
│                                        │
│   Welcome to Hoodtorial University!    │
│                                        │
│   Yo [Name]! 🎬                        │
│                                        │
│   You just joined the dopest film      │
│   school on the internet. We're hype   │
│   to have you!                         │
│                                        │
│   Next steps:                          │
│   1. Complete your profile             │
│   2. Take your entry assessment        │
│   3. Start learning!                   │
│                                        │
│   [Get Started →]                      │
│                                        │
│   Stay creative,                       │
│   The Hoodtorial Team                  │
└────────────────────────────────────────┘
```

**Mention Notification Email:**
```text
┌────────────────────────────────────────┐
│           [Hoodtorial Logo]            │
│                                        │
│   [Sender] mentioned you!              │
│                                        │
│   "@YourName check out this lighting   │
│   technique I used..."                 │
│                                        │
│   [View Post →]                        │
│                                        │
│   Stay in the loop,                    │
│   The Hoodtorial Team                  │
└────────────────────────────────────────┘
```

### 3. Create Edge Functions

**send-welcome-email:**
- Triggered when a new user signs up
- Fetches user email from auth.users
- Sends branded welcome email via Resend

**send-mention-notification:**
- Triggered when a notification with type='mention' is created
- Fetches mentioned user's email
- Fetches sender's display name
- Sends mention notification email via Resend

### 4. Database Triggers

Create triggers that fire HTTP requests to edge functions:

**Welcome Email Trigger:**
- Fires on INSERT to auth.users
- Calls send-welcome-email edge function

**Mention Email Trigger:**
- Fires on INSERT to notifications table
- Only fires when type = 'mention'
- Calls send-mention-notification edge function

## File Structure

| File | Purpose |
|------|---------|
| `supabase/functions/send-welcome-email/index.ts` | Edge function for welcome emails |
| `supabase/functions/send-welcome-email/_templates/welcome.tsx` | React Email template |
| `supabase/functions/send-mention-notification/index.ts` | Edge function for mention emails |
| `supabase/functions/send-mention-notification/_templates/mention.tsx` | React Email template |
| Database migration | Create triggers for email notifications |

## Database Changes

### Migration: Create Email Notification Triggers

```sql
-- Enable pg_net extension for HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function to send welcome email on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_welcome_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM extensions.http_post(
    url := 'https://qdvmekqcouchyhwstnuh.supabase.co/functions/v1/send-welcome-email',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer [ANON_KEY]"}'::jsonb,
    body := json_build_object(
      'user_id', NEW.id,
      'email', NEW.email,
      'display_name', COALESCE(NEW.raw_user_meta_data->>'display_name', 'Filmmaker')
    )::text
  );
  RETURN NEW;
END;
$$;

-- Trigger on auth.users for welcome email
-- NOTE: Triggers on auth schema require special handling

-- Function to send mention notification email
CREATE OR REPLACE FUNCTION public.handle_mention_notification_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.type = 'mention' THEN
    PERFORM extensions.http_post(
      url := 'https://qdvmekqcouchyhwstnuh.supabase.co/functions/v1/send-mention-notification',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer [ANON_KEY]"}'::jsonb,
      body := json_build_object(
        'notification_id', NEW.id,
        'user_id', NEW.user_id,
        'sender_id', NEW.sender_id,
        'post_id', NEW.post_id,
        'content_preview', NEW.content_preview
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger on notifications table
CREATE TRIGGER on_mention_notification_created
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_mention_notification_email();
```

## Edge Function: send-welcome-email

```typescript
// supabase/functions/send-welcome-email/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import WelcomeEmail from "./_templates/welcome.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  const { email, display_name } = await req.json();
  
  const html = await renderAsync(
    React.createElement(WelcomeEmail, {
      displayName: display_name,
      baseUrl: Deno.env.get("SITE_URL") || "https://hoodtorial.com",
    })
  );

  await resend.emails.send({
    from: "Hoodtorial University <noreply@yourdomain.com>",
    to: [email],
    subject: "Welcome to Hoodtorial University! 🎬",
    html,
  });

  return new Response(JSON.stringify({ success: true }));
});
```

## Edge Function: send-mention-notification

```typescript
// supabase/functions/send-mention-notification/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import MentionEmail from "./_templates/mention.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  const { user_id, sender_id, post_id, content_preview } = await req.json();
  
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Get user email
  const { data: user } = await supabase.auth.admin.getUserById(user_id);
  
  // Get sender display name
  const { data: sender } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", sender_id)
    .single();

  const html = await renderAsync(
    React.createElement(MentionEmail, {
      senderName: sender?.display_name || "Someone",
      contentPreview: content_preview,
      postUrl: `${Deno.env.get("SITE_URL")}/community?post=${post_id}`,
    })
  );

  await resend.emails.send({
    from: "Hoodtorial University <noreply@yourdomain.com>",
    to: [user?.email],
    subject: `${sender?.display_name || "Someone"} mentioned you in a post!`,
    html,
  });

  return new Response(JSON.stringify({ success: true }));
});
```

## React Email Templates

### Welcome Email Template

Branded welcome email with:
- Hoodtorial logo
- Personalized greeting with display name
- "Hood" personality in the copy
- Clear call-to-action buttons
- Next steps guidance

### Mention Notification Template

Clean mention notification with:
- Hoodtorial logo
- Sender name highlighted
- Content preview snippet
- Direct link to the post
- Unsubscribe consideration (future)

## Setup Steps Summary

1. **Request RESEND_API_KEY** from user
2. **Create email-assets storage bucket** and upload logo
3. **Create send-welcome-email edge function** with React Email template
4. **Create send-mention-notification edge function** with React Email template
5. **Create database migration** with triggers for both email types
6. **Deploy and test**

## Alternative Approach for Welcome Email

Since triggers on `auth.users` require special handling, an alternative is to use a Supabase Auth Hook (configured in config.toml) or call the edge function directly from the frontend after successful signup. The frontend approach would be:

```typescript
// In AuthContext.tsx signUp function, after successful signup:
await supabase.functions.invoke('send-welcome-email', {
  body: { email, display_name: displayName }
});
```

This is simpler and avoids auth schema trigger complexity.

## Expected User Experience

1. **New User Signs Up** → Receives branded welcome email within seconds
2. **User Gets Mentioned** → Receives email notification with preview and link to post
3. Emails match the Hoodtorial brand with gold accents and film-school personality


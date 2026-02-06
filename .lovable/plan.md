
# Fix: Waitlist Approval Authentication Error

## Problem

The edge function is failing with "AuthSessionMissingError: Auth session missing!" because it's using `auth.getUser()` on a client created with a JWT token in the header, which doesn't work the same way as a browser session.

## Root Cause

The current code creates a Supabase client with the anon key and passes the Authorization header, then calls `auth.getUser()`. However, this approach doesn't properly extract the user from a JWT token in an edge function context.

## Solution

Update the edge function to properly validate the JWT token by using the service role client with `auth.getUser(token)` method, which accepts the JWT token directly.

### Change in `supabase/functions/approve-waitlist/index.ts`

**Current (broken):**
```typescript
const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  global: { headers: { Authorization: authHeader } },
});

const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
```

**Fixed:**
```typescript
// Extract the JWT token from the Authorization header
const token = authHeader.replace("Bearer ", "");

// Use service role client to validate the token and get user
const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
```

### Complete Changes

1. Remove the separate `supabaseAuth` client (not needed)
2. Extract the JWT token from the Authorization header
3. Use `supabaseAdmin.auth.getUser(token)` to validate the user
4. Use the service role client for the admin role check (already has bypass RLS)

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/approve-waitlist/index.ts` | Fix JWT validation approach |

---

## Technical Details

The `auth.getUser(token)` method accepts an optional JWT token parameter. When called without a parameter, it looks for an active session. When called with a token, it validates that specific JWT and returns the user data.

This is the standard pattern for authenticating users in Supabase Edge Functions.

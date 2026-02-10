

## Fix: Remove Overly Broad Profile Access Policy

### Problem
The last migration added a policy `"Authenticated users can read profiles via public view"` that allows any authenticated user to SELECT all rows and **all columns** from the `profiles` table. This exposes sensitive data like subscription status, ban information, and trial dates to every logged-in user.

### Root Cause
There is a fundamental conflict:
- The Supabase linter wants `security_invoker=on` on views
- But with `security_invoker=on`, the view inherits base table RLS, meaning users can only see their own profile through the view
- To work around this, a broad SELECT policy was added -- but that defeats the purpose of column-level protection

### Solution
Revert the `profiles_public` view to **not** use `security_invoker` (making it a security definer view), and **remove** the dangerous broad SELECT policy. The view itself provides column-level security by only exposing non-sensitive fields.

### Migration Steps

1. **Drop and recreate** the `profiles_public` view **without** `security_invoker=on`
2. **Drop** the policy `"Authenticated users can read profiles via public view"` from the `profiles` table
3. **Ignore** the `SUPA_security_definer_view` linter finding with a clear justification (intentional design -- the view acts as a safe public interface)

### Why This Is Safe
- The `profiles_public` view only selects non-sensitive columns (display name, avatar, bio, social links, gallery, etc.)
- The base `profiles` table retains restrictive RLS: users can only read their **own** row, and admins/moderators can read all
- No sensitive fields (subscription status, ban reason, trial dates, location) are exposed through the view

### Security Findings Updated
- **Delete** `profiles_table_sensitive_exposure` (fixed by removing the broad policy)
- **Ignore** `SUPA_security_definer_view` (intentional design for column-level access control)
- **Ignore** `waitlist_email_exposure` (admin-only SELECT already enforced; INSERT is public by design for signups)
- **Ignore** `quiz_questions_public_view_unnecessary` (the public view intentionally excludes correct answers to prevent cheating)


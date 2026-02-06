
# Fix: RLS Policy Blocking Non-Enrolled Users from Creating Posts

## Problem Identified

The error "new row violates row-level security policy for table 'community_posts'" occurs because:

1. We removed the UI enrollment gate from the Community page (allowing viewing)
2. But the RLS INSERT policy still requires `is_enrolled_student()` which checks for:
   - Paid access (trial or subscription) 
   - **At least one active enrollment**

New users who have paid access but haven't enrolled in any courses cannot create posts or wall messages.

## Current RLS Policy

```sql
-- "Enrolled students can create posts" policy
WITH CHECK (
  auth.uid() = user_id AND 
  is_enrolled_student(auth.uid()) AND   -- ← This requires active enrollment
  category <> 'announcement'
)
```

The `is_enrolled_student()` function definition:
```sql
SELECT CASE 
  WHEN _user_id IS NULL THEN false
  ELSE (
    has_paid_access(_user_id)   -- Must have trial/subscription
    AND
    EXISTS (SELECT 1 FROM enrollments WHERE user_id = _user_id AND status = 'active')  -- ← Requires enrollment
  )
END
```

---

## Solution

Create a new helper function `can_create_community_content()` that only checks for paid access, then update the relevant RLS policies.

### Database Migration

```sql
-- 1. Create helper function that checks paid access only (not enrollment)
CREATE OR REPLACE FUNCTION public.has_community_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE 
    WHEN _user_id IS NULL THEN false
    ELSE has_paid_access(_user_id)  -- Only check paid access, not enrollment
  END
$$;

-- 2. Drop existing INSERT policies
DROP POLICY IF EXISTS "Enrolled students can create posts" ON public.community_posts;
DROP POLICY IF EXISTS "Enrolled students can create comments" ON public.community_comments;
DROP POLICY IF EXISTS "Enrolled students can like posts" ON public.post_likes;
DROP POLICY IF EXISTS "Enrolled students can like comments" ON public.comment_likes;
DROP POLICY IF EXISTS "Enrolled students can follow accessible posts" ON public.post_follows;

-- 3. Recreate INSERT policies using has_community_access() instead
CREATE POLICY "Paid users can create posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND 
    has_community_access(auth.uid()) AND 
    category <> 'announcement'::post_category
  );

CREATE POLICY "Paid users can create comments"
  ON public.community_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND 
    has_community_access(auth.uid())
  );

CREATE POLICY "Paid users can like posts"
  ON public.post_likes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND 
    has_community_access(auth.uid())
  );

CREATE POLICY "Paid users can like comments"
  ON public.comment_likes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND 
    has_community_access(auth.uid())
  );

CREATE POLICY "Paid users can follow posts"
  ON public.post_follows FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id AND 
    has_community_access(auth.uid()) AND
    EXISTS (SELECT 1 FROM community_posts WHERE id = post_follows.post_id)
  );
```

---

## Files to Modify

| File | Changes |
|------|---------|
| Database migration | Create `has_community_access()` function and update RLS policies |

---

## Expected Behavior After Fix

| User Type | Can View Community | Can Post/Comment/Like |
|-----------|-------------------|----------------------|
| Not logged in | No | No |
| Trial (no enrollment) | Yes | Yes |
| Paid (no enrollment) | Yes | Yes |
| Trial + Enrolled | Yes | Yes |
| Paid + Enrolled | Yes | Yes |

---

## Technical Notes

- The new `has_community_access()` function only checks for paid access (trial or subscription)
- Enrollment is no longer required for community participation
- This aligns with the UI change that removed the enrollment gate from the Community page
- SELECT policies remain unchanged (they already allow viewing for enrolled students OR users with paid access)

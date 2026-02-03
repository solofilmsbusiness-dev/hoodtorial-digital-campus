

# Add Professor Role to Admin System

## Overview

Add a new "professor" role to the role system and update all admin-related UI to clearly display role badges. This will allow distinguishing professors from regular students, with admin accounts clearly labeled as "Admin" throughout the platform.

## Database Changes

### 1. Extend the app_role Enum

Add "professor" as a new role type:

```sql
ALTER TYPE public.app_role ADD VALUE 'professor';
```

## Frontend Changes

### 2. Update StudentFilters.tsx

Add "Professor" as a filter option in the role dropdown:

| Before | After |
|--------|-------|
| Admin, Moderator, Student | Admin, Professor, Moderator, Student |

### 3. Update UserManager.tsx

Add role management actions and update badge styling:

**Add getRoleBadgeVariant case:**
```typescript
case "professor":
  return "default"; // Uses primary color
```

**Add dropdown menu options:**
- "Make Professor" action for non-professors
- "Remove Professor" action for existing professors

### 4. Update StudentDetailSheet.tsx

Add professor role styling and management options matching the UserManager pattern.

### 5. Update CommentThread.tsx

Update the instructor badge logic to also recognize professors:

```typescript
// Before
if (comment.is_instructor_comment || comment.user_role === 'admin')

// After  
if (comment.is_instructor_comment || comment.user_role === 'admin' || comment.user_role === 'professor')
```

### 6. Update useCommunityComments.ts

Include professors when determining if a comment should be marked as an instructor comment:

```typescript
// Before
const isInstructor = userRoles?.some(r => r.role === 'admin' || r.role === 'moderator');

// After
const isInstructor = userRoles?.some(r => ['admin', 'moderator', 'professor'].includes(r.role));
```

## Data Updates

### 7. Update bangoutfilms@gmail.com Account

After the schema migration, update the user's role from "student" to "professor":

1. Look up the user_id for bangoutfilms@gmail.com
2. Add the "professor" role to their user_roles entry
3. Remove the "student" role if desired (or keep both)

## Visual Summary

### Role Badge Styling

| Role | Badge Style | Color |
|------|-------------|-------|
| Admin | destructive | Red background - clearly stands out |
| Professor | default | Primary color (gold) |
| Moderator | secondary | Gray/muted |
| Student | outline | Subtle border only |

### Role Display in Timeline Posts

When a professor or admin comments on a post:
- Their avatar gets a gold/primary border
- An "Instructor" badge appears next to their name
- Their name appears in the primary color

## Files to Modify

| File | Changes |
|------|---------|
| Database migration | Add 'professor' to app_role enum |
| `src/components/admin/StudentFilters.tsx` | Add Professor to role filter dropdown |
| `src/pages/admin/UserManager.tsx` | Add professor badge variant and dropdown actions |
| `src/components/admin/StudentDetailSheet.tsx` | Add professor badge variant |
| `src/components/community/CommentThread.tsx` | Recognize professors as instructors |
| `src/hooks/useCommunityComments.ts` | Include professors in instructor check |

## Expected Outcome

1. Admins are clearly labeled with red "admin" badges throughout the platform
2. Professors get gold "professor" badges and their comments show "Instructor" label
3. Role filter in user management includes Professor option
4. Admin can promote/demote users to/from professor role
5. bangoutfilms@gmail.com account will have the professor role


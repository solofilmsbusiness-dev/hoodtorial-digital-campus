

# Add Graduation Cap Badges for Admin Users

## Overview

Update the community feed to clearly display admin status with graduation cap icons next to user names. This will make administrators easily identifiable throughout posts and comments.

## Current vs. New Design

| Component | Current | New |
|-----------|---------|-----|
| **CommentThread** | Shield icon + "Instructor" label | GraduationCap icon + "Admin" label |
| **TimelinePost** | No role badge shown | GraduationCap badge for admins |
| **PostCard** | No role badge shown | GraduationCap badge for admins |

## Visual Design

```text
Post Header (Current):
  [Avatar] John Smith  ·  2h ago  [Category]

Post Header (New - for Admin):
  [Avatar] John Smith  [🎓 Admin]  ·  2h ago  [Category]

Comment (Current):
  [Avatar] Admin User  [🛡️ Instructor]

Comment (New):
  [Avatar] Admin User  [🎓 Admin]
  [Avatar] Professor   [🎓 Professor]
```

## Implementation Details

### 1. Update CommentThread.tsx

Change the role badge rendering to use GraduationCap and display specific role names:

```typescript
const getRoleBadge = () => {
  if (comment.user_role === 'admin') {
    return (
      <Badge className="bg-destructive/20 text-destructive text-xs">
        <GraduationCap className="h-3 w-3 mr-1" />
        Admin
      </Badge>
    );
  }
  if (comment.user_role === 'professor') {
    return (
      <Badge className="bg-primary/20 text-primary text-xs">
        <GraduationCap className="h-3 w-3 mr-1" />
        Professor
      </Badge>
    );
  }
  if (comment.user_role === 'moderator') {
    return (
      <Badge className="bg-accent/20 text-accent text-xs">
        <Shield className="h-3 w-3 mr-1" />
        Moderator
      </Badge>
    );
  }
  return null;
};
```

### 2. Update TimelinePost.tsx

Add role badge display in the header section next to author name. This requires:
- Fetching author role data (needs hook update)
- Rendering a GraduationCap badge for admins/professors

### 3. Update PostCard.tsx

Similarly add role badge display next to author names for admins and professors.

### 4. Update useCommunityPosts.ts Hook

Extend the author data fetch to include role information so posts can display role badges.

## Role Badge Styling

| Role | Icon | Background | Text Color |
|------|------|------------|------------|
| Admin | GraduationCap | Red (destructive) | Red |
| Professor | GraduationCap | Gold (primary) | Gold |
| Moderator | Shield | Green (accent) | Green |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/community/CommentThread.tsx` | Change icon to GraduationCap, show specific role names |
| `src/components/community/TimelinePost.tsx` | Add role badge to post header |
| `src/components/community/PostCard.tsx` | Add role badge to post header |
| `src/hooks/useCommunityPosts.ts` | Include author role in post data |

## Expected Outcome

1. Admin users will have a red badge with graduation cap icon saying "Admin"
2. Professors will have a gold badge with graduation cap icon saying "Professor"  
3. Moderators keep their current styling with shield icon
4. Role badges appear on both post cards and comments
5. Easy visual identification of staff members throughout the community


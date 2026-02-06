
# Fix: "View Public Profile" Button Not Working

## Problem Identified

The "View Public Profile" button at the bottom of the Student Detail Sheet (lines 720-725) uses a plain `<a>` tag with `target="_blank"`:

```typescript
<Button variant="ghost" asChild>
  <a href={`/profile/${student.id}`} target="_blank" rel="noopener noreferrer">
    <ExternalLink className="h-4 w-4 mr-2" />
    View Public Profile
  </a>
</Button>
```

**Why it's not working:**
- Using `href="/profile/..."` in a React SPA causes a full page reload instead of client-side navigation
- The `target="_blank"` opens in a new tab, which may be blocked by popup blockers
- The Sheet component may be intercepting the click event

## Solution

Replace the `<a>` tag with React Router's `<Link>` component, matching the pattern used in the header "View Profile" button (which works correctly):

```typescript
<Button variant="ghost" asChild>
  <Link to={`/profile/${student.id}`}>
    <ExternalLink className="h-4 w-4 mr-2" />
    View Public Profile
  </Link>
</Button>
```

This change:
- Uses client-side navigation (no page reload)
- Stays within the same tab
- Properly closes the Sheet when navigating
- Matches the working pattern in the header

## File to Modify

| File | Change |
|------|--------|
| `src/components/admin/StudentDetailSheet.tsx` | Lines 720-725: Replace `<a href>` with `<Link to>` |

## Note

The `Link` component is already imported at line 3, so no additional imports are needed.



# Redirect Root URL to Login Screen

## Overview

This plan modifies the application so that the first page users see when visiting the site is always the login screen (`/auth`), rather than the marketing homepage. Authenticated users will be redirected to the Student Center.

---

## Current State

| Route | Current Behavior |
|-------|------------------|
| `/` | Shows `Index.tsx` (marketing homepage) - accessible to everyone |
| `/auth` | Shows login/signup page - redirects authenticated users to `/student` |

Users landing on the root URL see the marketing homepage regardless of authentication status.

---

## Proposed State

| Route | New Behavior |
|-------|--------------|
| `/` | Redirects unauthenticated users to `/auth`, authenticated users to `/student` |
| `/auth` | Login/signup page (unchanged behavior) |

Users visiting the root URL are always directed to the login screen first. Once authenticated, they go to the Student Center.

---

## Implementation Options

### Option A: Wrap Index in ProtectedRoute (Simple Redirect)

Wrap the Index route with a route guard that redirects unauthenticated users to `/auth`:

```tsx
<Route path="/" element={
  <ProtectedRoute>
    <Navigate to="/student" replace />
  </ProtectedRoute>
} />
```

**Result**: 
- Unauthenticated users at `/` are redirected to `/auth`
- Authenticated users at `/` are redirected to `/student`
- The marketing homepage becomes inaccessible

### Option B: Create a Redirect-Only Root Component (Recommended)

Create a simple redirect component that checks auth status and routes accordingly:

```tsx
// In App.tsx or new component
function RootRedirect() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return <Navigate to={user ? "/student" : "/auth"} replace />;
}

// Route
<Route path="/" element={<RootRedirect />} />
```

**Result**:
- Unauthenticated users at `/` are redirected to `/auth`
- Authenticated users at `/` are redirected to `/student`
- Clean separation of logic

---

## Recommended Approach: Option B

This approach is cleaner and more explicit about the routing behavior.

### File to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Replace Index component with RootRedirect component |

### Implementation Details

1. Add a `RootRedirect` component inside `App.tsx` (no new file needed):

```typescript
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Inside App.tsx, before the App component
function RootRedirect() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary font-bold text-xl">Loading...</div>
      </div>
    );
  }
  
  // Redirect based on authentication status
  return <Navigate to={user ? "/student" : "/auth"} replace />;
}
```

2. Update the root route from:
```tsx
<Route path="/" element={<Index />} />
```

To:
```tsx
<Route path="/" element={<RootRedirect />} />
```

3. The `Index` import can be removed since the marketing homepage is no longer used.

---

## User Experience Flow

```text
User visits hoodtorial.com (root URL)
              |
              v
       ┌──────────────┐
       │ Loading...   │
       │ (check auth) │
       └──────────────┘
              |
    ┌─────────┴─────────┐
    |                   |
    v                   v
[Not logged in]    [Logged in]
    |                   |
    v                   v
Redirect to        Redirect to
  /auth              /student
    |                   |
    v                   v
 Login Screen      Student Center
```

---

## Notes

- The marketing homepage (`Index.tsx`) will no longer be accessible from the root URL
- If you want to keep the marketing page accessible at a different URL (e.g., `/home` or `/welcome`), we can add a separate route for it
- All existing navigation links to `/` in the codebase may need to be updated to point to `/auth` or `/student` instead
- The `"Start Learning"` and other CTA buttons on Index currently point to `/enroll` - these would need to be updated if Index is kept at another route

---

## Technical Summary

| Change | Description |
|--------|-------------|
| Remove Index route at `/` | Replace with redirect logic |
| Add RootRedirect component | Checks auth and redirects appropriately |
| Update root route | Point to RootRedirect instead of Index |


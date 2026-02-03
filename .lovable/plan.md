
# Mandatory Assessment Requirement Implementation

## Overview

This plan adds a requirement for new users to complete the entry assessment before accessing any protected content in the app. Users who haven't taken the assessment will be redirected to the `/assessment` page.

## Current Flow

```text
Sign Up → Verify Email → Sign In → Redirect to /assessment (but can navigate away)
```

## Proposed Flow

```text
Sign Up → Verify Email → Sign In → Forced to /assessment → Complete → Full access
```

## Implementation Strategy

### Option A: Create an AssessmentRoute Component (Recommended)

Create a new route wrapper that extends `ProtectedRoute` to also check if the user has completed the assessment. This is the cleanest approach since it's explicit about which routes require assessment completion.

### Changes Required

#### 1. Create AssessmentRequiredRoute Component

A new route component that:
- First checks if user is logged in (like ProtectedRoute)
- Then checks if user has completed assessment using `useAssessmentResults`
- If not completed, redirects to `/assessment` with a toast notification

```typescript
// src/components/auth/AssessmentRequiredRoute.tsx
export function AssessmentRequiredRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { hasCompletedAssessment, loading: assessmentLoading } = useAssessmentResults();
  
  if (!user) → redirect to /auth
  if (!hasCompletedAssessment) → redirect to /assessment with toast
  return children
}
```

#### 2. Update Route Wrappers in App.tsx

Replace `ProtectedRoute` with `AssessmentRequiredRoute` for routes that should require assessment completion:

| Route | Current | New |
|-------|---------|-----|
| `/student` | `ProtectedRoute` | `AssessmentRequiredRoute` |
| `/student/profile` | `ProtectedRoute` | `AssessmentRequiredRoute` |
| `/student/grades` | `ProtectedRoute` | `AssessmentRequiredRoute` |
| `/community` | `ProtectedRoute` | `AssessmentRequiredRoute` |

The `/assessment` route stays as `ProtectedRoute` (not `AssessmentRequiredRoute`) to avoid redirect loops.

#### 3. Update PaidRoute to Also Check Assessment

Modify `PaidRoute` to include assessment check before the paid access check:

```typescript
// Updated flow:
1. Check user is logged in
2. Check assessment is completed → redirect to /assessment if not
3. Check paid access → redirect to /enrollment if not
```

This ensures course pages also require assessment completion.

#### 4. Clean Up Auth.tsx Redirect Logic

The existing redirect logic in `Auth.tsx` can remain as a helpful first-time redirect, but the route guards will now enforce the requirement globally.

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/auth/AssessmentRequiredRoute.tsx` | New route guard requiring assessment |

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Update routes to use AssessmentRequiredRoute |
| `src/components/auth/PaidRoute.tsx` | Add assessment check |
| `src/components/auth/index.ts` | Export new component |

## User Experience

1. **New user signs up** → Email verified → Logs in
2. **Tries to access /student** → Redirected to /assessment with message "Please complete your entry assessment first"
3. **Completes assessment** → Can now access all protected content
4. **Existing users** who completed assessment → No change, normal access

## Edge Cases Handled

- Direct URL access to protected routes → Redirected to assessment
- Browser back button after assessment redirect → Assessment page shown
- Returning users who already completed → Normal access
- Assessment page itself → Uses ProtectedRoute, not AssessmentRequiredRoute (prevents loop)

## Technical Details

### AssessmentRequiredRoute Component

```typescript
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAssessmentResults } from "@/hooks/useAssessmentResults";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";

interface AssessmentRequiredRouteProps {
  children: React.ReactNode;
}

export function AssessmentRequiredRoute({ children }: AssessmentRequiredRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasCompletedAssessment, loading: assessmentLoading } = useAssessmentResults();
  const location = useLocation();
  const { toast } = useToast();
  const hasShownToast = useRef(false);

  const loading = authLoading || assessmentLoading;

  useEffect(() => {
    if (!loading && user && !hasCompletedAssessment && !hasShownToast.current) {
      hasShownToast.current = true;
      toast({
        title: "Assessment Required",
        description: "Please complete your entry assessment to continue.",
      });
    }
  }, [loading, user, hasCompletedAssessment, toast]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!hasCompletedAssessment) {
    return <Navigate to="/assessment" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

### Updated PaidRoute

```typescript
export function PaidRoute({ children }: PaidRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasCompletedAssessment, loading: assessmentLoading } = useAssessmentResults();
  const { hasAccess, loading: subLoading } = useSubscription();
  
  // ... loading state ...
  
  if (!user) → redirect to /auth
  if (!hasCompletedAssessment) → redirect to /assessment  
  if (!hasAccess) → redirect to /enrollment
  
  return children
}
```



# Fix PDF Question Generator - Auth Issue

## Problem Identified

The "Generate Questions from PDF" feature is stuck on a spinning wheel because of an authentication error in the `parse-pdf` edge function.

**Error from logs:**
```
Auth error: AuthApiError: invalid claim: missing sub claim
```

**Root cause:** The client code is sending the Supabase anon key as the Authorization token instead of the user's actual session token. The anon key is not a user JWT, so when the edge function tries to validate it with `supabase.auth.getUser()`, it fails.

---

## Current Code (Broken)

```typescript
// PDFQuestionGeneratorDialog.tsx - Line 140-148
const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-pdf`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`, // ❌ This is the anon key, not a user token!
    },
    body: formData,
  }
);
```

---

## Solution

Get the user's actual session token from Supabase and use that for authentication.

### Changes to `src/components/admin/PDFQuestionGeneratorDialog.tsx`

Update the `handleFileSelect` function to:
1. Get the current session from Supabase
2. Use the session's access token in the Authorization header
3. Add error handling if no session exists

```typescript
const handleFileSelect = async (selectedFile: File) => {
  // ... validation code stays the same ...

  setFile(selectedFile);
  setIsUploading(true);

  try {
    // Get the user's session token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error("You must be logged in to upload PDFs");
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-pdf`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`, // ✅ User's actual token
        },
        body: formData,
      }
    );
    // ... rest of the code ...
  }
};
```

---

## Why This Fixes It

| Before | After |
|--------|-------|
| `Authorization: Bearer <anon_key>` | `Authorization: Bearer <user_session_token>` |
| Anon key has no user claims | Session token has `sub` claim with user ID |
| `getUser()` fails with "missing sub claim" | `getUser()` succeeds and returns user data |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/admin/PDFQuestionGeneratorDialog.tsx` | Get session token and use it for Authorization header |

---

## Technical Notes

- The `generate-questions` function works because it's called via `supabase.functions.invoke()` which automatically includes the user's session token
- The `parse-pdf` function uses raw `fetch()` because it needs to send `FormData` (file upload), which is why we need to manually get and attach the session token
- This is the same authentication pattern used elsewhere in the codebase


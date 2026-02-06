

# Fix: Multiple Student Issues and Video Upload Problems

## Issues Identified

### Issue 1: Prince Moran Stuck in Assessment Loop (Again)

**Current State:**
| Field | Value | Problem |
|-------|-------|---------|
| `assessment_count` | 0 | No assessments completed |
| `degree_path` | `"associate"` | Has a path set without assessment |
| `onboarding_completed` | `false` | Not marked complete |

**Root Cause:** The corrupted profile fix from earlier reset `degree_path` to `null`, but it was set to "bachelor" before. Now it shows "associate" - which means either:
1. The previous SQL fix didn't work (wrong user_id)
2. The profile was modified again after the fix
3. The defensive `useEffect` in Assessment.tsx fired but the update didn't persist

The defensive code in Assessment.tsx checks `profile?.degree_path` but only triggers when `hasCompletedAssessment` is false. If the assessment query is loading, this check is skipped.

---

### Issue 2: Video Upload Not Working

**Symptoms:** Admin can't upload videos for login page or other tabs (admin backgrounds).

**Findings from Investigation:**
- Storage bucket `site-assets` exists and is public
- RLS policies are correctly configured (admins can INSERT/UPDATE/DELETE)
- The `site_settings` table policies are correct (admins can INSERT/UPDATE)
- No actual upload errors visible in recent network logs

**Likely Causes:**
1. The upload is failing silently without proper error handling
2. The `updateSetting` call to save the URL may be failing due to RLS
3. Browser may be blocking large file uploads

---

## Solution

### Part 1: Database Fix for Prince Moran

Reset the corrupted profile state:

```sql
UPDATE profiles 
SET degree_path = NULL, 
    certificate_department = NULL,
    recommended_degree_path = NULL
WHERE user_id = '3e612916-6557-4b3f-81b4-3b3e185064c6';
```

### Part 2: Improve Defensive Code in Assessment.tsx

The current defensive code has a race condition - it only triggers if `resultsLoading` is false. We need to make it more robust:

**File: `src/pages/Assessment.tsx`**

```typescript
// Current code (line 58-68):
useEffect(() => {
  if (!resultsLoading && !hasCompletedAssessment && profile?.degree_path) {
    console.warn("Detected corrupted profile state...");
    updateProfile({...});
  }
}, [resultsLoading, hasCompletedAssessment, profile?.degree_path, updateProfile]);
```

**Problems:**
1. The `updateProfile` call doesn't handle errors or confirm success
2. No feedback to user about what's happening
3. Page might still show wrong state during the fix

**Improved approach:**
1. Add loading state while auto-fixing
2. Show toast notification about the fix
3. Force refetch profile after fix
4. Navigate user to start fresh assessment after fix

### Part 3: Fix Video Upload Error Handling

**File: `src/hooks/useSiteSettings.ts`**

The `uploadAsset` function silently fails without proper error details. Add better logging and validation:

```typescript
const uploadAsset = useCallback(async (file: File, assetType: 'video' | 'logo' | 'music'): Promise<string> => {
  console.log("Starting upload:", { type: assetType, size: file.size, name: file.name });
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${assetType}-${Date.now()}.${fileExt}`;
  const filePath = `login/${fileName}`;

  const { error: uploadError, data: uploadData } = await supabase.storage
    .from('site-assets')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  console.log("Upload successful:", uploadData);
  
  const { data: urlData } = supabase.storage
    .from('site-assets')
    .getPublicUrl(filePath);

  console.log("Public URL:", urlData.publicUrl);
  return urlData.publicUrl;
}, []);
```

**File: `src/components/admin/SiteCustomization.tsx`**

Add better error display in the upload handlers:

```typescript
} catch (error) {
  console.error("Error uploading video:", error);
  toast({
    title: "Upload failed",
    description: error instanceof Error 
      ? error.message 
      : "Failed to upload video. Please try again.",
    variant: "destructive",
  });
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| Database | Reset Prince Moran's corrupted profile |
| `src/pages/Assessment.tsx` | Improve defensive code with proper error handling, loading state, and user feedback |
| `src/hooks/useSiteSettings.ts` | Add detailed logging to upload function |
| `src/components/admin/SiteCustomization.tsx` | Improve error message display |

---

## Implementation Steps

1. **Database Fix** - Reset Prince Moran's profile fields
2. **Assessment.tsx** - Add robust auto-fix with loading state and navigation
3. **useSiteSettings.ts** - Add console logging for debugging uploads
4. **SiteCustomization.tsx** - Show more detailed error messages
5. **Test** - Have Prince Moran log in and verify assessment starts correctly
6. **Test** - Try uploading a video and check browser console for any errors

---

## Expected Behavior After Fix

**For Students:**
1. Prince Moran visits any protected page
2. Gets redirected to `/assessment` 
3. Assessment page detects corrupted state → shows loading → auto-fixes profile
4. User sees "Start Assessment" button and can proceed normally

**For Video Uploads:**
1. Admin uploads a video
2. Console shows detailed progress: "Starting upload... Upload successful... Public URL..."
3. If error occurs, toast shows specific error message for debugging


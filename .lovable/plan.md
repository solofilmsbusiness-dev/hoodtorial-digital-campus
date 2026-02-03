
# Enhanced Profile System with Full Site Reflection

## Problem Analysis

Based on my investigation, there are two main issues:

### Issue 1: Profile Changes Don't Reflect Across Website
The Navigation component (header) displays the user avatar but:
- **Line 77**: Uses `AvatarImage src={undefined}` - hardcoded to undefined!
- **Line 79**: Only shows email initial, not profile display_name
- The `useProfile` hook is not used in Navigation, so it has no access to profile data

### Issue 2: Edit Profile Section Could Be Enhanced
Current limitations:
- Basic form layout without visual hierarchy or grouping feedback
- No live preview of how profile will look across the site
- No indication of which fields are publicly visible vs private
- Missing profile completeness indicator
- No unsaved changes warning

## Solution Overview

### Part 1: Create a Profile Context for Site-Wide Access
Instead of calling `useProfile` in multiple components, create a centralized profile context that:
- Loads profile once at app level
- Provides profile data to any component that needs it
- Auto-refreshes when profile is updated
- Eliminates duplicate profile fetches

### Part 2: Fix Navigation to Show Real Profile Data
Update Navigation component to:
- Use the new profile context
- Display user's actual avatar
- Show display_name initial (not email initial)
- Apply user's accent color to avatar border (personalization)

### Part 3: Enhance the Edit Profile Page
Improvements:
- Add a live "Preview Card" showing how profile appears to others
- Add "Profile Completeness" progress indicator
- Group fields with clearer visual sections
- Add privacy indicators (🔒 private / 👁 public)
- Add unsaved changes detection with confirmation dialog
- Improve mobile responsiveness

### Part 4: Profile Reflection Across Site
Ensure profile updates reflect in:
- Navigation header avatar
- Student Center header
- Community posts (author info)
- Comment threads (author info)

## Implementation Details

### Files to Create

| File | Purpose |
|------|---------|
| `src/contexts/ProfileContext.tsx` | Global profile state provider |
| `src/components/profile/ProfilePreviewCard.tsx` | Live preview of how profile appears |
| `src/components/profile/ProfileCompleteness.tsx` | Progress indicator for profile completion |

### Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Wrap with ProfileProvider |
| `src/components/layout/Navigation.tsx` | Use profile context for avatar/name |
| `src/pages/StudentProfile.tsx` | Add preview card, completeness, unsaved changes detection |
| `src/pages/StudentCenter.tsx` | Use profile context (already using useProfile, but will use context) |
| `src/hooks/useProfile.ts` | Update to expose refetch function for context use |

## Technical Implementation

### ProfileContext.tsx

```typescript
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;

      // Update local state immediately
      setProfile((prev) => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, error, refetch: fetchProfile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
}
```

### Navigation.tsx Changes

```typescript
// Add import
import { useProfileContext } from "@/contexts/ProfileContext";

// Inside Navigation component
const { profile } = useProfileContext();

const getInitials = (name?: string | null, email?: string | null) => {
  if (name) {
    return name.split(" ").map((n) => n.charAt(0)).join("").toUpperCase().slice(0, 2);
  }
  return email?.charAt(0).toUpperCase() || "S";
};

// In the avatar JSX
<Avatar 
  className="h-9 w-9 border-2"
  style={{ borderColor: profile?.profile_accent_color || '#D4AF37' }}
>
  <AvatarImage src={profile?.avatar_url || undefined} />
  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
    {getInitials(profile?.display_name, user?.email)}
  </AvatarFallback>
</Avatar>
```

### ProfilePreviewCard Component

A compact card showing how the user's profile appears to others:

```text
┌─────────────────────────────────────────┐
│  How others see you                     │
├─────────────────────────────────────────┤
│  ┌──────┐                               │
│  │Avatar│  Display Name                 │
│  └──────┘  🎬 Narrative Fiction         │
│            📍 Los Angeles, CA           │
│                                         │
│  "Your bio text appears here..."        │
│                                         │
│  📷 Sony A7III                          │
│  🎥 Working on: Short Film Project      │
│                                         │
│  Favorite Films: The Matrix, Inception  │
│                                         │
│  🔗 Portfolio | 📸 Instagram | 🎬 Vimeo │
└─────────────────────────────────────────┘
```

### ProfileCompleteness Component

Shows profile completion percentage with suggestions:

```text
┌─────────────────────────────────────────┐
│  Profile Completeness: 65%              │
│  ████████████░░░░░░░░                   │
│                                         │
│  Add to stand out:                      │
│  • Add a bio to introduce yourself      │
│  • Upload a profile photo               │
│  • Share your camera gear               │
│  • Link your portfolio                  │
└─────────────────────────────────────────┘
```

### StudentProfile.tsx Enhancements

1. **Unsaved Changes Detection**
```typescript
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

useEffect(() => {
  // Compare formData with original profile
  if (profile) {
    const changed = Object.keys(formData).some(
      key => formData[key] !== (profile[key] ?? "")
    );
    setHasUnsavedChanges(changed);
  }
}, [formData, profile]);

// Add beforeunload warning
useEffect(() => {
  const handleBeforeUnload = (e: BeforeEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = "";
    }
  };
  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [hasUnsavedChanges]);
```

2. **Privacy Indicators on Fields**
```typescript
const PRIVATE_FIELDS = ["location", "bio", "camera_gear", "instagram_url", ...];

<Label>
  Location
  <span className="ml-2 text-xs text-muted-foreground">
    <Lock className="inline h-3 w-3" /> Private
  </span>
</Label>
```

3. **Layout Improvements**
- Fixed sidebar with profile preview card (desktop)
- Profile completeness at top
- Sticky save button on mobile

## Expected Outcomes

1. **Immediate Reflection**: Profile changes show instantly in:
   - Navigation header avatar
   - Student Center welcome section
   - Community post author info (on next fetch)

2. **Enhanced Editing Experience**:
   - Users see live preview of their profile
   - Clear indication of profile completeness
   - Know which fields are private vs public
   - Protected from losing unsaved changes

3. **Personalization Visible Site-Wide**:
   - Custom accent color on nav avatar border
   - Avatar shows everywhere, not just profile pages

4. **Performance**:
   - Single profile fetch at app level
   - No duplicate queries
   - Context provides cached profile to all components

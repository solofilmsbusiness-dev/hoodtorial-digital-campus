

# Admin Option to Disable Sign-Up

## Overview

Add an admin toggle in the Settings page that allows disabling the sign-up functionality on the login page. This is useful for running tests or limiting access to existing users only.

---

## How It Will Work

### Admin Settings Page
A new toggle in the existing Site Customization card (or a new Access Control section):

```text
┌─────────────────────────────────────────────────────────────┐
│ ACCESS CONTROL                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Disable Sign Up                                 [TOGGLE]    │
│ Prevent new users from creating accounts.                   │
│ Only existing users can sign in.                            │
│                                                             │
│ ⚠️ Currently: Sign up is DISABLED                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Login Page Behavior
When sign-up is disabled:
- The "Sign Up" button/link is hidden
- If someone tries to toggle to sign-up mode, they see a message: "Sign up is currently disabled"
- Only the sign-in form is available
- Display name field never appears

---

## Implementation

### Database Change
Add a new row to the `site_settings` table:

| id | value |
|----|-------|
| signup_disabled | "true" or "false" |

### Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useSiteSettings.ts` | Add `signup_disabled` to the settings interface |
| `src/pages/Auth.tsx` | Fetch the setting and conditionally hide sign-up UI |
| `src/components/admin/SiteCustomization.tsx` | Add toggle for disabling sign-up |

---

## Technical Details

### 1. Update useSiteSettings Hook

Add `signup_disabled` to the `SiteSettings` interface:

```typescript
interface SiteSettings {
  login_video_url: string | null;
  login_logo_url: string | null;
  login_music_url: string | null;
  signup_disabled: string | null; // "true" or "false"
}
```

### 2. Update Auth Page

Fetch the `signup_disabled` setting and conditionally render:

```typescript
// In Auth.tsx useEffect for fetching settings
const [signupDisabled, setSignupDisabled] = useState(false);

// Fetch from site_settings
const signupSetting = data?.find(s => s.id === "signup_disabled");
setSignupDisabled(signupSetting?.value === "true");

// In JSX - hide the toggle link if disabled
{!signupDisabled && (
  <div className="mt-6 text-center">
    <p className="text-sm text-muted-foreground">
      Don't have an account?
      <button onClick={() => setIsSignUp(true)}>Sign Up</button>
    </p>
  </div>
)}

// Force sign-in mode if disabled
useEffect(() => {
  if (signupDisabled && isSignUp) {
    setIsSignUp(false);
  }
}, [signupDisabled, isSignUp]);
```

### 3. Add Toggle to Admin Settings

In `SiteCustomization.tsx`, add a new section:

```typescript
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <div className="space-y-0.5">
      <Label className="text-base font-medium flex items-center gap-2">
        <UserX className="h-4 w-4" />
        Disable Sign Up
      </Label>
      <p className="text-sm text-muted-foreground">
        Prevent new users from creating accounts
      </p>
    </div>
    <Switch
      checked={settings.signup_disabled === "true"}
      onCheckedChange={(checked) => 
        updateSetting("signup_disabled", checked ? "true" : "false")
      }
    />
  </div>
  
  {settings.signup_disabled === "true" && (
    <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
      <p className="text-sm text-amber-600 dark:text-amber-400">
        Sign up is currently disabled. Only existing users can access the platform.
      </p>
    </div>
  )}
</div>
```

---

## User Experience

### For Admins
1. Go to Admin > Settings
2. Find "Access Control" or "Site Customization" section
3. Toggle "Disable Sign Up" on/off
4. See confirmation message
5. Changes take effect immediately

### For Visitors (when disabled)
1. Visit /auth page
2. Only see sign-in form
3. No "Sign Up" link visible
4. Cannot create new accounts

---

## Files Summary

| File | Action |
|------|--------|
| `src/hooks/useSiteSettings.ts` | Add `signup_disabled` field |
| `src/pages/Auth.tsx` | Fetch setting, hide sign-up when disabled |
| `src/components/admin/SiteCustomization.tsx` | Add toggle with warning indicator |

No database migration needed - the `site_settings` table already supports arbitrary key-value pairs.


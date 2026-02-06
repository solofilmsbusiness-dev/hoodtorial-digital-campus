

# Fix: Complete the Forgot Password Flow

## Problem

The "Forgot Password" button correctly sends a recovery email, but when you click the link in the email, you're redirected back to the login page with no way to actually set a new password. The `PASSWORD_RECOVERY` auth event is never handled.

## Solution

### 1. Handle the PASSWORD_RECOVERY event in Auth.tsx

Listen for the `PASSWORD_RECOVERY` event in the auth state change listener. When detected, show a "Set New Password" form instead of the normal login/signup form.

### 2. Add a New Password form

Display a simple form with a new password field and confirm button. On submit, call `supabase.auth.updateUser({ password })` to save the new password.

### 3. Immediate action after deploying

Once this fix is live:
1. Go to hoodtorialuniversity.com/auth
2. Click "Forgot Password?" and enter bangoutfilms@gmail.com
3. Check your email and click the reset link
4. Enter your new password in the form that appears

---

## File to Modify

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Add PASSWORD_RECOVERY event handler and new password form |

## Technical Details

**Auth.tsx changes:**

Add state to track recovery mode:
```tsx
const [isRecoveryMode, setIsRecoveryMode] = useState(false);
const [newPassword, setNewPassword] = useState("");
```

Add a `useEffect` to listen for the recovery event:
```tsx
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      setIsRecoveryMode(true);
    }
  });
  return () => subscription.unsubscribe();
}, []);
```

Add a handler to update the password:
```tsx
const handlePasswordReset = async () => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    toast({ title: "Error", description: error.message, variant: "destructive" });
  } else {
    toast({ title: "Success", description: "Password updated! You can now log in." });
    setIsRecoveryMode(false);
    navigate("/student");
  }
};
```

Conditionally render the recovery form when `isRecoveryMode` is true, showing a password input and "Update Password" button instead of the normal login/signup form.

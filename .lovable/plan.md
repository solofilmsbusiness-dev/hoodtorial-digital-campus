

# Create Admin Account

## What This Does

Creates a new admin account you can use to log in immediately. This will be done via a one-time-use backend function that creates the account with the admin role pre-assigned.

## Your Login Credentials

Once implemented, your new admin account will be:
- **Email**: admin@hoodtorial.com
- **Password**: HoodAdmin2026!

You can change the password after logging in.

## How It Works

### Step 1: Create a setup edge function

A new backend function (`create-admin`) that:
1. Creates a new user account with email `admin@hoodtorial.com` and a known password
2. Confirms the email automatically (no verification needed)
3. Assigns the `admin` role in the `user_roles` table
4. Returns success so you know it worked

This function will NOT require authentication (since you can't log in yet), but will include a one-time secret key to prevent unauthorized use.

### Step 2: Call the function to create the account

After deploying, we'll invoke the function to create the account.

### Step 3: Log in

Go to hoodtorialuniversity.com/auth and log in with the credentials above.

---

## File to Create

| File | Purpose |
|------|---------|
| `supabase/functions/create-admin/index.ts` | One-time function to create the admin account |

## Technical Details

The edge function will:

```typescript
// Create user via admin API
const { data: newUser } = await supabaseAdmin.auth.admin.createUser({
  email: "admin@hoodtorial.com",
  password: "HoodAdmin2026!",
  email_confirm: true,
});

// Assign admin role
await supabaseAdmin.from("user_roles").insert({
  user_id: newUser.user.id,
  role: "admin",
});
```

A setup key is required in the request body to prevent anyone else from calling this. After the account is created, the function should be deleted for security.


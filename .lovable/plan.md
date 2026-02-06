

# Implement Waiting List Feature

## Problem
When signup is disabled via the admin Access Control settings, visitors have no way to express interest in joining the platform. Currently, they just see a sign-in form with no signup option and no way to get notified when access opens.

## Solution Overview
Create a complete "waiting list" system that:
1. Shows a "Join Waiting List" option when signup is disabled
2. Collects visitor emails in a database table
3. Allows admins to view and manage waiting list entries
4. Sends a welcome email when admin approves an entry (future enhancement)

---

## Technical Implementation

### Part 1: Database Table

Create a new `waitlist` table to store interested visitors:

```sql
CREATE TABLE public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS: Public can INSERT (to join), only admins can SELECT/UPDATE/DELETE
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can join the waiting list
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

-- Only admins can view waitlist entries
CREATE POLICY "Admins can manage waitlist"
  ON public.waitlist FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### Part 2: Auth Page Updates

**File: `src/pages/Auth.tsx`**

Add a "Join Waiting List" mode when signup is disabled:

```typescript
// New state for waitlist mode
const [isWaitlistMode, setIsWaitlistMode] = useState(false);
const [waitlistName, setWaitlistName] = useState("");
const [waitlistSuccess, setWaitlistSuccess] = useState(false);

// Handle waitlist submission
const handleWaitlistSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const { error } = await supabase
      .from("waitlist")
      .insert({ email, name: waitlistName });
    
    if (error) {
      if (error.code === "23505") { // Unique violation
        toast({
          variant: "destructive",
          title: "Already on the list",
          description: "This email is already on the waiting list.",
        });
      } else {
        throw error;
      }
    } else {
      setWaitlistSuccess(true);
      toast({
        title: "You're on the list!",
        description: "We'll notify you when registration opens.",
      });
    }
  } catch (err) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to join waiting list. Please try again.",
    });
  } finally {
    setLoading(false);
  }
};
```

**UI Changes:**
- When `signupDisabled === true`, show a "Join Waiting List" link below the sign-in form
- Clicking it switches to a waitlist form with email and optional name fields
- On successful submission, show a success message

### Part 3: Admin Waiting List Manager

**New File: `src/pages/admin/WaitlistManager.tsx`**

Create a new admin page to manage waiting list entries:

```typescript
// Features:
// - Table showing all waitlist entries
// - Filter by status (pending/approved/rejected)
// - Bulk actions (approve, reject)
// - Export to CSV
// - Quick action to manually create user account from waitlist entry
```

**Update: `src/components/admin/AdminSidebar.tsx`**

Add navigation link to waitlist manager:
```typescript
{ title: "Waiting List", url: "/admin/waitlist", icon: Clock }
```

### Part 4: Pending Items Integration

**Update: `src/hooks/useAdminActivity.ts`**

Add pending waitlist entries to the admin dashboard:

```typescript
// Add to useAdminPendingItems
const { data: pendingWaitlist } = useQuery({
  queryKey: ["admin-pending-waitlist"],
  queryFn: async () => {
    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    return count || 0;
  },
});

// Add to pendingItems array:
if (pendingWaitlist > 0) {
  pendingItems.push({
    type: "waitlist",
    count: pendingWaitlist,
    items: [],
  });
}
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| Database migration | Create | `waitlist` table with RLS policies |
| `src/pages/Auth.tsx` | Modify | Add waitlist mode UI when signup disabled |
| `src/pages/admin/WaitlistManager.tsx` | Create | Admin page to manage waitlist entries |
| `src/hooks/useWaitlist.ts` | Create | Hook for fetching/managing waitlist entries |
| `src/components/admin/AdminSidebar.tsx` | Modify | Add waitlist navigation link |
| `src/hooks/useAdminActivity.ts` | Modify | Include pending waitlist in dashboard |
| `src/App.tsx` | Modify | Add route for `/admin/waitlist` |

---

## User Flow

### Visitor Experience:
```
1. Visitor goes to /auth
2. Sees sign-in form (signup is disabled)
3. Clicks "Join Waiting List" link below form
4. Enters email (and optional name)
5. Clicks "Join List" button
6. Sees success message: "You're on the list!"
```

### Admin Experience:
```
1. Admin sees "X waiting list entries" in dashboard pending items
2. Clicks to go to Waiting List page
3. Views all pending entries
4. Can approve/reject entries
5. Approved entries get notified (future: email integration)
```

---

## Expected Behavior After Implementation

**Login Page (signup disabled):**
- Shows "Join Waiting List" link below sign-in form
- Clicking switches to waitlist form
- User can enter email and name
- Submitting shows success confirmation

**Admin Dashboard:**
- Pending Items card shows waitlist count
- New sidebar link: "Waiting List"
- Full management page with approve/reject actions


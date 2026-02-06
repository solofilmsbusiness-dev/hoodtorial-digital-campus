

# Fix: Online Status Not Showing in Admin

## Problem

The `useOnlineUsers` hook and the `LivePresenceIndicator` both call `supabase.channel("online-users")` but with different presence key configs. Supabase's client can conflict when multiple channel instances share the same name but different configurations. The admin hook creates a competing channel that doesn't properly see other users' presence state.

## Solution

Change the `useOnlineUsers` hook to use a **different channel name** (e.g., `"online-users-admin"`) that subscribes to the same presence room but avoids the naming conflict. Alternatively -- and more correctly -- the hook should subscribe to the same channel without a separate presence key config, and simply not call `track()` at all (pure listener).

The cleanest fix: remove the presence config from `useOnlineUsers` entirely and just subscribe as a plain listener. Supabase Presence requires calling `track()` to join the presence set, but you can still listen to `sync` events without tracking. The issue is that without `track()`, the `subscribe` may not trigger presence sync. So the hook should `track()` with a minimal payload (no `user_id`) on a **uniquely named channel** that still connects to the same presence topic.

Actually, the real fix is simpler: Supabase Presence channels must share the **exact same channel name** to see each other. The current code already does this (`"online-users"`). The bug is that when two `supabase.channel("online-users")` calls happen in the same browser session (admin is also running `LivePresenceIndicator` via Navigation, or they have separate instances), they conflict.

### Root cause
The admin page uses `AdminLayout` (not `Navigation`), so `LivePresenceIndicator` is **not** mounted. That means no one is calling `track()` with `user_id` on the admin side. The `useOnlineUsers` hook does subscribe and calls `track({ reader: true })`, which is correct -- it should see other users who tracked with `user_id`. If no students are browsing the site, the count will legitimately be 0.

### The actual fix
The hook works correctly in theory. The issue may be that **no students have the `LivePresenceIndicator` rendered** at the time of testing. To verify, we should also ensure the admin's own session is tracked. We'll update `useOnlineUsers` to also track the admin's own `user_id` so at minimum the admin sees themselves as online, confirming the system works.

## Changes

### 1. `src/hooks/useOnlineUsers.ts`
- Track the admin's own `user_id` in the presence payload (so the admin appears online too)
- Fetch the current user via `supabase.auth.getUser()` before subscribing
- Use the user's ID as the presence key (not a random string) to avoid duplicate entries

### 2. Verify `LivePresenceIndicator` tracks `user_id`
- Already done in prior changes -- no modification needed

## Technical Details

```typescript
export function useOnlineUsers() {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const presenceKey = user?.id || `admin-reader-${Math.random().toString(36).substring(7)}`;

      const channel = supabase.channel("online-users", {
        config: { presence: { key: presenceKey } },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const ids = new Set<string>();
          Object.values(state).forEach((presences) => {
            presences.forEach((p: any) => {
              if (p.user_id) ids.add(p.user_id);
            });
          });
          setOnlineUserIds(ids);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({
              online_at: new Date().toISOString(),
              user_id: user?.id || null,
            });
          }
        });

      return channel;
    };

    let channelRef: any = null;
    setup().then((ch) => { channelRef = ch; });

    return () => {
      if (channelRef) supabase.removeChannel(channelRef);
    };
  }, []);

  return { onlineUserIds, onlineCount: onlineUserIds.size };
}
```

This mirrors the same pattern used in `LivePresenceIndicator` -- async setup, track with `user_id`, and use the user's actual ID as the presence key. The admin will now appear in the online list and can see all other online users.

## Files

| File | Change |
|------|--------|
| `src/hooks/useOnlineUsers.ts` | Track admin's own user_id, use async setup pattern matching LivePresenceIndicator |


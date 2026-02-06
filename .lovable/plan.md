

# Online Status Indicators in Admin User Manager

## Overview

Add a real-time online/offline indicator (green dot) next to each student's avatar in the admin User Manager table. This uses the same Supabase Presence channel (`online-users`) that the existing `LivePresenceIndicator` already uses.

## How It Works

The existing presence system tracks users with random keys (`user-${random}`). To identify *which* users are online, the presence `track()` call needs to include the user's ID. Then on the admin side, we subscribe to the same channel and read the presence state to build a set of online user IDs.

## Changes

### 1. `src/components/animations/LivePresenceIndicator.tsx`
- Update the `track()` payload to include `user_id` from the auth context (alongside the existing `online_at` field)
- This allows the admin to know *who* is online, not just a count
- The presence key will use the actual user ID when authenticated, falling back to the random key for anonymous visitors

### 2. New Hook: `src/hooks/useOnlineUsers.ts`
- Subscribe to the `online-users` presence channel (read-only, no tracking)
- On `sync` events, extract all `user_id` values from the presence state into a `Set<string>`
- Returns `{ onlineUserIds: Set<string>, onlineCount: number }`
- Cleans up the channel subscription on unmount

### 3. `src/pages/admin/UserManager.tsx`
- Import `useOnlineUsers` hook
- Add a small green/gray dot indicator on each student's avatar showing online/offline status
- Add an "Online" filter option to the existing filter controls (or a simple toggle)
- Add an "Online" column header or integrate the dot into the existing Student column
- Show online count in the header stats area (e.g., "12 students -- 3 online")

### 4. `src/components/admin/StudentFilters.tsx`
- Add an "Online Status" filter: All / Online / Offline

## Technical Details

### Updated `track()` in LivePresenceIndicator:
```typescript
// Before
await channel.track({ online_at: new Date().toISOString() });

// After  
const { data: { user } } = await supabase.auth.getUser();
await channel.track({
  online_at: new Date().toISOString(),
  user_id: user?.id || null,
});
```

### `useOnlineUsers` hook:
```typescript
export function useOnlineUsers() {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const channel = supabase.channel("online-users");
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const ids = new Set<string>();
      Object.values(state).forEach(presences => {
        presences.forEach((p: any) => {
          if (p.user_id) ids.add(p.user_id);
        });
      });
      setOnlineUserIds(ids);
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { onlineUserIds, onlineCount: onlineUserIds.size };
}
```

### Avatar indicator in UserManager:
A small absolute-positioned dot on the avatar (green pulse for online, nothing for offline), similar to common chat apps.

## Files Summary

| File | Change |
|------|--------|
| `src/components/animations/LivePresenceIndicator.tsx` | Include `user_id` in presence track payload |
| `src/hooks/useOnlineUsers.ts` | New hook -- subscribes to presence, returns set of online user IDs |
| `src/pages/admin/UserManager.tsx` | Show green/gray dot on avatars, show online count in header |
| `src/components/admin/StudentFilters.tsx` | Add Online/Offline filter option |


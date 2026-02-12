

## Fix Contact Cards in Messages

### Problems Found
1. **React ref error**: `ContactCardMessage` is a plain function component but gets a ref passed to it (from the message bubble layout), causing a React warning that can break rendering
2. **Visually bland**: The card uses a basic `Card` with generic styling that doesn't match the platform's bold dark/gold aesthetic
3. **No clear purpose**: The card has no "View Profile" button linking to `/profile/:id`, making it a dead-end
4. **Empty states look awkward**: When a user has no bio, no social links, and no portfolio, the card is just a name and avatar with nothing else

### Solution

**Modified: `src/components/messaging/ContactCardMessage.tsx`**
- Wrap with `React.forwardRef` to fix the ref warning
- Redesign with the platform's brutalist aesthetic:
  - Dark gradient background with gold accent border on the left edge
  - Larger avatar with the user's accent color ring
  - Creative role shown as a gold badge/chip below the name
  - Bio in a subtle quote-style block
  - Camera gear with a styled icon chip
  - Social links as gold-accented icon buttons
  - "View Profile" as a prominent gold button linking to `/profile/:userId`
  - "View Portfolio" as a secondary outlined button (only if portfolio exists)
- Handle empty states gracefully: if nothing but name/avatar, show a clean minimal card with just the View Profile action

**Modified: `src/components/messaging/MessageComposer.tsx`**
- Improve the "Share Contact Card" preview popover to better match the new card style
- Show a mini version of what the recipient will see

### Visual Design (New Card Layout)

```text
+----------------------------------------------+
| [Gold left border]                            |
|  [Avatar w/ ring]  Name                       |
|                    "Cinematographer" (badge)   |
|                                               |
|  "Bio text here in italic quote style..."     |
|                                               |
|  Camera icon  Camera gear details             |
|                                               |
|  [IG] [YT] [TW] [Vimeo]  (gold icon row)     |
|                                               |
|  [ View Profile ]  [ View Portfolio ]         |
+----------------------------------------------+
```

### Files Summary

| File | Action |
|------|--------|
| `src/components/messaging/ContactCardMessage.tsx` | Rewrite with forwardRef + redesign |
| `src/components/messaging/MessageComposer.tsx` | Update contact preview to match new style |


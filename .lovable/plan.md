
# Remove AI Chat from Login Page

## Problem

The AI chat widget (floating message bubble in the bottom-right corner) appears on the login page, which clutters the cinematic authentication experience.

## Solution

Update the `ChatWidget` component to detect when the user is on the `/auth` route and hide itself. This keeps the chat available on all other pages while removing it from the login screen.

## Changes Required

### src/components/chat/ChatWidget.tsx

Add route detection using `useLocation` from react-router-dom:

```typescript
import { useLocation } from "react-router-dom";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Hide chat widget on auth page
  if (location.pathname === "/auth") {
    return null;
  }

  // ... rest of component
}
```

## Technical Details

| Aspect | Implementation |
|--------|----------------|
| Hook used | `useLocation` from react-router-dom |
| Route to hide | `/auth` |
| Return value when hidden | `null` (renders nothing) |

## File to Modify

| File | Change |
|------|--------|
| `src/components/chat/ChatWidget.tsx` | Add location check to hide on `/auth` route |

## Expected Outcome

1. AI chat button no longer appears on the login page
2. Chat widget still works on all other pages
3. Clean, uncluttered login experience with only the music toggle on the left

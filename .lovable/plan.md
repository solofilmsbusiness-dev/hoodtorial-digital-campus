

## Fix Messaging Scroll and Message Cutoff

### Root Causes

**1. Broken flex layout on desktop (`Messages.tsx` line 84-89)**
The chat panel container has `className="flex-1 flex flex-col"` combined with `"md:block"`. On desktop, `md:block` overrides `flex flex-col` to `display: block`, which breaks the entire flex height chain. When the parent is `block` instead of `flex`, `flex-1` on children has no effect, so the `ChatWindow` has no bounded height and the `ScrollArea` expands infinitely instead of scrolling.

**2. ScrollArea auto-scroll not reaching the viewport (`ChatWindow.tsx`)**
`bottomRef.current?.scrollIntoView()` targets a div inside the ScrollArea content, but Radix ScrollArea uses an internal `Viewport` element as the actual scrollable container. `scrollIntoView` doesn't always work reliably with Radix ScrollArea because the browser doesn't recognize the Viewport as the scroll ancestor. Replacing ScrollArea with a plain `div` with `overflow-y: auto` gives us direct, reliable scroll control.

### Changes

**File 1: `src/pages/Messages.tsx`**
- Line 84-89: Change `"flex-1 flex flex-col", "md:block"` to `"flex-1 flex flex-col", "md:flex"` so the flex layout is preserved on desktop instead of being overridden by `block`.
- Line 99: Add `min-h-0` to the flex-1 wrapper so it can shrink below its content height, allowing the inner ScrollArea to actually scroll: `"flex-1 min-h-0"`.

**File 2: `src/components/messaging/ChatWindow.tsx`**
- Replace the `ScrollArea` component with a plain `div` using `overflow-y: auto` and a ref for direct scroll control. This eliminates the Radix Viewport indirection that breaks `scrollIntoView`.
- Change `bottomRef` scroll logic to use the container ref directly: `scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight`.
- Remove the `ScrollArea` import.

### Technical Summary

```
Messages.tsx (line 84-89):
  Before: "flex-1 flex flex-col", "md:block"
  After:  "flex-1 flex flex-col", "md:flex"

Messages.tsx (line 99):
  Before: "flex-1"
  After:  "flex-1 min-h-0"

ChatWindow.tsx (line 112):
  Before: <ScrollArea className="flex-1 p-4">
  After:  <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4">

ChatWindow.tsx scroll effect:
  Before: bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  After:  scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
```

These two changes fix the height chain so the message area has a bounded height and scrolls properly, and ensure auto-scroll to the latest message works reliably.

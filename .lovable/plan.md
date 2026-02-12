

## Speed Up Messaging/Comments + Full Shop Cart and Checkout

This plan addresses three issues: slow data loading for messaging and community posts, missing cart/checkout functionality in the shop, and lack of product detail/stock information.

---

### Part 1: Speed Up Messaging and Community Data Loading

**Problem:** Hooks like `useCommunityPosts`, `useCommunityComments`, and `useConversations` make 5-7 sequential database queries one after another. Each query waits for the previous one to finish, causing compounding latency.

**Fix:** Run independent queries in parallel using `Promise.all` instead of sequential `await` calls.

**Files to update:**

- **`src/hooks/useCommunityPosts.ts`** — After fetching posts, batch the profile, role, likes, comments, and user-likes queries into a single `Promise.all` call. Currently 6 sequential queries become 1 post query + 1 parallel batch of 5 queries.

- **`src/hooks/useCommunityComments.ts`** — After fetching comments, batch the profiles, roles, likes-count, and user-likes queries into `Promise.all`. Currently 5 sequential queries become 1 comment query + 1 parallel batch of 4.

- **`src/hooks/useConversations.ts`** — After fetching conversations, batch the profiles and messages queries into `Promise.all`. Currently 3 sequential queries become 1 conversations query + 1 parallel batch of 2.

- **`src/hooks/useDirectMessages.ts`** — Add optimistic message insertion: immediately append the new message to local state before the database confirms, then reconcile when realtime delivers the server version. This makes sending feel instant.

---

### Part 2: Add Product Descriptions, Stock Info, and Cart System

**Problem:** Products have no description or stock count. The "Add to Cart" button does nothing -- there is no cart state, no cart UI, and no way to complete a purchase.

**Changes:**

- **`src/components/cards/ProductCard.tsx`** — Extend the `Product` interface to include `description: string`, `stock: number`, and `color?: string`. Show stock count on the card (e.g., "Only 3 left" when stock is low, or "In Stock" when plentiful).

- **`src/pages/Shop.tsx`** — Update the hardcoded products array with descriptions, stock numbers, and optional color info. Expand the product detail modal to show description text, stock availability, and color. Wire the "Add to Cart" button to the new cart context. Add a floating cart icon/badge that shows the number of items and opens a cart drawer.

- **New file: `src/contexts/CartContext.tsx`** — Create a React context for cart state with:
  - `addToCart(product, size, quantity)` 
  - `removeFromCart(itemId)`
  - `updateQuantity(itemId, quantity)` 
  - `clearCart()`
  - `cartItems` array and `cartTotal` computed value
  - Persist cart to localStorage so it survives page refreshes

- **New file: `src/components/shop/CartDrawer.tsx`** — A slide-out drawer (using the existing Vaul drawer component) showing cart items with quantity controls, item removal, subtotal, and a "Proceed to Checkout" button that navigates to `/checkout` with cart data.

- **New file: `src/components/shop/CartIcon.tsx`** — A floating cart button with item count badge, positioned in the bottom-right corner on the shop page.

- **`src/pages/Checkout.tsx`** — Add a "Merch Order" section alongside the existing subscription checkout. When cart items are present in the URL state or cart context, show the merch order summary (items, sizes, quantities, total) with the existing test payment form. After successful payment, clear the cart.

- **`src/App.tsx`** — Wrap the app (or just the shop/checkout routes) with `CartProvider`.

---

### Part 3: Enhanced Product Detail Modal

The existing modal only shows image, category tag, price, and size selector. It will be expanded to include:

- Product description paragraph (2-3 sentences about the item)
- Stock indicator: "In Stock (X left)" with color coding (green for plenty, amber for low, red for last few)
- Color swatch if applicable
- The disclosure note already added to checkout will also appear here as a small line

---

### Technical Details

**Query parallelization pattern (applied to all three hooks):**
```text
// Before (sequential):
const profiles = await fetchProfiles();
const roles = await fetchRoles();
const likes = await fetchLikes();

// After (parallel):
const [profiles, roles, likes] = await Promise.all([
  fetchProfiles(),
  fetchRoles(),
  fetchLikes(),
]);
```

**Optimistic messaging pattern:**
```text
// Immediately show message in UI
setMessages(prev => [...prev, optimisticMessage]);
// Then insert to database
await supabase.from("direct_messages").insert(...)
// Realtime subscription handles reconciliation
```

**Cart state shape:**
```text
CartItem {
  productId: string
  name: string
  price: number
  size: string
  quantity: number
  image: string
}
```

**New files:** 3 (CartContext, CartDrawer, CartIcon)
**Modified files:** 6 (useCommunityPosts, useCommunityComments, useConversations, useDirectMessages, ProductCard, Shop, Checkout, App.tsx)


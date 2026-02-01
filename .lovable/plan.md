

# Hoodtorial University Shop

## Overview
Create a merch shop page that matches the ultra-dark, urban, brutalist aesthetic of the rest of the site. The shop will feature university apparel including varsity jackets and t-shirts with the designs you provided.

---

## What Will Be Created

### 1. Shop Page (`/shop`)
A full-featured merchandise page with:
- Hero section with urban vibe ("GEAR UP" / "REP THE CULTURE")
- Product grid displaying all merch items
- Category filter tabs (All, Jackets, Tees, Accessories)
- Product cards with hover effects matching site style

### 2. Product Card Component
Each product will display:
- Product image
- Title and category
- Price with the brutalist styling
- "SOLD OUT" or "COMING SOON" badges where applicable
- Hover effects with gold border glow

### 3. Product Detail Modal (Optional Quick View)
When clicking a product:
- Larger image view
- Size selector (S, M, L, XL, 2XL)
- Add to cart button (linking to external store or showing "Coming Soon")

---

## Products to Display

Using your uploaded images as the product photos:

| Product | Image | Price | Status |
|---------|-------|-------|--------|
| Varsity Jacket (Crown Logo) | Gold/black jacket with Hoodtorials crown | $249 | Available |
| Varsity Jacket (Class of 2025) | Graduation cap design jacket | $249 | Available |
| Bali 25 Tee | "25 BALI" graphic | $45 | Available |
| Classic HT Tee | Film strip logo | $40 | Available |
| Class of 2025 Tee | Palm tree house graphic | $45 | Available |

---

## Page Structure

```text
Shop Page
|
+-- Hero Section
|     - "GEAR UP" headline
|     - "Rep the culture. Show the world you're film school different."
|
+-- Filter Tabs
|     - All / Jackets / Tees
|
+-- Product Grid
|     - 2 columns on mobile
|     - 3-4 columns on desktop
|     - ProductCard components
|
+-- Coming Soon Banner (optional)
      - "More drops loading..."
```

---

## Design Details

### Product Card Styling
- Black/charcoal background (card-urban style)
- Border-2 border, hover to gold
- Image with subtle scale on hover
- Gold price text (matches brand)
- Category tag in top corner (tag-sticker style)

### Responsive Layout
- Mobile: 1-2 columns
- Tablet: 2-3 columns  
- Desktop: 3-4 columns

---

## Technical Implementation

### New Files
1. `src/pages/Shop.tsx` - Main shop page
2. `src/components/cards/ProductCard.tsx` - Reusable product card
3. Copy product images to `src/assets/shop/` folder

### Route Addition
Add to `src/App.tsx`:
```text
<Route path="/shop" element={<Shop />} />
```

### Product Card Props
- `id`: unique identifier
- `name`: product name
- `category`: "Jacket" | "Tee" | "Accessory"
- `price`: number
- `image`: imported image path
- `status`: "available" | "sold-out" | "coming-soon"
- `sizes`: array of available sizes

---

## Images Usage

Your uploaded product images will be:
1. Copied to `src/assets/shop/` directory
2. Imported as ES6 modules in the Shop page
3. Displayed as the actual product photos

The jacket photos and design graphics will serve as:
- Varsity Jacket 1: Crown logo jacket (IMG A3BE33D5)
- Varsity Jacket 2: Class of 2025 jacket (IMG_2900)
- Tee designs: The logo graphics will be shown as t-shirt mockups

---

## Future Enhancements (Not in This Build)
- Shopping cart functionality
- Checkout integration (would require Shopify)
- Size guide modal
- Product zoom gallery

---

## Files Summary

| File | Purpose |
|------|---------|
| `src/pages/Shop.tsx` | Main shop page with hero, filters, product grid |
| `src/components/cards/ProductCard.tsx` | Reusable product display card |
| `src/components/cards/index.ts` | Add ProductCard export |
| `src/App.tsx` | Add /shop route |
| `src/assets/shop/*` | Product images |


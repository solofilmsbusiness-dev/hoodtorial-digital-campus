

# Add Page Background Videos to Student-Facing Sections

## Overview

Extend the existing admin background video system to cover the main student-facing pages. This reuses the exact same pattern already built for admin pages -- a `PageBackground` wrapper component that reads video URLs and overlay opacity from `site_settings`, plus admin UI to configure each page.

## Pages to Support

| Key | Label | Route |
|-----|-------|-------|
| `home` | Home | `/` |
| `academics` | Courses | `/academics` |
| `community` | Community | `/community` |
| `student_center` | Student Center | `/student-center` |
| `degrees` | Degrees | `/degrees` |
| `faculty` | Faculty | `/faculty` |
| `shop` | Shop | `/shop` |
| `friends` | Friends | `/friends` |
| `messages` | Messages | `/messages` |

## Changes

### 1. Create `src/components/layout/PageBackground.tsx`

A generic version of `AdminBackground` that reads settings using the prefix `page_bg_` instead of `admin_bg_`. Same video + overlay approach, same mobile-disable logic (skip video on small screens to avoid crashes, matching the login page pattern).

### 2. Update `src/components/layout/PageLayout.tsx`

Add an optional `pageKey` prop. When provided, wrap the content in `PageBackground`. Pages that don't pass a key behave exactly as before.

```
Before: <PageLayout>...</PageLayout>
After:  <PageLayout pageKey="academics">...</PageLayout>
```

### 3. Update each page to pass `pageKey`

Each of the 9 pages listed above gets a one-line change adding the `pageKey` prop to their `<PageLayout>` call.

### 4. Create `src/components/admin/PageBackgroundSettings.tsx`

A new settings card (nearly identical to `AdminBackgroundSettings`) but configured with the student-facing pages list and using the `page_bg_` prefix. Includes the same video upload, remove, overlay slider, and preview link for each page.

### 5. Add settings card to Admin Settings page

Import and render `PageBackgroundSettings` in the admin settings page alongside the existing `AdminBackgroundSettings` card.

### 6. Update `src/hooks/useSiteSettings.ts`

Add the new `page_bg_*` keys to the `SiteSettings` type and initial state so they're fetched and available.

## Technical Details

- Settings keys follow the pattern: `page_bg_{key}_video` and `page_bg_{key}_overlay`
- Videos are uploaded to the existing `site-assets` bucket via `uploadAsset`
- No database migration needed -- `site_settings` is a key-value store that accepts any ID
- Mobile devices skip video rendering (matches existing login page pattern to prevent crashes)
- The `PageBackground` component is identical in behavior to `AdminBackground`


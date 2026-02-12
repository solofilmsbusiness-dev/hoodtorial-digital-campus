

## Fix Profile Editor Tour

### Problem
The 5-step tour targets elements spread across multiple tabs:
- Steps 1-2: Inside "Appearance" tab (cover/avatar, theme picker)
- Step 3: Inside "About You" tab (bio section) -- **hidden when not active**
- Steps 4-5: Tab triggers (always visible)

When the tour reaches step 3, the target element doesn't exist in the visible DOM because the "About You" tab isn't active. The overlay fails to find it and shows a floating tooltip with no spotlight.

### Solution
Make the tour **switch tabs automatically** as it progresses. This requires:
1. The `StudentProfile` page controls the active tab via state instead of uncontrolled `defaultValue`
2. The walkthrough hook exposes which tab each step belongs to
3. On step change, the page sets the active tab accordingly

### Changes

**Modified: `src/hooks/useProfileWalkthrough.ts`**
- Add a `tab` property to each tour step indicating which tab it belongs to:
  - Steps 1-2: `"appearance"`
  - Step 3: `"about"`
  - Steps 4-5: no tab switch needed (tab triggers are always visible)
- Export the `tab` field so the parent can react to step changes

**Modified: `src/pages/StudentProfile.tsx`**
- Change `Tabs` from `defaultValue="appearance"` to controlled with `value={activeTab}` + `onValueChange`
- Add a `useEffect` that watches `profileWalkthrough.currentStep` and switches `activeTab` to the step's associated tab when the tour is active
- This ensures the target element is rendered before the overlay tries to measure it

### Updated Tour Steps

| Step | Target | Tab to activate |
|------|--------|-----------------|
| 1. Your Look | `profile-cover-avatar` | `appearance` |
| 2. Pick Your Vibe | `profile-theme-picker` | `appearance` |
| 3. Tell Your Story | `profile-bio-section` | `about` |
| 4. Showcase Your Work | `profile-portfolio-tab` | (none -- always visible) |
| 5. Arrange Your Page | `profile-layout-tab` | (none -- always visible) |

### Technical Details

In `useProfileWalkthrough.ts`, each step gets a `tab` field:
```
{ id: "cover-avatar", target: "profile-cover-avatar", tab: "appearance", ... }
{ id: "theme-picker", target: "profile-theme-picker", tab: "appearance", ... }
{ id: "bio-section", target: "profile-bio-section", tab: "about", ... }
{ id: "portfolio-tab", target: "profile-portfolio-tab", tab: null, ... }
{ id: "layout-tab", target: "profile-layout-tab", tab: null, ... }
```

In `StudentProfile.tsx`:
- Replace `defaultValue="appearance"` with `value={activeTab}` state
- Add effect: when tour is active and step has a `tab`, set `activeTab` to that tab
- Small delay before measuring ensures the tab content renders first

### Files Summary

| File | Action |
|------|--------|
| `src/hooks/useProfileWalkthrough.ts` | Add `tab` field to each step |
| `src/pages/StudentProfile.tsx` | Controlled tabs + auto-switch on tour step change |


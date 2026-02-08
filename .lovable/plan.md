

# Fix Login Music Volume Control and Add Disable Toggle

## Problems

1. **Volume slider doesn't work on the actual login page** -- The admin panel's volume slider only adjusts the preview player locally. The chosen volume is never saved to the database, and the Auth page always uses a hardcoded volume of `0.3`.

2. **No way to disable music without deleting it** -- Currently the only way to stop music on the login page is to remove the uploaded file entirely. There should be a toggle to enable/disable the music while keeping the file.

## Changes

### 1. Save volume to site_settings (`src/components/admin/SiteCustomization.tsx`)

- When the admin changes the volume slider, persist the value to the `site_settings` table as `login_music_volume` (a string like `"0.45"`).
- Debounce the save so it doesn't fire on every tiny drag movement.
- Load the saved volume on component mount.

### 2. Add a music enable/disable toggle (`src/components/admin/SiteCustomization.tsx`)

- Add a Switch toggle labeled "Enable login music" below the music player section.
- Save the state to `site_settings` as `login_music_enabled` (`"true"` / `"false"`).
- When disabled, the login page won't play music even if a file is uploaded.

### 3. Read volume and enabled state on login page (`src/pages/Auth.tsx`)

- Fetch `login_music_volume` and `login_music_enabled` alongside the other site settings.
- Replace the hardcoded `audio.volume = 0.3` with the saved volume value.
- Only attempt to play music when `login_music_enabled` is `"true"` (or not set, defaulting to enabled for backward compatibility).

### 4. Update site settings hook (`src/hooks/useSiteSettings.ts`)

- Add `login_music_volume` and `login_music_enabled` to the `SiteSettings` type and fetch list.

## Technical Details

### Files to modify

| File | Change |
|------|--------|
| `src/hooks/useSiteSettings.ts` | Add `login_music_volume` and `login_music_enabled` fields |
| `src/components/admin/SiteCustomization.tsx` | Persist volume on slider change (debounced); add Switch toggle for enable/disable |
| `src/pages/Auth.tsx` | Fetch saved volume and enabled state; use them for playback |

### Volume handling

- Admin slider range: 0-100 (integer)
- Stored in DB as string (e.g., `"45"`)
- Auth page converts to 0-1 float for `audio.volume` (divide by 100)
- Default if not set: 30 (matching current hardcoded 0.3)

### Enable/disable toggle

- Stored as `"true"` / `"false"` string in site_settings
- Default if not set: `"true"` (backward compatible -- music plays if file exists)
- When disabled, Auth page skips all audio playback logic


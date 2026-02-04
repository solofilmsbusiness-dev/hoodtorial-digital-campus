
# Add Login Music Upload Feature

## Overview

Add an option in Admin Settings > Site Customization to upload background music that plays on the login page. The music will loop while users are on the authentication screen, creating an immersive experience alongside the background video.

## Architecture

```text
Admin Flow:
┌─────────────────────────────────────┐
│   Site Customization Panel          │
│   ┌───────────────────────────────┐ │
│   │ Login Background Video        │ │
│   │ [Upload] [Remove] [Preview]   │ │
│   ├───────────────────────────────┤ │
│   │ Login Logo                    │ │
│   │ [Upload] [Remove]             │ │
│   ├───────────────────────────────┤ │
│   │ Login Background Music  (NEW) │ │
│   │ ♪ filename.mp3               │ │
│   │ [▶ Play] [Upload] [Remove]    │ │
│   │ 🔊 Volume: ────●──── 50%     │ │
│   └───────────────────────────────┘ │
└─────────────────────────────────────┘

Auth Page Flow:
┌─────────────────┐
│   Auth.tsx      │
│   ┌───────────┐ │
│   │ useEffect │───► Fetch login_music_url from site_settings
│   └───────────┘ │
│        │        │
│        ▼        │
│   <audio>       │───► Loop, autoplay (muted initially)
│   element       │
│        │        │
│        ▼        │
│   User clicks   │───► Unmute and play (browser policy)
│   anywhere      │
└─────────────────┘
```

## Changes Required

### 1. Database: Add Music Setting Key

The existing `site_settings` table will store the music URL with key `login_music_url`. No schema changes needed since the table uses dynamic key-value pairs.

### 2. Hook: Update useSiteSettings.ts

Add `login_music_url` to the SiteSettings interface and initial state:

```typescript
interface SiteSettings {
  login_video_url: string | null;
  login_logo_url: string | null;
  login_music_url: string | null;  // NEW
  [key: string]: string | null;
}
```

Update `uploadAsset` to support 'music' as an asset type.

### 3. Component: Update SiteCustomization.tsx

Add a new section for music upload with:
- Audio preview player with play/pause controls
- Volume slider
- Upload button (accepts MP3, WAV, OGG, max 50MB)
- Remove button
- File info display showing filename

### 4. Auth Page: Add Background Audio

Update Auth.tsx to:
- Fetch `login_music_url` from site_settings
- Add a hidden `<audio>` element that loops
- Handle browser autoplay policy by starting muted
- Add a small music toggle button in corner to enable/disable

## Technical Details

### File Validation (SiteCustomization)

| Property | Value |
|----------|-------|
| Accepted formats | MP3, WAV, OGG |
| Max file size | 50MB |
| MIME types | `audio/mpeg`, `audio/wav`, `audio/ogg` |

### Audio Element Configuration (Auth.tsx)

| Property | Value |
|----------|-------|
| Autoplay | Yes (muted) |
| Loop | Yes |
| Initial volume | 0.3 (30%) |
| Storage key | `hoodtorial-login-music-enabled` |

### Browser Autoplay Policy Handling

Modern browsers block autoplay with sound. The implementation will:
1. Start audio muted with `autoplay` and `loop`
2. Show a subtle music icon/toggle in the corner
3. On first user interaction (click anywhere), check user preference
4. If music was enabled before, unmute and play

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useSiteSettings.ts` | Add `login_music_url` to interface, add 'music' asset type |
| `src/components/admin/SiteCustomization.tsx` | Add music upload section with player preview |
| `src/pages/Auth.tsx` | Add audio element, fetch music URL, add toggle button |

## Expected Outcome

1. Admins can upload background music from Site Customization panel
2. Music plays in a loop on the login page
3. Users see a small mute/unmute toggle for the music
4. Music preference is remembered in localStorage
5. Respects browser autoplay policies gracefully

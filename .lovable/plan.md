

# Fix Music Upload - Add Audio MIME Types to Storage Bucket

## Problem Identified

The music upload failed with error:
```
"mime type audio/mpeg is not supported"
```

The `site-assets` storage bucket only allows these MIME types:
- `video/mp4`
- `video/webm`
- `image/jpeg`
- `image/png`
- `image/webp`

Audio files (MP3, WAV, OGG) are blocked because their MIME types are not in the allowed list.

## Solution

Update the storage bucket configuration to include audio MIME types:
- `audio/mpeg` (MP3)
- `audio/wav` (WAV)
- `audio/ogg` (OGG)

## Changes Required

### Database Migration

Update the `site-assets` bucket to allow audio file uploads:

```sql
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'video/mp4', 
  'video/webm', 
  'image/jpeg', 
  'image/png', 
  'image/webp',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg'
]
WHERE id = 'site-assets';
```

## Technical Details

| Setting | Current | New |
|---------|---------|-----|
| allowed_mime_types | video/mp4, video/webm, image/jpeg, image/png, image/webp | + audio/mpeg, audio/wav, audio/ogg |
| file_size_limit | 200MB | 200MB (unchanged) |

## Expected Outcome

1. Audio files can be uploaded to the `site-assets` bucket
2. MP3, WAV, and OGG files will be accepted
3. Music upload in Site Customization will work as intended


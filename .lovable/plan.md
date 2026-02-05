

# Fix: Profile Photo Distortion + Add Cropping Adjustment

## Problem Summary

Profile photos appear distorted because:
1. Users upload images with various aspect ratios (landscape, portrait)
2. The circular avatar frame tries to fit these non-square images using `object-cover`
3. There's no way to adjust which part of the image is shown
4. Important parts of faces may be cut off or images may appear stretched

## Solution

Add an image cropper dialog that appears when a user selects a photo, allowing them to:
- Pan the image to center their face
- Zoom in/out to frame the photo perfectly
- Preview the final circular crop before uploading
- Save a properly-cropped square image

---

## Technical Implementation

### 1. Install react-easy-crop

Add the package which provides:
- Circular crop area support
- Touch and mouse-friendly pan/zoom
- Pixel-perfect crop output

### 2. Create Cropper Dialog Component

**New file: `src/components/profile/ImageCropperDialog.tsx`**

A dialog that:
- Opens after file selection
- Shows the image with circular crop overlay
- Has zoom slider control
- "Cancel" and "Save" buttons
- Outputs a cropped canvas/blob

```text
┌─────────────────────────────────────────┐
│           Adjust Your Photo             │
├─────────────────────────────────────────┤
│                                         │
│     ┌───────────────────────────┐       │
│     │                           │       │
│     │      ○ Circular crop      │       │
│     │        preview area       │       │
│     │                           │       │
│     └───────────────────────────┘       │
│                                         │
│        ─────●─────────────── Zoom       │
│                                         │
├─────────────────────────────────────────┤
│             [Cancel]  [Save]            │
└─────────────────────────────────────────┘
```

### 3. Create Crop Utility Function

**New file: `src/lib/cropImage.ts`**

Utility to:
- Take the cropped area coordinates from react-easy-crop
- Draw the cropped portion onto a canvas
- Export as a Blob for upload

### 4. Update AvatarEditor Component

Modify `src/components/profile/AvatarEditor.tsx` to:
1. On file select, open the cropper dialog (don't upload immediately)
2. Pass the selected file to the cropper
3. On crop complete, receive the cropped blob
4. Upload the cropped blob instead of original file

```text
User Flow (Before):
Select file → Upload immediately → May be distorted

User Flow (After):
Select file → Cropper dialog opens → User adjusts → Save → Upload cropped image
```

### 5. Update index.ts Barrel Export

Add the new `ImageCropperDialog` component to the profile components export.

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Install `react-easy-crop` | Cropping library |
| `src/components/profile/ImageCropperDialog.tsx` | Create | Cropper dialog UI |
| `src/lib/cropImage.ts` | Create | Canvas crop utility |
| `src/components/profile/AvatarEditor.tsx` | Modify | Integrate cropper flow |
| `src/components/profile/index.ts` | Modify | Export new component |

---

## User Experience Improvements

| Before | After |
|--------|-------|
| Photo may be cut off or distorted | User controls exactly what's shown |
| No preview of final result | Live circular preview while adjusting |
| Must re-upload to try different framing | Adjust before committing |
| Non-square images look wrong | All avatars are perfectly square after crop |

---

## Technical Notes

- Cropped images are resized to 400x400 pixels for optimal file size and display quality
- The crop output is JPEG format at 90% quality for good compression
- Zoom range: 1x to 3x for flexibility
- The cropper respects the existing accent color and border style preferences



# Simplify PDF Viewer - Click to Open

## Problem

Chrome blocks embedded PDFs in iframes with the message "This page has been blocked by Chrome". This is a common security restriction that affects many PDF sources.

## Solution

Remove the iframe embed and replace it with a clean, clickable card that opens the PDF in a new tab when clicked. This is more reliable across all browsers and provides a better user experience.

## Changes

**File:** `src/components/course/DocumentViewer.tsx`

### Current Behavior
- Shows header with Open/Download buttons
- Tries to embed PDF in an iframe (blocked by Chrome)

### New Behavior
- Shows a larger, clickable document card
- Clicking anywhere on the card opens the PDF in a new tab
- Keep the download button for convenience
- Remove the problematic iframe entirely

## Visual Design

```
+------------------------------------------------------------------+
|  [PDF Icon]                                                       |
|                                                                   |
|  Document Title                                                   |
|  PDF Document - Click to open                                     |
|                                                                   |
|  [Download]                                                       |
+------------------------------------------------------------------+
```

The entire card will be clickable to open the PDF.

## Technical Changes

1. Remove the `showEmbed` variable and the iframe section
2. Create a unified card design for all documents (PDF and non-PDF)
3. Make the main area clickable with a clear call-to-action
4. Keep the download button as a secondary action

This is a simple, reliable solution that works across all browsers without any security restrictions.



# Fix Document Viewer Adobe Redirect Issue

## Problem

When clicking "Open" on a document, the browser is redirecting to an Adobe page. This happens because:
1. The PDF URL opens in a new tab via `window.open()`
2. Adobe Acrobat browser extensions intercept PDF files and redirect them to Adobe's online viewer

## Solution

Instead of opening the raw PDF URL directly, we'll embed the PDF in a modal/dialog within the app using an embedded viewer approach. This keeps the document viewing experience within your application and prevents Adobe or other browser extensions from intercepting.

## Implementation Approach

**Replace click-to-open with an in-app viewer modal:**

1. Add a Dialog/Sheet component that opens when clicking the document card
2. Inside the dialog, use Google Docs Viewer or PDF.js to render the PDF
3. Google Docs Viewer URL format: `https://docs.google.com/gview?url=ENCODED_URL&embedded=true`
4. This displays the PDF in an iframe within your app, bypassing browser extension interception

## Changes

**File:** `src/components/course/DocumentViewer.tsx`

| Current Behavior | New Behavior |
|------------------|--------------|
| Click opens raw PDF URL in new tab | Click opens in-app modal with embedded viewer |
| Adobe extensions can intercept | PDF renders via Google Docs viewer (no interception) |
| Download button only | Keep download button + add "Open in new tab" option |

**New UI Flow:**
```
+--------------------------------------------------+
|  [PDF Icon]                                       |
|                                                   |
|  Document Title                                   |
|  PDF Document - Click to view                     |
|                                                   |
|  [View Document]   [Download]                     |
+--------------------------------------------------+
         |
         v (click View Document)
+--------------------------------------------------+
|  [X]                              Document Title  |
|  +--------------------------------------------+   |
|  |                                            |   |
|  |    [PDF rendered via Google Docs Viewer]   |   |
|  |                                            |   |
|  +--------------------------------------------+   |
|                                                   |
|  [Download]              [Open in New Tab]        |
+--------------------------------------------------+
```

## Technical Details

```tsx
// Use Google Docs Viewer to embed the PDF
const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(documentUrl)}&embedded=true`;

// Render in a Sheet/Dialog
<Sheet>
  <SheetContent className="w-full max-w-4xl">
    <iframe 
      src={viewerUrl}
      className="w-full h-[80vh]"
      title={title}
    />
  </SheetContent>
</Sheet>
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/course/DocumentViewer.tsx` | Add Sheet component with embedded Google Docs viewer iframe |

## Benefits

- Documents view inside your app (better UX)
- No Adobe extension interception
- Still provides download and "open in new tab" options
- Works for any publicly accessible PDF


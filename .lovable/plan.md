

# Add Document Upload for Reading Lessons

## Overview

When creating or editing a "reading" type lesson, admins should be able to upload a PDF or document file that students can read. Currently, reading lessons only support text content via a textarea. This enhancement adds document upload capability.

## Current State

- **LessonDialog.tsx**: For "reading" type lessons, shows only a textarea for markdown content
- **lessons table**: Has `content` (text) and `video_url` fields, but no dedicated document URL field
- **Storage**: Buckets exist for `community-uploads` and `avatars`, but not for lesson documents
- **VideoPlayer.tsx**: Currently only handles video lessons; reading lessons show a placeholder

## Implementation Plan

### 1. Database: Add `document_url` Column to Lessons Table

Add a new column to store the uploaded document URL:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| document_url | text | null | URL to uploaded PDF/document |

This keeps the existing `content` field for text/markdown, while `document_url` stores the file.

### 2. Storage: Create `lesson-documents` Bucket

Create a new storage bucket for lesson documents:
- **Bucket name**: `lesson-documents`
- **Public**: Yes (students need to view/download)
- **Allowed MIME types**: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
- **File size limit**: 20MB

RLS policies will allow:
- Authenticated admins to upload/delete
- Anyone to view (public bucket)

### 3. New Hook: `useLessonDocumentUpload`

Create a hook similar to `useCommunityUploads` for lesson document uploads:
- Upload document to `lesson-documents` bucket
- Return public URL
- Handle progress and errors
- Delete document capability

### 4. Update LessonDialog Component

Modify the dialog for "reading" type lessons to include:
- **Document upload section** with drag-and-drop
- **Preview of uploaded document** (show filename + PDF icon)
- **Option to remove uploaded document**
- Keep the existing markdown textarea for supplementary text content
- Show document preview/download link when document exists

Visual layout for reading lessons:
```
+----------------------------------+
|  Upload Document (PDF, DOCX)     |
|  [ Drag & drop or click ]        |
+----------------------------------+
|  [PDF icon] document.pdf  [X]    |  <- When uploaded
+----------------------------------+
|  Additional Content (optional)   |
|  [Markdown textarea]             |
+----------------------------------+
```

### 5. Update DbLesson Interface

Add `document_url` field to the TypeScript interface in `useAdminCourseContent.ts`:
```typescript
export interface DbLesson {
  // ... existing fields
  document_url: string | null;
}
```

### 6. Update Lesson Save/Update Logic

Modify the `onSave` handler in LessonDialog to include `document_url`:
```typescript
onSave({
  title,
  type,
  duration,
  document_url: documentUrl,  // NEW
  content,
  description,
});
```

### 7. Student View: Display Document Reader

Update `VideoPlayer.tsx` or create a new `DocumentViewer.tsx` component to:
- Render PDF in an iframe or embedded viewer
- Provide download link for non-PDF documents
- Show the markdown content below the document if provided

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/` | Create | Add `document_url` column + create storage bucket |
| `src/hooks/useLessonDocumentUpload.ts` | Create | Upload hook for lesson documents |
| `src/components/admin/LessonDialog.tsx` | Modify | Add document upload UI for reading lessons |
| `src/hooks/useAdminCourseContent.ts` | Modify | Add `document_url` to DbLesson interface and mutations |
| `src/components/course/DocumentViewer.tsx` | Create | Component to display documents for students |
| `src/components/course/VideoPlayer.tsx` | Modify | Handle reading lessons with document_url |

## User Experience

**Admin Flow**:
1. Go to Course Editor > Add Lesson
2. Select "Reading" as type
3. Click "Upload Document" or drag-and-drop a PDF
4. See upload progress and preview
5. Optionally add supplementary markdown text
6. Save lesson

**Student Flow**:
1. Navigate to reading lesson
2. See embedded PDF viewer or download link
3. Read the document
4. Any supplementary markdown content appears below
5. Mark lesson complete when done

## Technical Details

### Storage Bucket SQL

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-documents',
  'lesson-documents',
  true,
  20971520,  -- 20MB
  ARRAY['application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);
```

### RLS Policy for Uploads (Admin Only)

```sql
CREATE POLICY "Admins can upload lesson documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lesson-documents' AND
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND membership_tier = 'admin')
);
```

### Document Upload Hook Structure

```typescript
export function useLessonDocumentUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadDocument = async (file: File): Promise<string | null> => {
    // Upload to lesson-documents bucket
    // Return public URL
  };

  const deleteDocument = async (url: string): Promise<boolean> => {
    // Remove from storage
  };

  return { uploadDocument, deleteDocument, isUploading, uploadProgress };
}
```

## Summary

This feature adds document upload capability for reading lessons:
1. New `document_url` database column
2. New `lesson-documents` storage bucket
3. Upload UI in admin LessonDialog
4. Document viewer for students
5. Maintains backward compatibility with existing text-based reading lessons


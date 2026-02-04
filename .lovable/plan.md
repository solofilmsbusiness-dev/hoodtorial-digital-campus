
# PDF-Based AI Quiz Question Generation

## Overview

Add an AI-powered feature that allows admins to upload a PDF document and automatically generate quiz questions, titles, and answers based on the content. This creates a streamlined workflow for rapidly creating test and extra credit material.

---

## User Experience Flow

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│  QUESTION MANAGER DIALOG                                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │ + Add Question  │  │ ✨ Generate AI  │  │ 📄 From PDF     │                 │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                 │
│                                                                                 │
│  [Question list here...]                                                        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Step 1: Upload PDF**
- Admin clicks "From PDF" button in Question Manager
- Drag-and-drop or file picker for PDF upload (max 20MB)
- PDF is parsed and text extracted

**Step 2: Configure Generation**
- Number of questions (5, 10, 15, 20)
- Difficulty level (Beginner, Intermediate, Advanced)
- Question type: "Test Questions" or "Extra Credit"
- Optional: Focus areas or keywords

**Step 3: AI Processing**
- Edge function receives PDF text content
- Lovable AI analyzes the material
- Generates questions with answers and explanations

**Step 4: Review & Save**
- Preview all generated questions
- Edit, remove, or approve each question
- Bulk save to quiz

---

## Technical Architecture

### New Components

**1. `src/components/admin/PDFQuestionGeneratorDialog.tsx`**

A new dialog component that handles:
- PDF file upload with drag-and-drop
- Text extraction from PDF (client-side using pdf.js or via edge function)
- Configuration options (num questions, difficulty, type)
- Loading/processing states
- Preview and approval of generated questions

**2. Update `supabase/functions/generate-questions/index.ts`**

Modify the existing edge function to accept:
- `pdfContent`: Extracted text from PDF (instead of just topic)
- `questionType`: "test" | "extra_credit" (adjusts prompt tone)
- Keep existing `topic`, `numQuestions`, `difficulty`, `context` parameters

### PDF Text Extraction Options

**Option A (Recommended): Server-side with Edge Function**

Create a new edge function `parse-pdf` that:
1. Receives PDF as base64 or FormData
2. Uses a PDF parsing library (pdf-parse for Deno) to extract text
3. Returns the extracted text content

This keeps the frontend simple and handles complex PDFs better.

**Option B: Client-side with pdf.js**

Use Mozilla's pdf.js library:
- Add `pdfjs-dist` dependency
- Extract text in the browser before sending to AI
- Lighter server load but larger client bundle

---

## Implementation Plan

### Phase 1: Create PDF Parsing Edge Function

**File: `supabase/functions/parse-pdf/index.ts`**

```typescript
// Receives PDF file, extracts and returns text content
// Uses pdf-parse or similar library for Deno
// Returns: { text: string, pageCount: number }
```

**Update: `supabase/config.toml`**
```toml
[functions.parse-pdf]
verify_jwt = false
```

### Phase 2: Update Question Generation Edge Function

**File: `supabase/functions/generate-questions/index.ts`**

Add support for:
- `pdfContent` parameter (extracted PDF text)
- `questionType` parameter for test vs extra credit
- Enhanced system prompt that:
  - Analyzes document content thoroughly
  - Extracts key concepts and facts
  - Creates questions that test understanding of the material
  - For extra credit: creates harder, more nuanced questions

### Phase 3: Create PDF Generator Dialog Component

**File: `src/components/admin/PDFQuestionGeneratorDialog.tsx`**

Features:
- Drag-and-drop file upload zone
- File size validation (max 20MB)
- Progress indicator for upload/parsing/generation
- Configuration form (number, difficulty, type)
- Question preview and editing
- Bulk save functionality

Props:
```typescript
interface PDFQuestionGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizTitle: string;
  onGenerated: (questions: GeneratedQuestion[]) => void;
}
```

### Phase 4: Update Question Manager

**File: `src/components/admin/QuestionManager.tsx`**

Add:
- "From PDF" button next to existing "Generate AI" button
- State for PDF dialog open/close
- Integration with `PDFQuestionGeneratorDialog`

---

## UI Design for PDF Dialog

```text
┌─────────────────────────────────────────────────────────────────┐
│  📄 Generate Questions from PDF                             [X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │           📁 Drag & drop your PDF here                   │ │
│  │              or click to browse                          │ │
│  │                                                           │ │
│  │              Supports: PDF (max 20MB)                    │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ──────────────────────────────────────────────────────────────│
│                                                                 │
│  Number of Questions        Difficulty                          │
│  ┌──────────────────┐       ┌──────────────────┐               │
│  │ 10 questions   ▾ │       │ Intermediate   ▾ │               │
│  └──────────────────┘       └──────────────────┘               │
│                                                                 │
│  Question Type                                                  │
│  ┌──────────────────┐                                          │
│  │ Test Questions ▾ │  ← or "Extra Credit Questions"          │
│  └──────────────────┘                                          │
│                                                                 │
│  Focus Keywords (optional)                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ lighting techniques, three-point setup                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                      [Cancel]  [✨ Generate Questions]          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**After generation (preview step):**

```text
┌─────────────────────────────────────────────────────────────────┐
│  📄 Review Generated Questions                              [X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Generated from: "Lighting_Fundamentals.pdf" (12 pages)         │
│  10 intermediate-level test questions                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. What is the primary purpose of a key light?        🗑│   │
│  │    ✓ A. To create the main illumination on the subject │   │
│  │    ✗ B. To fill in shadows                            │   │
│  │    ✗ C. To separate subject from background           │   │
│  │    ✗ D. To add dramatic color                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 2. In three-point lighting, what role does fill...    🗑│   │
│  │    ...                                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│              [← Back]  [Save 10 Questions]                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Enhanced System Prompt for PDF Content

The AI will receive a specialized prompt for PDF-based generation:

```text
You are an expert quiz creator for filmmaking and cinematography education.

You have been provided with educational content extracted from a PDF document.
Your task is to create high-quality {questionType} questions based on this material.

Guidelines:
- Create {numQuestions} questions at {difficulty} difficulty level
- Questions must be directly based on the provided content
- Test understanding and application, not just memorization
- For "test questions": Create fair, comprehensive assessments
- For "extra credit": Create challenging questions that reward deeper understanding
- Each question should have 4 answer options (A, B, C, D)
- Include a brief explanation referencing the source material

Document Content:
{pdfContent}

{focusKeywords ? `Focus especially on: ${focusKeywords}` : ''}
```

---

## Summary of Changes

| File | Changes |
|------|---------|
| `supabase/functions/parse-pdf/index.ts` | **NEW** - Edge function to extract text from uploaded PDFs |
| `supabase/functions/generate-questions/index.ts` | Add `pdfContent`, `questionType` params; enhanced prompt for document-based generation |
| `supabase/config.toml` | Add `[functions.parse-pdf]` configuration |
| `src/components/admin/PDFQuestionGeneratorDialog.tsx` | **NEW** - Dialog for PDF upload and question generation |
| `src/components/admin/QuestionManager.tsx` | Add "From PDF" button and integrate new dialog |
| `src/components/admin/index.ts` | Export new `PDFQuestionGeneratorDialog` |

---

## Dependencies

No new npm dependencies required. PDF parsing will be handled server-side in the edge function.

---

## Admin Workflow Summary

**Creating Test Material:**
1. Open any quiz in Course Editor
2. Click "Questions" → "From PDF"
3. Upload course notes, textbook chapters, or lecture materials
4. Configure: 10 questions, Intermediate, Test Questions
5. Click Generate → Review → Save
6. Done in under a minute!

**Creating Extra Credit:**
1. Same flow, but select "Extra Credit Questions"
2. AI generates harder, more nuanced questions
3. Questions can be added to a separate "Extra Credit Quiz"

This gives admins a powerful tool to rapidly create quality assessments from their existing educational materials.

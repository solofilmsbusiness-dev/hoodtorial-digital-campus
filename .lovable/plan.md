
# Full Admin Course Content Management

## Overview
Enable complete administrative control over all course content including modules, lessons (with video embedding), and quiz questions. Admins will be able to create, edit, delete, and regenerate quiz questions for any course.

---

## Current State Analysis

### What Works Now
- Module creation, editing, deletion, and reordering
- Lesson creation with title, type, duration, and video URL
- Video embedding support (YouTube, Vimeo, direct URLs)

### Current Limitations
1. **Quizzes are static**: All quiz questions are stored in `src/data/quizzes/*.ts` files - not editable through admin panel
2. **No quiz management**: Cannot add/remove/edit questions from admin
3. **No database-backed quizzes**: No `quizzes` or `quiz_questions` tables exist
4. **Module quizzes not linked**: Database modules don't have quiz associations
5. **Lesson content field unused**: The `content` field in lessons exists but isn't editable in the dialog

---

## Implementation Plan

### Phase 1: Database Schema - Quiz Tables

**New Table: `quizzes`**
```sql
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  passing_score INTEGER NOT NULL DEFAULT 80,
  time_limit_minutes INTEGER DEFAULT NULL,
  is_final_exam BOOLEAN DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**New Table: `quiz_questions`**
```sql
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies**: Admin-only CRUD, students can view

---

### Phase 2: Enhanced Lesson Dialog

Expand the existing `LessonDialog` to include:

1. **Rich Content Editor** for reading/practice lessons
2. **Video Preview** when URL is entered
3. **Content field** for text-based lessons

```text
+--------------------------------------------------+
|              EDIT LESSON                          |
+--------------------------------------------------+
| Title: [Introduction to Lighting                ]|
+--------------------------------------------------+
| Type: [Video ▼]     Duration: [12 min          ]|
+--------------------------------------------------+
| Video URL:                                        |
| [https://youtube.com/watch?v=abc123             ]|
|                                                   |
| Preview:                                          |
| +----------------------------------------------+ |
| |  [YouTube Video Thumbnail/Embed]              | |
| +----------------------------------------------+ |
+--------------------------------------------------+
| Description:                                      |
| [Learn the fundamentals of three-point lighting ]|
| [and how to create depth with shadows...       ]|
+--------------------------------------------------+
|                          [Cancel]  [Save Lesson] |
+--------------------------------------------------+
```

---

### Phase 3: Quiz Management in Module Editor

Add quiz section to each module with full CRUD:

```text
+--------------------------------------------------+
| Module 1: Getting Started with iPhone Cinema     |
+--------------------------------------------------+
| LESSONS:                                          |
|   [≡] Video: Why iPhone for Filmmaking? (12 min) |
|   [≡] Video: Essential Camera Settings (18 min)  |
|   [+ Add Lesson]                                  |
|                                                   |
| MODULE QUIZ:                                      |
|   Settings Quiz • 5 questions • 80% to pass      |
|   [Edit Quiz] [Manage Questions]                  |
|                                                   |
|   OR if no quiz:                                  |
|   [+ Add Quiz]                                    |
+--------------------------------------------------+
```

---

### Phase 4: Quiz Editor Dialog

Full quiz configuration:

```text
+--------------------------------------------------+
|              EDIT QUIZ                            |
+--------------------------------------------------+
| Title: [Settings Quiz                           ]|
+--------------------------------------------------+
| Passing Score: [80]%    Time Limit: [5] minutes  |
+--------------------------------------------------+
|                          [Cancel]    [Save Quiz] |
+--------------------------------------------------+
```

---

### Phase 5: Question Manager

Dedicated interface for managing quiz questions:

```text
+--------------------------------------------------+
|    MANAGE QUESTIONS: Settings Quiz               |
+--------------------------------------------------+
| Questions (5)                    [+ Add Question]|
|                                  [Generate AI ▼] |
+--------------------------------------------------+
| 1. What is the recommended frame rate for...     |
|    [A] 30fps  [B] 24fps ✓  [C] 60fps  [D] 120fps|
|    Explanation: 24fps is the standard...         |
|    [Edit] [Delete] [↑] [↓]                       |
+--------------------------------------------------+
| 2. Which iPhone camera setting controls...       |
|    [A] ISO  [B] Shutter  [C] Exposure ✓  [D] WB |
|    [Edit] [Delete] [↑] [↓]                       |
+--------------------------------------------------+
| 3. What does 4K resolution refer to?             |
|    ... (collapsed)                               |
+--------------------------------------------------+
```

---

### Phase 6: Question Editor Dialog

Add/edit individual questions:

```text
+--------------------------------------------------+
|           ADD/EDIT QUESTION                       |
+--------------------------------------------------+
| Question:                                         |
| [What is the recommended frame rate for         ]|
| [cinematic footage on iPhone?                   ]|
+--------------------------------------------------+
| Options:                                          |
|   [A] [30fps                    ] [ ]            |
|   [B] [24fps                    ] [●] Correct    |
|   [C] [60fps                    ] [ ]            |
|   [D] [120fps                   ] [ ]            |
|   [+ Add Option]                                  |
+--------------------------------------------------+
| Explanation (shown after answer):                 |
| [24fps is the standard cinematic frame rate,    ]|
| [giving footage that classic film look.         ]|
+--------------------------------------------------+
|                        [Cancel]  [Save Question] |
+--------------------------------------------------+
```

---

### Phase 7: AI Question Generation

Generate questions using AI based on lesson content:

```text
+--------------------------------------------------+
|         GENERATE QUIZ QUESTIONS                   |
+--------------------------------------------------+
| Topic: [iPhone Cinematography Settings          ]|
+--------------------------------------------------+
| Number of questions: [5]                          |
| Difficulty: [Beginner ▼]                          |
+--------------------------------------------------+
| Context (optional):                               |
| [Focus on frame rates, exposure, and resolution ]|
+--------------------------------------------------+
|                     [Cancel]  [Generate Questions]|
+--------------------------------------------------+
```

After generation, questions appear in a preview where admin can:
- Edit each question before saving
- Remove unwanted questions
- Regenerate individual questions

---

### Phase 8: Final Exam Management

Add course-level final exam in CourseEditor:

```text
+--------------------------------------------------+
| FINAL EXAM                                        |
+--------------------------------------------------+
| ☑ This course has a final exam                   |
|                                                   |
| Final Exam: iPhone Cinematography                |
| 20 questions • 75% to pass • 20 min time limit   |
| [Edit Exam] [Manage Questions]                    |
+--------------------------------------------------+
```

---

## Data Migration Strategy

### Option A: Seed from Static (One-Time)
Create a migration script to import existing questions from static files into the new database tables. This preserves all 1,500+ existing questions.

### Option B: Hybrid Approach
- Keep static files as fallback
- Database questions take priority
- Gradually migrate as admins edit

**Recommended**: Option A with backup - import all static data, keep static files as reference only.

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/xxx.sql` | Create | quizzes and quiz_questions tables |
| `src/hooks/useAdminQuizContent.ts` | Create | Quiz CRUD operations |
| `src/components/admin/QuizDialog.tsx` | Create | Quiz editor dialog |
| `src/components/admin/QuestionDialog.tsx` | Create | Question editor dialog |
| `src/components/admin/QuestionManager.tsx` | Create | Question list management |
| `src/components/admin/QuizSection.tsx` | Create | Quiz display in module |
| `src/components/admin/LessonDialog.tsx` | Modify | Add content editor, video preview |
| `src/components/admin/SortableModuleItem.tsx` | Modify | Add quiz section |
| `src/pages/admin/CourseEditor.tsx` | Modify | Add final exam section |
| `supabase/functions/generate-questions/index.ts` | Create | AI question generation |

---

## Database Schema Diagram

```text
courses
  │
  ├── modules
  │     │
  │     ├── lessons (title, type, video_url, content, description)
  │     │
  │     └── quizzes (module_id, title, passing_score, time_limit)
  │           │
  │           └── quiz_questions (question, options[], correct_answer, explanation)
  │
  └── quizzes (course_id, is_final_exam = true)
        │
        └── quiz_questions
```

---

## Summary

This implementation provides:

1. **Full Module Control**: Edit titles, reorder, delete
2. **Full Lesson Control**: Edit all fields including video URLs and content
3. **Video Embedding**: Preview videos directly in the editor
4. **Full Quiz Control**: Create, edit, delete quizzes per module
5. **Full Question Control**: Add, edit, delete, reorder questions
6. **AI Generation**: Generate questions on any topic with one click
7. **Custom Questions**: Add completely custom questions manually
8. **Final Exam Management**: Manage course-level final exams

All changes sync to the database in real-time and immediately reflect in the student-facing course pages.

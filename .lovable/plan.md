

# Fix PDF Question Generator - Remove Source References

## The Problem

When generating questions from a PDF, the AI is creating questions that reference the source document directly, like:

> "Based on the provided PDF source code, what is the primary function of the 'q' operator..."

This makes the questions feel artificial and not like real test questions.

## Root Cause

The system prompt in the `generate-questions` edge function instructs the AI to:
- Reference the source material in explanations
- Base questions "directly" on the provided content

The AI interprets this too literally and includes phrases like "Based on the PDF..." or "According to the document..." in the actual question text.

---

## Solution

Update the system prompt to explicitly instruct the AI to:
1. Never mention the source document, PDF, or reading material in questions
2. Write questions as if they are standalone test questions
3. Only reference concepts/knowledge, not where it came from
4. The explanation can still reference the material, but the question itself must be clean

---

## Changes to `supabase/functions/generate-questions/index.ts`

### Update the PDF-based system prompt (lines 80-108)

**Add these new guidelines:**

```
CRITICAL RULES FOR QUESTION WRITING:
- NEVER mention "the PDF", "the document", "the reading", "the source", or "the material" in question text
- NEVER use phrases like "Based on...", "According to...", "As stated in..."
- Write questions as standalone test questions that feel professional and self-contained
- Questions should test knowledge of the CONCEPTS, not knowledge of the document
- The student should not need to know the question came from a document
```

**Update the explanation guideline from:**
```
- Include a brief explanation referencing the source material
```

**To:**
```
- Include a brief explanation of why the answer is correct (do NOT reference "the document" or "the PDF" - just explain the concept)
```

---

## Before vs After

| Before | After |
|--------|-------|
| "Based on the provided PDF, what is..." | "What is the primary function of..." |
| "According to the document, which operator..." | "Which operator is used to..." |
| "The source material indicates that..." | "In After Effects, the correct approach is..." |

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/generate-questions/index.ts` | Update system prompt to prohibit source references in questions |

---

## Updated Prompt Section

The key section to update is the guidelines block (around line 85-94):

```typescript
Guidelines:
- Create ${numQuestions} questions at ${difficulty} difficulty level
- Questions must test understanding of the concepts from the provided content
- Test understanding and application, not just memorization
- For "test questions": Create fair, comprehensive assessments
- For "extra credit": Create challenging questions that reward deeper understanding and critical thinking
- Each question should have 4 answer options (A, B, C, D)
- Only one answer should be correct
- Include a brief explanation of why the answer is correct

CRITICAL - Question Writing Rules:
- NEVER mention "the PDF", "the document", "the reading", "the source material", or "the provided content" in question text
- NEVER start questions with "Based on...", "According to...", "As stated in...", or similar phrases
- Write questions as standalone, professional test questions
- Questions should test knowledge of CONCEPTS, not knowledge of where they came from
- The student should feel like this is a real exam question, not a reading comprehension quiz
```


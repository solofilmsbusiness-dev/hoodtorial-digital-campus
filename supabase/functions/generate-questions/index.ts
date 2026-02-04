import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabase.auth.getUser(token);

    if (authError || !data?.user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Authenticated user:", data.user.id);

    const { 
      topic, 
      numQuestions = 5, 
      difficulty = "intermediate", 
      context = "",
      pdfContent = "",
      questionType = "test",
      focusKeywords = ""
    } = await req.json();

    // Either topic or pdfContent is required
    if (!topic && !pdfContent) {
      return new Response(
        JSON.stringify({ error: "Either topic or pdfContent is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the system prompt based on whether we have PDF content or just a topic
    let systemPrompt: string;
    let userPrompt: string;

    if (pdfContent) {
      // PDF-based generation
      const questionTypeDescription = questionType === "extra_credit" 
        ? "extra credit questions that are challenging and reward deeper understanding"
        : "test questions that fairly assess understanding of the material";

      systemPrompt = `You are an expert quiz creator for filmmaking and cinematography education.

You have been provided with educational content extracted from a PDF document.
Your task is to create high-quality ${questionTypeDescription} based on this material.

Guidelines:
- Create ${numQuestions} questions at ${difficulty} difficulty level
- Questions must test understanding of the concepts from the provided content
- Test understanding and application, not just memorization
- For "test questions": Create fair, comprehensive assessments
- For "extra credit": Create challenging questions that reward deeper understanding and critical thinking
- Each question should have 4 answer options (A, B, C, D)
- Only one answer should be correct
- Include a brief explanation of why the answer is correct (explain the concept, not where it came from)
${focusKeywords ? `- Focus especially on these topics: ${focusKeywords}` : ""}

CRITICAL - Question Writing Rules:
- NEVER mention "the PDF", "the document", "the reading", "the source material", or "the provided content" in question text
- NEVER start questions with "Based on...", "According to...", "As stated in...", or similar phrases
- Write questions as standalone, professional test questions
- Questions should test knowledge of CONCEPTS, not knowledge of where they came from
- The student should feel like this is a real exam question, not a reading comprehension quiz

Return your response as a valid JSON object with this exact structure:
{
  "questions": [
    {
      "question": "The question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Brief explanation of why this is correct, referencing the source material"
    }
  ]
}

The correct_answer is the zero-based index of the correct option (0 for A, 1 for B, 2 for C, 3 for D).`;

      userPrompt = `Generate ${numQuestions} ${difficulty}-level ${questionType === "extra_credit" ? "extra credit" : "test"} questions based on the following document content:

---DOCUMENT START---
${pdfContent.substring(0, 50000)}
---DOCUMENT END---`;

    } else {
      // Topic-based generation (original behavior)
      systemPrompt = `You are an expert quiz creator for filmmaking and cinematography courses. 
Generate high-quality multiple choice questions that test understanding, not just memorization.

Guidelines:
- Create ${numQuestions} questions at ${difficulty} difficulty level
- Each question should have 4 answer options (A, B, C, D)
- Only one answer should be correct
- Include a brief explanation for the correct answer
- Questions should be practical and relevant to real filmmaking scenarios
- Avoid trick questions or overly technical jargon for beginner levels

Return your response as a valid JSON object with this exact structure:
{
  "questions": [
    {
      "question": "The question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

The correct_answer is the zero-based index of the correct option (0 for A, 1 for B, 2 for C, 3 for D).`;

      userPrompt = `Generate ${numQuestions} ${difficulty}-level quiz questions about: ${topic}${context ? `\n\nAdditional context: ${context}` : ""}`;
    }

    console.log(`Generating ${numQuestions} ${questionType} questions (PDF: ${pdfContent ? "yes" : "no"})`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate questions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response:", aiResponse);
      return new Response(
        JSON.stringify({ error: "Empty response from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON from the response
    let questions;
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      const parsed = JSON.parse(jsonStr);
      questions = parsed.questions;
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, content);
      return new Response(
        JSON.stringify({ error: "Failed to parse generated questions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate the questions structure
    if (!Array.isArray(questions) || questions.length === 0) {
      console.error("Invalid questions format:", questions);
      return new Response(
        JSON.stringify({ error: "Invalid questions format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ensure each question has the required fields
    const validatedQuestions = questions.map((q: {
      question?: string;
      options?: string[];
      correct_answer?: number;
      explanation?: string;
    }, i: number) => ({
      question: q.question || `Question ${i + 1}`,
      options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ["Option A", "Option B", "Option C", "Option D"],
      correct_answer: typeof q.correct_answer === "number" && q.correct_answer >= 0 ? q.correct_answer : 0,
      explanation: q.explanation || undefined,
    }));

    console.log(`Successfully generated ${validatedQuestions.length} questions`);

    return new Response(
      JSON.stringify({ questions: validatedQuestions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Generate questions error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

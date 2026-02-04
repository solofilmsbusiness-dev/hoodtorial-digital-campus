import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface StudentMetrics {
  avgWatchPercentage: number;
  lessonCompletionRate: number;
  quizPassRate: number;
  quizScoreTrend: "improving" | "declining" | "stable";
  lastActivityDaysAgo: number | null;
  enrolledCourses: string[];
  coursesWithNoProgress: string[];
  totalWatchTimeMinutes: number;
  averageQuizScore: number;
}

interface InsightRequest {
  userId: string;
  studentName: string;
  metrics: StudentMetrics;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the user and verify they are admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: hasAdminRole } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!hasAdminRole) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { studentName, metrics }: InsightRequest = await req.json();

    // Build prompt for AI analysis
    const prompt = buildAnalysisPrompt(studentName, metrics);

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an educational analytics AI assistant helping administrators understand student learning patterns and provide actionable recommendations. 
            
Your responses should be:
- Specific and actionable
- Based on the data provided
- Focused on improving student outcomes
- Professional yet empathetic

Always respond with valid JSON in this exact format:
{
  "summary": "A 2-3 sentence summary of the student's learning status",
  "riskLevel": "low" | "medium" | "high",
  "insights": [
    {
      "category": "engagement" | "progression" | "performance" | "consistency",
      "observation": "What the data shows",
      "recommendation": "What the admin should consider doing"
    }
  ],
  "suggestedActions": ["Action 1", "Action 2", "Action 3"]
}`,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let insights;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
      insights = JSON.parse(cleanContent);
    } catch {
      console.error("Failed to parse AI response:", content);
      // Provide fallback response
      insights = generateFallbackInsights(studentName, metrics);
    }

    console.log(`Generated insights for student ${studentName}`);

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("student-insights error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildAnalysisPrompt(studentName: string, metrics: StudentMetrics): string {
  return `Analyze the learning data for student "${studentName}" and provide insights.

LEARNING METRICS:
- Average Video Watch Percentage: ${metrics.avgWatchPercentage}%
- Lesson Completion Rate: ${metrics.lessonCompletionRate}%
- Quiz Pass Rate: ${metrics.quizPassRate}%
- Average Quiz Score: ${metrics.averageQuizScore}%
- Quiz Score Trend: ${metrics.quizScoreTrend}
- Total Watch Time: ${metrics.totalWatchTimeMinutes} minutes
- Days Since Last Activity: ${metrics.lastActivityDaysAgo ?? "No activity recorded"}
- Enrolled Courses: ${metrics.enrolledCourses.join(", ") || "None"}
- Courses With No Progress: ${metrics.coursesWithNoProgress.join(", ") || "None"}

Based on this data, provide:
1. A risk assessment (low/medium/high) based on engagement and performance
2. Specific observations about their learning patterns
3. Actionable recommendations for the administrator
4. Suggested actions to help improve this student's outcomes

Consider factors like:
- Video engagement vs quiz performance correlation
- Activity patterns and consistency
- Courses that may need intervention
- Signs of struggling or disengagement`;
}

function generateFallbackInsights(studentName: string, metrics: StudentMetrics) {
  const insights = [];
  const actions = [];
  let riskLevel: "low" | "medium" | "high" = "low";

  // Analyze watch percentage
  if (metrics.avgWatchPercentage < 50) {
    insights.push({
      category: "engagement",
      observation: `Video watch percentage is only ${metrics.avgWatchPercentage}%`,
      recommendation: "Consider reaching out to check if content length or difficulty is appropriate",
    });
    riskLevel = "medium";
  }

  // Analyze quiz performance
  if (metrics.quizPassRate < 60) {
    insights.push({
      category: "performance",
      observation: `Quiz pass rate of ${metrics.quizPassRate}% indicates struggling`,
      recommendation: "Review quiz difficulty or suggest additional study resources",
    });
    riskLevel = "high";
  }

  // Analyze activity
  if (metrics.lastActivityDaysAgo !== null && metrics.lastActivityDaysAgo > 7) {
    insights.push({
      category: "consistency",
      observation: `No activity in ${metrics.lastActivityDaysAgo} days`,
      recommendation: "Send a check-in message to re-engage the student",
    });
    riskLevel = riskLevel === "low" ? "medium" : riskLevel;
    actions.push("Send personalized check-in message");
  }

  // Check for courses with no progress
  if (metrics.coursesWithNoProgress.length > 0) {
    insights.push({
      category: "progression",
      observation: `Enrolled in ${metrics.coursesWithNoProgress.join(", ")} but no progress made`,
      recommendation: "Verify enrollment intent or offer guidance to get started",
    });
    actions.push(`Follow up on inactive courses: ${metrics.coursesWithNoProgress.join(", ")}`);
  }

  // Check quiz trend
  if (metrics.quizScoreTrend === "declining") {
    insights.push({
      category: "performance",
      observation: "Quiz scores are trending downward",
      recommendation: "Consider offering tutoring or simplified content",
    });
    actions.push("Review recent quiz results for areas of difficulty");
  }

  // Add default actions
  if (actions.length === 0) {
    actions.push("Continue monitoring progress");
    actions.push("Consider recognition for consistent engagement");
  }

  // Generate summary
  let summary = `${studentName} `;
  if (riskLevel === "low") {
    summary += "is progressing well with consistent engagement and solid quiz performance.";
  } else if (riskLevel === "medium") {
    summary += "shows moderate engagement but could benefit from additional support or encouragement.";
  } else {
    summary += "may be struggling and requires attention. Consider reaching out to understand their challenges.";
  }

  return {
    summary,
    riskLevel,
    insights: insights.length > 0 ? insights : [{
      category: "engagement",
      observation: "Limited data available for detailed analysis",
      recommendation: "Encourage more platform activity to generate actionable insights",
    }],
    suggestedActions: actions,
  };
}

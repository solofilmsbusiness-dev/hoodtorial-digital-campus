import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth client to verify the caller is admin
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: hasAdminRole } = await authClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!hasAdminRole) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { userId, studentName } = await req.json();

    if (!userId || !studentName) {
      return new Response(JSON.stringify({ error: "userId and studentName are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service-role client to read student data (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all data in parallel
    const [enrollmentsRes, progressRes, quizResultsRes, coursesRes, lessonsRes] = await Promise.all([
      supabaseAdmin
        .from("enrollments")
        .select("course_code, enrolled_at, status, completed_at, dropped_at")
        .eq("user_id", userId)
        .order("enrolled_at", { ascending: true }),
      supabaseAdmin
        .from("user_progress")
        .select("course_code, lesson_id, completed, watch_percentage, watched_seconds, video_duration_seconds, completed_at, updated_at")
        .eq("user_id", userId)
        .eq("is_demo", false)
        .order("updated_at", { ascending: true }),
      supabaseAdmin
        .from("quiz_results")
        .select("quiz_id, course_code, score, total_questions, passed, attempt_number, created_at, time_taken_seconds")
        .eq("user_id", userId)
        .eq("is_demo", false)
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("courses")
        .select("code, title, credits, level, department_id"),
      supabaseAdmin
        .from("lessons")
        .select("id, title, module_id, sort_order")
        .order("sort_order", { ascending: true }),
    ]);

    const enrollments = enrollmentsRes.data || [];
    const progress = progressRes.data || [];
    const quizResults = quizResultsRes.data || [];
    const courses = coursesRes.data || [];
    const lessons = lessonsRes.data || [];

    // Build course lookup
    const courseMap = new Map(courses.map(c => [c.code, c]));
    const lessonMap = new Map(lessons.map(l => [l.id, l]));

    // Build prompt with granular data
    const prompt = buildDetailedPrompt(studentName, enrollments, progress, quizResults, courseMap, lessonMap);

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
- Specific and actionable, referencing actual course names and quiz scores
- Based on the granular data provided (individual quiz attempts, per-lesson watch times)
- Focused on identifying where the student is struggling and why
- Professional yet empathetic

Always respond with valid JSON in this exact format:
{
  "summary": "A 2-3 sentence summary of the student's learning status referencing specific courses",
  "riskLevel": "low" | "medium" | "high",
  "insights": [
    {
      "category": "engagement" | "progression" | "performance" | "consistency",
      "observation": "What the data shows - be specific with course names, scores, percentages",
      "recommendation": "What the admin should consider doing"
    }
  ],
  "suggestedActions": ["Action 1", "Action 2", "Action 3"]
}`,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
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

    let insights;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
      insights = JSON.parse(cleanContent);
    } catch {
      console.error("Failed to parse AI response:", content);
      insights = generateFallbackInsights(studentName, enrollments, progress, quizResults, courseMap);
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

function buildDetailedPrompt(
  studentName: string,
  enrollments: any[],
  progress: any[],
  quizResults: any[],
  courseMap: Map<string, any>,
  lessonMap: Map<string, any>,
): string {
  const lines: string[] = [];
  lines.push(`Analyze the learning data for student "${studentName}" and provide insights.\n`);

  if (enrollments.length === 0) {
    lines.push("This student has no course enrollments.");
    return lines.join("\n");
  }

  // Group progress and quiz results by course
  const progressByCourse = new Map<string, any[]>();
  for (const p of progress) {
    if (!p.lesson_id) continue; // skip course-level entries
    const arr = progressByCourse.get(p.course_code) || [];
    arr.push(p);
    progressByCourse.set(p.course_code, arr);
  }

  const quizByCourse = new Map<string, any[]>();
  for (const q of quizResults) {
    const arr = quizByCourse.get(q.course_code) || [];
    arr.push(q);
    quizByCourse.set(q.course_code, arr);
  }

  lines.push("COURSE-BY-COURSE BREAKDOWN:\n");

  for (const enrollment of enrollments) {
    const course = courseMap.get(enrollment.course_code);
    const title = course?.title || enrollment.course_code;
    const code = enrollment.course_code;

    lines.push(`Course: "${title}" (${code})`);
    lines.push(`  Status: ${enrollment.status}`);
    lines.push(`  Enrolled: ${new Date(enrollment.enrolled_at).toLocaleDateString()}`);
    if (enrollment.completed_at) {
      lines.push(`  Completed: ${new Date(enrollment.completed_at).toLocaleDateString()}`);
    }
    if (enrollment.dropped_at) {
      lines.push(`  Dropped: ${new Date(enrollment.dropped_at).toLocaleDateString()}`);
    }

    // Video progress
    const courseProgress = progressByCourse.get(code) || [];
    if (courseProgress.length > 0) {
      lines.push("  Video Progress:");
      for (const p of courseProgress) {
        const lesson = lessonMap.get(p.lesson_id);
        const lessonName = lesson?.title || p.lesson_id;
        const watchPct = p.watch_percentage ?? 0;
        const watchMin = p.watched_seconds ? Math.round(p.watched_seconds / 60) : 0;
        const completed = p.completed ? " ✓" : "";
        let flag = "";
        if (watchPct > 0 && watchPct < 50) flag = "  <-- low engagement";
        lines.push(`    - ${lessonName}: ${watchPct}% watched (${watchMin} min)${completed}${flag}`);
      }
    } else {
      lines.push("  Video Progress: No lessons started");
    }

    // Quiz results
    const courseQuizzes = quizByCourse.get(code) || [];
    if (courseQuizzes.length > 0) {
      lines.push("  Quiz Results:");
      for (const q of courseQuizzes) {
        const scorePct = q.total_questions > 0 ? Math.round((q.score / q.total_questions) * 100) : 0;
        const status = q.passed ? "passed" : "failed";
        const date = new Date(q.created_at).toLocaleDateString();
        const attempt = q.attempt_number ? ` (attempt ${q.attempt_number})` : "";
        let flag = "";
        if (!q.passed && (q.attempt_number || 1) >= 2) flag = "  <-- struggling with retakes";
        if (scorePct < 40) flag = "  <-- very low score";
        lines.push(`    - Score: ${scorePct}% (${status})${attempt} - ${date}${flag}`);
      }
    } else {
      lines.push("  Quiz Results: None");
    }

    lines.push("");
  }

  // Overall summary stats
  const totalQuizzes = quizResults.length;
  const passedQuizzes = quizResults.filter(q => q.passed).length;
  const avgScore = totalQuizzes > 0
    ? Math.round(quizResults.reduce((s, q) => s + (q.total_questions > 0 ? (q.score / q.total_questions) * 100 : 0), 0) / totalQuizzes)
    : 0;
  const totalWatchMin = Math.round(progress.reduce((s, p) => s + (p.watched_seconds || 0), 0) / 60);
  const avgWatch = progress.filter(p => p.lesson_id && p.watch_percentage != null);
  const avgWatchPct = avgWatch.length > 0
    ? Math.round(avgWatch.reduce((s, p) => s + (p.watch_percentage || 0), 0) / avgWatch.length)
    : 0;

  // Last activity
  const allDates = [
    ...progress.map(p => p.updated_at),
    ...quizResults.map(q => q.created_at),
  ].filter(Boolean).map(d => new Date(d).getTime());
  const lastActivity = allDates.length > 0 ? new Date(Math.max(...allDates)) : null;
  const daysSinceActivity = lastActivity ? Math.round((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)) : null;

  lines.push("OVERALL SUMMARY:");
  lines.push(`  Total Enrolled Courses: ${enrollments.length}`);
  lines.push(`  Active Courses: ${enrollments.filter(e => e.status === "active").length}`);
  lines.push(`  Total Quiz Attempts: ${totalQuizzes} (${passedQuizzes} passed)`);
  lines.push(`  Average Quiz Score: ${avgScore}%`);
  lines.push(`  Average Video Watch: ${avgWatchPct}%`);
  lines.push(`  Total Watch Time: ${totalWatchMin} minutes`);
  lines.push(`  Days Since Last Activity: ${daysSinceActivity ?? "No activity recorded"}`);

  lines.push("\nBased on this data, provide:");
  lines.push("1. A risk assessment (low/medium/high) based on engagement and performance patterns");
  lines.push("2. Specific observations referencing actual course names, quiz scores, and watch patterns");
  lines.push("3. Actionable recommendations for the administrator");
  lines.push("4. Suggested actions to help improve this student's outcomes");

  return lines.join("\n");
}

function generateFallbackInsights(
  studentName: string,
  enrollments: any[],
  progress: any[],
  quizResults: any[],
  courseMap: Map<string, any>,
) {
  const insights: any[] = [];
  const actions: string[] = [];
  let riskLevel: "low" | "medium" | "high" = "low";

  // Avg watch percentage
  const watchEntries = progress.filter(p => p.lesson_id && p.watch_percentage != null);
  const avgWatch = watchEntries.length > 0
    ? Math.round(watchEntries.reduce((s, p) => s + (p.watch_percentage || 0), 0) / watchEntries.length)
    : 0;

  if (watchEntries.length > 0 && avgWatch < 50) {
    insights.push({
      category: "engagement",
      observation: `Average video watch percentage is only ${avgWatch}%`,
      recommendation: "Consider reaching out to check if content length or difficulty is appropriate",
    });
    riskLevel = "medium";
  }

  // Quiz performance
  const totalQuizzes = quizResults.length;
  const passedQuizzes = quizResults.filter(q => q.passed).length;
  const quizPassRate = totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 100;

  if (totalQuizzes > 0 && quizPassRate < 60) {
    insights.push({
      category: "performance",
      observation: `Quiz pass rate of ${quizPassRate}% (${passedQuizzes}/${totalQuizzes} passed)`,
      recommendation: "Review quiz difficulty or suggest additional study resources",
    });
    riskLevel = "high";
  }

  // Courses with no progress
  const coursesWithProgress = new Set(progress.filter(p => p.lesson_id).map(p => p.course_code));
  const noProgressCourses = enrollments
    .filter(e => e.status === "active" && !coursesWithProgress.has(e.course_code))
    .map(e => courseMap.get(e.course_code)?.title || e.course_code);

  if (noProgressCourses.length > 0) {
    insights.push({
      category: "progression",
      observation: `Enrolled but no progress in: ${noProgressCourses.join(", ")}`,
      recommendation: "Verify enrollment intent or offer guidance to get started",
    });
    actions.push(`Follow up on inactive courses: ${noProgressCourses.join(", ")}`);
  }

  // Last activity
  const allDates = [
    ...progress.map(p => p.updated_at),
    ...quizResults.map(q => q.created_at),
  ].filter(Boolean).map(d => new Date(d).getTime());
  const lastActivity = allDates.length > 0 ? new Date(Math.max(...allDates)) : null;
  const daysSince = lastActivity ? Math.round((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)) : null;

  if (daysSince !== null && daysSince > 7) {
    insights.push({
      category: "consistency",
      observation: `No activity in ${daysSince} days`,
      recommendation: "Send a check-in message to re-engage the student",
    });
    riskLevel = riskLevel === "low" ? "medium" : riskLevel;
    actions.push("Send personalized check-in message");
  }

  if (actions.length === 0) {
    actions.push("Continue monitoring progress");
    actions.push("Consider recognition for consistent engagement");
  }

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

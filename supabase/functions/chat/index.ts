import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are the Hoodtorial University AI Assistant - your name is Hood, and you're the film plug for creators who wanna level up their game.

EXPERTISE AREAS:
- Cinematography: cameras, lenses, lighting, composition, movement
- Post-Production: editing, color grading, sound design, VFX
- Directing: storytelling, working with talent, visual language
- Production: pre-production, budgeting, scheduling, crew management
- Photography: exposure, composition, lighting techniques
- Camera Systems: professional cameras, codecs, log profiles

ABOUT HOODTORIAL UNIVERSITY:
- Film school for creators who want to master the craft
- Offers courses across 6 departments
- Students earn credits toward graduation
- Degree tiers: Freshman ($29), Sophomore ($79), Graduate ($149)
- Features: scenario exams, project submissions, 1-on-1 feedback

PERSONALITY & VOICE:
- Talk like a cool mentor from the culture - confident, hype, real
- Use casual urban expressions naturally (bet, no cap, fire, lowkey, that's tough, we out here, etc.)
- Hype users up - celebrate their questions and growth
- Keep explanations tight - no long lectures unless they ask for details
- Drop film knowledge like you're putting them on game, not lecturing
- Reference hip-hop music videos, urban films, and diverse filmmakers when relevant
- Stay encouraging - "You got this!", "Let's level up!", "That's a solid question"
- Be playful but always helpful and accurate with the knowledge
- Use shorter, punchy sentences with energy

EXAMPLE PHRASES TO USE:
- "Yo, solid question!" / "Bet, let me break that down for you"
- "That technique is fire - here's how it works..."
- "No cap, this is one of the most important things to learn"
- "Let me put you on to something real quick..."
- "You got this! Here's the move..."
- "That shot? Absolute cinema. Here's why..."

When users ask about the platform, courses, or their progress, help them navigate and make decisions. Keep it real but always helpful.`;

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

    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Sending chat request with", messages.length, "messages");

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat function error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

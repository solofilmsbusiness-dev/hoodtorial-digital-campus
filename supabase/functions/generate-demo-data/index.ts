import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface GenerateConfig {
  userCount: number;
  postCount: number;
  commentCount: number;
}

interface ClearConfig {
  action: 'clear';
}

const FILMMAKER_FIRST_NAMES = [
  "Alex", "Jordan", "Casey", "Riley", "Morgan", "Taylor", "Quinn", "Skyler",
  "Jamie", "Avery", "Blake", "Cameron", "Dakota", "Drew", "Emery", "Finley",
  "Gray", "Harper", "Hayden", "Jaden", "Kai", "Lennox", "Marley", "Parker",
  "Peyton", "Phoenix", "Reese", "River", "Rowan", "Sage", "Sam", "Sawyer",
  "Sydney", "Teagan", "Tatum", "Wren", "Zion", "Eden", "Jules", "Kendall"
];

const FILMMAKER_LAST_NAMES = [
  "Rivera", "Chen", "Patel", "Kim", "Nguyen", "Santos", "Lee", "Garcia",
  "Martinez", "Hernandez", "Lopez", "Williams", "Brown", "Jones", "Miller",
  "Davis", "Anderson", "Wilson", "Taylor", "Thomas", "Moore", "Jackson",
  "Martin", "White", "Thompson", "Robinson", "Clark", "Lewis", "Walker", "Hall"
];

const LOCATIONS = [
  "Los Angeles, CA", "New York, NY", "Austin, TX", "Vancouver, BC", "London, UK",
  "Toronto, ON", "Atlanta, GA", "Chicago, IL", "Miami, FL", "Seattle, WA",
  "Portland, OR", "Denver, CO", "Nashville, TN", "New Orleans, LA", "Boston, MA"
];

const FILMMAKING_STYLES = [
  "Documentary", "Narrative", "Experimental", "Commercial", "Music Video",
  "Horror", "Comedy", "Drama", "Action", "Sci-Fi", "Animation", "Nature",
  "Portrait", "Cinematic", "Guerrilla", "Run-and-gun"
];

const POST_TITLES_BY_CATEGORY = {
  general: [
    "Anyone else feeling overwhelmed with gear choices?",
    "Just wrapped my first paid gig! 🎬",
    "Recommendations for affordable lenses?",
    "How do you stay motivated on long projects?",
    "Film school vs self-taught: your thoughts?",
    "Best books for learning cinematography?",
    "Studio vs natural lighting debate",
    "Collaboration opportunities in LA area"
  ],
  course_discussion: [
    "Struggling with the 3-point lighting module",
    "Week 3 assignment feedback request",
    "Best approach for the final project?",
    "Module 2 quiz tips?",
    "Professor's feedback was amazing!",
    "Study group for upcoming exam?",
    "Confused about exposure triangle",
    "Color grading lecture was incredible"
  ],
  project_submission: [
    "My first short film - 'The Wait'",
    "Documentary project: Urban Wildlife",
    "Music video for local band",
    "30-second commercial spec piece",
    "Student film: 'Echoes'",
    "Experimental piece exploring time",
    "Cinematography reel 2025",
    "Behind the scenes of my latest shoot"
  ],
  feedback_critique: [
    "First time using a slider - feedback appreciated!",
    "Composition critique needed on this shot",
    "Color grade feedback for moody scene",
    "Audio mixing advice for dialogue scene",
    "Does this shot feel too static?",
    "Pacing feedback for my edit",
    "Lighting setup for interview - thoughts?",
    "Focus pull timing - am I doing this right?"
  ],
  announcement: [
    "🎉 Community film screening next Friday!",
    "New course modules available!",
    "Gear exchange meetup this weekend",
    "Festival submission deadline reminder",
    "Guest speaker announcement",
    "Community challenge results!"
  ]
};

const AVATAR_COLORS = [
  "4A90A4", "E07A5F", "81B29A", "F4A261", "8B5CF6", 
  "EC4899", "10B981", "F59E0B", "6366F1", "EF4444"
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDisplayName(): string {
  return `${getRandomElement(FILMMAKER_FIRST_NAMES)} ${getRandomElement(FILMMAKER_LAST_NAMES)}`;
}

function generateAvatarUrl(name: string): string {
  const color = getRandomElement(AVATAR_COLORS);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=128&bold=true`;
}

async function generateBioWithAI(apiKey: string, name: string): Promise<string> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: "You are generating realistic bios for film students. Keep bios 1-2 sentences, casual and authentic."
          },
          {
            role: "user",
            content: `Generate a brief bio for a film student named ${name}. Include their interest area (cinematography, directing, editing, sound, etc.) and maybe a current project or goal. Keep it under 30 words.`
          }
        ],
      }),
    });
    
    if (!response.ok) {
      console.error("AI bio generation failed:", response.status);
      return `Passionate filmmaker exploring the art of visual storytelling.`;
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || `Aspiring filmmaker with a love for visual storytelling.`;
  } catch (error) {
    console.error("AI bio error:", error);
    return `Film enthusiast dedicated to learning the craft.`;
  }
}

async function generatePostContentWithAI(apiKey: string, title: string, category: string): Promise<string> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: "You are a film student writing posts in a community forum. Write authentic, engaging content that sounds like a real student. 2-3 paragraphs max."
          },
          {
            role: "user",
            content: `Write a community forum post with the title: "${title}" in the ${category} category. Be authentic and conversational. Keep it under 150 words.`
          }
        ],
      }),
    });
    
    if (!response.ok) {
      return `Just wanted to share my thoughts on this topic. Looking forward to hearing what others think!`;
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || `Excited to discuss this with the community!`;
  } catch (error) {
    console.error("AI content error:", error);
    return `Would love to get the community's perspective on this.`;
  }
}

async function generateCommentWithAI(apiKey: string, postTitle: string): Promise<string> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: "You are a film student commenting on a community post. Be supportive, constructive, and authentic. 1-2 sentences."
          },
          {
            role: "user",
            content: `Write a brief comment for a post titled "${postTitle}". Be encouraging and add value to the discussion. Under 40 words.`
          }
        ],
      }),
    });
    
    if (!response.ok) {
      return `Great work! Keep pushing forward.`;
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || `Really appreciate you sharing this!`;
  } catch (error) {
    return `Love seeing this kind of content in our community!`;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify admin role from auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Check admin role
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const body = await req.json() as GenerateConfig | ClearConfig;
    
    // Handle clear action
    if ('action' in body && body.action === 'clear') {
      console.log("Clearing all demo data...");
      
      // Delete in order of dependencies
      await supabase.from('comment_likes').delete().eq('is_demo', true);
      await supabase.from('post_likes').delete().eq('is_demo', true);
      await supabase.from('community_comments').delete().eq('is_demo', true);
      await supabase.from('community_posts').delete().eq('is_demo', true);
      await supabase.from('quiz_results').delete().eq('is_demo', true);
      await supabase.from('user_progress').delete().eq('is_demo', true);
      await supabase.from('enrollments').delete().eq('is_demo', true);
      await supabase.from('challenge_submissions').delete().eq('is_demo', true);
      await supabase.from('profiles').delete().eq('is_demo', true);
      
      // Update demo settings
      await supabase
        .from('demo_settings')
        .update({ 
          is_active: false,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', '00000000-0000-0000-0000-000000000001');
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: "All demo data cleared" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Handle generate action
    const config = body as GenerateConfig;
    const { userCount = 25, postCount = 50, commentCount = 100 } = config;
    
    console.log(`Generating demo data: ${userCount} users, ${postCount} posts, ${commentCount} comments`);
    
    // Generate demo profiles
    const demoUsers: { user_id: string; display_name: string }[] = [];
    
    for (let i = 0; i < userCount; i++) {
      const displayName = generateDisplayName();
      const fakeUserId = crypto.randomUUID();
      const bio = await generateBioWithAI(lovableApiKey, displayName);
      
      const profile = {
        user_id: fakeUserId,
        display_name: displayName,
        bio: bio,
        avatar_url: generateAvatarUrl(displayName),
        location: getRandomElement(LOCATIONS),
        filmmaking_style: getRandomElement(FILMMAKING_STYLES),
        is_demo: true,
        subscription_status: getRandomElement(['trial', 'active', 'active', 'active']),
        trial_started_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        trial_ends_at: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      const { error } = await supabase.from('profiles').insert(profile);
      if (!error) {
        demoUsers.push({ user_id: fakeUserId, display_name: displayName });
      }
      
      // Small delay to avoid rate limiting
      if (i % 5 === 0) {
        await new Promise(r => setTimeout(r, 100));
      }
    }
    
    console.log(`Created ${demoUsers.length} demo users`);
    
    // Generate demo posts
    const categories = Object.keys(POST_TITLES_BY_CATEGORY) as (keyof typeof POST_TITLES_BY_CATEGORY)[];
    const demoPosts: { id: string; title: string; user_id: string }[] = [];
    
    for (let i = 0; i < postCount; i++) {
      const category = getRandomElement(categories);
      const title = getRandomElement(POST_TITLES_BY_CATEGORY[category]);
      const author = getRandomElement(demoUsers);
      const content = await generatePostContentWithAI(lovableApiKey, title, category);
      
      const post = {
        user_id: author.user_id,
        title: title,
        content: content,
        category: category,
        is_demo: true,
        media_urls: [],
        is_pinned: false,
        is_highlighted: Math.random() > 0.9,
        is_project_post: category === 'project_submission',
        created_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      const { data, error } = await supabase.from('community_posts').insert(post).select('id').single();
      if (!error && data) {
        demoPosts.push({ id: data.id, title: title, user_id: author.user_id });
      }
      
      if (i % 5 === 0) {
        await new Promise(r => setTimeout(r, 100));
      }
    }
    
    console.log(`Created ${demoPosts.length} demo posts`);
    
    // Generate demo comments
    let commentsCreated = 0;
    for (let i = 0; i < commentCount; i++) {
      const post = getRandomElement(demoPosts);
      const author = getRandomElement(demoUsers.filter(u => u.user_id !== post.user_id));
      if (!author) continue;
      
      const content = await generateCommentWithAI(lovableApiKey, post.title);
      
      const comment = {
        post_id: post.id,
        user_id: author.user_id,
        content: content,
        is_demo: true,
        is_highlighted: Math.random() > 0.95,
        is_instructor_comment: false,
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      const { error } = await supabase.from('community_comments').insert(comment);
      if (!error) commentsCreated++;
      
      if (i % 10 === 0) {
        await new Promise(r => setTimeout(r, 50));
      }
    }
    
    console.log(`Created ${commentsCreated} demo comments`);
    
    // Generate demo likes
    let likesCreated = 0;
    for (const post of demoPosts) {
      const likeCount = Math.floor(Math.random() * 12) + 3;
      const likers = demoUsers
        .filter(u => u.user_id !== post.user_id)
        .sort(() => Math.random() - 0.5)
        .slice(0, likeCount);
      
      for (const liker of likers) {
        const { error } = await supabase.from('post_likes').insert({
          post_id: post.id,
          user_id: liker.user_id,
          is_demo: true,
        });
        if (!error) likesCreated++;
      }
    }
    
    console.log(`Created ${likesCreated} demo likes`);
    
    // Update demo settings
    await supabase
      .from('demo_settings')
      .update({
        is_active: true,
        demo_user_count: demoUsers.length,
        demo_post_count: demoPosts.length,
        demo_comment_count: commentsCreated,
        last_generated_at: new Date().toISOString(),
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', '00000000-0000-0000-0000-000000000001');
    
    return new Response(JSON.stringify({
      success: true,
      stats: {
        users: demoUsers.length,
        posts: demoPosts.length,
        comments: commentsCreated,
        likes: likesCreated,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Generate demo data error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

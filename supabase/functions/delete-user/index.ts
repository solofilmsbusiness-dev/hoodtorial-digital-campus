import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface DeleteUserRequest {
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const token = authHeader.replace("Bearer ", "");
    console.log("Validating token for delete-user");

    const { data: claimsData, error: claimsError } = await supabaseAdmin.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      console.error("Claims error:", claimsError);
      throw new Error("Unauthorized");
    }

    const callerUserId = claimsData.claims.sub as string;
    console.log("Caller validated via claims, userId:", callerUserId);

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUserId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("Role check error:", roleError);
      throw new Error("Admin access required");
    }

    const { userId: targetUserId }: DeleteUserRequest = await req.json();
    if (!targetUserId) {
      throw new Error("userId is required");
    }

    if (targetUserId === callerUserId) {
      throw new Error("You cannot delete your own account");
    }

    console.log(`Admin ${callerUserId} is deleting user ${targetUserId}`);

    // Try to delete auth record - gracefully handle "User not found"
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (deleteError) {
      const msg = deleteError.message?.toLowerCase() || "";
      if (msg.includes("not found") || msg.includes("404")) {
        console.log(`Auth record for ${targetUserId} already gone, proceeding to clean up data`);
      } else {
        console.error("Delete user error:", deleteError);
        throw new Error(`Failed to delete user: ${deleteError.message}`);
      }
    }

    // Explicitly clean up orphaned data that may not cascade without an auth record
    const cleanupTables = [
      "user_progress",
      "quiz_results",
      "enrollments",
      "community_posts",
      "community_comments",
      "post_likes",
      "comment_likes",
      "challenge_submissions",
      "notifications",
      "friend_requests",
      "friendships",
      "support_tickets",
      "user_roles",
      "profiles",
    ];

    for (const table of cleanupTables) {
      const col = table === "friendships" ? "user_id" : "user_id";
      const { error } = await supabaseAdmin.from(table).delete().eq(col, targetUserId);
      if (error) {
        console.warn(`Cleanup ${table} warning:`, error.message);
      }
    }

    // Also clean friendships where user is the friend
    await supabaseAdmin.from("friendships").delete().eq("friend_id", targetUserId);

    // Clean conversations where user is a participant
    const { data: convos } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .or(`participant_1.eq.${targetUserId},participant_2.eq.${targetUserId}`);

    if (convos && convos.length > 0) {
      const convoIds = convos.map(c => c.id);
      await supabaseAdmin.from("direct_messages").delete().in("conversation_id", convoIds);
      await supabaseAdmin.from("conversations").delete().in("id", convoIds);
    }

    console.log(`User ${targetUserId} successfully deleted and cleaned up`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "User has been permanently deleted",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Delete user error:", errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);

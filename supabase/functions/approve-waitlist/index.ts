import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ApproveRequest {
  waitlistId: string;
}

// Generate a secure random password
function generatePassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}

// Generate acceptance letter HTML email
function generateAcceptanceEmail(
  name: string,
  username: string,
  email: string,
  tempPassword: string,
  loginUrl: string
): string {
  const displayName = name || "Future Filmmaker";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Hoodtorial University</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 16px; border: 1px solid #333; overflow: hidden;">
          
          <!-- Header with Gold Accent -->
          <tr>
            <td style="background: linear-gradient(90deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%); height: 4px;"></td>
          </tr>
          
          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 4px; color: #ffffff;">
                HOODTORIAL
              </h1>
              <p style="margin: 4px 0 0; font-size: 14px; font-weight: 600; letter-spacing: 6px; background: linear-gradient(90deg, #d4af37, #f4d03f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                UNIVERSITY
              </p>
            </td>
          </tr>
          
          <!-- Acceptance Banner -->
          <tr>
            <td align="center" style="padding: 20px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 8px;">
                <tr>
                  <td style="padding: 16px 32px;">
                    <p style="margin: 0; font-size: 12px; font-weight: 700; letter-spacing: 4px; color: #d4af37; text-transform: uppercase;">
                      🎬 Official Acceptance Letter 🎬
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 20px 40px 40px;">
              <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #ffffff;">
                Congratulations, ${displayName}!
              </h2>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #b0b0b0;">
                The wait is over. You've been <strong style="color: #d4af37;">officially accepted</strong> to Hoodtorial University. 
                Your journey from hustle to Hollywood starts now.
              </p>
              
              <!-- Credentials Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(255,255,255,0.05); border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px; font-size: 12px; font-weight: 600; letter-spacing: 2px; color: #888; text-transform: uppercase;">
                      Your Login Credentials
                    </p>
                    
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #888; font-size: 14px;">Username:</span>
                          <span style="color: #d4af37; font-size: 14px; font-weight: 600; margin-left: 8px;">@${username}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #888; font-size: 14px;">Email:</span>
                          <span style="color: #ffffff; font-size: 14px; margin-left: 8px;">${email}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #888; font-size: 14px;">Temporary Password:</span>
                          <code style="background: rgba(212, 175, 55, 0.2); color: #d4af37; font-size: 14px; font-weight: 600; padding: 4px 8px; border-radius: 4px; margin-left: 8px;">${tempPassword}</code>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(90deg, #d4af37 0%, #f4d03f 100%); color: #0a0a0a; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; text-decoration: none; padding: 16px 48px; border-radius: 8px;">
                      Login Now →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; font-size: 13px; color: #666; text-align: center;">
                For security, please change your password after your first login.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background: rgba(0,0,0,0.3); border-top: 1px solid #222;">
              <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; letter-spacing: 2px; color: #666; text-align: center; text-transform: uppercase;">
                Where Hustle Meets Hollywood
              </p>
              <p style="margin: 0; font-size: 11px; color: #444; text-align: center;">
                © ${new Date().getFullYear()} Hoodtorial University. All rights reserved.
              </p>
            </td>
          </tr>
          
          <!-- Bottom Gold Accent -->
          <tr>
            <td style="background: linear-gradient(90deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%); height: 4px;"></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Service role client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Extract the JWT token and validate the user using getClaims
    const token = authHeader.replace("Bearer ", "");
    console.log("Validating token for approve-waitlist (v3)");
    
    const { data: claimsData, error: claimsError } = await supabaseAdmin.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      console.error("Claims error (v3):", claimsError);
      throw new Error("Unauthorized");
    }
    
    const adminUserId = claimsData.claims.sub as string;
    console.log("User validated via claims, adminUserId:", adminUserId);

    // Check if user has admin role (using service role client to bypass RLS)
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", adminUserId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("Role check error:", roleError);
      throw new Error("Admin access required");
    }

    // Get request body
    const { waitlistId }: ApproveRequest = await req.json();
    if (!waitlistId) {
      throw new Error("waitlistId is required");
    }

    console.log(`Processing approval for waitlist ID: ${waitlistId}`);

    // Fetch waitlist entry
    const { data: waitlistEntry, error: fetchError } = await supabaseAdmin
      .from("waitlist")
      .select("*")
      .eq("id", waitlistId)
      .single();

    if (fetchError || !waitlistEntry) {
      console.error("Fetch error:", fetchError);
      throw new Error("Waitlist entry not found");
    }

    if (waitlistEntry.status === "approved") {
      throw new Error("This entry has already been approved");
    }

    const { email, name, desired_username } = waitlistEntry;
    const username = desired_username || email.split("@")[0];

    // Generate temporary password
    const tempPassword = generatePassword();

    console.log(`Checking if user already exists for: ${email}`);

    // Check if user already exists with this email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    let userId: string;
    let createdNewUser = false;

    if (existingUser) {
      console.log(`User already exists with ID: ${existingUser.id}, confirming email only (preserving password)`);
      // User exists - only confirm their email, do NOT overwrite their password
      const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        {
          email_confirm: true,
          user_metadata: {
            display_name: name || username,
          },
        }
      );

      if (updateUserError) {
        console.error("User update error:", updateUserError);
        throw new Error(`Failed to update existing user: ${updateUserError.message}`);
      }
      userId = existingUser.id;
      createdNewUser = false;
    } else {
      console.log(`Creating new user account for: ${email}`);
      // Create the user account
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm since we're approving them
        user_metadata: {
          display_name: name || username,
        },
      });

      if (createError) {
        console.error("User creation error:", createError);
        throw new Error(`Failed to create user: ${createError.message}`);
      }
      userId = newUser.user.id;
      createdNewUser = true;
    }

    console.log(`User ${createdNewUser ? 'created' : 'updated'} with ID: ${userId}`);

    // Update the user's profile with the username
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        display_name: name || username,
      })
      .eq("user_id", userId);

    if (profileError) {
      console.error("Profile update error:", profileError);
      // Don't fail the whole operation for this
    }

    // Get the login URL
    const loginUrl = Deno.env.get("SITE_URL") || "https://hoodtorial-digital-campus.lovable.app/auth";

    // Only send acceptance email with credentials for newly created users
    if (createdNewUser) {
      console.log(`Sending acceptance email to: ${email}`);
      
      const emailHtml = generateAcceptanceEmail(
        name || "",
        username,
        email,
        tempPassword,
        loginUrl
      );

      const { error: emailError } = await resend.emails.send({
        from: "Hoodtorial University <onboarding@resend.dev>",
        to: [email],
        subject: "🎬 Welcome to Hoodtorial University - You're IN!",
        html: emailHtml,
      });

      if (emailError) {
        console.error("Email send error:", emailError);
      } else {
        console.log("Acceptance email sent successfully");
      }
    } else {
      console.log(`Skipping credential email for existing user: ${email}`);
    }

    // Update waitlist status to approved
    const { error: updateError } = await supabaseAdmin
      .from("waitlist")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        password_token: tempPassword.substring(0, 4) + "****", // Store partial for reference
      })
      .eq("id", waitlistId);

    if (updateError) {
      console.error("Waitlist update error:", updateError);
      throw new Error("Failed to update waitlist status");
    }

    console.log(`Approval complete for: ${email}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `User ${email} has been approved and notified`,
        userId: userId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Approve waitlist error:", errorMessage);
    
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

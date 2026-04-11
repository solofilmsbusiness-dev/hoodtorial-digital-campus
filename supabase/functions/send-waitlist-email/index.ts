import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateWaitlistEmail(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're on the List — Hoodtorial University</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Arial',sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#111111;border-bottom:4px solid #f5c518;padding:40px 40px 32px;text-align:center;">
          <h1 style="margin:0 0 8px;font-size:32px;font-weight:900;letter-spacing:4px;color:#f5c518;text-transform:uppercase;">HOODTORIAL</h1>
          <p style="margin:0;font-size:13px;letter-spacing:6px;color:#888888;text-transform:uppercase;">UNIVERSITY</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#111111;padding:40px;">
          <p style="font-size:13px;letter-spacing:3px;color:#f5c518;text-transform:uppercase;margin:0 0 16px;">WAITLIST CONFIRMED</p>
          <h2 style="margin:0 0 24px;font-size:28px;font-weight:900;text-transform:uppercase;color:#ffffff;">You're on the list.</h2>
          <p style="color:#aaaaaa;line-height:1.7;margin:0 0 24px;">We got you. Your spot on the Hoodtorial University waitlist is locked in.</p>
          <p style="color:#aaaaaa;line-height:1.7;margin:0 0 32px;">When access opens up, you'll be the first to know. We'll hit your inbox with everything you need to get started.</p>

          <table cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #222;padding:24px;margin:0 0 32px;">
            <tr><td>
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;color:#666;text-transform:uppercase;">What's coming</p>
              <p style="margin:0 0 12px;color:#cccccc;line-height:1.7;font-size:14px;">→ Real film education built for creators from the culture</p>
              <p style="margin:0 0 12px;color:#cccccc;line-height:1.7;font-size:14px;">→ No gatekeeping. No fluff. Just skills that actually translate.</p>
              <p style="margin:0;color:#cccccc;line-height:1.7;font-size:14px;">→ Courses across cinematography, editing, directing, and more</p>
            </td></tr>
          </table>

          <p style="color:#555555;font-size:13px;line-height:1.6;margin:0;">Sit tight. We'll see you inside.</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#0a0a0a;padding:24px 40px;text-align:center;border-top:1px solid #1a1a1a;">
          <p style="margin:0;font-size:12px;color:#444444;">© 2026 Hoodtorial University · <a href="https://hoodtorialuniversity.com/privacy" style="color:#666;text-decoration:none;">Privacy Policy</a></p>
          <p style="margin:8px 0 0;font-size:11px;color:#333333;letter-spacing:1px;text-transform:uppercase;">WHERE HUSTLE MEETS HOLLYWOOD</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await resend.emails.send({
      from: "Hoodtorial University <noreply@hoodtorialuniversity.com>",
      to: [email],
      subject: "You're on the list. We'll see you inside.",
      html: generateWaitlistEmail(),
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

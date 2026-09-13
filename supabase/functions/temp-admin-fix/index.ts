import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: list, error: listErr } = await admin.auth.admin.listUsers();
    if (listErr) throw listErr;
    const user = list.users.find((u) => u.email === "solofilmsagent@gmail.com");
    if (!user) {
      return new Response(JSON.stringify({ error: "user not found" }), { status: 404 });
    }
    const { error: updErr } = await admin.auth.admin.updateUserById(user.id, {
      email: "solofilmsbusiness@gmail.com",
      password: "$olo4Eva1010",
      email_confirm: true,
    });
    if (updErr) throw updErr;
    return new Response(JSON.stringify({ ok: true, id: user.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});

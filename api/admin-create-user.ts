import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { full_name, email, phone, password, role = "student" } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "email and password are required" });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

  const db = supabaseAdmin();

  // 1. Create auth user (email auto-confirmed)
  const { data, error: authErr } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: full_name ?? "", phone: phone ?? "" },
  });
  if (authErr) return res.status(400).json({ error: authErr.message });

  const userId = data.user.id;

  // 2. Create profile row (upsert in case a trigger already created it)
  const { error: profileErr } = await db.from("profiles").upsert({
    id: userId,
    full_name: full_name ?? null,
    phone: phone ?? null,
  }, { onConflict: "id" });
  if (profileErr) return res.status(400).json({ error: profileErr.message });

  // 3. Assign role if admin
  if (role === "admin") {
    await db.from("user_roles").insert({ user_id: userId, role: "admin" });
  }

  return res.status(200).json({ success: true, userId });
}

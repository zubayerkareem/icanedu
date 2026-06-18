import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, password } = req.body ?? {};
  if (!userId || !password) return res.status(400).json({ error: "userId and password are required" });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

  const db = supabaseAdmin();
  const { error } = await db.auth.admin.updateUserById(userId, { password });
  if (error) return res.status(400).json({ error: error.message });

  return res.status(200).json({ success: true });
}

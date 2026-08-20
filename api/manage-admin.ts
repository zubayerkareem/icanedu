import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * POST /api/manage-admin
 * Body:  { action: "promote" | "demote", targetEmail: string }
 * Auth:  Authorization: Bearer <supabase access token>
 *
 * Restricted to superadmin callers only. Never promotes/demotes superadmin rows.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // ── 1. Verify caller identity ──────────────────────────────────────────────
  const token = req.headers.authorization?.replace("Bearer ", "").trim();
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const db = supabaseAdmin();

  const { data: { user: caller }, error: authErr } = await db.auth.getUser(token);
  if (authErr || !caller) return res.status(401).json({ error: "Invalid or expired token" });

  // ── 2. Confirm caller is superadmin ────────────────────────────────────────
  const { data: callerRole } = await db
    .from("user_roles")
    .select("role")
    .eq("user_id", caller.id)
    .eq("role", "superadmin")
    .maybeSingle();

  if (!callerRole) {
    return res.status(403).json({ error: "Forbidden: superadmin access required" });
  }

  // ── 3. Parse & validate body ───────────────────────────────────────────────
  const { action, targetEmail } = req.body ?? {};
  if (!action || !targetEmail) {
    return res.status(400).json({ error: "Missing action or targetEmail" });
  }
  if (action !== "promote" && action !== "demote") {
    return res.status(400).json({ error: "action must be 'promote' or 'demote'" });
  }

  const email = String(targetEmail).toLowerCase().trim();

  // ── 4. Find target user by email ───────────────────────────────────────────
  const { data: { users }, error: listErr } = await db.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) return res.status(500).json({ error: "Could not list users" });

  const target = users.find((u) => u.email === email);
  if (!target) return res.status(404).json({ error: "No account found for that email" });

  // ── 5. Safety guards ───────────────────────────────────────────────────────
  if (target.id === caller.id) {
    return res.status(400).json({ error: "You cannot modify your own role" });
  }

  // Prevent touching another superadmin row
  const { data: targetSuperadmin } = await db
    .from("user_roles")
    .select("role")
    .eq("user_id", target.id)
    .eq("role", "superadmin")
    .maybeSingle();

  if (targetSuperadmin) {
    return res.status(400).json({ error: "Superadmin accounts can only be managed via SQL" });
  }

  // ── 6. Perform the action ──────────────────────────────────────────────────
  if (action === "promote") {
    const { error } = await db
      .from("user_roles")
      .upsert({ user_id: target.id, role: "admin" }, { onConflict: "user_id,role" });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, message: `${email} is now an admin` });
  }

  if (action === "demote") {
    const { error } = await db
      .from("user_roles")
      .delete()
      .eq("user_id", target.id)
      .eq("role", "admin");
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, message: `${email} admin role removed` });
  }
}

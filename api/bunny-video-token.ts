import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

function supabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const videoId = req.query.videoId as string;
  const courseId = req.query.courseId as string;
  const courseSlug = req.query.courseSlug as string | undefined;

  if (!videoId || !courseId) {
    return res.status(400).json({ error: "Missing videoId or courseId" });
  }

  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const accessToken = authHeader.slice(7);

  const db = supabaseAdmin();
  const { data: { user }, error: authError } = await db.auth.getUser(accessToken);
  if (authError || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Check enrollment: product_id matches courseId OR courseSlug, with active status
  const productIds = [courseId, courseSlug].filter(Boolean) as string[];
  const [{ data: order }, { data: adminRole }] = await Promise.all([
    db
      .from("orders")
      .select("id")
      .eq("user_id", user.id)
      .eq("order_type", "course")
      .in("product_id", productIds)
      .in("status", ["confirmed", "shipped", "delivered"])
      .maybeSingle(),
    db
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle(),
  ]);

  if (!order && !adminRole) {
    return res.status(403).json({ error: "Not enrolled" });
  }

  const libraryId = process.env.BUNNY_LIBRARY_ID;
  const tokenKey = process.env.BUNNY_TOKEN_KEY;

  if (!libraryId || !tokenKey) {
    return res.status(500).json({ error: "Bunny not configured" });
  }

  // Token expires in 4 hours — long enough for a full watch session
  const expiration = Math.floor(Date.now() / 1000) + 14400;
  const hash = createHash("sha256")
    .update(`${tokenKey}${videoId}${expiration}`)
    .digest("hex");

  const embedUrl =
    `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}` +
    `?token=${hash}&expires=${expiration}&autoplay=false&preload=true`;

  return res.status(200).json({ url: embedUrl });
}

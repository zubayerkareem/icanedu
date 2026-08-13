// Sends a product order to Steadfast Courier and saves the tracking info back to the order.
// POST /api/send-to-courier
// Auth: Bearer <supabase_access_token>
// Body: { orderId: string; note?: string; delivery_type?: 0 | 1 }

import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // ── Auth ──────────────────────────────────────────────────────────────────────
  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const accessToken = authHeader.slice(7);

  const db = supabaseAdmin();
  const { data: { user }, error: authError } = await db.auth.getUser(accessToken);
  if (authError || !user) return res.status(401).json({ error: "Unauthorized" });

  // Admin-only
  const { data: adminRole } = await db
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!adminRole) return res.status(403).json({ error: "Admin only" });

  // ── Body ──────────────────────────────────────────────────────────────────────
  const { orderId, note, delivery_type } = req.body ?? {};
  if (!orderId) return res.status(400).json({ error: "orderId required" });

  // ── Fetch order ───────────────────────────────────────────────────────────────
  const { data: order, error: orderError } = await db
    .from("orders")
    .select("id, customer_name, phone, address, total_price, product_name, courier_consignment_id")
    .eq("id", orderId)
    .eq("order_type", "product")
    .maybeSingle();

  if (orderError || !order) {
    return res.status(404).json({ error: "Order not found" });
  }
  if (order.courier_consignment_id) {
    return res.status(409).json({ error: "Order already sent to courier", consignment_id: order.courier_consignment_id });
  }

  // ── Fetch Steadfast API keys from site_settings ───────────────────────────────
  const { data: settings } = await db
    .from("site_settings")
    .select("key, value")
    .in("key", ["steadfast_api_key", "steadfast_secret_key"]);

  const apiKey    = settings?.find((s: any) => s.key === "steadfast_api_key")?.value ?? "";
  const secretKey = settings?.find((s: any) => s.key === "steadfast_secret_key")?.value ?? "";

  if (!apiKey || !secretKey) {
    return res.status(500).json({ error: "Steadfast API keys not configured. Set them in Admin → Settings." });
  }

  // ── Call Steadfast API ────────────────────────────────────────────────────────
  const payload = {
    invoice:          order.id,
    recipient_name:   order.customer_name,
    recipient_phone:  order.phone,
    recipient_address: order.address ?? "N/A",
    cod_amount:       order.total_price,
    item_description: order.product_name,
    note:             note ?? "",
    delivery_type:    delivery_type ?? 0,
  };

  let sfData: any;
  try {
    const sfRes = await fetch("https://portal.packzy.com/api/v1/create_order", {
      method:  "POST",
      headers: {
        "Api-Key":      apiKey,
        "Secret-Key":   secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    sfData = await sfRes.json();

    // Steadfast returns { status: 200, message: "...", consignment: { consignment_id, tracking_code, ... } }
    if (!sfRes.ok || sfData?.status !== 200) {
      const msg = sfData?.message ?? `Steadfast error (HTTP ${sfRes.status})`;
      return res.status(502).json({ error: msg });
    }
  } catch (err: any) {
    return res.status(502).json({ error: `Failed to reach Steadfast: ${err.message}` });
  }

  const consignment   = sfData?.consignment ?? {};
  const consignment_id  = String(consignment.consignment_id ?? "");
  const tracking_code   = String(consignment.tracking_code   ?? "");

  // ── Save tracking info back to order ─────────────────────────────────────────
  const { error: updateError } = await db
    .from("orders")
    .update({
      courier_consignment_id: consignment_id,
      courier_tracking_code:  tracking_code,
      courier_status:         "in_review",
    })
    .eq("id", orderId);

  if (updateError) {
    // Still return success — courier created, just couldn't save locally
    console.error("Failed to update order with courier info", updateError);
  }

  return res.status(200).json({
    consignment_id,
    tracking_code,
    status: "in_review",
  });
}

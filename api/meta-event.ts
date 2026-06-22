import { createClient } from "@supabase/supabase-js";

const GRAPH_API = "https://graph.facebook.com/v21.0";

function supabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function sha256Hex(val: string): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createHash } = require("crypto") as typeof import("crypto");
  return createHash("sha256").update(val.trim().toLowerCase()).digest("hex");
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Read pixel ID and CAPI token from DB (service role bypasses RLS — token never exposed to browser)
  const db = supabaseAdmin();
  const [{ data: pixelRow }, { data: tokenRow }] = await Promise.all([
    db.from("site_settings").select("value").eq("key", "meta_pixel_id").maybeSingle(),
    db.from("site_settings").select("value").eq("key", "meta_capi_token").maybeSingle(),
  ]);

  const pixelId  = pixelRow?.value  || (req.body?.pixelId as string | undefined);
  const capiToken = tokenRow?.value || process.env.META_CAPI_TOKEN; // env var as fallback

  const { eventName, eventId, sourceUrl, customData } = req.body ?? {};

  if (!capiToken || !pixelId || !eventName) {
    return res.status(200).json({ ok: false, reason: "not configured" });
  }

  const ip        = ((req.headers["x-forwarded-for"] as string) ?? "").split(",")[0]?.trim();
  const userAgent = (req.headers["user-agent"] as string) ?? "";

  const userData: Record<string, string> = {};
  if (ip)        userData.client_ip_address = ip;
  if (userAgent) userData.client_user_agent = userAgent;

  const body = req.body as { email?: string; phone?: string } & typeof req.body;
  if (body.email) userData.em = sha256Hex(body.email);
  if (body.phone) userData.ph = sha256Hex(body.phone.replace(/\D/g, ""));

  const eventPayload: Record<string, unknown> = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: sourceUrl ?? "",
    event_id: eventId ?? "",
    action_source: "website",
    user_data: userData,
    custom_data: customData ?? {},
  };

  const graphBody: Record<string, unknown> = { data: [eventPayload] };
  const testCode = process.env.META_TEST_EVENT_CODE;
  if (testCode) graphBody.test_event_code = testCode;

  try {
    const response = await fetch(
      `${GRAPH_API}/${pixelId}/events?access_token=${capiToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(graphBody),
      },
    );
    const json = (await response.json()) as Record<string, unknown>;
    if (!response.ok) console.error("[meta-event] CAPI error:", json);
    return res.status(200).json({ ok: response.ok, result: json });
  } catch (err: unknown) {
    console.error("[meta-event] fetch error:", (err as Error).message);
    return res.status(200).json({ ok: false, error: (err as Error).message });
  }
}

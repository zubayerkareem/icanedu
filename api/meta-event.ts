const GRAPH_API = "https://graph.facebook.com/v21.0";

function sha256Hex(val: string): string {
  // Node.js built-in
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createHash } = require("crypto") as typeof import("crypto");
  return createHash("sha256").update(val.trim().toLowerCase()).digest("hex");
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const capiToken = process.env.META_CAPI_TOKEN;
  const { pixelId, eventName, eventId, sourceUrl, customData } = req.body ?? {};

  // Silent skip — admin hasn't configured CAPI yet
  if (!capiToken || !pixelId || !eventName) {
    return res.status(200).json({ ok: false, reason: "not configured" });
  }

  const ip = ((req.headers["x-forwarded-for"] as string) ?? "").split(",")[0]?.trim();
  const userAgent = (req.headers["user-agent"] as string) ?? "";

  // Hashed user data for better audience matching
  const userData: Record<string, string> = {};
  if (ip)        userData.client_ip_address = ip;
  if (userAgent) userData.client_user_agent = userAgent;

  // If caller sends email or phone for hashing (future extension)
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
    if (!response.ok) {
      console.error("[meta-event] CAPI error:", json);
    }
    return res.status(200).json({ ok: response.ok, result: json });
  } catch (err: unknown) {
    console.error("[meta-event] fetch error:", (err as Error).message);
    return res.status(200).json({ ok: false, error: (err as Error).message });
  }
}

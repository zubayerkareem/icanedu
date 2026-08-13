// Verifies a Cloudflare Turnstile token server-side.
// Called from Login and Register before the Supabase auth call.

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { token } = req.body ?? {};
  if (!token) return res.status(400).json({ success: false, error: "No token provided" });

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Key not configured (local dev without env) — fail open with a warning
    console.warn("TURNSTILE_SECRET_KEY not set — skipping server verification");
    return res.status(200).json({ success: true });
  }

  try {
    const body = new URLSearchParams({ secret, response: token });
    const cfRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    );
    const data = await cfRes.json();
    return res.status(200).json({ success: !!data.success });
  } catch (err) {
    console.error("Turnstile verify error", err);
    return res.status(500).json({ success: false, error: "Verification failed" });
  }
}

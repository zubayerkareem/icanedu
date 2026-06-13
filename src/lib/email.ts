// Frontend helper — calls the Vercel serverless function at /api/send-email.
// Never put credentials here; they live in .env server-side only.

import { toast } from "sonner";

async function post(body: object) {
  try {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      console.error("[email] API error", res.status, err);
      toast.warning(`ইমেইল পাঠানো যায়নি (${res.status}): ${err.error ?? res.statusText}`);
    }
  } catch (e) {
    console.error("[email] Network error:", e);
  }
}

export function sendPurchaseEmail(userId: string, data: {
  name: string;
  productName: string;
  orderType: "course" | "product";
  amount: number;
}) {
  return post({ type: "purchase", userId, data });
}

export function sendShippedEmail(userId: string, data: {
  name: string;
  productName: string;
}) {
  return post({ type: "shipped", userId, data });
}

export function sendNoticeEmail(data: {
  title: string;
  content: string;
}) {
  return post({ type: "notice", data });
}

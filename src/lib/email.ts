// Frontend helper — calls the Vercel serverless function at /api/send-email.
// Never put credentials here; they live in .env server-side only.

async function post(body: object) {
  const res = await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.warn("[email]", err.error ?? res.statusText);
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

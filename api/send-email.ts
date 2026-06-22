import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase admin client (service role) ─────────────────────

function supabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars (VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function getUserEmail(userId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin().auth.admin.getUserById(userId);
  if (error || !data.user) return null;
  return data.user.email ?? null;
}

async function getAllUserEmails(): Promise<string[]> {
  const { data, error } = await supabaseAdmin().auth.admin.listUsers({ perPage: 1000 });
  if (error || !data) return [];
  return data.users.map((u) => u.email).filter(Boolean) as string[];
}

// ─── Email templates ──────────────────────────────────────────

function baseLayout(content: string) {
  return `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #f4f4f5; font-family: Arial, sans-serif; }
    .wrapper { max-width: 560px; margin: 32px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7; }
    .header { background: #16a34a; padding: 24px 32px; }
    .header h1 { margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; }
    .body { padding: 28px 32px; color: #18181b; line-height: 1.6; }
    .body h2 { margin-top: 0; font-size: 18px; color: #16a34a; }
    .body p { font-size: 15px; color: #3f3f46; }
    .info-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
    .info-box p { margin: 6px 0; font-size: 14px; }
    .info-box strong { color: #15803d; }
    .btn { display: inline-block; margin-top: 20px; padding: 12px 28px; background: #16a34a; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; }
    .footer { padding: 20px 32px; background: #fafafa; border-top: 1px solid #e4e4e7; font-size: 12px; color: #a1a1aa; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>iCANBD Academy</h1></div>
    <div class="body">${content}</div>
    <div class="footer">
      iCANBD Academy &bull; Farmgate, Dhaka &bull;
      <a href="https://www.icanbd.com" style="color:#16a34a;">icanbd.com</a>
    </div>
  </div>
</body>
</html>`;
}

function purchaseTemplate(data: { name: string; productName: string; orderType: string; amount: number }) {
  const typeLabel = data.orderType === "course" ? "কোর্স" : "পণ্য";
  return {
    subject: `✅ অর্ডার কনফার্ম হয়েছে — ${data.productName}`,
    html: baseLayout(`
      <h2>অর্ডার কনফার্ম হয়েছে!</h2>
      <p>প্রিয় <strong>${data.name}</strong>,</p>
      <p>আপনার অর্ডার সফলভাবে কনফার্ম হয়েছে। নিচে বিস্তারিত দেখুন:</p>
      <div class="info-box">
        <p><strong>অর্ডার:</strong> ${data.productName}</p>
        <p><strong>ধরন:</strong> ${typeLabel}</p>
        <p><strong>মোট পরিমাণ:</strong> ৳${data.amount}</p>
        <p><strong>স্ট্যাটাস:</strong> কনফার্ম ✅</p>
      </div>
      <p>${data.orderType === "course" ? "আপনার কোর্স এখন অ্যাক্সেসযোগ্য।" : "আপনার পণ্য শীঘ্রই পাঠানো হবে।"}</p>
      <a href="https://www.icanbd.com/dashboard" class="btn">ড্যাশবোর্ড দেখুন</a>
    `),
  };
}

function shippedTemplate(data: { name: string; productName: string }) {
  return {
    subject: `📦 আপনার পণ্য পাঠানো হয়েছে — ${data.productName}`,
    html: baseLayout(`
      <h2>পণ্য পাঠানো হয়েছে!</h2>
      <p>প্রিয় <strong>${data.name}</strong>,</p>
      <p>আপনার <strong>${data.productName}</strong> পাঠানো হয়েছে। শীঘ্রই আপনার কাছে পৌঁছাবে।</p>
      <div class="info-box">
        <p><strong>পণ্য:</strong> ${data.productName}</p>
        <p><strong>স্ট্যাটাস:</strong> পাঠানো হয়েছে 📦</p>
      </div>
      <p>কোনো সমস্যা হলে আমাদের সাথে যোগাযোগ করুন।</p>
      <a href="https://www.icanbd.com/dashboard/orders" class="btn">অর্ডার দেখুন</a>
    `),
  };
}

function orderReceivedTemplate(data: { name: string; productName: string; orderType: string; amount: number; bkashTxnId: string }) {
  const typeLabel = data.orderType === "course" ? "কোর্স" : "পণ্য";
  return {
    subject: `🛒 অর্ডার পাওয়া গেছে — ${data.productName}`,
    html: baseLayout(`
      <h2>অর্ডার পেয়েছি!</h2>
      <p>প্রিয় <strong>${data.name}</strong>,</p>
      <p>আপনার অর্ডার আমরা পেয়েছি। পেমেন্ট যাচাই হলে শীঘ্রই কনফার্ম করা হবে।</p>
      <div class="info-box">
        <p><strong>অর্ডার:</strong> ${data.productName}</p>
        <p><strong>ধরন:</strong> ${typeLabel}</p>
        <p><strong>মোট পরিমাণ:</strong> ৳${data.amount}</p>
        <p><strong>bKash TxnID:</strong> ${data.bkashTxnId}</p>
        <p><strong>স্ট্যাটাস:</strong> যাচাই হচ্ছে ⏳</p>
      </div>
      <p>সাধারণত ২৪ ঘণ্টার মধ্যে পেমেন্ট যাচাই করা হয়। কোনো সমস্যা হলে আমাদের সাথে যোগাযোগ করুন।</p>
      <a href="https://www.icanbd.com/dashboard" class="btn">ড্যাশবোর্ড দেখুন</a>
    `),
  };
}

function noticeTemplate(data: { title: string; content: string }) {
  const plain = data.content.replace(/<[^>]*>/g, "").slice(0, 300);
  return {
    subject: `📢 নতুন নোটিশ: ${data.title}`,
    html: baseLayout(`
      <h2>নতুন নোটিশ</h2>
      <p>iCANBD Academy-র পক্ষ থেকে একটি নতুন নোটিশ প্রকাশিত হয়েছে:</p>
      <div class="info-box">
        <p><strong>${data.title}</strong></p>
        <p>${plain}${data.content.length > 300 ? "..." : ""}</p>
      </div>
      <a href="https://www.icanbd.com/notices" class="btn">সম্পূর্ণ নোটিশ দেখুন</a>
    `),
  };
}

// ─── Handler ──────────────────────────────────────────────────

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Validate Gmail env vars on every request (not at module init)
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    console.error("[send-email] Missing env vars: GMAIL_USER or GMAIL_APP_PASSWORD not set in Vercel");
    return res.status(500).json({ error: "Email not configured — missing GMAIL_USER or GMAIL_APP_PASSWORD" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailPass },
  });

  const { type, userId, data } = req.body ?? {};

  if (!type) return res.status(400).json({ error: "Missing type" });

  try {
    if (type === "order_received") {
      if (!userId) return res.status(400).json({ error: "Missing userId" });

      const email = await getUserEmail(userId);
      if (!email) return res.status(404).json({ error: `User email not found for userId: ${userId}` });

      const template = orderReceivedTemplate(data);

      await transporter.sendMail({
        from: `"iCANBD Academy" <${gmailUser}>`,
        to: email,
        subject: template.subject,
        html: template.html,
      });

      console.log(`[send-email] order_received email sent to ${email}`);
      return res.status(200).json({ ok: true, sent: 1 });
    }

    if (type === "purchase" || type === "shipped") {
      if (!userId) return res.status(400).json({ error: "Missing userId" });

      const email = await getUserEmail(userId);
      if (!email) return res.status(404).json({ error: `User email not found for userId: ${userId}` });

      const template = type === "purchase"
        ? purchaseTemplate(data)
        : shippedTemplate(data);

      await transporter.sendMail({
        from: `"iCANBD Academy" <${gmailUser}>`,
        to: email,
        subject: template.subject,
        html: template.html,
      });

      console.log(`[send-email] ${type} email sent to ${email}`);
      return res.status(200).json({ ok: true, sent: 1 });
    }

    if (type === "notice") {
      const emails = await getAllUserEmails();
      if (emails.length === 0) {
        console.warn("[send-email] No user emails found for notice broadcast");
        return res.status(200).json({ ok: true, sent: 0 });
      }

      const template = noticeTemplate(data);

      // Send sequentially to avoid SMTP connection limits
      let sent = 0;
      for (const email of emails) {
        try {
          await transporter.sendMail({
            from: `"iCANBD Academy" <${gmailUser}>`,
            to: email,
            subject: template.subject,
            html: template.html,
          });
          sent++;
        } catch (e: any) {
          console.error(`[send-email] Failed to send notice to ${email}:`, e.message);
        }
      }

      console.log(`[send-email] Notice sent to ${sent}/${emails.length} users`);
      return res.status(200).json({ ok: true, sent });
    }

    return res.status(400).json({ error: "Unknown type" });
  } catch (err: any) {
    console.error("[send-email] Error:", err.message);
    return res.status(500).json({ error: err.message ?? "Failed to send email" });
  }
}

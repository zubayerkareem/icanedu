import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function baseLayout(content: string) {
  return `
<!DOCTYPE html>
<html lang="en">
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
      <a href="https://icanbd.com" style="color:#16a34a;">icanbd.com</a>
    </div>
  </div>
</body>
</html>`;
}

function welcomeTemplate(data: { name: string; email: string; password: string; courseName?: string }) {
  const displayName = data.name || data.email;
  return {
    subject: `🎓 Welcome to iCANBD Academy — Your Login Details`,
    html: baseLayout(`
      <h2>Welcome to iCANBD Academy!</h2>
      <p>Dear <strong>${displayName}</strong>,</p>
      <p>Your account has been created successfully. Here are your login credentials:</p>
      <div class="info-box">
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Password:</strong> ${data.password}</p>
        ${data.courseName ? `<p><strong>Enrolled Course:</strong> ${data.courseName}</p>` : ""}
      </div>
      <p>Please login and change your password after your first login for security.</p>
      <a href="https://icanbd.com/auth/login" class="btn">Login Now</a>
    `),
  };
}

export interface ImportRow {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  course_id?: string;
  valid_until?: string;
}

export interface ImportResult {
  email: string;
  success: boolean;
  error?: string;
  emailSent?: boolean;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { rows } = req.body ?? {};
  if (!Array.isArray(rows) || rows.length === 0)
    return res.status(400).json({ error: "No rows provided" });

  const db = supabaseAdmin();
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  const transporter =
    gmailUser && gmailPass
      ? nodemailer.createTransport({ service: "gmail", auth: { user: gmailUser, pass: gmailPass } })
      : null;

  const results: ImportResult[] = [];

  for (const row of rows as ImportRow[]) {
    const { full_name, email, phone, password, course_id, valid_until } = row;

    if (!email?.trim() || !password?.trim()) {
      results.push({ email: email || "(missing)", success: false, error: "Email and password are required" });
      continue;
    }

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await db.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password: password.trim(),
        email_confirm: true,
        user_metadata: { full_name: full_name?.trim() || null },
      });

      if (authError) {
        results.push({ email, success: false, error: authError.message });
        continue;
      }

      const userId = authData.user.id;

      // 2. Update profile with full_name, phone, and mark as admin_created
      await db
        .from("profiles")
        .update({
          full_name: full_name?.trim() || null,
          phone: phone?.trim() || null,
          source: "admin_created",
        })
        .eq("id", userId);

      // 3. Enroll in course if provided
      let courseName: string | undefined;
      if (course_id?.trim()) {
        const { data: course } = await db
          .from("courses")
          .select("title")
          .eq("id", course_id.trim())
          .single();
        courseName = course?.title;

        await db.from("orders").insert({
          user_id: userId,
          order_type: "course",
          product_id: course_id.trim(),
          product_name: courseName || "Course",
          product_price: 0,
          customer_name: courseName || "Course",
          phone: "",
          shipping_cost: 0,
          total_price: 0,
          status: "confirmed",
          valid_until: valid_until?.trim() || null,
        });
      }

      // 4. Send welcome email
      let emailSent = false;
      if (transporter) {
        try {
          const template = welcomeTemplate({
            name: full_name?.trim() || "",
            email: email.trim().toLowerCase(),
            password: password.trim(),
            courseName,
          });
          await transporter.sendMail({
            from: `"iCANBD Academy" <${gmailUser}>`,
            to: email.trim().toLowerCase(),
            subject: template.subject,
            html: template.html,
          });
          emailSent = true;
        } catch (e: any) {
          console.error(`[import-users] Email failed for ${email}:`, e.message);
        }
      }

      results.push({ email, success: true, emailSent });
    } catch (e: any) {
      results.push({ email, success: false, error: e.message });
    }
  }

  const created = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const emailsSent = results.filter((r) => r.emailSent).length;

  console.log(`[import-users] Done: ${created} created, ${failed} failed, ${emailsSent} emails sent`);
  return res.status(200).json({ results, created, failed, emailsSent });
}

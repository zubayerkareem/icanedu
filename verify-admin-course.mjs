import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const BASE = "http://localhost:8080";
const SHOTS = "verify-screenshots";
fs.mkdirSync(SHOTS, { recursive: true });

const shot = async (page, name) => {
  const p = path.join(SHOTS, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  console.log(`📸 ${name} → ${p}`);
  return p;
};

const browser = await chromium.launch({ headless: false, slowMo: 200 });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

try {
  // ── 1. Login ──────────────────────────────────────────────────────────────
  console.log("\n[1] Navigating to login…");
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await shot(page, "01-login");

  await page.fill('input[type="email"], input[name="email"]', "hellozubayer@gmail.com");
  await page.fill('input[type="password"], input[name="password"]', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|admin|\/$/, { timeout: 10000 });
  await shot(page, "02-after-login");
  console.log("✅ Logged in → " + page.url());

  // ── 2. Navigate to admin courses ─────────────────────────────────────────
  console.log("\n[2] Opening admin courses…");
  await page.goto(`${BASE}/admin/courses`, { waitUntil: "networkidle" });
  await shot(page, "03-admin-courses-list");
  console.log("✅ Admin courses page loaded");

  // ── 3. Click "নতুন কোর্স" ────────────────────────────────────────────────
  console.log("\n[3] Clicking New Course…");
  await page.click('button:has-text("নতুন কোর্স")');
  await page.waitForURL(/\/admin\/courses\/new/, { timeout: 5000 });
  await shot(page, "04-course-editor-basic");
  console.log("✅ CourseEditor opened at " + page.url());

  // ── 4. Fill Basic tab ────────────────────────────────────────────────────
  console.log("\n[4] Filling Basic tab…");
  await page.fill('input[placeholder="কোর্সের নাম"]', "ISSB Regular Programme");
  await page.fill('input[placeholder="ISSB, Cadet..."]', "ISSB");
  await page.fill('input[placeholder="৮ সপ্তাহ / ৪৮ দিন"]', "৮ সপ্তাহ / ৪৮ দিন");
  await page.fill('textarea[placeholder*="ISSB"]', "৮ সপ্তাহে সম্পূর্ণ ISSB প্রস্তুতি — ইনডোর ৫০% + আউটডোর ৫০%।");
  // Teacher name
  await page.fill('input[placeholder*="মেজর"]', "মেজর (অব.) আরিফ হোসেন");
  await page.fill('input[placeholder*="ISSB পরামর্শদাতা"]', "ISSB পরামর্শদাতা");
  await shot(page, "05-basic-filled");
  console.log("✅ Basic tab filled");

  // ── 5. Pricing & Coupons tab ─────────────────────────────────────────────
  console.log("\n[5] Switching to Pricing tab…");
  await page.click('button[role="tab"]:has-text("মূল্য ও কুপন")');
  await page.waitForTimeout(400);
  await page.fill('input[placeholder="9000"]', "9000");
  await page.fill('input[placeholder="ঐচ্ছিক"]', "6000");

  // Add a coupon
  await page.click('button:has-text("কুপন")');
  await page.waitForTimeout(300);
  await page.fill('input[placeholder="SAVE20"]', "SAVE20");
  // Type = percent (already default), value = 20
  await page.fill('input[placeholder="20"]', "20");
  // Max uses
  const maxInputs = await page.locator('input[type="number"]').all();
  // max_uses is the 5th number input in the coupon row
  await shot(page, "06-pricing-coupons");
  console.log("✅ Pricing & coupon filled");

  // ── 6. Overview tab ──────────────────────────────────────────────────────
  console.log("\n[6] Switching to Overview tab…");
  await page.click('button[role="tab"]:has-text("ওভারভিউ")');
  await page.waitForTimeout(400);

  // Add a highlight_item
  const highlightAddBtn = page.locator('button:has-text("আইটেম")').first();
  await highlightAddBtn.click();
  await page.waitForTimeout(300);
  const highlightInput = page.locator('input[placeholder="১০৪ ঘণ্টা ক্লাস"]').first();
  await highlightInput.fill("১০৪ ঘণ্টা ক্লাস (ইনডোর ৫০% + আউটডোর ৫০%)");

  // Add a feature_item
  const featureAddBtn = page.locator('button:has-text("আইটেম")').nth(1);
  await featureAddBtn.click();
  await page.waitForTimeout(300);
  const featureInput = page.locator('input[placeholder="৪৮ ভিডিও লেসন"]').first();
  await featureInput.fill("৪৮ ভিডিও লেসন");

  await shot(page, "07-overview");
  console.log("✅ Overview filled");

  // ── 7. Curriculum tab ────────────────────────────────────────────────────
  console.log("\n[7] Building curriculum…");
  await page.click('button[role="tab"]:has-text("কারিকুলাম")');
  await page.waitForTimeout(400);

  // Module 1
  await page.click('button:has-text("মডিউল যোগ করুন")');
  await page.waitForTimeout(300);
  const mod1TitleInput = page.locator('input[placeholder*="মডিউলের শিরোনাম"]').first();
  await mod1TitleInput.fill("শুরুর কথা ও পরিচিতি");
  const durationInput = page.locator('input[placeholder="১ ঘণ্টা ২০ মিনিট"]').first();
  await durationInput.fill("১ ঘণ্টা ২০ মিনিট");

  // Lesson 1 (video)
  await page.click('button:has-text("লেসন যোগ করুন")');
  await page.waitForTimeout(300);
  const lesson1Title = page.locator('input[placeholder="লেসনের শিরোনাম"]').first();
  await lesson1Title.fill("কোর্স পরিচিতি");
  const lesson1Duration = page.locator('input[placeholder*="০৮:১২"]').first();
  await lesson1Duration.fill("০৮:১২");
  // Mark lesson 1 free
  const freeSwitches = await page.locator('label:has-text("ফ্রি") input[role="switch"], button[role="switch"]').all();
  if (freeSwitches.length > 0) await freeSwitches[0].click();
  // Fill YouTube URL
  const videoUrlInput = page.locator('input[placeholder*="youtube"]').first();
  await videoUrlInput.fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

  // Lesson 2 (pdf)
  await page.click('button:has-text("লেসন যোগ করুন")');
  await page.waitForTimeout(300);
  const lesson2Titles = await page.locator('input[placeholder="লেসনের শিরোনাম"]').all();
  await lesson2Titles[lesson2Titles.length - 1].fill("প্রয়োজনীয় গাইড (PDF)");
  // Switch type to pdf
  const typeSelects = await page.locator('select, [role="combobox"]').all();
  // Find the lesson type selector for lesson 2
  const lastTypeSelect = page.locator('[role="combobox"]').last();
  await lastTypeSelect.click();
  await page.waitForTimeout(200);
  await page.locator('[role="option"]:has-text("PDF")').click();
  await page.waitForTimeout(200);

  // Module 2
  await page.click('button:has-text("মডিউল যোগ করুন")');
  await page.waitForTimeout(300);
  const mod2TitleInputs = await page.locator('input[placeholder*="মডিউলের শিরোনাম"]').all();
  await mod2TitleInputs[mod2TitleInputs.length - 1].fill("মূল ভিত্তি গড়ে তোলা");

  await page.click('button:has-text("লেসন যোগ করুন")');
  await page.waitForTimeout(300);
  const l3Titles = await page.locator('input[placeholder="লেসনের শিরোনাম"]').all();
  await l3Titles[l3Titles.length - 1].fill("মৌলিক ধারণা");
  const videoUrls = await page.locator('input[placeholder*="youtube"]').all();
  if (videoUrls.length > 0) await videoUrls[videoUrls.length - 1].fill("https://www.youtube.com/watch?v=abcdefghijk");

  await page.click('button:has-text("লেসন যোগ করুন")');
  await page.waitForTimeout(300);
  const l4Titles = await page.locator('input[placeholder="লেসনের শিরোনাম"]').all();
  await l4Titles[l4Titles.length - 1].fill("অনুশীলন — প্রথম পর্ব");

  await shot(page, "08-curriculum");
  console.log("✅ Curriculum built (2 modules, 4 lessons)");

  // ── 8. Save ───────────────────────────────────────────────────────────────
  console.log("\n[8] Saving the course…");
  await page.click('button:has-text("সংরক্ষণ")');
  await page.waitForURL(/\/admin\/courses$/, { timeout: 10000 });
  await page.waitForTimeout(800);
  await shot(page, "09-after-save-list");
  console.log("✅ Saved → redirected to list at " + page.url());

  // ── 9. Verify course in list ──────────────────────────────────────────────
  const courseTitle = await page.locator('text="ISSB Regular Programme"').first();
  const visible = await courseTitle.isVisible();
  console.log(visible ? "✅ Course appears in admin list" : "❌ Course NOT found in list");
  await shot(page, "10-course-in-list");

  // ── 10. Navigate to public detail page ───────────────────────────────────
  console.log("\n[10] Checking public course detail…");
  // Get slug from URL or find the course row
  const editBtn = page.locator('tr:has-text("ISSB Regular Programme") button').first();
  await editBtn.click();
  await page.waitForURL(/\/admin\/courses\/.+\/edit/, { timeout: 5000 });
  const editUrl = page.url();
  const courseId = editUrl.match(/\/admin\/courses\/([^/]+)\/edit/)?.[1];
  console.log("Course ID:", courseId);

  await page.goto(`${BASE}/courses/issb-regular-programme`, { waitUntil: "networkidle" });
  if (page.url().includes("issb-regular-programme") || page.url().includes(courseId)) {
    await shot(page, "11-public-detail");
    console.log("✅ Public detail page loaded");
  } else {
    // try by ID
    await page.goto(`${BASE}/courses/${courseId}`, { waitUntil: "networkidle" });
    await shot(page, "11-public-detail");
    console.log("✅ Public detail (by ID) loaded");
  }

  // ── 11. Verify coupon input ───────────────────────────────────────────────
  const couponInput = page.locator('input[placeholder="কুপন কোড"]');
  const couponVisible = await couponInput.isVisible();
  console.log(couponVisible ? "✅ Coupon input visible" : "❌ Coupon input NOT visible");

  if (couponVisible) {
    await couponInput.fill("SAVE20");
    await page.click('button:has-text("প্রয়োগ")');
    await page.waitForTimeout(600);
    await shot(page, "12-coupon-applied");
    const success = await page.locator('text="কুপন প্রয়োগ হয়েছে"').isVisible();
    console.log(success ? "✅ Coupon applied successfully" : "⚠️ Coupon success message not found");
  }

  // ── 12. Free lesson link ──────────────────────────────────────────────────
  await page.click('text="কোর্স কারিকুলাম"').catch(() => {});
  const freeLink = page.locator('a:has-text("ফ্রি"), .text-success:has-text("ফ্রি")').first();
  const freeLinkVisible = await freeLink.isVisible().catch(() => false);
  console.log(freeLinkVisible ? "✅ Free lesson badge/link visible" : "ℹ️ Free lesson badge not found (may need accordion open)");
  await shot(page, "13-final-detail");

  console.log("\n🎉 DONE — all screenshots in", SHOTS);

} catch (err) {
  console.error("❌ Error:", err.message);
  await shot(page, "error-state").catch(() => {});
  process.exit(1);
} finally {
  await page.waitForTimeout(1500);
  await browser.close();
}

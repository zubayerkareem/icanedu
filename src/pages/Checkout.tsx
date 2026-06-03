import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ShoppingBag, BookOpen, Truck, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const BKASH_NUMBER = "01894734002";

const SHIPPING = {
  inside:  { label: "ঢাকার ভেতরে",  cost: 60  },
  outside: { label: "ঢাকার বাইরে",  cost: 100 },
} as const;
type ShippingKey = keyof typeof SHIPPING;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
    >
      {copied
        ? <><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> কপি হয়েছে</>
        : <><Copy className="h-3.5 w-3.5" /> কপি করুন</>}
    </button>
  );
}

export default function Checkout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const orderType   = (params.get("type") ?? "product") as "product" | "course";
  const isCourse    = orderType === "course";
  const itemId      = params.get(isCourse ? "courseId"   : "productId") ?? "";
  const itemName    = params.get(isCourse ? "courseName" : "productName") ?? (isCourse ? "কোর্স" : "পণ্য");
  const itemPrice   = Number(params.get("price") ?? 0);
  const couponCode  = params.get("coupon") ?? null;

  const [name,       setName]       = useState("");
  const [phone,      setPhone]      = useState("");
  const [address,    setAddress]    = useState("");
  const [shipping,   setShipping]   = useState<ShippingKey>("inside");
  const [bkashTxnId, setBkashTxnId] = useState("");
  const [bkashPhone, setBkashPhone] = useState("");
  const [loading,    setLoading]    = useState(false);
  const [errors,     setErrors]     = useState<Record<string, string>>({});

  const shippingCost = isCourse ? 0 : SHIPPING[shipping].cost;
  const total        = itemPrice + shippingCost;

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim())  e.name  = "নাম প্রয়োজন";
    if (!phone.trim()) e.phone = "ফোন নম্বর প্রয়োজন";
    else if (!/^01[3-9]\d{8}$/.test(phone.trim())) e.phone = "সঠিক ফোন নম্বর দিন";
    if (!isCourse && !address.trim()) e.address = "সম্পূর্ণ ঠিকানা প্রয়োজন";
    if (isCourse) {
      if (!bkashTxnId.trim()) e.bkashTxnId = "ট্রানজেকশন আইডি লিখুন";
      if (!bkashPhone.trim()) e.bkashPhone = "bKash নম্বর লিখুন";
      else if (!/^01[3-9]\d{8}$/.test(bkashPhone.trim())) e.bkashPhone = "সঠিক bKash নম্বর দিন";
    }
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const order = {
      user_id:       user?.id ?? null,
      order_type:    orderType,
      product_id:    itemId || null,
      product_name:  itemName,
      product_price: itemPrice,
      customer_name: name.trim(),
      phone:         phone.trim(),
      address:       isCourse ? null : address.trim(),
      shipping_type: isCourse ? null  : shipping,
      shipping_cost: shippingCost,
      total_price:   total,
      coupon_code:   couponCode,
      bkash_txn_id:  isCourse ? bkashTxnId.trim() : null,
      bkash_number:  isCourse ? bkashPhone.trim()  : null,
      status:        "pending",
    };

    const { error } = await supabase.from("orders").insert([order]);
    setLoading(false);

    if (error) {
      toast.error("অর্ডার সম্পন্ন হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
      return;
    }

    if (isCourse && couponCode && itemId) {
      supabase.rpc("increment_coupon_use", {
        p_course_id: itemId,
        p_code: couponCode,
      }).then(() => {}).catch(() => {});
    }

    navigate(isCourse ? "/thank-you?type=course" : "/thank-you");
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/30">
        <div className="container py-4">
          <nav className="text-sm text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link to="/" className="hover:text-foreground">হোম</Link></li>
              <li aria-hidden>›</li>
              <li>
                <Link to={isCourse ? "/courses" : "/products"} className="hover:text-foreground">
                  {isCourse ? "কোর্সসমূহ" : "প্রোডাক্ট"}
                </Link>
              </li>
              <li aria-hidden>›</li>
              <li className="text-foreground">চেকআউট</li>
            </ol>
          </nav>
        </div>
      </div>

      <section className="container py-8 sm:py-12">
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
          <Link to={itemId ? `/${isCourse ? "courses" : "products"}/${itemId}` : (isCourse ? "/courses" : "/products")}>
            <ChevronLeft className="mr-1 h-4 w-4" /> ফিরে যান
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Form */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                {isCourse ? "কোর্স নিবন্ধন" : "অর্ডার করুন"}
              </h1>
              {isCourse && (
                <Badge className="bg-accent/10 text-accent">
                  <BookOpen className="mr-1 h-3 w-3" /> কোর্স
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">নিচের তথ্যগুলো পূরণ করুন</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name">পূর্ণ নাম <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  placeholder="আপনার পূর্ণ নাম লিখুন"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone">যোগাযোগের ফোন নম্বর <span className="text-destructive">*</span></Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: "" })); }}
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>

              {/* Address + Shipping — product only */}
              {!isCourse && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="address">সম্পূর্ণ ঠিকানা <span className="text-destructive">*</span></Label>
                    <textarea
                      id="address"
                      rows={3}
                      placeholder="বাসা/ফ্ল্যাট নং, রাস্তা, এলাকা, জেলা"
                      value={address}
                      onChange={(e) => { setAddress(e.target.value); setErrors((p) => ({ ...p, address: "" })); }}
                      className={[
                        "w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground resize-none",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        errors.address ? "border-destructive" : "border-input",
                      ].join(" ")}
                    />
                    {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>ডেলিভারি অপশন <span className="text-destructive">*</span></Label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(Object.entries(SHIPPING) as [ShippingKey, typeof SHIPPING[ShippingKey]][]).map(([key, opt]) => (
                        <label
                          key={key}
                          className={[
                            "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all",
                            shipping === key
                              ? "border-accent bg-accent/5 ring-2 ring-accent/30"
                              : "border-border hover:border-accent/40",
                          ].join(" ")}
                        >
                          <input
                            type="radio"
                            name="shipping"
                            value={key}
                            checked={shipping === key}
                            onChange={() => setShipping(key)}
                            className="accent-accent"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{opt.label}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                              <Truck className="h-3 w-3" /> ৳{opt.cost} ডেলিভারি চার্জ
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* bKash payment — course only */}
              {isCourse && (
                <div className="space-y-5">
                  {/* Step indicator */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E2136E] text-white text-xs font-bold">২</div>
                    <p className="text-sm font-semibold text-foreground">bKash-এ পেমেন্ট করুন</p>
                  </div>

                  {/* bKash instruction box */}
                  <div className="rounded-xl border-2 border-[#E2136E]/30 bg-[#E2136E]/5 p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E2136E] text-white font-bold text-xs">b</div>
                      <span className="font-semibold text-foreground text-sm">bKash পেমেন্ট নির্দেশনা</span>
                    </div>

                    <ol className="space-y-2 text-sm text-muted-foreground list-none">
                      <li className="flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E2136E]/15 text-[#E2136E] text-xs font-bold mt-0.5">১</span>
                        <span>আপনার bKash অ্যাপ বা *247# খুলুন এবং <strong className="text-foreground">Send Money</strong> নির্বাচন করুন</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E2136E]/15 text-[#E2136E] text-xs font-bold mt-0.5">২</span>
                        <span>নিচের নম্বরে <strong className="text-foreground">৳{total.toLocaleString("bn-BD")}</strong> পাঠান:</span>
                      </li>
                    </ol>

                    {/* Merchant number highlight */}
                    <div className="flex items-center justify-between rounded-lg border border-[#E2136E]/30 bg-background px-4 py-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">bKash নম্বর</p>
                        <p className="font-heading text-2xl font-black text-foreground tracking-widest">{BKASH_NUMBER}</p>
                      </div>
                      <CopyButton text={BKASH_NUMBER} />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      পেমেন্ট সম্পন্ন হলে <strong className="text-foreground">Transaction ID</strong> এবং যে নম্বর থেকে পাঠিয়েছেন সেটি নিচে লিখুন।
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">৩</div>
                    <p className="text-sm font-semibold text-foreground">পেমেন্টের তথ্য দিন</p>
                  </div>

                  {/* Transaction ID */}
                  <div className="space-y-1.5">
                    <Label htmlFor="bkash-txn">
                      bKash Transaction ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="bkash-txn"
                      placeholder="যেমন: 8A6XXXXXXX"
                      value={bkashTxnId}
                      onChange={(e) => { setBkashTxnId(e.target.value); setErrors((p) => ({ ...p, bkashTxnId: "" })); }}
                      className={errors.bkashTxnId ? "border-destructive font-mono" : "font-mono"}
                    />
                    {errors.bkashTxnId && <p className="text-xs text-destructive">{errors.bkashTxnId}</p>}
                  </div>

                  {/* bKash phone */}
                  <div className="space-y-1.5">
                    <Label htmlFor="bkash-phone">
                      যে bKash নম্বর থেকে পাঠিয়েছেন <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="bkash-phone"
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={bkashPhone}
                      onChange={(e) => { setBkashPhone(e.target.value); setErrors((p) => ({ ...p, bkashPhone: "" })); }}
                      className={errors.bkashPhone ? "border-destructive" : ""}
                    />
                    {errors.bkashPhone && <p className="text-xs text-destructive">{errors.bkashPhone}</p>}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isCourse
                  ? <BookOpen className="mr-2 h-5 w-5" />
                  : <ShoppingBag className="mr-2 h-5 w-5" />
                }
                {loading ? "প্রক্রিয়া হচ্ছে..." : (isCourse ? "নিবন্ধন সম্পন্ন করুন" : "অর্ডার দিন")}
              </Button>

              {isCourse && (
                <p className="text-center text-xs text-muted-foreground">
                  পেমেন্ট যাচাইয়ের পর সাধারণত ২৪ ঘণ্টার মধ্যে কোর্সের অ্যাকসেস পাবেন।
                </p>
              )}
            </form>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                {isCourse ? "কোর্স সারসংক্ষেপ" : "অর্ডার সারসংক্ষেপ"}
              </h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground leading-snug">{itemName}</span>
                  <span className="shrink-0 font-medium text-foreground">৳{itemPrice.toLocaleString("bn-BD")}</span>
                </div>
                {couponCode && (
                  <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                    <span className="flex items-center gap-1">🏷 কুপন: <span className="font-mono font-semibold">{couponCode}</span></span>
                    <span className="font-medium">প্রয়োগ হয়েছে</span>
                  </div>
                )}
                {!isCourse && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">ডেলিভারি চার্জ</span>
                    <span className="font-medium text-foreground">৳{shippingCost}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <span className="font-semibold text-foreground">মোট</span>
                  <span className="font-heading text-xl font-bold text-accent">৳{total.toLocaleString("bn-BD")}</span>
                </div>
              </div>

              {isCourse && (
                <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-xs text-amber-700 dark:text-amber-400 space-y-1">
                  <p className="font-semibold">⚠️ গুরুত্বপূর্ণ</p>
                  <p>Transaction ID ছাড়া নিবন্ধন গ্রহণযোগ্য হবে না। সঠিক তথ্য দিন।</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

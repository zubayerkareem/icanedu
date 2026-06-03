import { useState } from "react";
import {
  Package, Plus, Pencil, Trash2, RefreshCw, Search, X, CheckCircle2, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAdminProducts, useUpsertProduct, useDeleteProduct } from "@/hooks/useAdminProducts";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { Product } from "@/lib/products/types";

type FormData = {
  id?: string;
  name: string;
  slug: string;
  category: string;
  image_url: string;
  price: string;
  discount_price: string;
  short_description: string;
  long_description: string;
  delivery_info: string;
  contact_info: string;
  in_stock: boolean;
  is_published: boolean;
};

const empty: FormData = {
  name: "", slug: "", category: "", image_url: "",
  price: "", discount_price: "", short_description: "", long_description: "",
  delivery_info: "", contact_info: "", in_stock: true, is_published: true,
};

function toForm(p: Product & { is_published?: boolean }): FormData {
  return {
    id:                p.id,
    name:              p.name,
    slug:              p.slug ?? "",
    category:          p.category ?? "",
    image_url:         p.image_url ?? "",
    price:             p.price != null ? String(p.price) : "",
    discount_price:    p.discount_price != null ? String(p.discount_price) : "",
    short_description: p.short_description ?? "",
    long_description:  p.long_description ?? "",
    delivery_info:     p.delivery_info ?? "",
    contact_info:      p.contact_info ?? "",
    in_stock:          p.in_stock ?? true,
    is_published:      p.is_published ?? true,
  };
}

const CATEGORIES = ["বই", "প্রশ্নব্যাংক", "নোট", "ডিজিটাল", "অন্যান্য"];

export default function AdminProducts() {
  const { data: products = [], isLoading, error, refetch } = useAdminProducts();
  const upsert = useUpsertProduct();
  const deleteProduct = useDeleteProduct();

  const [search, setSearch]     = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm]           = useState<FormData>(empty);
  const [deleteId, setDeleteId]   = useState<string | null>(null);

  const filtered = products.filter((p) => {
    const q = search.trim().toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || (p.category ?? "").toLowerCase().includes(q);
  });

  function openNew()             { setForm(empty); setSheetOpen(true); }
  function openEdit(p: Product)  { setForm(toForm(p as Product & { is_published?: boolean })); setSheetOpen(true); }
  function set(field: keyof FormData, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("পণ্যের নাম প্রয়োজন"); return; }
    try {
      await upsert.mutateAsync({
        ...(form.id ? { id: form.id } : {}),
        name:              form.name.trim(),
        slug:              form.slug.trim() || undefined,
        category:          form.category.trim() || undefined,
        image_url:         form.image_url.trim() || undefined,
        price:             form.price ? Number(form.price) : undefined,
        discount_price:    form.discount_price ? Number(form.discount_price) : undefined,
        short_description: form.short_description.trim() || undefined,
        long_description:  form.long_description.trim() || undefined,
        delivery_info:     form.delivery_info.trim() || undefined,
        contact_info:      form.contact_info.trim() || undefined,
        in_stock:          form.in_stock,
        is_published:      form.is_published,
      });
      toast.success(form.id ? "পণ্য আপডেট হয়েছে" : "নতুন পণ্য যোগ হয়েছে");
      setSheetOpen(false);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "সমস্যা হয়েছে");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteProduct.mutateAsync(deleteId);
      toast.success("পণ্য মুছে ফেলা হয়েছে");
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "মুছতে সমস্যা হয়েছে");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">পণ্য ম্যানেজমেন্ট</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">মোট {products.length}টি পণ্য</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> রিফ্রেশ
          </Button>
          <Button size="sm" onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" /> নতুন পণ্য
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mt-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="নাম বা ক্যাটাগরি দিয়ে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="mt-5 overflow-x-auto rounded-lg border border-border">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">লোড হচ্ছে...</div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-sm font-medium text-destructive">ডেটা লোড হয়নি</p>
            <div className="max-w-sm rounded-md border border-border bg-muted/50 p-4 text-left text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">সমাধান:</p>
              <p className="mt-1">Supabase SQL Editor-এ নিচের ফাইলটি রান করুন:</p>
              <code className="mt-2 block rounded bg-muted px-2 py-1.5 text-[11px]">supabase_products_migration.sql</code>
              <p className="mt-2 text-[11px]">Error: {(error as Error)?.message}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetch()}>আবার চেষ্টা করুন</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package className="mb-3 h-10 w-10 opacity-30" />
            <p>কোনো পণ্য পাওয়া যায়নি</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                {["পণ্য", "ক্যাটাগরি", "মূল্য", "স্টক", "স্ট্যাটাস", "অ্যাকশন"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {filtered.map((p) => {
                const prod = p as Product & { is_published?: boolean };
                return (
                  <tr key={p.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="h-12 w-12 shrink-0 rounded object-cover" />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-muted">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">{p.name}</p>
                          {p.short_description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{p.short_description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.category ?? "—"}</td>
                    <td className="px-4 py-3">
                      {p.discount_price ? (
                        <div>
                          <span className="font-medium text-foreground">৳{p.discount_price}</span>
                          <span className="ml-1 text-xs line-through text-muted-foreground">৳{p.price}</span>
                        </div>
                      ) : (
                        <span className="font-medium text-foreground">{p.price ? `৳${p.price}` : "—"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.in_stock !== false ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> আছে
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-destructive">
                          <XCircle className="h-3.5 w-3.5" /> নেই
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {prod.is_published !== false ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">প্রকাশিত</Badge>
                      ) : (
                        <Badge variant="secondary">ড্রাফট</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(p.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{form.id ? "পণ্য সম্পাদনা" : "নতুন পণ্য যোগ করুন"}</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6 pb-4">
            {/* Basic info */}
            <Section label="মূল তথ্য">
              <Field label="পণ্যের নাম *">
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="পণ্যের নাম লিখুন" />
              </Field>
              <Field label="Slug (URL)">
                <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto-generated if empty" />
              </Field>
              <Field label="ক্যাটাগরি">
                <div className="space-y-2">
                  <select
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">— ক্যাটাগরি বাছাই করুন —</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <Input
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    placeholder="বা নতুন ক্যাটাগরি লিখুন..."
                  />
                </div>
              </Field>
              <Field label="পণ্যের ছবি">
                <ImageUpload
                  value={form.image_url}
                  onChange={(url) => set("image_url", url)}
                  folder="products"
                />
              </Field>
            </Section>

            {/* Pricing */}
            <Section label="মূল্য">
              <div className="grid grid-cols-2 gap-3">
                <Field label="নিয়মিত মূল্য (৳)">
                  <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="850" />
                </Field>
                <Field label="ছাড়ের মূল্য (৳)">
                  <Input type="number" value={form.discount_price} onChange={(e) => set("discount_price", e.target.value)} placeholder="ঐচ্ছিক" />
                </Field>
              </div>
            </Section>

            {/* Descriptions */}
            <Section label="বিবরণ">
              <Field label="সংক্ষিপ্ত বিবরণ">
                <Textarea value={form.short_description} onChange={(v) => set("short_description", v)} rows={2} placeholder="এক-দুই লাইনের বিবরণ..." />
              </Field>
              <Field label="বিস্তারিত বিবরণ">
                <Textarea value={form.long_description} onChange={(v) => set("long_description", v)} rows={4} placeholder="বিস্তারিত বিবরণ..." />
              </Field>
            </Section>

            {/* Delivery */}
            <Section label="ডেলিভারি ও যোগাযোগ">
              <Field label="ডেলিভারি তথ্য">
                <Input value={form.delivery_info} onChange={(e) => set("delivery_info", e.target.value)} placeholder="৩-৫ কর্মদিবসে সারাদেশে হোম ডেলিভারি।" />
              </Field>
              <Field label="যোগাযোগ নম্বর">
                <Input value={form.contact_info} onChange={(e) => set("contact_info", e.target.value)} placeholder="০১৭০০-০০০০০০" />
              </Field>
            </Section>

            {/* Settings */}
            <Section label="সেটিংস">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.in_stock}
                  onChange={(e) => set("in_stock", e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-accent"
                />
                <span className="text-sm">স্টকে আছে</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => set("is_published", e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-accent"
                />
                <span className="text-sm">প্রকাশিত (পাবলিক দেখতে পাবে)</span>
              </label>
            </Section>
          </div>

          <SheetFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              <X className="mr-2 h-4 w-4" /> বাতিল
            </Button>
            <Button onClick={handleSave} disabled={upsert.isPending}>
              {upsert.isPending ? "সংরক্ষণ হচ্ছে..." : form.id ? "আপডেট করুন" : "যোগ করুন"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>পণ্য মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>এই অ্যাকশন পূর্বাবস্থায় ফেরানো যাবে না।</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? "মুছছে..." : "মুছে ফেলুন"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function Textarea({ value, onChange, rows, placeholder }: {
  value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows ?? 3}
      placeholder={placeholder}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}

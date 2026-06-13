import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ShoppingBag, Truck, Phone, ChevronLeft, PackageX, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useProduct } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { t } from "@/lib/strings";

function formatBnNumber(n: number): string {
  try {
    return new Intl.NumberFormat("bn-BD").format(n);
  } catch {
    return String(n);
  }
}

function discountPercent(price: number, discountPrice: number) {
  return Math.round(((price - discountPrice) / price) * 100);
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id);
  const { user } = useAuth();
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const gallery = (() => {
    const primary = product?.image_url ? [product.image_url] : [];
    const extra = Array.isArray(product?.images)
      ? (product!.images as string[]).filter((u) => u && u !== product?.image_url)
      : [];
    return [...primary, ...extra];
  })();

  const activeImage = gallery[activeIdx];

  if (isLoading) {
    return (
      <section className="container py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-3">
            <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
            <div className="grid grid-cols-4 gap-2">
              {[1,2,3,4].map(i => <Skeleton key={i} className="aspect-square rounded-lg" />)}
            </div>
          </div>
          <div className="space-y-4 pt-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-9 w-4/5" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="container py-20">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <PackageX className="h-8 w-8" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-bold">{t.productDetail.notFoundTitle}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.productDetail.notFoundDesc}</p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/products">
              <ChevronLeft className="mr-1 h-4 w-4" />
              {t.productDetail.backToProducts}
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  const hasDiscount =
    typeof product.discount_price === "number" &&
    typeof product.price === "number" &&
    product.discount_price < product.price;

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/30">
        <div className="container py-3">
          <nav aria-label="breadcrumb" className="text-xs text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to="/" className="hover:text-foreground">{t.products.breadcrumbHome}</Link></li>
              <li aria-hidden>›</li>
              <li><Link to="/products" className="hover:text-foreground">{t.products.breadcrumbProducts}</Link></li>
              <li aria-hidden>›</li>
              <li className="line-clamp-1 max-w-[50vw] text-foreground">{product.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main layout */}
      <section className="container py-8 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] xl:grid-cols-[5fr_4fr]">

          {/* LEFT — image gallery */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-border bg-muted">
              {activeImage ? (
                <>
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <button
                    onClick={() => setLightbox(true)}
                    className="absolute inset-0 flex items-end justify-end p-3 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Zoom"
                  >
                    <span className="flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
                      <ZoomIn className="h-3.5 w-3.5" />
                      বড় করে দেখুন
                    </span>
                  </button>
                </>
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-muted to-secondary" />
              )}
            </div>

            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                {gallery.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      i === activeIdx
                        ? "border-accent ring-2 ring-accent/30"
                        : "border-border hover:border-accent/50 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={src} alt={`${product.name} ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — product info */}
          <div className="flex flex-col">
            <div className="lg:sticky lg:top-20">
              {/* Category + badge */}
              <div className="flex flex-wrap items-center gap-2">
                {product.category && (
                  <Badge variant="secondary" className="rounded-full text-xs">{product.category}</Badge>
                )}
                {hasDiscount && (
                  <Badge className="rounded-full bg-green-500/10 text-green-600 border-green-200 text-xs">
                    {discountPercent(product.price!, product.discount_price!)}% ছাড়
                  </Badge>
                )}
              </div>

              {/* Name */}
              <h1 className="mt-3 font-heading text-2xl font-bold leading-snug text-foreground sm:text-3xl">
                {product.name}
              </h1>

              {product.short_description && (
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {product.short_description}
                </p>
              )}

              {/* Price */}
              <div className="mt-5 flex items-baseline gap-3">
                {hasDiscount ? (
                  <>
                    <span className="font-heading text-4xl font-bold text-accent">
                      ৳{formatBnNumber(product.discount_price!)}
                    </span>
                    <span className="text-lg text-muted-foreground line-through">
                      ৳{formatBnNumber(product.price!)}
                    </span>
                  </>
                ) : typeof product.price === "number" ? (
                  <span className="font-heading text-4xl font-bold text-foreground">
                    ৳{formatBnNumber(product.price)}
                  </span>
                ) : null}
              </div>

              {/* CTA */}
              <div className="mt-6 space-y-3">
                <Button
                  size="lg"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base rounded-xl"
                  onClick={() => {
                    const price = product.discount_price ?? product.price ?? 0;
                    const url = `/checkout?productId=${encodeURIComponent(product.id)}&productName=${encodeURIComponent(product.name)}&price=${price}`;
                    if (!user) { navigate(`/login?redirect=${encodeURIComponent(url)}`); return; }
                    navigate(url);
                  }}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {t.productDetail.orderNow}
                </Button>
                {!user && (
                  <p className="text-center text-xs text-muted-foreground">
                    অর্ডার করতে <Link to="/login" className="text-accent hover:underline">লগইন করুন</Link>
                  </p>
                )}
              </div>

              {/* Delivery & contact */}
              <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <Truck className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t.productDetail.deliveryTitle}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{product.delivery_info ?? t.productDetail.deliveryDefault}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <Phone className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t.productDetail.contactTitle}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{product.contact_info ?? t.productDetail.contactDefault}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Long description */}
        {product.long_description && (
          <div className="mt-14 max-w-3xl border-t border-border pt-10">
            <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">{t.productDetail.detailsTitle}</h2>
            <div className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">
              {product.long_description}
            </div>
          </div>
        )}
      </section>

      {/* Lightbox */}
      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent className="max-w-2xl bg-black/95 border-0 p-2">
          {activeImage && (
            <img src={activeImage} alt={product.name} className="w-full rounded-lg object-contain max-h-[85vh]" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

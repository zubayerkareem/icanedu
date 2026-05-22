import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ShoppingBag, Truck, Phone, ChevronLeft, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id);
  const { user } = useAuth();

  const gallery =
    product?.images && product.images.length > 0
      ? product.images
      : product?.image_url
      ? [product.image_url]
      : [];
  const [activeIdx, setActiveIdx] = useState(0);
  const activeImage = gallery[activeIdx];

  if (isLoading) {
    return (
      <section className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
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
          <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">
            {t.productDetail.notFoundTitle}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.productDetail.notFoundDesc}
          </p>
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
        <div className="container py-4">
          <nav aria-label="breadcrumb" className="text-sm text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link to="/" className="hover:text-foreground">
                  {t.products.breadcrumbHome}
                </Link>
              </li>
              <li aria-hidden>›</li>
              <li>
                <Link to="/products" className="hover:text-foreground">
                  {t.products.breadcrumbProducts}
                </Link>
              </li>
              <li aria-hidden>›</li>
              <li className="line-clamp-1 max-w-[60vw] text-foreground">{product.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main */}
      <section className="container py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
          {/* LEFT — image gallery */}
          <div>
            <div className="aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-muted to-secondary" />
              )}
            </div>

            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-3 sm:grid-cols-6">
                {gallery.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    aria-label={`${t.productDetail.viewImage} ${i + 1}`}
                    aria-current={i === activeIdx}
                    className={`aspect-square overflow-hidden rounded-md border transition-all ${
                      i === activeIdx
                        ? "border-accent ring-2 ring-accent/40"
                        : "border-border hover:border-accent/60"
                    }`}
                  >
                    <img
                      src={src}
                      alt={`${product.name} ${i + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — sticky info card */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              {product.category && (
                <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {product.category}
                </span>
              )}
              <h1 className="mt-3 font-heading text-2xl font-bold text-foreground sm:text-3xl">
                {product.name}
              </h1>

              {product.short_description && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {product.short_description}
                </p>
              )}

              {/* Price */}
              <div className="mt-5 flex items-baseline gap-3">
                {hasDiscount ? (
                  <>
                    <span className="font-heading text-3xl font-bold text-accent">
                      ৳{formatBnNumber(product.discount_price!)}
                    </span>
                    <span className="text-base text-muted-foreground line-through">
                      ৳{formatBnNumber(product.price!)}
                    </span>
                  </>
                ) : typeof product.price === "number" ? (
                  <span className="font-heading text-3xl font-bold text-foreground">
                    ৳{formatBnNumber(product.price)}
                  </span>
                ) : null}
              </div>

              {/* CTA */}
              <Button
                size="lg"
                className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => {
                  const price = product.discount_price ?? product.price ?? 0;
                  const checkoutUrl = `/checkout?productId=${encodeURIComponent(product.id)}&productName=${encodeURIComponent(product.name)}&price=${price}`;
                  if (!user) {
                    navigate(`/login?redirect=${encodeURIComponent(checkoutUrl)}`);
                    return;
                  }
                  navigate(checkoutUrl);
                }}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {t.productDetail.orderNow}
              </Button>
              {!user && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  অর্ডার করতে{" "}
                  <Link to="/login" className="text-accent hover:underline">লগইন করুন</Link>
                </p>
              )}

              {/* Delivery / contact placeholders */}
              <div className="mt-6 space-y-3 border-t border-border pt-5">
                <div className="flex items-start gap-3 text-sm">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <p className="font-medium text-foreground">
                      {t.productDetail.deliveryTitle}
                    </p>
                    <p className="mt-0.5 text-muted-foreground">
                      {product.delivery_info ?? t.productDetail.deliveryDefault}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <p className="font-medium text-foreground">
                      {t.productDetail.contactTitle}
                    </p>
                    <p className="mt-0.5 text-muted-foreground">
                      {product.contact_info ?? t.productDetail.contactDefault}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Long description */}
        {product.long_description && (
          <div className="mt-12 max-w-3xl">
            <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
              {t.productDetail.detailsTitle}
            </h2>
            <div className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">
              {product.long_description}
            </div>
          </div>
        )}

      </section>
    </>
  );
}

import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/lib/strings";
import type { FeaturedProductsConfig } from "@/lib/page-builder/types";

interface ProductRow {
  id: string;
  name: string;
  slug?: string;
  image_url?: string;
  price?: number;
  discount_price?: number;
  sales_count?: number;
  created_at?: string;
}

function useFeaturedProducts(config: FeaturedProductsConfig) {
  return useQuery({
    queryKey: ["featured_products", config.source, config.count, config.manualIds],
    staleTime: 60 * 1000,
    queryFn: async (): Promise<ProductRow[]> => {
      try {
        let q = supabase.from("products").select("*").limit(config.count);
        if (config.source === "manual" && config.manualIds.length > 0) {
          q = q.in("id", config.manualIds);
        } else if (config.source === "popular") {
          q = q.order("sales_count", { ascending: false });
        } else {
          q = q.order("created_at", { ascending: false });
        }
        const { data, error } = await q;
        if (error) return [];
        return (data ?? []) as ProductRow[];
      } catch {
        return [];
      }
    },
  });
}

function ProductCard({ product }: { product: ProductRow }) {
  const href = `/products/${product.slug ?? product.id}`;
  const hasDiscount =
    typeof product.discount_price === "number" &&
    typeof product.price === "number" &&
    product.discount_price < product.price;
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link to={href} className="block aspect-square w-full overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-muted to-secondary" />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-heading text-base font-semibold text-foreground">
          <Link to={href} className="hover:text-accent">
            {product.name}
          </Link>
        </h3>
        <div className="mt-3 flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="font-heading text-lg font-bold text-accent">
                ৳{product.discount_price}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ৳{product.price}
              </span>
            </>
          ) : (
            <span className="font-heading text-lg font-bold text-foreground">
              ৳{product.price ?? 0}
            </span>
          )}
        </div>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to={href}>{t.home.details}</Link>
        </Button>
      </div>
    </article>
  );
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card p-4">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="mt-3 h-4 w-3/4" />
      <Skeleton className="mt-3 h-8 w-full" />
    </div>
  );
}

export function FeaturedProductsSection({ config }: { config: FeaturedProductsConfig }) {
  const { data, isLoading } = useFeaturedProducts(config);
  return (
    <section className="bg-muted/30 py-12 sm:py-16">
      <div className="container">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            {config.heading}
          </h2>
          {config.showSeeAll && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/products">{t.home.seeAllProducts}</Link>
            </Button>
          )}
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: config.count }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {t.home.noProducts}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

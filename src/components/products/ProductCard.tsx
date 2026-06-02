import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import type { Product } from "@/lib/products/types";

function formatBnNumber(n: number): string {
  try {
    return new Intl.NumberFormat("bn-BD").format(n);
  } catch {
    return String(n);
  }
}

export function ProductCard({ product }: { product: Product }) {
  const tr = useTranslation();
  const href = `/products/${product.slug ?? product.id}`;
  const cover = product.image_url ?? product.images?.[0];
  const hasDiscount =
    typeof product.discount_price === "number" &&
    typeof product.price === "number" &&
    product.discount_price < product.price;

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link to={href} className="relative block aspect-square w-full overflow-hidden bg-muted">
        {cover ? (
          <img
            src={cover}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-muted to-secondary" />
        )}
        {product.category && (
          <Badge
            variant="secondary"
            className="absolute left-3 top-3 bg-background/90 text-xs backdrop-blur"
          >
            {product.category}
          </Badge>
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
                ৳{formatBnNumber(product.discount_price!)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ৳{formatBnNumber(product.price!)}
              </span>
            </>
          ) : typeof product.price === "number" && product.price > 0 ? (
            <span className="font-heading text-lg font-bold text-foreground">
              ৳{formatBnNumber(product.price)}
            </span>
          ) : null}
        </div>

        <Button asChild variant="default" size="sm" className="mt-4 w-full gap-2">
          <Link to={href}><ShoppingCart className="h-4 w-4" />{tr.home.cards.orderNow}</Link>
        </Button>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card p-4">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="mt-3 h-4 w-3/4" />
      <Skeleton className="mt-3 h-8 w-full" />
    </div>
  );
}

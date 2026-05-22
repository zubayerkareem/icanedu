import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";
import { t } from "@/lib/strings";
import type { NoticePreviewConfig } from "@/lib/page-builder/types";

interface NoticeRow {
  id: string;
  title: string;
  content?: string;
  slug?: string;
  is_active?: boolean;
  created_at?: string;
  published_at?: string;
}

function formatBnDate(iso?: string): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("bn-BD", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

function useNotices(count: number) {
  return useQuery({
    queryKey: ["notice_preview", count],
    staleTime: 60 * 1000,
    queryFn: async (): Promise<NoticeRow[]> => {
      try {
        const { data, error } = await supabase
          .from("notices")
          .select("*")
          .eq("is_active", true)
          .order("published_at", { ascending: false })
          .limit(count);
        if (error) return [];
        return (data ?? []) as NoticeRow[];
      } catch {
        return [];
      }
    },
  });
}

export function NoticePreviewSection({ config }: { config: NoticePreviewConfig }) {
  const { data, isLoading } = useNotices(config.count);
  return (
    <section className="bg-muted/30 py-12 sm:py-16">
      <div className="container max-w-4xl">
        <h2 className="mb-8 font-heading text-2xl font-bold text-foreground sm:text-3xl">
          {config.heading}
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: config.count }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {t.home.noNotices}
          </p>
        ) : (
          <div className="grid gap-3">
            {data.map((n) => {
              const href = `/notices/${n.slug ?? n.id}`;
              return (
                <article
                  key={n.id}
                  className="rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <time>{formatBnDate(n.published_at ?? n.created_at)}</time>
                  </div>
                  <h3 className="mt-2 font-heading text-base font-semibold text-foreground">
                    <Link to={href} className="hover:text-accent">
                      {n.title}
                    </Link>
                  </h3>
                  {n.content && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {n.content}
                    </p>
                  )}
                  <Link
                    to={href}
                    className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
                  >
                    {t.home.readMore} →
                  </Link>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-center">
          <Button variant="outline" asChild>
            <Link to="/notices">{t.home.seeAllNotices}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import { Calendar, Bell, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RichContent } from "@/components/RichEditor";
import { useNotices } from "@/hooks/useNotices";
import { useTranslation, useLanguage } from "@/lib/i18n";

function formatDate(iso: string, lang: string) {
  return new Date(iso).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function NoticesSection() {
  const { data: notices = [], isLoading } = useNotices(3);
  const tr = useTranslation();
  const { lang } = useLanguage();

  return (
    <section className="py-10 sm:py-14">
      <div className="container max-w-3xl">

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-accent" />
            <h2 className="font-heading text-lg font-bold text-foreground sm:text-xl">
              {tr.home.notices.title}
            </h2>
          </div>
          <Link
            to="/notices"
            className="flex items-center gap-1 text-sm text-accent transition-colors hover:text-accent/80"
          >
            {tr.home.notices.seeAll}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Notices */}
        <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
          {isLoading ? (
            <>
              {[1, 2].map((i) => (
                <div key={i} className="px-5 py-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-2 h-4 w-2/3" />
                  <Skeleton className="mt-1.5 h-3 w-full" />
                </div>
              ))}
            </>
          ) : notices.length === 0 ? (
            <div className="px-5 py-6 text-sm text-center text-muted-foreground">
              {tr.home.notices.empty}
            </div>
          ) : (
            notices.map((n) => (
              <article
                key={n.id}
                className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={n.badge_variant} className="text-[11px] px-2 py-0">
                      {n.badge}
                    </Badge>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(n.created_at, lang)}
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-heading text-sm font-semibold text-foreground leading-snug">
                    {n.title}
                  </h3>
                  <RichContent
                    html={n.content}
                    className="mt-0.5 line-clamp-1 text-xs text-muted-foreground"
                  />
                </div>
                <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-accent" />
              </article>
            ))
          )}
        </div>

      </div>
    </section>
  );
}

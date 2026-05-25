import { Link } from "react-router-dom";
import { Calendar, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RichContent } from "@/components/RichEditor";
import { useNotices } from "@/hooks/useNotices";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" });
}

export function NoticesSection() {
  const { data: notices = [], isLoading } = useNotices(1);

  return (
    <section className="bg-muted/30 py-12 sm:py-16">
      <div className="container max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <Bell className="h-5 w-5 text-accent" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">সাম্প্রতিক নোটিশ</h2>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/notices">সব নোটিশ দেখুন</Link>
          </Button>
        </div>

        <div className="grid gap-3">
          {isLoading ? (
            <div className="rounded-lg border border-border bg-card p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-5 w-3/4" />
              <Skeleton className="mt-2 h-4 w-full" />
            </div>
          ) : notices.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
              কোনো নোটিশ নেই
            </div>
          ) : notices.map((n) => (
            <article
              key={n.id}
              className="rounded-lg border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={n.badge_variant} className="text-xs">{n.badge}</Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(n.created_at)}
                </span>
              </div>
              <h3 className="mt-2 font-heading text-base font-semibold text-foreground">{n.title}</h3>
              <RichContent html={n.content} className="mt-1 line-clamp-2 text-sm text-muted-foreground" />
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}

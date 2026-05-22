import { Link } from "react-router-dom";
import { Bell, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RichContent } from "@/components/RichEditor";
import { useNotices } from "@/hooks/useNotices";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
}

export default function Notices() {
  const { data: notices = [], isLoading } = useNotices();

  return (
    <>
      {/* Page header */}
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
        <div className="container py-10 sm:py-14">
          <nav aria-label="breadcrumb" className="text-sm text-muted-foreground">
            <ol className="flex items-center gap-2">
              <li><Link to="/" className="hover:text-foreground">হোম</Link></li>
              <li aria-hidden>›</li>
              <li className="text-foreground">নোটিশবোর্ড</li>
            </ol>
          </nav>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <Bell className="h-5 w-5 text-accent" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">নোটিশবোর্ড</h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            iCANBD-এর সর্বশেষ ঘোষণা, ইভেন্ট ও আপডেট এখানে পাবেন।
          </p>
        </div>
      </section>

      {/* Notices list */}
      <section className="py-10 sm:py-14">
        <div className="container max-w-4xl">
          {isLoading ? (
            <div className="grid gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-3 h-5 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-full" />
                </div>
              ))}
            </div>
          ) : notices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Bell className="mb-3 h-12 w-12 opacity-20" />
              <p>কোনো নোটিশ নেই</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {notices.map((n) => (
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
                  <RichContent html={n.content} className="mt-2 text-sm text-muted-foreground" />
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

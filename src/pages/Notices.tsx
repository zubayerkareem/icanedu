import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Calendar, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RichContent } from "@/components/RichEditor";
import { useNotices, type Notice } from "@/hooks/useNotices";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function NoticeCard({ notice, onClick }: { notice: Notice; onClick: () => void }) {
  return (
    <article
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-accent/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <Badge variant={notice.badge_variant} className="text-[11px] px-2.5 py-0.5 shrink-0">
          {notice.badge}
        </Badge>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground whitespace-nowrap">
          <Calendar className="h-3 w-3" />
          {formatDate(notice.created_at)}
        </span>
      </div>

      <h3 className="mt-3 font-heading text-sm font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-accent transition-colors">
        {notice.title}
      </h3>

      <div className="mt-2 flex-1">
        <RichContent
          html={notice.content}
          className="line-clamp-3 text-xs text-muted-foreground leading-relaxed"
        />
      </div>

      <div className="mt-4 text-[11px] font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
        বিস্তারিত পড়ুন →
      </div>
    </article>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export default function Notices() {
  const { data: notices = [], isLoading } = useNotices();
  const [selected, setSelected] = useState<Notice | null>(null);
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? notices.filter(
        (n) =>
          n.title.toLowerCase().includes(query.toLowerCase()) ||
          n.badge.toLowerCase().includes(query.toLowerCase())
      )
    : notices;

  return (
    <>
      {/* Header */}
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

          {/* Search */}
          <div className="mt-6 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="নোটিশ খুঁজুন..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-10 sm:py-14">
        <div className="container">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Bell className="mb-3 h-12 w-12 opacity-20" />
              <p className="text-sm">{query ? "কোনো ফলাফল পাওয়া যায়নি" : "কোনো নোটিশ নেই"}</p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-xs text-muted-foreground">{filtered.length}টি নোটিশ</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((n) => (
                  <NoticeCard key={n.id} notice={n} onClick={() => setSelected(n)} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {selected && (
                <>
                  <Badge variant={selected.badge_variant} className="text-xs">
                    {selected.badge}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(selected.created_at)}
                  </span>
                </>
              )}
            </div>
            <DialogTitle className="font-heading text-lg leading-snug">
              {selected?.title}
            </DialogTitle>
          </DialogHeader>
          <RichContent
            html={selected?.content ?? ""}
            className="text-sm leading-relaxed text-foreground"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

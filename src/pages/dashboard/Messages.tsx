import { useState } from "react";
import { MessageSquare, CheckCircle2, ChevronLeft, ChevronRight, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyMessages, useMarkMessageRead } from "@/hooks/useAdminMessages";

const PAGE_SIZE = 10;

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1)  return "এইমাত্র";
  if (m < 60) return `${m} মিনিট আগে`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ঘণ্টা আগে`;
  return `${Math.floor(h / 24)} দিন আগে`;
}

export default function Messages() {
  const { data: messages = [], isLoading } = useMyMessages();
  const markRead = useMarkMessageRead();
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(messages.length / PAGE_SIZE);
  const paged = messages.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const unreadCount = messages.filter((m) => !m.read_at).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">মেসেজ</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount}টি অপঠিত বার্তা` : "সব বার্তা পড়া হয়েছে"}
        </p>
      </div>

      {/* Messages list */}
      <div className="space-y-2">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-4 h-20" />
          ))
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            <MessageSquare className="mb-3 h-10 w-10 opacity-30" />
            <p className="text-sm">কোনো বার্তা নেই।</p>
          </div>
        ) : (
          paged.map((msg) => {
            const isUnread = !msg.read_at;
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-4 rounded-xl border bg-card px-5 py-4 transition-colors ${
                  isUnread
                    ? "border-accent/40 bg-accent/5"
                    : "border-border"
                }`}
              >
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isUnread ? "bg-accent/20" : "bg-muted"}`}>
                  {isUnread
                    ? <MessageSquare className="h-4 w-4 text-accent" />
                    : <MailOpen className="h-4 w-4 text-muted-foreground" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm whitespace-pre-wrap break-words ${isUnread ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                    {msg.body}
                  </p>
                  <p className="mt-1.5 text-[10px] text-muted-foreground/60">{timeAgo(msg.created_at)}</p>
                </div>
                {isUnread && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 h-7 gap-1 text-xs text-accent hover:text-accent hover:bg-accent/10"
                    onClick={() => markRead.mutate(msg.id)}
                    disabled={markRead.isPending}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    পড়েছি
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, messages.length)} / {messages.length}টি
          </p>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="outline" className="h-8 w-8" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
            <Button size="icon" variant="outline" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

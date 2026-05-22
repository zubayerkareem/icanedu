import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Clock, Lock, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IQ_SETS } from "@/lib/iq-practice/mock";
import { loadProgress } from "@/hooks/useIQProgress";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function IQPracticeHome() {
  const { id: courseId = "" } = useParams<{ id: string }>();

  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
        <div className="container py-10 sm:py-14">
          <nav aria-label="breadcrumb" className="text-sm text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link to="/" className="hover:text-foreground">হোম</Link></li>
              <li aria-hidden>›</li>
              <li><Link to="/courses" className="hover:text-foreground">কোর্সসমূহ</Link></li>
              <li aria-hidden>›</li>
              <li><Link to={`/courses/${courseId}`} className="hover:text-foreground">কোর্স</Link></li>
              <li aria-hidden>›</li>
              <li className="text-foreground">IQ Practice</li>
            </ol>
          </nav>
          <h1 className="mt-4 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            IQ Practice Sets
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            প্রতিটি সেটে ৫ মিনিট সময় দেওয়া হবে। যেকোনো সময় বিরতি নিলে সময় ও উত্তর সংরক্ষিত থাকবে।
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="container max-w-3xl">
          <div className="grid gap-4">
            {IQ_SETS.map((set, idx) => {
              const saved = loadProgress(courseId, set.id);
              const isCompleted = saved?.completed ?? false;
              const isInProgress = saved && !isCompleted;
              const score = saved?.score;
              const total = saved?.total ?? set.questions.length;
              const answeredCount = saved ? Object.keys(saved.answers).length : 0;
              const isLocked = idx > 0 && !(loadProgress(courseId, IQ_SETS[idx - 1].id)?.completed);

              return (
                <div
                  key={set.id}
                  className={[
                    "rounded-xl border bg-card p-5 shadow-sm transition-all",
                    isLocked ? "border-border opacity-60" : "border-border hover:shadow-md",
                  ].join(" ")}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      {/* Index badge */}
                      <div className={[
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-heading text-base font-bold",
                        isCompleted
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : isInProgress
                          ? "bg-accent/15 text-accent"
                          : "bg-muted text-muted-foreground",
                      ].join(" ")}>
                        {isCompleted
                          ? <CheckCircle2 className="h-5 w-5" />
                          : isLocked
                          ? <Lock className="h-4 w-4" />
                          : idx + 1}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-heading text-base font-semibold text-foreground">
                            {set.title}
                          </h2>
                          {isCompleted && (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              সম্পন্ন
                            </Badge>
                          )}
                          {isInProgress && (
                            <Badge variant="secondary">চলমান</Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">{set.description}</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatTime(set.timerSeconds)} মিনিট
                          </span>
                          <span>{set.questions.length}টি প্রশ্ন</span>
                          {isInProgress && (
                            <span className="text-accent">
                              {answeredCount}/{set.questions.length} উত্তর দেওয়া হয়েছে
                            </span>
                          )}
                          {isCompleted && score !== undefined && (
                            <span className="font-medium text-green-600 dark:text-green-400">
                              স্কোর: {score}/{total}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      {isLocked ? (
                        <Button variant="outline" size="sm" disabled>
                          <Lock className="mr-1.5 h-3.5 w-3.5" /> লক
                        </Button>
                      ) : isCompleted ? (
                        <Button variant="outline" size="sm" disabled>
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> সম্পন্ন
                        </Button>
                      ) : isInProgress ? (
                        <Button size="sm" asChild>
                          <Link to={`/courses/${courseId}/iq-practice/${set.id}`}>
                            <PlayCircle className="mr-1.5 h-4 w-4" /> চালিয়ে যান
                          </Link>
                        </Button>
                      ) : (
                        <Button size="sm" asChild>
                          <Link to={`/courses/${courseId}/iq-practice/${set.id}`}>
                            <PlayCircle className="mr-1.5 h-4 w-4" /> শুরু করুন
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

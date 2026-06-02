import { Link, useParams } from "react-router-dom";
import { FileText, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IST_SETS } from "@/lib/ist/mock";
import { useISTSets } from "@/hooks/useISSBContent";

export default function ISTHome() {
  const { id: courseId = "" } = useParams<{ id: string }>();
  const { data: dbSets = [] } = useISTSets(courseId);
  const sets = dbSets.length > 0
    ? dbSets.map((s) => ({
        id: s.id,
        title: s.title,
        isPremium: false,
        timerSeconds: s.timer_seconds,
        sentences: s.ist_sentences ?? [],
      }))
    : IST_SETS;

  return (
    <div className="container max-w-2xl py-10 sm:py-14">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link to="/" className="hover:text-foreground">হোম</Link></li>
          <li aria-hidden>›</li>
          <li><Link to="/courses" className="hover:text-foreground">কোর্সসমূহ</Link></li>
          <li aria-hidden>›</li>
          <li><Link to={`/courses/${courseId}`} className="hover:text-foreground">কোর্স</Link></li>
          <li aria-hidden>›</li>
          <li className="text-foreground">IST</li>
        </ol>
      </nav>

      <div className="text-center mb-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background font-heading font-bold text-lg mb-4">
          IST
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Incomplete Sentence Test
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          একটি অসম্পূর্ণ বাক্য দেওয়া হবে। নির্ধারিত সময়ের মধ্যে বাক্যটি সম্পূর্ণ করুন।
        </p>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {sets.map((set, idx) => (
          <div
            key={set.id}
            className={["flex items-center gap-4 px-5 py-4", idx < sets.length - 1 ? "border-b" : ""].join(" ")}
          >
            <div className={["flex h-9 w-9 shrink-0 items-center justify-center rounded-full", set.isPremium ? "bg-amber-100 dark:bg-amber-900/30" : "bg-accent/10"].join(" ")}>
              {set.isPremium
                ? <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                : <FileText className="h-5 w-5 text-accent" />
              }
            </div>

            <div className="flex-1 min-w-0">
              <span className="font-medium text-foreground">{set.title}</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                {set.sentences.length}টি বাক্য · {Math.floor(set.timerSeconds / 60)} মিনিট
              </p>
            </div>

            {set.isPremium && (
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 shrink-0">
                Premium
              </Badge>
            )}

            <Button size="sm" asChild>
              <Link to={`/courses/${courseId}/ist/${set.id}`}>Start</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

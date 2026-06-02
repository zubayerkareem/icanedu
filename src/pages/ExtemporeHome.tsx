import { Link, useParams } from "react-router-dom";
import { FileEdit, Lock, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EXTEMPORE_SETS, EXTEMPORE_TIMER_SECONDS } from "@/lib/extempore/mock";
import { useExtemporeSets } from "@/hooks/useISSBContent";
import { useIsEnrolled } from "@/hooks/useEnrollment";

export default function ExtemporeHome() {
  const { id: courseId = "" } = useParams<{ id: string }>();
  const { data: dbSets = [] } = useExtemporeSets(courseId);
  const { enrolled } = useIsEnrolled(courseId);

  const usingDb = dbSets.length > 0;
  const sets = usingDb
    ? dbSets.map((s) => ({
        id: s.id,
        title: s.title,
        topics: s.extempore_topics ?? [],
        is_free: s.is_free,
      }))
    : EXTEMPORE_SETS.map((s) => ({ ...s, is_free: true }));
  const timerSeconds = usingDb ? (dbSets[0]?.timer_seconds ?? EXTEMPORE_TIMER_SECONDS) : EXTEMPORE_TIMER_SECONDS;

  return (
    <div className="container max-w-2xl py-10 sm:py-14">
      <nav className="text-sm text-muted-foreground mb-6">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link to="/" className="hover:text-foreground">হোম</Link></li>
          <li aria-hidden>›</li>
          <li><Link to="/courses" className="hover:text-foreground">কোর্সসমূহ</Link></li>
          <li aria-hidden>›</li>
          <li><Link to={`/courses/${courseId}`} className="hover:text-foreground">কোর্স</Link></li>
          <li aria-hidden>›</li>
          <li className="text-foreground">Extempore Essay</li>
        </ol>
      </nav>

      <div className="text-center mb-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background font-heading font-bold text-sm mb-4">
          EE
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Extempore Essay
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          বিষয় দেওয়া হবে, প্রস্তুতি ছাড়াই {Math.floor(timerSeconds / 60)} মিনিটে একটি সুগঠিত প্রবন্ধ লিখুন।
        </p>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {sets.map((set, idx) => {
          const canAccess = set.is_free || enrolled;
          return (
            <div
              key={set.id}
              className={["flex items-center gap-4 px-5 py-4", idx < sets.length - 1 ? "border-b" : "", !canAccess ? "opacity-70" : ""].join(" ")}
            >
              <div className={["flex h-9 w-9 shrink-0 items-center justify-center rounded-full", canAccess ? "bg-accent/10" : "bg-muted"].join(" ")}>
                {canAccess
                  ? <FileEdit className="h-5 w-5 text-accent" />
                  : <Lock className="h-4 w-4 text-muted-foreground" />}
              </div>

              <div className="flex-1 min-w-0">
                <span className="font-medium text-foreground">{set.title}</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {set.topics.length}টি বিষয় · {Math.floor(timerSeconds / 60)} মিনিট প্রতিটি
                </p>
              </div>

              {set.is_free && !enrolled && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 shrink-0">
                  ফ্রি
                </Badge>
              )}

              {canAccess ? (
                <Button size="sm" asChild>
                  <Link to={`/courses/${courseId}/extempore/${set.id}`}>শুরু করুন</Link>
                </Button>
              ) : (
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/courses/${courseId}`}>
                    <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> কিনুন
                  </Link>
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border bg-muted/40 p-5">
        <h3 className="font-heading font-semibold text-foreground mb-3">Extempore Essay কী?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {[
            "বিষয় দেওয়ার সাথে সাথে লেখা শুরু করতে হবে — প্রস্তুতির সময় নেই",
            "দ্রুত চিন্তা, ধারণা সংগঠন ও লিখিত প্রকাশক্ষমতা যাচাই হয়",
            "সাধারণ জ্ঞান, সমসাময়িক ঘটনা ও বিশ্লেষণ ক্ষমতা গুরুত্বপূর্ণ",
            "পরীক্ষা শেষে মডেল পয়েন্ট ও নমুনা প্রবন্ধ দেখতে পাবেন",
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

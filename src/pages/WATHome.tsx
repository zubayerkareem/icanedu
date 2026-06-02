import { Link, useParams } from "react-router-dom";
import { Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WAT_SETS } from "@/lib/wat/mock";
import { useWATSets } from "@/hooks/useISSBContent";

export default function WATHome() {
  const { id: courseId = "" } = useParams<{ id: string }>();
  const { data: dbSets = [] } = useWATSets(courseId);
  const sets = dbSets.length > 0
    ? dbSets.map((s) => ({ id: s.id, title: s.title, isPremium: false, words: s.words }))
    : WAT_SETS;

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
          <li className="text-foreground">WAT</li>
        </ol>
      </nav>

      <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl text-center mb-8">WAT</h1>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {sets.map((set, idx) => (
          <div
            key={set.id}
            className={["flex items-center gap-4 px-5 py-4", idx < sets.length - 1 ? "border-b" : ""].join(" ")}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10">
              <Brain className="h-5 w-5 text-accent" />
            </div>

            <span className="flex-1 font-medium text-foreground">{set.title}</span>

            {set.isPremium && (
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                Premium
              </Badge>
            )}

            <Button size="sm" asChild>
              <Link to={`/courses/${courseId}/wat/${set.id}`}>Start</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

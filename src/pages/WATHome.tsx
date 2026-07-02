import { Link, useParams } from "react-router-dom";
import { Brain, Lock, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWATSets } from "@/hooks/useISSBContent";
import { useIsEnrolled } from "@/hooks/useEnrollment";
import { useCourse } from "@/hooks/useCourse";

export default function WATHome() {
  const { id: courseId = "" } = useParams<{ id: string }>();
  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: dbSets = [], isLoading: setsLoading } = useWATSets(course?.id);
  const { enrolled } = useIsEnrolled(courseId, course?.id);

  const isLoading = courseLoading || setsLoading;
  const sets = dbSets.map((s) => ({ id: s.id, title: s.title, is_free: s.is_free }));

  return (
    <div className="container max-w-2xl py-10 sm:py-14">

      <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl text-center mb-8">WAT</h1>

      {isLoading ? (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : sets.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">কোনো সেট পাওয়া যায়নি।</p>
      ) : (
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
                  ? <Brain className="h-5 w-5 text-accent" />
                  : <Lock className="h-4 w-4 text-muted-foreground" />}
              </div>

              <span className="flex-1 font-medium text-foreground">{set.title}</span>

              {set.is_free && !enrolled && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 shrink-0">
                  ফ্রি
                </Badge>
              )}

              {canAccess ? (
                <Button size="sm" asChild>
                  <Link to={`/courses/${courseId}/wat/${set.id}`}>শুরু করুন</Link>
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
      )}
    </div>
  );
}

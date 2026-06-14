import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Brain, Lock, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IST_SETS } from "@/lib/ist/mock";
import { useISTSets } from "@/hooks/useISSBContent";
import { useIsEnrolled } from "@/hooks/useEnrollment";
import { useCourse } from "@/hooks/useCourse";

type TextType = "Bangla" | "English";

export default function ISTHome() {
  const { id: courseId = "" } = useParams<{ id: string }>();
  const { data: course } = useCourse(courseId);
  const { data: dbSets = [] } = useISTSets(course?.id);
  const { enrolled } = useIsEnrolled(courseId, course?.id);
  const [textType, setTextType] = useState<TextType>("Bangla");

  const usingDb = dbSets.length > 0;
  const allSets = usingDb
    ? dbSets.map((s) => ({
        id: s.id,
        title: s.title,
        timerSeconds: s.timer_seconds,
        sentences: s.ist_sentences ?? [],
        is_free: s.is_free,
        text_type: (s.text_type ?? "Bangla") as TextType,
      }))
    : IST_SETS.map((s) => ({ ...s, is_free: true, text_type: "Bangla" as TextType }));

  const sets = allSets.filter((s) => s.text_type === textType);

  return (
    <div className="container max-w-2xl py-10 sm:py-14">
      <div className="text-center mb-8">
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Incomplete Sentences
        </h1>
      </div>

      {/* Language tab switcher */}
      <div className="flex gap-3 mb-8 justify-center">
        {(["Bangla", "English"] as TextType[]).map((lang) => (
          <button
            key={lang}
            onClick={() => setTextType(lang)}
            className={[
              "flex-1 max-w-[220px] py-2.5 rounded-full text-sm font-semibold border transition-colors",
              textType === lang
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-foreground border-border hover:border-foreground/40",
            ].join(" ")}
          >
            {lang === "Bangla" ? "বাংলা" : "English"}
          </button>
        ))}
      </div>

      {sets.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
          এই ভাষায় কোনো সেট পাওয়া যায়নি।
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          {sets.map((set, idx) => {
            const canAccess = set.is_free || enrolled;
            return (
              <div
                key={set.id}
                className={["flex items-center gap-4 px-5 py-4", idx < sets.length - 1 ? "border-b" : ""].join(" ")}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <Brain className="h-5 w-5 text-accent" />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="font-medium text-foreground">{set.title}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {set.sentences.length}টি বাক্য · {Math.floor(set.timerSeconds / 60)} মিনিট
                  </p>
                </div>

                {!set.is_free && (
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 shrink-0">
                    Premium
                  </Badge>
                )}
                {set.is_free && !enrolled && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 shrink-0">
                    ফ্রি
                  </Badge>
                )}

                {canAccess ? (
                  <Button size="sm" className="shrink-0 bg-foreground text-background hover:bg-foreground/90" asChild>
                    <Link to={`/courses/${courseId}/ist/${set.id}`}>Start</Link>
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="shrink-0" asChild>
                    <Link to={`/courses/${courseId}`}>
                      <Lock className="mr-1.5 h-3.5 w-3.5" /> Unlock
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

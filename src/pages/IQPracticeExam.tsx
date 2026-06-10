import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IQ_SETS, IQ_COURSE_ID } from "@/lib/iq-practice/mock";
import type { IQQuestion, IQSet } from "@/lib/iq-practice/mock";
import { loadProgress, saveProgress } from "@/hooks/useIQProgress";
import { useIQSets } from "@/hooks/useISSBContent";
import { useSaveIQResult } from "@/hooks/useIQResult";

// ─── Timer display ────────────────────────────────────────────────────────────

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function TimerDisplay({ seconds, urgent }: { seconds: number; urgent: boolean }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (
    <div
      className={[
        "flex items-center gap-2 rounded-lg px-4 py-2 font-heading text-xl font-bold tabular-nums transition-colors",
        urgent
          ? "animate-pulse bg-destructive/10 text-destructive"
          : "bg-muted text-foreground",
      ].join(" ")}
    >
      <Clock className="h-5 w-5 shrink-0" />
      {pad(m)}:{pad(s)}
    </div>
  );
}

// ─── Question card ────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  index,
  total,
  selected,
  onSelect,
  showResult,
}: {
  question: IQQuestion;
  index: number;
  total: number;
  selected: string | undefined;
  onSelect: (optionId: string) => void;
  showResult: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>প্রশ্ন {index + 1} / {total}</span>
      </div>

      <p className="font-heading text-base font-semibold leading-relaxed text-foreground sm:text-lg">
        {question.text}
      </p>

      {question.hasImage && (
        <div className="mt-4 flex aspect-video max-h-48 w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-muted to-secondary">
          <svg className="h-14 w-14 text-muted-foreground/30" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
        </div>
      )}

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {question.options.map((opt, i) => {
          const isSelected = selected === opt.id;
          const isCorrect = showResult && opt.id === question.correct;
          const isWrong = showResult && isSelected && opt.id !== question.correct;
          const label = String.fromCharCode(65 + i);

          return (
            <li key={opt.id}>
              <button
                onClick={() => !showResult && onSelect(opt.id)}
                disabled={showResult}
                className={[
                  "w-full rounded-lg border px-4 py-3 text-left text-sm transition-all",
                  isCorrect
                    ? "border-green-500 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                    : isWrong
                    ? "border-destructive bg-destructive/5 text-destructive"
                    : isSelected
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-background text-foreground hover:border-accent/50 hover:bg-muted/50",
                ].join(" ")}
              >
                <span className="font-semibold">{label}.</span> {opt.text}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Question nav dots ────────────────────────────────────────────────────────

function QuestionNav({
  total,
  current,
  answers,
  skipped,
  onGoto,
}: {
  total: number;
  current: number;
  answers: Record<string, string>;
  skipped: Set<string>;
  onGoto: (i: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const isPast = i < current;
        const isCurrent = i === current;
        return (
          <button
            key={i}
            disabled={isPast || isCurrent}
            onClick={() => !isPast && !isCurrent && onGoto(i)}
            title={isPast && skipped.has(String(i)) ? "Skip করা হয়েছে" : undefined}
            className={[
              "h-8 w-8 rounded-md text-xs font-semibold transition-colors",
              isCurrent
                ? "bg-accent text-accent-foreground cursor-default"
                : isPast && skipped.has(String(i))
                ? "bg-amber-100 text-amber-700 cursor-not-allowed opacity-70 dark:bg-amber-900/30 dark:text-amber-400"
                : isPast
                ? "bg-green-100 text-green-700 cursor-not-allowed opacity-70 dark:bg-green-900/30 dark:text-green-400"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            ].join(" ")}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

// ─── Results screen ───────────────────────────────────────────────────────────

function ResultScreen({
  set,
  answers,
  courseId,
}: {
  set: IQSet;
  answers: Record<string, string>;
  courseId: string;
}) {
  const score = set.questions.filter((q) => answers[q.id] === q.correct).length;
  const total = set.questions.length;
  const pct = Math.round((score / total) * 100);

  return (
    <div className="flex flex-col items-center gap-8 py-10">
      {/* Score badge */}
      <div className="text-center">
        <div className={[
          "mx-auto flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold font-heading",
          pct >= 70 ? "bg-green-100 text-green-700 dark:bg-green-900/20" : "bg-amber-100 text-amber-700 dark:bg-amber-900/20",
        ].join(" ")}>
          {score}/{total}
        </div>
        <h2 className="mt-3 font-heading text-2xl font-bold text-foreground">
          {pct >= 70 ? "চমৎকার! 🎉" : pct >= 50 ? "ভালো চেষ্টা!" : "আরও অনুশীলন করুন"}
        </h2>
        <p className="mt-1 text-muted-foreground">
          {total}টি প্রশ্নের মধ্যে {score}টি সঠিক ({pct}%)
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded border border-green-500 bg-green-50 dark:bg-green-900/20" />
          সঠিক উত্তর
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded border border-destructive bg-destructive/5" />
          আপনার ভুল উত্তর
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded border border-border bg-background" />
          উত্তর দেওয়া হয়নি
        </span>
      </div>

      {/* Per-question review with full options */}
      <div className="w-full space-y-5">
        {set.questions.map((q, i) => {
          const chosen = answers[q.id];
          const isCorrect = chosen === q.correct;
          const skipped = !chosen;

          return (
            <div
              key={q.id}
              className={[
                "rounded-xl border p-5 shadow-sm",
                isCorrect
                  ? "border-green-200 bg-green-50/40 dark:border-green-800 dark:bg-green-900/10"
                  : skipped
                  ? "border-border bg-card"
                  : "border-red-200 bg-red-50/40 dark:border-red-800 dark:bg-red-900/10",
              ].join(" ")}
            >
              {/* Question header */}
              <div className="mb-3 flex items-start gap-2">
                <span className={[
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  isCorrect
                    ? "bg-green-500 text-white"
                    : skipped
                    ? "bg-muted text-muted-foreground"
                    : "bg-destructive text-white",
                ].join(" ")}>
                  {i + 1}
                </span>
                <p className="font-heading text-sm font-semibold text-foreground leading-relaxed">
                  {q.text}
                </p>
              </div>

              {/* Options */}
              <ul className="grid gap-2 sm:grid-cols-2 ml-8">
                {q.options.map((opt, oi) => {
                  const isChosen = chosen === opt.id;
                  const isCorrectOpt = opt.id === q.correct;
                  const isWrongChosen = isChosen && !isCorrectOpt;
                  const label = String.fromCharCode(65 + oi);

                  return (
                    <li key={opt.id}>
                      <div className={[
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                        isCorrectOpt
                          ? "border-green-500 bg-green-50 text-green-800 font-medium dark:bg-green-900/20 dark:text-green-300"
                          : isWrongChosen
                          ? "border-destructive bg-destructive/5 text-destructive font-medium"
                          : "border-border bg-background text-muted-foreground",
                      ].join(" ")}>
                        <span className={[
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          isCorrectOpt
                            ? "bg-green-500 text-white"
                            : isWrongChosen
                            ? "bg-destructive text-white"
                            : "bg-muted text-muted-foreground",
                        ].join(" ")}>
                          {label}
                        </span>
                        {opt.text}
                        {isCorrectOpt && (
                          <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-green-600" />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Skipped label */}
              {skipped && (
                <p className="ml-8 mt-2 text-xs text-muted-foreground">
                  উত্তর দেওয়া হয়নি · সঠিক উত্তর:{" "}
                  <span className="font-semibold text-green-600">
                    {String.fromCharCode(65 + q.options.findIndex((o) => o.id === q.correct))}
                  </span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Button asChild>
        <Link to={`/courses/${courseId}/iq-practice`}>সব সেট দেখুন</Link>
      </Button>
    </div>
  );
}

// ─── Main exam page ───────────────────────────────────────────────────────────

export default function IQPracticeExam() {
  const { id: courseId = "", setId = "" } = useParams<{ id: string; setId: string }>();
  const navigate = useNavigate();
  const saveResult = useSaveIQResult();

  const { data: dbSets = [] } = useIQSets(courseId);
  const dbSet = dbSets.find((s) => s.id === setId);
  const set: IQSet | undefined = dbSet
    ? {
        id: dbSet.id,
        title: dbSet.title,
        description: dbSet.description ?? "",
        timerSeconds: dbSet.timer_seconds,
        questions: (dbSet.iq_questions ?? []) as IQQuestion[],
      }
    : IQ_SETS.find((s) => s.id === setId);

  const initProgress = useCallback(() => loadProgress(courseId, setId), [courseId, setId]);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (!set) return 300;
    const saved = initProgress();
    return saved && !saved.completed ? saved.timeLeft : set.timerSeconds;
  });
  const [currentQ, setCurrentQ] = useState(0);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState<boolean>(() => initProgress()?.completed ?? false);

  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const answersRef     = useRef(answers);
  const timeLeftRef    = useRef(timeLeft);
  const endTimeRef     = useRef<number>(Date.now() + timeLeft * 1000);
  const autoSubmitRef  = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

  const persist = useCallback(() => {
    if (!set) return;
    saveProgress(courseId, setId, {
      answers: answersRef.current,
      timeLeft: timeLeftRef.current,
      completed: false,
    });
  }, [courseId, setId, set]);

  const handleSubmit = useCallback(() => {
    if (!set) return;
    const score = set.questions.filter((q) => answersRef.current[q.id] === q.correct).length;
    saveProgress(courseId, setId, {
      answers: answersRef.current,
      timeLeft: timeLeftRef.current,
      completed: true,
      score,
      total: set.questions.length,
    });
    saveResult.mutate({
      set_id: setId,
      course_id: courseId || undefined,
      score,
      total: set.questions.length,
      answers: answersRef.current,
      time_taken_seconds: set.timerSeconds - timeLeftRef.current,
    });
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [courseId, setId, set, saveResult]);

  // Store latest handleSubmit in a ref so the timer closure never goes stale
  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => { handleSubmitRef.current = handleSubmit; }, [handleSubmit]);

  // Single stable timer effect — only [submitted] as dep so endTimeRef is NEVER reset mid-exam
  useEffect(() => {
    if (submitted) return;

    endTimeRef.current = Date.now() + timeLeftRef.current * 1000;
    autoSubmitRef.current = false;

    const tick = () => {
      const left = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(left);
      timeLeftRef.current = left;
      if (left % 5 === 0 && left > 0) {
        saveProgress(courseId, setId, {
          answers: answersRef.current,
          timeLeft: left,
          completed: false,
        });
      }
      if (left <= 0 && !autoSubmitRef.current) {
        autoSubmitRef.current = true;
        handleSubmitRef.current();
      }
    };

    timerRef.current = setInterval(tick, 250);

    const onVisible = () => { if (!document.hidden) tick(); };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(timerRef.current!);
      document.removeEventListener("visibilitychange", onVisible);
      saveProgress(courseId, setId, {
        answers: answersRef.current,
        timeLeft: timeLeftRef.current,
        completed: false,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]); // ← ONLY submitted — endTimeRef is never reset mid-exam

  const handleSelect = useCallback((optionId: string) => {
    if (!set) return;
    const qId = set.questions[currentQ].id;
    setAnswers((prev) => {
      const next = { ...prev, [qId]: optionId };
      answersRef.current = next;
      saveProgress(courseId, setId, {
        answers: next,
        timeLeft: timeLeftRef.current,
        completed: false,
      });
      return next;
    });
  }, [courseId, setId, set, currentQ]);

  const handleSkip = useCallback(() => {
    if (!set) return;
    setSkipped((prev) => new Set(prev).add(String(currentQ)));
    setCurrentQ((q) => Math.min(set.questions.length - 1, q + 1));
  }, [set, currentQ]);

  if (!set) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h1 className="font-heading text-2xl font-bold text-foreground">সেটটি পাওয়া যায়নি</h1>
        <Button asChild variant="outline">
          <Link to={`/courses/${courseId}/iq-practice`}>ফিরে যান</Link>
        </Button>
      </div>
    );
  }

  const question = set.questions[currentQ];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/courses/${courseId}/iq-practice`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <p className="font-heading text-sm font-semibold text-foreground">{set.title}</p>
              <p className="text-xs text-muted-foreground">{answeredCount}/{set.questions.length} উত্তর দেওয়া হয়েছে</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!submitted && <TimerDisplay seconds={timeLeft} urgent={timeLeft <= 60} />}
          </div>
        </div>
      </div>

      <div className="container max-w-2xl py-8">
        {submitted ? (
          <ResultScreen
            set={set}
            answers={answers}
            courseId={courseId}
          />
        ) : (
          <>
            <QuestionCard
              question={question}
              index={currentQ}
              total={set.questions.length}
              selected={answers[question.id]}
              onSelect={handleSelect}
              showResult={false}
            />

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-end gap-3">
              {currentQ < set.questions.length - 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkip}
                >
                  Skip করুন
                </Button>
              )}
              {currentQ < set.questions.length - 1 ? (
                <Button
                  size="sm"
                  onClick={() => setCurrentQ((q) => Math.min(set.questions.length - 1, q + 1))}
                >
                  পরের প্রশ্ন <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={handleSubmit}
                >
                  <Send className="mr-1.5 h-4 w-4" /> জমা দিন
                </Button>
              )}
            </div>

            {/* Question nav dots */}
            <div className="mt-6 rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="font-medium">প্রশ্নে যান</span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded bg-green-100 dark:bg-green-900/30" /> উত্তর দেওয়া
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded bg-amber-100 dark:bg-amber-900/30" /> Skip করা
                </span>
              </div>
              <QuestionNav
                total={set.questions.length}
                current={currentQ}
                answers={answers}
                skipped={(() => {
                  // merge explicit skips + auto-skips (past questions with no answer)
                  const merged = new Set(skipped);
                  for (let i = 0; i < currentQ; i++) {
                    if (!answers[set.questions[i].id]) merged.add(String(i));
                  }
                  return merged;
                })()}
                onGoto={setCurrentQ}
              />
            </div>

            {/* Submit early */}
            {answeredCount > 0 && (
              <div className="mt-4 text-center">
                <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleSubmit}>
                  <Send className="mr-1.5 h-3.5 w-3.5" /> এখনই জমা দিন ({answeredCount}/{set.questions.length})
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

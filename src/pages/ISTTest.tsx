import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Clock, SkipForward, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IST_SETS, type ISTSentence } from "@/lib/ist/mock";
import { useISTSets } from "@/hooks/useISSBContent";

// ─── Audio ─────────────────────────────────────────────────────────────────────

function playBeep(freq = 520, duration = 0.12, volume = 0.4) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch { /* not available */ }
}

function playEndBeep() {
  [0, 0.2, 0.4].forEach((offset) => {
    setTimeout(() => playBeep(660, 0.15, 0.5), offset * 1000);
  });
}

// ─── Timer pill ────────────────────────────────────────────────────────────────

function TimerPill({ seconds, total }: { seconds: number; total: number }) {
  const pct = (seconds / total) * 100;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const urgent = seconds <= 30;

  return (
    <div className={[
      "fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-full border shadow-lg backdrop-blur-sm transition-colors",
      urgent
        ? "bg-destructive/10 border-destructive/30 text-destructive"
        : "bg-background/90 border-border text-foreground",
    ].join(" ")}>
      <Clock className="h-3.5 w-3.5 shrink-0" />
      <span className="font-heading font-bold tabular-nums text-sm">
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </span>
      <div className="w-20 h-1 rounded-full bg-muted overflow-hidden">
        <div
          className={["h-full rounded-full transition-all duration-1000 ease-linear", urgent ? "bg-destructive" : "bg-accent"].join(" ")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Instructions ──────────────────────────────────────────────────────────────

function Instructions({
  title,
  count,
  minutes,
  onStart,
}: {
  title: string;
  count: number;
  minutes: number;
  onStart: () => void;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)", backgroundSize: "24px 24px" }}
    >
      <div className="w-full max-w-lg rounded-2xl border bg-background shadow-lg p-8 sm:p-10 text-center space-y-6">
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background font-heading font-bold text-lg">
            IST
          </div>
        </div>

        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Incomplete Sentence Test</h1>
          <p className="mt-1 text-sm text-accent font-medium">{title}</p>
        </div>

        <div className="rounded-xl bg-muted/50 border p-5 text-left space-y-3">
          {[
            "প্রতিটি অসম্পূর্ণ বাক্য দেখানো হবে।",
            "বাক্যটি পড়ুন এবং আপনার মনে যা আসে তা দিয়ে সম্পূর্ণ করুন।",
            "উত্তর যতটা সম্ভব স্বাভাবিক ও সৎ রাখুন।",
            "শেষে সঠিক উদাহরণের সাথে তুলনা করতে পারবেন।",
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent text-xs font-bold mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-foreground">{t}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          {count}টি বাক্য · {minutes} মিনিট সময়
        </p>

        <Button size="lg" className="w-full gap-2" onClick={onStart}>
          পরীক্ষা শুরু করুন <span>→</span>
        </Button>
      </div>
    </div>
  );
}

// ─── Test screen ───────────────────────────────────────────────────────────────

function TestScreen({
  sentences,
  timerSeconds,
  onFinish,
}: {
  sentences: ISTSentence[];
  timerSeconds: number;
  onFinish: (answers: Record<string, string>) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [current, setCurrent] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = useRef(false);
  const endTimeRef = useRef<number>(Date.now() + timerSeconds * 1000);
  const warned30Ref = useRef(false);

  const handleFinish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
    playEndBeep();
    onFinish(answers);
  }, [answers, onFinish]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(left);
      if (left <= 30 && !warned30Ref.current) {
        warned30Ref.current = true;
        playBeep(440, 0.1, 0.3);
      }
      if (left <= 0) handleFinish();
    }, 250);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [handleFinish]);

  // Auto-focus current sentence input
  useEffect(() => {
    inputRefs.current[current]?.focus();
  }, [current]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Enter") {
      if (idx < sentences.length - 1) {
        setCurrent(idx + 1);
      } else {
        handleFinish();
      }
    }
  };

  const handleSkip = () => {
    if (current < sentences.length - 1) setCurrent(current + 1);
    else handleFinish();
  };

  const sentence = sentences[current];
  const answered = Object.values(answers).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background"
      style={{ backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)", backgroundSize: "24px 24px" }}
    >
      <TimerPill seconds={timeLeft} total={timerSeconds} />

      <div className="container max-w-2xl pt-20 pb-24 px-4">
        {/* Progress */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>{answered} / {sentences.length} উত্তর দেওয়া হয়েছে</span>
          <span>{current + 1} / {sentences.length}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-8">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${((current + 1) / sentences.length) * 100}%` }}
          />
        </div>

        {/* Current sentence card */}
        <div className="rounded-2xl border bg-background shadow-lg overflow-hidden mb-6">
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold font-heading">
                {current + 1}
              </span>
              <span className="text-xs text-muted-foreground font-medium">বাক্য সম্পূর্ণ করুন</span>
            </div>

            <p className="font-heading font-bold text-foreground text-2xl sm:text-3xl leading-relaxed mb-5">
              {sentence.stem}…
            </p>

            <input
              ref={(el) => { inputRefs.current[current] = el; }}
              type="text"
              className="w-full rounded-xl border-2 bg-muted/30 px-4 py-3 text-foreground font-medium text-lg placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent transition-colors"
              placeholder="এখানে লিখুন…"
              value={answers[sentence.id] ?? ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [sentence.id]: e.target.value }))}
              onKeyDown={(e) => handleKeyDown(e, current)}
              autoComplete="off"
            />
            <p className="mt-2 text-xs text-muted-foreground">Enter চাপুন বা নিচের বাটনে ক্লিক করুন</p>
          </div>

          <div className="flex items-center justify-between px-6 pb-5 pt-2 border-t bg-muted/20">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-1.5"
              onClick={handleSkip}
            >
              <SkipForward className="h-3.5 w-3.5" />
              {current < sentences.length - 1 ? "পরবর্তী" : "শেষ করুন"}
            </Button>

            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                if (current < sentences.length - 1) setCurrent(current + 1);
                else handleFinish();
              }}
            >
              {current < sentences.length - 1 ? "পরবর্তী →" : "জমা দিন ✓"}
            </Button>
          </div>
        </div>

        {/* Mini sentence navigator */}
        <div className="flex flex-wrap gap-2 justify-center">
          {sentences.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrent(i)}
              className={[
                "h-8 w-8 rounded-lg text-xs font-bold font-heading transition-all border",
                i === current
                  ? "bg-foreground text-background border-foreground scale-110 shadow-md"
                  : answers[s.id]
                  ? "bg-accent/20 text-accent border-accent/30"
                  : "bg-muted text-muted-foreground border-border hover:border-foreground/30",
              ].join(" ")}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{answered}</span>/{sentences.length} সম্পন্ন
          </p>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60"
            onClick={handleFinish}
          >
            পরীক্ষা শেষ করুন
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Result card ───────────────────────────────────────────────────────────────

function ResultCard({
  index,
  sentence,
  userAnswer,
}: {
  index: number;
  sentence: ISTSentence;
  userAnswer: string;
}) {
  const answered = userAnswer.trim().length > 0;

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b bg-muted/30 flex items-center gap-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold font-heading shrink-0">
          {index}
        </span>
        <p className="font-heading font-semibold text-foreground text-base leading-snug">
          {sentence.stem}…
        </p>
      </div>

      <div className="px-5 py-4 grid sm:grid-cols-2 gap-4">
        {/* User answer */}
        <div className={["rounded-lg p-3.5 border", answered ? "bg-accent/5 border-accent/20" : "bg-muted/50 border-border"].join(" ")}>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">আপনার উত্তর</p>
          {answered ? (
            <p className="text-sm text-foreground font-medium">{sentence.stem} {userAnswer}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">উত্তর দেওয়া হয়নি</p>
          )}
        </div>

        {/* Example */}
        <div className="rounded-lg p-3.5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-1.5 mb-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400 shrink-0" />
            <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">উদাহরণ উত্তর</p>
          </div>
          <p className="text-sm text-foreground font-medium">{sentence.example}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Results screen ────────────────────────────────────────────────────────────

function ResultsScreen({
  title,
  sentences,
  answers,
  courseId,
  onRetry,
}: {
  title: string;
  sentences: ISTSentence[];
  answers: Record<string, string>;
  courseId: string;
  onRetry: () => void;
}) {
  const answered = sentences.filter((s) => answers[s.id]?.trim()).length;
  const skipped = sentences.length - answered;

  return (
    <div className="min-h-screen bg-background"
      style={{ backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)", backgroundSize: "24px 24px" }}
    >
      <div className="container max-w-2xl py-10 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📋</div>
          <h1 className="font-heading text-2xl font-bold text-foreground">পরীক্ষা সম্পন্ন!</h1>
          <p className="mt-1 text-sm text-muted-foreground">{title}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "মোট বাক্য", value: sentences.length, color: "text-foreground" },
            { label: "উত্তর দিয়েছেন", value: answered, color: "text-accent" },
            { label: "বাদ দিয়েছেন", value: skipped, color: "text-muted-foreground" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-card p-4 text-center">
              <p className={["text-2xl font-heading font-black", stat.color].join(" ")}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Sentence-by-sentence comparison */}
        <div className="space-y-3 mb-8">
          {sentences.map((s, i) => (
            <ResultCard
              key={s.id}
              index={i + 1}
              sentence={s}
              userAnswer={answers[s.id] ?? ""}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="flex-1 gap-2" onClick={onRetry}>
            <RotateCcw className="h-4 w-4" /> আবার চেষ্টা করুন
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <Link to={`/courses/${courseId}/ist`}>সব সেট দেখুন</Link>
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <Link to={`/courses/${courseId}`}>কোর্সে ফিরুন</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

type Phase = "instructions" | "test" | "results";

export default function ISTTest() {
  const { id: courseId = "", setId = "" } = useParams<{ id: string; setId: string }>();
  const [phase, setPhase] = useState<Phase>("instructions");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { data: dbSets = [], isLoading } = useISTSets(courseId);

  // Normalize DB set to the shape the test components expect
  const dbSet = dbSets.find((s) => s.id === setId);
  const mockSet = !dbSet ? IST_SETS.find((s) => s.id === setId) : undefined;
  const set: { id: string; title: string; timerSeconds: number; sentences: ISTSentence[] } | null =
    dbSet
      ? {
          id: dbSet.id,
          title: dbSet.title,
          timerSeconds: dbSet.timer_seconds,
          sentences: (dbSet.ist_sentences ?? []).map((s) => ({
            id: s.id,
            stem: s.stem,
            example: s.example,
          })),
        }
      : mockSet ?? null;

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!set) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground">সেটটি পাওয়া যায়নি</h1>
        <Button asChild variant="outline">
          <Link to={`/courses/${courseId}/ist`}>ফিরে যান</Link>
        </Button>
      </div>
    );
  }

  if (phase === "instructions") {
    return (
      <Instructions
        title={set.title}
        count={set.sentences.length}
        minutes={Math.floor(set.timerSeconds / 60)}
        onStart={() => setPhase("test")}
      />
    );
  }

  if (phase === "test") {
    return (
      <TestScreen
        sentences={set.sentences}
        timerSeconds={set.timerSeconds}
        onFinish={(a) => { setAnswers(a); setPhase("results"); }}
      />
    );
  }

  return (
    <ResultsScreen
      title={set.title}
      sentences={set.sentences}
      answers={answers}
      courseId={courseId}
      onRetry={() => { setAnswers({}); setPhase("test"); }}
    />
  );
}

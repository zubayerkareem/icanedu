import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Clock, ChevronRight, ChevronLeft, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXTEMPORE_SETS, EXTEMPORE_TIMER_SECONDS, type ExtemporeEssayTopic } from "@/lib/extempore/mock";

const STORAGE_KEY = (courseId: string, setId: string) => `extempore_${courseId}_${setId}`;

// ─── Audio ─────────────────────────────────────────────────────────────────────
function playBeep(freq = 520, vol = 0.4, duration = 0.15) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(); osc.stop(ctx.currentTime + duration);
  } catch { /* noop */ }
}

// ─── Timer pill ────────────────────────────────────────────────────────────────
function TimerPill({ seconds, total }: { seconds: number; total: number }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const urgent = seconds <= 120;
  return (
    <div className={["fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-full border shadow-lg backdrop-blur-sm transition-colors", urgent ? "bg-destructive/10 border-destructive/30 text-destructive" : "bg-background/90 border-border text-foreground"].join(" ")}>
      <Clock className="h-3.5 w-3.5 shrink-0" />
      <span className="font-heading font-bold tabular-nums text-sm">
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </span>
      <div className="w-20 h-1 rounded-full bg-muted overflow-hidden">
        <div className={["h-full rounded-full transition-all duration-1000 ease-linear", urgent ? "bg-destructive" : "bg-accent"].join(" ")} style={{ width: `${(seconds / total) * 100}%` }} />
      </div>
    </div>
  );
}

// ─── Instructions ──────────────────────────────────────────────────────────────
function Instructions({ topicCount, onStart }: { topicCount: number; onStart: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
      <div className="w-full max-w-lg rounded-2xl border bg-background shadow-lg p-8 sm:p-10 text-center space-y-6">
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background font-heading font-bold text-sm">EE</div>
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Essay Writing Test</h1>
          <p className="mt-1 text-sm text-accent font-medium">{topicCount}টি বিষয়ে পরীক্ষা</p>
        </div>
        <div className="rounded-xl bg-muted/50 border p-5 text-left space-y-3">
          {[
            "একটি বিষয় দেওয়া হবে — কোনো প্রস্তুতি নেই।",
            `প্রতিটি বিষয়ে ${Math.floor(EXTEMPORE_TIMER_SECONDS / 60)} মিনিটে প্রবন্ধ লিখুন।`,
            "ভূমিকা, মূল অংশ ও উপসংহার সহ সুগঠিত রাখুন।",
            "সময় শেষে মডেল পয়েন্ট ও নমুনা উত্তর দেখতে পাবেন।",
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent text-xs font-bold mt-0.5">{i + 1}</span>
              <p className="text-sm text-foreground">{t}</p>
            </div>
          ))}
        </div>
        <Button size="lg" className="w-full gap-2" onClick={onStart}>পরীক্ষা শুরু করুন →</Button>
      </div>
    </div>
  );
}

// ─── Writing screen ─────────────────────────────────────────────────────────────
function WritingScreen({
  topic,
  topicIndex,
  topicCount,
  savedText,
  onSave,
  onFinish,
}: {
  topic: ExtemporeEssayTopic;
  topicIndex: number;
  topicCount: number;
  savedText: string;
  onSave: (text: string) => void;
  onFinish: () => void;
}) {
  const [text, setText] = useState(savedText);
  const [timeLeft, setTimeLeft] = useState(EXTEMPORE_TIMER_SECONDS);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef      = useRef(false);
  const endTimeRef   = useRef<number>(Date.now() + EXTEMPORE_TIMER_SECONDS * 1000);
  const warned2mRef  = useRef(false);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
    onSave(text);
    onFinish();
  }, [text, onSave, onFinish]);

  const checkTime = useCallback(() => {
    const left = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
    setTimeLeft(left);
    if (left <= 120 && !warned2mRef.current) {
      warned2mRef.current = true;
      playBeep(440, 0.3, 0.1);
    }
    if (left <= 0) finish();
  }, [finish]);

  useEffect(() => {
    intervalRef.current = setInterval(checkTime, 250);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [checkTime]);

  // Force-recalculate the instant the tab becomes visible
  useEffect(() => {
    const handle = () => { if (!document.hidden) checkTime(); };
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, [checkTime]);

  // Auto-save to localStorage every 10s
  useEffect(() => {
    const id = setInterval(() => onSave(text), 10000);
    return () => clearInterval(id);
  }, [text, onSave]);

  return (
    <div className="min-h-screen bg-background" style={{ backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
      <TimerPill seconds={timeLeft} total={EXTEMPORE_TIMER_SECONDS} />

      <div className="container max-w-3xl pt-20 pb-24 px-4">
        {/* Progress */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>বিষয় {topicIndex + 1} / {topicCount}</span>
          <span>{wordCount} শব্দ</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-6">
          <div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${((topicIndex + 1) / topicCount) * 100}%` }} />
        </div>

        {/* Topic card */}
        <div className="rounded-2xl border bg-background shadow-lg p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">{topic.categoryLabel}</span>
          </div>
          <h2 className="font-heading font-bold text-foreground text-xl sm:text-2xl leading-snug mb-3">
            {topic.topic}
          </h2>
          <p className="text-xs text-muted-foreground border-t pt-3 italic">{topic.hint}</p>
        </div>

        {/* Essay textarea */}
        <div className="rounded-2xl border bg-background shadow-lg overflow-hidden">
          <textarea
            className="w-full min-h-[360px] resize-none bg-transparent px-6 py-5 text-foreground text-base leading-relaxed placeholder:text-muted-foreground/40 focus:outline-none"
            placeholder="এখানে আপনার প্রবন্ধ লিখুন…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
          <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/20 text-xs text-muted-foreground">
            <span>{wordCount} শব্দ · লক্ষ্য: ৩০০–৫০০ শব্দ</span>
            <span className="italic">প্রতি ১০ সেকেন্ডে অটো-সেভ</span>
          </div>
        </div>
      </div>

      {/* Sticky bottom */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <p className="text-sm text-muted-foreground"><span className="font-bold text-foreground">{wordCount}</span> শব্দ লেখা হয়েছে</p>
          <Button size="sm" onClick={() => { onSave(text); onFinish(); }} className="gap-1.5">
            জমা দিন <CheckCircle2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Results screen ─────────────────────────────────────────────────────────────
function ResultsScreen({
  topic,
  userEssay,
  topicIndex,
  topicCount,
  courseId,
  setId,
  onPrev,
  onNext,
  onRetry,
}: {
  topic: ExtemporeEssayTopic;
  userEssay: string;
  topicIndex: number;
  topicCount: number;
  courseId: string;
  setId: string;
  onPrev: () => void;
  onNext: () => void;
  onRetry: () => void;
}) {
  const wordCount = userEssay.trim() ? userEssay.trim().split(/\s+/).length : 0;
  const isLast = topicIndex === topicCount - 1;

  return (
    <div className="min-h-screen bg-background" style={{ backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
      <div className="container max-w-3xl py-10 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📝</div>
          <h1 className="font-heading text-xl font-bold text-foreground">বিষয় {topicIndex + 1} — ফলাফল</h1>
          <p className="mt-1 text-sm text-muted-foreground">{topic.categoryLabel}</p>
        </div>

        {/* Topic */}
        <div className="rounded-xl border bg-card p-5 mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">বিষয়</p>
          <h2 className="font-heading font-bold text-foreground text-lg">{topic.topic}</h2>
        </div>

        {/* Your essay */}
        <div className="rounded-xl border bg-card p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">আপনার প্রবন্ধ</p>
            <span className="text-xs text-muted-foreground">{wordCount} শব্দ</span>
          </div>
          {userEssay.trim() ? (
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{userEssay}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">কোনো উত্তর লেখা হয়নি।</p>
          )}
        </div>

        {/* Model points */}
        <div className="rounded-xl border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 p-5 mb-4">
          <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> মডেল পয়েন্টসমূহ
          </p>
          <ul className="space-y-2">
            {topic.modelPoints.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                {pt}
              </li>
            ))}
          </ul>
        </div>

        {/* Model essay */}
        <details className="rounded-xl border bg-card mb-8 overflow-hidden">
          <summary className="px-5 py-4 cursor-pointer font-heading font-semibold text-foreground text-sm select-none hover:bg-muted/30 transition-colors">
            নমুনা প্রবন্ধ দেখুন ▾
          </summary>
          <div className="px-5 pb-5 pt-2 border-t">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{topic.modelEssay}</p>
          </div>
        </details>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="flex-1 gap-1.5" onClick={onRetry}>
            <RotateCcw className="h-4 w-4" /> আবার চেষ্টা
          </Button>
          {topicIndex > 0 && (
            <Button variant="outline" className="flex-1 gap-1.5" onClick={onPrev}>
              <ChevronLeft className="h-4 w-4" /> আগেরটি
            </Button>
          )}
          {!isLast ? (
            <Button className="flex-1 gap-1.5" onClick={onNext}>
              পরবর্তী বিষয় <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" className="flex-1" asChild>
              <Link to={`/courses/${courseId}/extempore`}>সব সেট দেখুন</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
type Phase = "instructions" | "writing" | "results";

export default function ExtemporeTest() {
  const { id: courseId = "", setId = "" } = useParams<{ id: string; setId: string }>();
  const set = EXTEMPORE_SETS.find((s) => s.id === setId);

  const [topicIndex, setTopicIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("instructions");

  const storageKey = STORAGE_KEY(courseId, setId);

  const loadAnswers = (): Record<string, string> => {
    try { return JSON.parse(localStorage.getItem(storageKey) ?? "{}"); } catch { return {}; }
  };
  const [answers, setAnswers] = useState<Record<string, string>>(loadAnswers);

  const saveAnswer = useCallback((topicId: string, text: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [topicId]: text };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  if (!set) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground">সেটটি পাওয়া যায়নি</h1>
        <Button asChild variant="outline"><Link to={`/courses/${courseId}/extempore`}>ফিরে যান</Link></Button>
      </div>
    );
  }

  const topic = set.topics[topicIndex];

  if (phase === "instructions") {
    return <Instructions topicCount={set.topics.length} onStart={() => setPhase("writing")} />;
  }

  if (phase === "writing") {
    return (
      <WritingScreen
        topic={topic}
        topicIndex={topicIndex}
        topicCount={set.topics.length}
        savedText={answers[topic.id] ?? ""}
        onSave={(text) => saveAnswer(topic.id, text)}
        onFinish={() => setPhase("results")}
      />
    );
  }

  return (
    <ResultsScreen
      topic={topic}
      userEssay={answers[topic.id] ?? ""}
      topicIndex={topicIndex}
      topicCount={set.topics.length}
      courseId={courseId}
      setId={setId}
      onPrev={() => { setTopicIndex((i) => i - 1); setPhase("results"); }}
      onNext={() => { setTopicIndex((i) => i + 1); setPhase("writing"); }}
      onRetry={() => setPhase("writing")}
    />
  );
}

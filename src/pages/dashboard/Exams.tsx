import { ClipboardList, Lock, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MOCK_EXAMS = [
  {
    id: "e1",
    title: "ISSB মক টেস্ট — ১",
    subject: "সাধারণ জ্ঞান ও বুদ্ধিমত্তা",
    duration: "৩০ মিনিট",
    questions: 30,
    status: "available" as const,
    score: null,
  },
  {
    id: "e2",
    title: "ISSB মক টেস্ট — ২",
    subject: "গণিত ও যুক্তি",
    duration: "৪৫ মিনিট",
    questions: 40,
    status: "available" as const,
    score: null,
  },
  {
    id: "e3",
    title: "ক্যাডেট কলেজ মডেল টেস্ট",
    subject: "বাংলা, ইংরেজি ও গণিত",
    duration: "৬০ মিনিট",
    questions: 60,
    status: "completed" as const,
    score: 78,
  },
  {
    id: "e4",
    title: "WAT প্র্যাকটিস সেশন",
    subject: "Word Association Test",
    duration: "১৫ মিনিট",
    questions: 60,
    status: "locked" as const,
    score: null,
  },
];

type ExamStatus = "available" | "completed" | "locked";

const STATUS_CONFIG: Record<ExamStatus, { label: string; color: string; icon: React.ReactNode }> = {
  available: { label: "দেওয়া যাবে",  color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",   icon: <CheckCircle2 className="h-3 w-3" /> },
  completed: { label: "সম্পন্ন",     color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",        icon: <CheckCircle2 className="h-3 w-3" /> },
  locked:    { label: "লক করা",      color: "bg-muted text-muted-foreground",                                           icon: <Lock className="h-3 w-3" /> },
};

export default function Exams() {
  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">পরীক্ষা</h1>
          <p className="mt-1 text-sm text-muted-foreground">মক টেস্ট ও মডেল টেস্ট — প্রস্তুতি যাচাই করুন</p>
        </div>
        <Badge variant="outline" className="text-xs">শীঘ্রই আসছে</Badge>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {MOCK_EXAMS.map((exam) => {
          const config = STATUS_CONFIG[exam.status];
          return (
            <div key={exam.id} className={`rounded-xl border border-border bg-card p-5 shadow-sm ${exam.status === "locked" ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  {exam.status === "locked"
                    ? <Lock className="h-5 w-5 text-muted-foreground" />
                    : <ClipboardList className="h-5 w-5 text-accent" />
                  }
                </div>
                <Badge className={`flex items-center gap-1 text-xs ${config.color}`}>
                  {config.icon} {config.label}
                </Badge>
              </div>

              <h3 className="mt-3 font-medium text-foreground">{exam.title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{exam.subject}</p>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {exam.duration}
                </span>
                <span className="flex items-center gap-1">
                  <ClipboardList className="h-3 w-3" /> {exam.questions}টি প্রশ্ন
                </span>
                {exam.score !== null && (
                  <span className="font-medium text-accent">স্কোর: {exam.score}%</span>
                )}
              </div>

              <div className="mt-4">
                {exam.status === "completed" ? (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    ফলাফল দেখুন (শীঘ্রই)
                  </Button>
                ) : exam.status === "locked" ? (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    <Lock className="mr-2 h-3.5 w-3.5" /> লক করা
                  </Button>
                ) : (
                  <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled>
                    পরীক্ষা দিন (শীঘ্রই)
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
        <ClipboardList className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="font-medium text-muted-foreground">পরীক্ষার সিস্টেম শীঘ্রই আসছে</p>
        <p className="mt-1 text-sm text-muted-foreground">অনলাইন মক টেস্ট ও ফলাফল বিশ্লেষণ সুবিধা খুব শীঘ্রই যোগ হবে।</p>
      </div>
    </div>
  );
}

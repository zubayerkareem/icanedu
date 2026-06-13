import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, Save, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { useAdminCourses } from "@/hooks/useAdminCourses";
import {
  useAdminIQSets, useAdminWATSets, useAdminISTSets,
  useAdminExtemporeSets, useAdminPPDTSets,
  useAdminPictureStorySets, useAdminIncompleteStorySets,
  useUpsertIQSet, useDeleteIQSet, useUpsertIQQuestion, useDeleteIQQuestion,
  useUpsertWATSet, useDeleteWATSet,
  useUpsertISTSet, useDeleteISTSet, useUpsertISTSentence, useDeleteISTSentence,
  useUpsertExtemporeSet, useDeleteExtemporeSet, useUpsertExtemporeTopic, useDeleteExtemporeTopic,
  useUpsertPPDTSet, useDeletePPDTSet, useUpsertPPDTPicture, useDeletePPDTPicture,
  useUpsertPictureStorySet, useDeletePictureStorySet, useUpsertPictureStoryPicture, useDeletePictureStoryPicture,
  useUpsertIncompleteStorySet, useDeleteIncompleteStorySet, useUpsertIncompleteStory, useDeleteIncompleteStory,
  useAdminPlanningTaskSets, useUpsertPlanningTaskSet, useDeletePlanningTaskSet, useUpsertPlanningTask, useDeletePlanningTask,
} from "@/hooks/useISSBAdmin";
import type {
  IQSet, IQQuestion, IQOption,
  WATSet, ISTSet, ISTSentence,
  ExtemporeSet, ExtemporeTopic,
  PPDTSet, PPDTPicture,
  PictureStorySet, PictureStoryPicture,
  IncompleteStorySet, IncompleteStory,
  PlanningTaskSet, PlanningTask,
} from "@/lib/issb/types";

const uid = () => Math.random().toString(36).slice(2, 10);

// ─── Shared helpers ───────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function CourseSelect({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const { data: courses = [] } = useAdminCourses();
  return (
    <Select value={value ?? "none"} onValueChange={(v) => onChange(v === "none" ? "" : v)}>
      <SelectTrigger className="h-8 text-xs">
        <SelectValue placeholder="কোর্স নির্বাচন করুন" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">— কোনো কোর্স নয় (গ্লোবাল) —</SelectItem>
        {courses.map((c) => (
          <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SetHeader({
  expanded, onToggle, title, badge, onDelete, isPending,
}: {
  expanded: boolean; onToggle: () => void;
  title: string; badge?: string;
  onDelete: () => void; isPending?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
      <button onClick={onToggle} className="flex flex-1 items-center gap-2 text-left">
        {expanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
        <span className="font-medium text-foreground">{title}</span>
        {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
      </button>
      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" disabled={isPending} onClick={onDelete}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// IQ TAB
// ═══════════════════════════════════════════════════════════════

function IQTab() {
  const { data: sets = [], refetch } = useAdminIQSets();
  const upsertSet = useUpsertIQSet();
  const deleteSet = useDeleteIQSet();
  const upsertQ = useUpsertIQQuestion();
  const deleteQ = useDeleteIQQuestion();
  const [expanded, setExpanded] = useState<string | null>(null);

  async function addSet() {
    await upsertSet.mutateAsync({ title: "নতুন IQ সেট", timer_seconds: 300, is_published: true });
    toast.success("সেট যোগ হয়েছে");
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <p className="text-sm text-muted-foreground">প্রতিটি সেটে MCQ প্রশ্ন যোগ করুন। সঠিক উত্তর চিহ্নিত করুন।</p>
        <Button size="sm" onClick={addSet}><Plus className="mr-2 h-4 w-4" /> সেট যোগ</Button>
      </div>
      {sets.map((s) => (
        <IQSetCard key={s.id} set={s} expanded={expanded === s.id}
          onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
          onDelete={async () => { await deleteSet.mutateAsync(s.id); toast.success("মুছে ফেলা হয়েছে"); }}
          upsertSet={upsertSet} upsertQ={upsertQ} deleteQ={deleteQ} />
      ))}
      {sets.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">কোনো IQ সেট নেই। উপরে যোগ করুন।</p>}
    </div>
  );
}

function IQSetCard({ set, expanded, onToggle, onDelete, upsertSet, upsertQ, deleteQ }: {
  set: IQSet; expanded: boolean; onToggle: () => void; onDelete: () => void;
  upsertSet: ReturnType<typeof useUpsertIQSet>;
  upsertQ: ReturnType<typeof useUpsertIQQuestion>;
  deleteQ: ReturnType<typeof useDeleteIQQuestion>;
}) {
  const [title, setTitle] = useState(set.title);
  const [timer, setTimer] = useState(String(set.timer_seconds));
  const [pub, setPub] = useState(set.is_published);
  const [free, setFree] = useState(set.is_free ?? false);
  const [courseId, setCourseId] = useState(set.course_id ?? "");

  async function save() {
    await upsertSet.mutateAsync({ id: set.id, title, timer_seconds: Number(timer), is_published: pub, is_free: free, course_id: courseId || undefined });
    toast.success("সেট আপডেট হয়েছে");
  }

  async function addQuestion() {
    const optId = () => uid();
    const opts: IQOption[] = [
      { id: optId(), text: "অপশন ১" },
      { id: optId(), text: "অপশন ২" },
      { id: optId(), text: "অপশন ৩" },
      { id: optId(), text: "অপশন ৪" },
    ];
    await upsertQ.mutateAsync({ set_id: set.id, text: "নতুন প্রশ্ন", options: opts, correct: opts[0].id, order_index: (set.iq_questions?.length ?? 0) });
  }

  const questions = (set.iq_questions ?? []).sort((a, b) => a.order_index - b.order_index);

  return (
    <div>
      <SetHeader expanded={expanded} onToggle={onToggle}
        title={set.title} badge={`${questions.length} প্রশ্ন`}
        onDelete={onDelete} isPending={false} />
      {expanded && (
        <div className="mt-1 rounded-lg border border-border bg-muted/20 p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="শিরোনাম"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
            <Field label="সময় (সেকেন্ড)"><Input type="number" value={timer} onChange={(e) => setTimer(e.target.value)} /></Field>
            <Field label="কোর্স"><CourseSelect value={courseId} onChange={setCourseId} /></Field>
          </div>
          <div className="flex items-center gap-6">
            <Field label="প্রকাশিত">
              <div className="flex items-center gap-2 pt-1"><Switch checked={pub} onCheckedChange={setPub} /><span className="text-sm">{pub ? "হ্যাঁ" : "না"}</span></div>
            </Field>
            <Field label="ফ্রি প্রিভিউ">
              <div className="flex items-center gap-2 pt-1"><Switch checked={free} onCheckedChange={setFree} /><span className="text-sm text-green-600">{free ? "ফ্রি" : "প্রিমিয়াম"}</span></div>
            </Field>
          </div>
          <Button size="sm" onClick={save}><Save className="mr-2 h-3.5 w-3.5" /> সেট সংরক্ষণ</Button>

          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">প্রশ্নসমূহ</p>
              <Button size="sm" variant="outline" onClick={addQuestion}><Plus className="mr-1 h-3.5 w-3.5" /> প্রশ্ন</Button>
            </div>
            {questions.map((q, qi) => (
              <IQQuestionCard key={q.id} question={q} index={qi}
                upsertQ={upsertQ} onDelete={() => deleteQ.mutateAsync(q.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function IQQuestionCard({ question, index, upsertQ, onDelete }: {
  question: IQQuestion; index: number;
  upsertQ: ReturnType<typeof useUpsertIQQuestion>;
  onDelete: () => void;
}) {
  const [text, setText] = useState(question.text);
  const [options, setOptions] = useState<IQOption[]>(question.options);
  const [correct, setCorrect] = useState(question.correct);
  const [dirty, setDirty] = useState(false);

  function setOpt(i: number, val: string) {
    setOptions((o) => o.map((x, j) => j === i ? { ...x, text: val } : x));
    setDirty(true);
  }

  function addOption() {
    const newOpt: IQOption = { id: uid(), text: `অপশন ${options.length + 1}` };
    setOptions((o) => [...o, newOpt]);
    setDirty(true);
  }

  function removeOption(id: string) {
    if (options.length <= 2) return;
    setOptions((o) => o.filter((x) => x.id !== id));
    if (correct === id) setCorrect(options.find((x) => x.id !== id)?.id ?? "");
    setDirty(true);
  }

  async function save() {
    await upsertQ.mutateAsync({ id: question.id, set_id: question.set_id, text, options, correct, order_index: index });
    setDirty(false);
    toast.success("প্রশ্ন সংরক্ষিত");
  }

  return (
    <div className="rounded-md border border-border bg-card p-3 space-y-2">
      <div className="flex items-start gap-2">
        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-accent/10 text-xs font-bold text-accent">{index + 1}</span>
        <Input value={text} onChange={(e) => { setText(e.target.value); setDirty(true); }} placeholder="প্রশ্নের টেক্সট" className="flex-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={onDelete}><X className="h-3.5 w-3.5" /></Button>
      </div>
      <div className="grid grid-cols-2 gap-2 pl-7">
        {options.map((o, i) => (
          <div key={o.id} className={`flex items-center gap-1.5 rounded-md border px-2 py-1 ${correct === o.id ? "border-success bg-success/10" : "border-border"}`}>
            <input type="radio" name={`correct-${question.id}`} checked={correct === o.id}
              onChange={() => { setCorrect(o.id); setDirty(true); }}
              className="accent-success shrink-0" />
            <Input value={o.text} onChange={(e) => setOpt(i, e.target.value)}
              className="h-7 border-0 bg-transparent px-1 text-xs focus-visible:ring-0 flex-1" placeholder={`অপশন ${i + 1}`} />
            {options.length > 2 && (
              <button onClick={() => removeOption(o.id)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="pl-7 flex items-center gap-2">
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addOption}>
          <Plus className="mr-1 h-3 w-3" /> অপশন যোগ
        </Button>
        {dirty && <Button size="sm" onClick={save}><Save className="mr-1 h-3 w-3" /> সংরক্ষণ</Button>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// WAT TAB
// ═══════════════════════════════════════════════════════════════

function WATTab() {
  const { data: sets = [] } = useAdminWATSets();
  const upsert = useUpsertWATSet();
  const del = useDeleteWATSet();
  const [expanded, setExpanded] = useState<string | null>(null);

  async function addSet() {
    await upsert.mutateAsync({ title: "নতুন WAT সেট", words: [], word_seconds: 10, is_published: true });
    toast.success("সেট যোগ হয়েছে");
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <p className="text-sm text-muted-foreground">প্রতিটি শব্দের জন্য সময় সেট করুন। শব্দগুলি একটি একটি করে দেখানো হবে।</p>
        <Button size="sm" onClick={addSet}><Plus className="mr-2 h-4 w-4" /> সেট যোগ</Button>
      </div>
      {sets.map((s) => (
        <WATSetCard key={s.id} set={s} expanded={expanded === s.id}
          onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
          onDelete={async () => { await del.mutateAsync(s.id); toast.success("মুছে ফেলা হয়েছে"); }}
          upsert={upsert} />
      ))}
    </div>
  );
}

function WATSetCard({ set, expanded, onToggle, onDelete, upsert }: {
  set: WATSet; expanded: boolean; onToggle: () => void; onDelete: () => void;
  upsert: ReturnType<typeof useUpsertWATSet>;
}) {
  const [title, setTitle] = useState(set.title);
  const [wordSec, setWordSec] = useState(String(set.word_seconds));
  const [pub, setPub] = useState(set.is_published);
  const [free, setFree] = useState(set.is_free ?? false);
  const [courseId, setCourseId] = useState(set.course_id ?? "");
  const [wordsText, setWordsText] = useState((set.words ?? []).join("\n"));

  async function save() {
    const words = wordsText.split("\n").map((w) => w.trim()).filter(Boolean);
    await upsert.mutateAsync({ id: set.id, title, words, word_seconds: Number(wordSec), is_published: pub, is_free: free, course_id: courseId || undefined });
    toast.success("WAT সেট সংরক্ষিত");
  }

  const wordCount = wordsText.split("\n").filter((w) => w.trim()).length;

  return (
    <div>
      <SetHeader expanded={expanded} onToggle={onToggle}
        title={set.title} badge={`${wordCount} শব্দ`}
        onDelete={onDelete} />
      {expanded && (
        <div className="mt-1 rounded-lg border border-border bg-muted/20 p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="শিরোনাম"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
            <Field label="প্রতি শব্দ (সেকেন্ড)"><Input type="number" value={wordSec} onChange={(e) => setWordSec(e.target.value)} /></Field>
            <Field label="কোর্স"><CourseSelect value={courseId} onChange={setCourseId} /></Field>
          </div>
          <div className="flex items-center gap-6">
            <Field label="প্রকাশিত">
              <div className="flex items-center gap-2 pt-1"><Switch checked={pub} onCheckedChange={setPub} /></div>
            </Field>
            <Field label="ফ্রি প্রিভিউ">
              <div className="flex items-center gap-2 pt-1"><Switch checked={free} onCheckedChange={setFree} /><span className="text-sm text-green-600">{free ? "ফ্রি" : "প্রিমিয়াম"}</span></div>
            </Field>
          </div>
          <Field label={`শব্দ তালিকা (প্রতি লাইনে একটি) — ${wordCount}টি শব্দ`}>
            <textarea value={wordsText} onChange={(e) => setWordsText(e.target.value)} rows={12}
              placeholder={"অগ্নি\nবীর\nদেশ\nসাহস\n..."}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </Field>
          <Button size="sm" onClick={save}><Save className="mr-2 h-3.5 w-3.5" /> সংরক্ষণ</Button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// IST TAB
// ═══════════════════════════════════════════════════════════════

function ISTTab() {
  const { data: sets = [] } = useAdminISTSets();
  const upsertSet = useUpsertISTSet();
  const deleteSet = useDeleteISTSet();
  const upsertS = useUpsertISTSentence();
  const deleteS = useDeleteISTSentence();
  const [expanded, setExpanded] = useState<string | null>(null);

  async function addSet() {
    await upsertSet.mutateAsync({ title: "নতুন IST সেট", timer_seconds: 300, is_published: true });
    toast.success("সেট যোগ হয়েছে");
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <p className="text-sm text-muted-foreground">অসম্পূর্ণ বাক্যের stem ও example উত্তর যোগ করুন।</p>
        <Button size="sm" onClick={addSet}><Plus className="mr-2 h-4 w-4" /> সেট যোগ</Button>
      </div>
      {sets.map((s) => (
        <ISTSetCard key={s.id} set={s} expanded={expanded === s.id}
          onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
          onDelete={async () => { await deleteSet.mutateAsync(s.id); toast.success("মুছে ফেলা হয়েছে"); }}
          upsertSet={upsertSet} upsertS={upsertS} deleteS={deleteS} />
      ))}
    </div>
  );
}

function ISTSetCard({ set, expanded, onToggle, onDelete, upsertSet, upsertS, deleteS }: {
  set: ISTSet; expanded: boolean; onToggle: () => void; onDelete: () => void;
  upsertSet: ReturnType<typeof useUpsertISTSet>;
  upsertS: ReturnType<typeof useUpsertISTSentence>;
  deleteS: ReturnType<typeof useDeleteISTSentence>;
}) {
  const [title, setTitle] = useState(set.title);
  const [timer, setTimer] = useState(String(set.timer_seconds));
  const [courseId, setCourseId] = useState(set.course_id ?? "");
  const [free, setFree] = useState(set.is_free ?? false);
  const sentences = (set.ist_sentences ?? []).sort((a, b) => a.order_index - b.order_index);

  async function addSentence() {
    await upsertS.mutateAsync({ set_id: set.id, stem: "আমি...", example: "", order_index: sentences.length });
  }

  return (
    <div>
      <SetHeader expanded={expanded} onToggle={onToggle}
        title={set.title} badge={`${sentences.length} বাক্য`} onDelete={onDelete} />
      {expanded && (
        <div className="mt-1 rounded-lg border border-border bg-muted/20 p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="শিরোনাম"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
            <Field label="মোট সময় (সেকেন্ড)"><Input type="number" value={timer} onChange={(e) => setTimer(e.target.value)} /></Field>
            <Field label="কোর্স"><CourseSelect value={courseId} onChange={setCourseId} /></Field>
          </div>
          <div className="flex items-center gap-6">
            <Field label="ফ্রি প্রিভিউ">
              <div className="flex items-center gap-2 pt-1"><Switch checked={free} onCheckedChange={setFree} /><span className="text-sm text-green-600">{free ? "ফ্রি" : "প্রিমিয়াম"}</span></div>
            </Field>
          </div>
          <Button size="sm" onClick={async () => { await upsertSet.mutateAsync({ id: set.id, title, timer_seconds: Number(timer), is_free: free, course_id: courseId || undefined }); toast.success("সংরক্ষিত"); }}>
            <Save className="mr-2 h-3.5 w-3.5" /> সেট সংরক্ষণ
          </Button>
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">বাক্যসমূহ</p>
              <Button size="sm" variant="outline" onClick={addSentence}><Plus className="mr-1 h-3.5 w-3.5" /> বাক্য</Button>
            </div>
            {sentences.map((s, i) => (
              <SentenceRow key={s.id} sentence={s} index={i} upsertS={upsertS} deleteS={deleteS} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SentenceRow({ sentence, index, upsertS, deleteS }: {
  sentence: ISTSentence; index: number;
  upsertS: ReturnType<typeof useUpsertISTSentence>;
  deleteS: ReturnType<typeof useDeleteISTSentence>;
}) {
  const [stem, setStem] = useState(sentence.stem);
  const [example, setExample] = useState(sentence.example);
  const [dirty, setDirty] = useState(false);

  return (
    <div className="flex items-start gap-2 rounded-md border border-border bg-card p-2">
      <span className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-accent/10 text-xs font-bold text-accent">{index + 1}</span>
      <div className="flex-1 space-y-1">
        <Input value={stem} onChange={(e) => { setStem(e.target.value); setDirty(true); }} placeholder="বাক্যের stem (যেমন: আমি...)" className="text-sm" />
        <Input value={example} onChange={(e) => { setExample(e.target.value); setDirty(true); }} placeholder="উদাহরণ উত্তর (ঐচ্ছিক)" className="text-sm text-muted-foreground" />
      </div>
      {dirty && <Button size="sm" variant="outline" className="shrink-0" onClick={async () => { await upsertS.mutateAsync({ id: sentence.id, set_id: sentence.set_id, stem, example, order_index: index }); setDirty(false); }}><Save className="h-3.5 w-3.5" /></Button>}
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => deleteS.mutateAsync(sentence.id)}><X className="h-3.5 w-3.5" /></Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EXTEMPORE TAB
// ═══════════════════════════════════════════════════════════════

function ExtemporeTab() {
  const { data: sets = [] } = useAdminExtemporeSets();
  const upsertSet = useUpsertExtemporeSet();
  const deleteSet = useDeleteExtemporeSet();
  const upsertT = useUpsertExtemporeTopic();
  const deleteT = useDeleteExtemporeTopic();
  const [expanded, setExpanded] = useState<string | null>(null);

  async function addSet() {
    await upsertSet.mutateAsync({ title: "নতুন Extempore সেট", timer_seconds: 1500, is_published: true });
    toast.success("সেট যোগ হয়েছে");
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <p className="text-sm text-muted-foreground">প্রতিটি topic-এ hint, model points ও model essay যোগ করুন।</p>
        <Button size="sm" onClick={addSet}><Plus className="mr-2 h-4 w-4" /> সেট যোগ</Button>
      </div>
      {sets.map((s) => (
        <ExtemporeSetCard key={s.id} set={s} expanded={expanded === s.id}
          onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
          onDelete={async () => { await deleteSet.mutateAsync(s.id); toast.success("মুছে ফেলা হয়েছে"); }}
          upsertSet={upsertSet} upsertT={upsertT} deleteT={deleteT} />
      ))}
    </div>
  );
}

function ExtemporeSetCard({ set, expanded, onToggle, onDelete, upsertSet, upsertT, deleteT }: {
  set: ExtemporeSet; expanded: boolean; onToggle: () => void; onDelete: () => void;
  upsertSet: ReturnType<typeof useUpsertExtemporeSet>;
  upsertT: ReturnType<typeof useUpsertExtemporeTopic>;
  deleteT: ReturnType<typeof useDeleteExtemporeTopic>;
}) {
  const [title, setTitle] = useState(set.title);
  const [timer, setTimer] = useState(String(set.timer_seconds));
  const [courseId, setCourseId] = useState(set.course_id ?? "");
  const [free, setFree] = useState(set.is_free ?? false);
  const topics = (set.extempore_topics ?? []).sort((a, b) => a.order_index - b.order_index);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  async function addTopic() {
    await upsertT.mutateAsync({ set_id: set.id, topic: "নতুন বিষয়", category: "general", hint: "", model_points: [], model_essay: "", order_index: topics.length });
  }

  return (
    <div>
      <SetHeader expanded={expanded} onToggle={onToggle}
        title={set.title} badge={`${topics.length} বিষয়`} onDelete={onDelete} />
      {expanded && (
        <div className="mt-1 rounded-lg border border-border bg-muted/20 p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="শিরোনাম"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
            <Field label="সময় (সেকেন্ড)"><Input type="number" value={timer} onChange={(e) => setTimer(e.target.value)} /></Field>
            <Field label="কোর্স"><CourseSelect value={courseId} onChange={setCourseId} /></Field>
          </div>
          <div className="flex items-center gap-6">
            <Field label="ফ্রি প্রিভিউ">
              <div className="flex items-center gap-2 pt-1"><Switch checked={free} onCheckedChange={setFree} /><span className="text-sm text-green-600">{free ? "ফ্রি" : "প্রিমিয়াম"}</span></div>
            </Field>
          </div>
          <Button size="sm" onClick={async () => { await upsertSet.mutateAsync({ id: set.id, title, timer_seconds: Number(timer), is_free: free, course_id: courseId || undefined }); toast.success("সংরক্ষিত"); }}>
            <Save className="mr-2 h-3.5 w-3.5" /> সেট সংরক্ষণ
          </Button>
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">বিষয়সমূহ</p>
              <Button size="sm" variant="outline" onClick={addTopic}><Plus className="mr-1 h-3.5 w-3.5" /> বিষয়</Button>
            </div>
            {topics.map((t, i) => (
              <TopicCard key={t.id} topic={t} index={i} expanded={expandedTopic === t.id}
                onToggle={() => setExpandedTopic(expandedTopic === t.id ? null : t.id)}
                upsertT={upsertT} deleteT={deleteT} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TopicCard({ topic, index, expanded, onToggle, upsertT, deleteT }: {
  topic: ExtemporeTopic; index: number; expanded: boolean; onToggle: () => void;
  upsertT: ReturnType<typeof useUpsertExtemporeTopic>;
  deleteT: ReturnType<typeof useDeleteExtemporeTopic>;
}) {
  const [t, setT] = useState(topic.topic);
  const [hint, setHint] = useState(topic.hint);
  const [pointsText, setPointsText] = useState((topic.model_points ?? []).join("\n"));
  const [essay, setEssay] = useState(topic.model_essay);
  const [cat, setCat] = useState(topic.category);

  async function save() {
    await upsertT.mutateAsync({ id: topic.id, set_id: topic.set_id, topic: t, category: cat, hint, model_points: pointsText.split("\n").filter(Boolean), model_essay: essay, order_index: index });
    toast.success("সংরক্ষিত");
  }

  return (
    <div className="rounded-md border border-border bg-card">
      <div className="flex items-center gap-2 px-3 py-2">
        <button onClick={onToggle} className="flex flex-1 items-center gap-2 text-left text-sm">
          {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          <span className="font-medium">{index + 1}. {topic.topic}</span>
        </button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteT.mutateAsync(topic.id)}><X className="h-3.5 w-3.5" /></Button>
      </div>
      {expanded && (
        <div className="border-t border-border px-3 py-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="বিষয়"><Input value={t} onChange={(e) => setT(e.target.value)} /></Field>
            <Field label="ক্যাটাগরি">
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["general","current_affairs","abstract","social","ethics","quote"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Hint (চিন্তার সংকেত)">
            <Input value={hint} onChange={(e) => setHint(e.target.value)} placeholder="প্রধান বিন্দু..." />
          </Field>
          <Field label="Model Points (প্রতি লাইনে একটি)">
            <textarea value={pointsText} onChange={(e) => setPointsText(e.target.value)} rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </Field>
          <Field label="Model Essay">
            <textarea value={essay} onChange={(e) => setEssay(e.target.value)} rows={6}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </Field>
          <Button size="sm" onClick={save}><Save className="mr-2 h-3.5 w-3.5" /> সংরক্ষণ</Button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PICTURE TESTS TAB (PPDT + Picture Story)
// ═══════════════════════════════════════════════════════════════

function PictureTab() {
  return (
    <Tabs defaultValue="ppdt">
      <TabsList className="mb-4">
        <TabsTrigger value="ppdt">PPDT</TabsTrigger>
        <TabsTrigger value="picture-story">Picture Story</TabsTrigger>
      </TabsList>
      <TabsContent value="ppdt"><PPDTSection /></TabsContent>
      <TabsContent value="picture-story"><PictureStorySection /></TabsContent>
    </Tabs>
  );
}

function PPDTSection() {
  const { data: sets = [] } = useAdminPPDTSets();
  const upsertSet = useUpsertPPDTSet();
  const deleteSet = useDeletePPDTSet();
  const upsertP = useUpsertPPDTPicture();
  const deleteP = useDeletePPDTPicture();
  const [expanded, setExpanded] = useState<string | null>(null);

  async function addSet() {
    await upsertSet.mutateAsync({ title: "নতুন PPDT সেট", observe_seconds: 30, write_seconds: 270, is_published: true });
    toast.success("সেট যোগ হয়েছে");
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <p className="text-sm text-muted-foreground">প্রতিটি সেটে ছবি আপলোড করুন। পর্যবেক্ষণ ও লেখার সময় সেট করুন।</p>
        <Button size="sm" onClick={addSet}><Plus className="mr-2 h-4 w-4" /> সেট যোগ</Button>
      </div>
      {sets.map((s) => (
        <PictureSetCard key={s.id} set={s} expanded={expanded === s.id}
          onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
          onDelete={async () => { await deleteSet.mutateAsync(s.id); }}
          tablePrefix="ppdt" upsertSet={upsertSet} upsertP={upsertP} deleteP={deleteP}
          pictures={(s.ppdt_pictures ?? []).sort((a, b) => a.order_index - b.order_index)} />
      ))}
    </div>
  );
}

function PictureStorySection() {
  const { data: sets = [] } = useAdminPictureStorySets();
  const upsertSet = useUpsertPictureStorySet();
  const deleteSet = useDeletePictureStorySet();
  const upsertP = useUpsertPictureStoryPicture();
  const deleteP = useDeletePictureStoryPicture();
  const [expanded, setExpanded] = useState<string | null>(null);

  async function addSet() {
    await upsertSet.mutateAsync({ title: "নতুন Picture Story সেট", observe_seconds: 30, write_seconds: 60, is_published: true });
    toast.success("সেট যোগ হয়েছে");
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <p className="text-sm text-muted-foreground">Picture Story সেটে ছবি ও idea যোগ করুন।</p>
        <Button size="sm" onClick={addSet}><Plus className="mr-2 h-4 w-4" /> সেট যোগ</Button>
      </div>
      {sets.map((s) => (
        <PictureSetCard key={s.id} set={s} expanded={expanded === s.id}
          onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
          onDelete={async () => { await deleteSet.mutateAsync(s.id); }}
          tablePrefix="picture_story" upsertSet={upsertSet} upsertP={upsertP} deleteP={deleteP}
          pictures={(s.picture_story_pictures ?? []).sort((a, b) => a.order_index - b.order_index)} />
      ))}
    </div>
  );
}

function PictureSetCard({ set, expanded, onToggle, onDelete, tablePrefix, upsertSet, upsertP, deleteP, pictures }: {
  set: PPDTSet | PictureStorySet; expanded: boolean; onToggle: () => void; onDelete: () => void;
  tablePrefix: "ppdt" | "picture_story";
  upsertSet: ReturnType<typeof useUpsertPPDTSet> | ReturnType<typeof useUpsertPictureStorySet>;
  upsertP: ReturnType<typeof useUpsertPPDTPicture> | ReturnType<typeof useUpsertPictureStoryPicture>;
  deleteP: ReturnType<typeof useDeletePPDTPicture> | ReturnType<typeof useDeletePictureStoryPicture>;
  pictures: (PPDTPicture | PictureStoryPicture)[];
}) {
  const [title, setTitle] = useState(set.title);
  const [obsS, setObsS] = useState(String(set.observe_seconds));
  const [wrS, setWrS] = useState(String(set.write_seconds));
  const [courseId, setCourseId] = useState(set.course_id ?? "");
  const [free, setFree] = useState(set.is_free ?? false);

  async function addPicture() {
    (upsertP as ReturnType<typeof useUpsertPPDTPicture>).mutateAsync({
      set_id: set.id,
      picture_number: pictures.length + 1,
      image_url: "",
      title: "",
      idea: "",
      order_index: pictures.length,
    });
  }

  return (
    <div>
      <SetHeader expanded={expanded} onToggle={onToggle}
        title={set.title} badge={`${pictures.length} ছবি`} onDelete={onDelete} />
      {expanded && (
        <div className="mt-1 rounded-lg border border-border bg-muted/20 p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="শিরোনাম"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
            <Field label="পর্যবেক্ষণ (সেকেন্ড)"><Input type="number" value={obsS} onChange={(e) => setObsS(e.target.value)} /></Field>
            <Field label="লেখার সময় (সেকেন্ড)"><Input type="number" value={wrS} onChange={(e) => setWrS(e.target.value)} /></Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="কোর্স"><CourseSelect value={courseId} onChange={setCourseId} /></Field>
            <Field label="ফ্রি প্রিভিউ">
              <div className="flex items-center gap-2 pt-1"><Switch checked={free} onCheckedChange={setFree} /><span className="text-sm text-green-600">{free ? "ফ্রি" : "প্রিমিয়াম"}</span></div>
            </Field>
          </div>
          <Button size="sm" onClick={async () => {
            await (upsertSet as ReturnType<typeof useUpsertPPDTSet>).mutateAsync({ id: set.id, title, observe_seconds: Number(obsS), write_seconds: Number(wrS), is_free: free, course_id: courseId || undefined });
            toast.success("সংরক্ষিত");
          }}>
            <Save className="mr-2 h-3.5 w-3.5" /> সেট সংরক্ষণ
          </Button>
          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ছবিসমূহ</p>
              <Button size="sm" variant="outline" onClick={addPicture}><Plus className="mr-1 h-3.5 w-3.5" /> ছবি</Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {pictures.map((p, i) => (
                <PictureCard key={p.id} picture={p} index={i} upsertP={upsertP} deleteP={deleteP} setId={set.id} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PictureCard({ picture, index, upsertP, deleteP, setId }: {
  picture: PPDTPicture | PictureStoryPicture; index: number;
  upsertP: ReturnType<typeof useUpsertPPDTPicture> | ReturnType<typeof useUpsertPictureStoryPicture>;
  deleteP: ReturnType<typeof useDeletePPDTPicture> | ReturnType<typeof useDeletePictureStoryPicture>;
  setId: string;
}) {
  const [url, setUrl] = useState(picture.image_url);
  const [title, setTitle] = useState(picture.title);
  const [idea, setIdea] = useState(picture.idea);

  async function save() {
    await (upsertP as ReturnType<typeof useUpsertPPDTPicture>).mutateAsync({
      id: picture.id, set_id: setId,
      picture_number: index + 1, image_url: url, title, idea, order_index: index,
    });
    toast.success("ছবি সংরক্ষিত");
  }

  return (
    <div className="rounded-md border border-border bg-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">ছবি {index + 1}</span>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => (deleteP as ReturnType<typeof useDeletePPDTPicture>).mutateAsync(picture.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <ImageUpload value={url} onChange={setUrl} folder="thumbnails" />
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ছবির শিরোনাম" className="text-sm" />
      <Input value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Idea / হিন্ট" className="text-sm" />
      <Button size="sm" className="w-full" onClick={save}><Save className="mr-2 h-3.5 w-3.5" /> সংরক্ষণ</Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// INCOMPLETE STORY TAB
// ═══════════════════════════════════════════════════════════════

function IncompleteStoryTab() {
  const { data: sets = [] } = useAdminIncompleteStorySets();
  const upsertSet = useUpsertIncompleteStorySet();
  const deleteSet = useDeleteIncompleteStorySet();
  const upsertS = useUpsertIncompleteStory();
  const deleteS = useDeleteIncompleteStory();
  const [expanded, setExpanded] = useState<string | null>(null);

  async function addSet() {
    await upsertSet.mutateAsync({ title: "নতুন গল্প সেট", is_published: true });
    toast.success("সেট যোগ হয়েছে");
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <p className="text-sm text-muted-foreground">অসম্পূর্ণ গল্পের body, word limit ও idea যোগ করুন।</p>
        <Button size="sm" onClick={addSet}><Plus className="mr-2 h-4 w-4" /> সেট যোগ</Button>
      </div>
      {sets.map((s) => (
        <IncompleteStorySetCard key={s.id} set={s} expanded={expanded === s.id}
          onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
          onDelete={async () => { await deleteSet.mutateAsync(s.id); toast.success("মুছে ফেলা হয়েছে"); }}
          upsertSet={upsertSet} upsertS={upsertS} deleteS={deleteS} />
      ))}
    </div>
  );
}

function IncompleteStorySetCard({ set, expanded, onToggle, onDelete, upsertSet, upsertS, deleteS }: {
  set: IncompleteStorySet; expanded: boolean; onToggle: () => void; onDelete: () => void;
  upsertSet: ReturnType<typeof useUpsertIncompleteStorySet>;
  upsertS: ReturnType<typeof useUpsertIncompleteStory>;
  deleteS: ReturnType<typeof useDeleteIncompleteStory>;
}) {
  const [title, setTitle] = useState(set.title);
  const [courseId, setCourseId] = useState(set.course_id ?? "");
  const [free, setFree] = useState(set.is_free ?? false);
  const stories = (set.incomplete_stories ?? []).sort((a, b) => a.order_index - b.order_index);
  const [expandedStory, setExpandedStory] = useState<string | null>(null);

  async function addStory() {
    await upsertS.mutateAsync({ set_id: set.id, title: "নতুন গল্প", body: "গল্পটি শুরু হয়েছিল...", word_limit: 200, time_guide_minutes: 10, idea: "", order_index: stories.length });
  }

  return (
    <div>
      <SetHeader expanded={expanded} onToggle={onToggle}
        title={set.title} badge={`${stories.length} গল্প`} onDelete={onDelete} />
      {expanded && (
        <div className="mt-1 rounded-lg border border-border bg-muted/20 p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="শিরোনাম"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
            <Field label="কোর্স"><CourseSelect value={courseId} onChange={setCourseId} /></Field>
          </div>
          <Field label="ফ্রি প্রিভিউ">
            <div className="flex items-center gap-2 pt-1"><Switch checked={free} onCheckedChange={setFree} /><span className="text-sm text-green-600">{free ? "ফ্রি" : "প্রিমিয়াম"}</span></div>
          </Field>
          <Button size="sm" onClick={async () => { await upsertSet.mutateAsync({ id: set.id, title, is_free: free, course_id: courseId || undefined }); toast.success("সংরক্ষিত"); }}>
            <Save className="mr-2 h-3.5 w-3.5" /> সেট সংরক্ষণ
          </Button>
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">গল্পসমূহ</p>
              <Button size="sm" variant="outline" onClick={addStory}><Plus className="mr-1 h-3.5 w-3.5" /> গল্প</Button>
            </div>
            {stories.map((s, i) => (
              <StoryCard key={s.id} story={s} index={i} expanded={expandedStory === s.id}
                onToggle={() => setExpandedStory(expandedStory === s.id ? null : s.id)}
                upsertS={upsertS} deleteS={deleteS} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StoryCard({ story, index, expanded, onToggle, upsertS, deleteS }: {
  story: IncompleteStory; index: number; expanded: boolean; onToggle: () => void;
  upsertS: ReturnType<typeof useUpsertIncompleteStory>;
  deleteS: ReturnType<typeof useDeleteIncompleteStory>;
}) {
  const [title, setTitle] = useState(story.title);
  const [instruction, setInstruction] = useState(story.instruction);
  const [body, setBody] = useState(story.body);
  const [wordLimit, setWordLimit] = useState(String(story.word_limit));
  const [timeGuide, setTimeGuide] = useState(String(story.time_guide_minutes));
  const [idea, setIdea] = useState(story.idea);

  async function save() {
    await upsertS.mutateAsync({ id: story.id, set_id: story.set_id, title, instruction, body, word_limit: Number(wordLimit), time_guide_minutes: Number(timeGuide), idea, order_index: index });
    toast.success("সংরক্ষিত");
  }

  return (
    <div className="rounded-md border border-border bg-card">
      <div className="flex items-center gap-2 px-3 py-2">
        <button onClick={onToggle} className="flex flex-1 items-center gap-2 text-left text-sm">
          {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          <span className="font-medium">{index + 1}. {story.title}</span>
        </button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteS.mutateAsync(story.id)}><X className="h-3.5 w-3.5" /></Button>
      </div>
      {expanded && (
        <div className="border-t border-border px-3 py-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="শিরোনাম"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
            <Field label="শব্দ সীমা"><Input type="number" value={wordLimit} onChange={(e) => setWordLimit(e.target.value)} /></Field>
            <Field label="সময় (মিনিট)"><Input type="number" value={timeGuide} onChange={(e) => setTimeGuide(e.target.value)} /></Field>
          </div>
          <Field label="নির্দেশনা">
            <Input value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="গল্প সম্পূর্ণ করুন..." />
          </Field>
          <Field label="গল্পের body (অসম্পূর্ণ)">
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5}
              placeholder="গল্পটি শুরু হয়েছিল..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </Field>
          <Field label="Idea (হিন্ট)">
            <Input value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="গল্পের সম্ভাব্য দিকনির্দেশনা..." />
          </Field>
          <Button size="sm" onClick={save}><Save className="mr-2 h-3.5 w-3.5" /> সংরক্ষণ</Button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PLANNING TASK TAB
// ═══════════════════════════════════════════════════════════════

function PlanningTab() {
  const { data: sets = [] } = useAdminPlanningTaskSets();
  const upsertSet = useUpsertPlanningTaskSet();
  const deleteSet = useDeletePlanningTaskSet();
  const upsertT = useUpsertPlanningTask();
  const deleteT = useDeletePlanningTask();
  const [expanded, setExpanded] = useState<string | null>(null);

  async function addSet() {
    await upsertSet.mutateAsync({ title: "নতুন প্ল্যানিং সেট", is_published: true });
    toast.success("সেট যোগ হয়েছে");
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <p className="text-sm text-muted-foreground">প্ল্যানিং টাস্কের ছবি, শিরোনাম ও বিবরণ যোগ করুন।</p>
        <Button size="sm" onClick={addSet}><Plus className="mr-2 h-4 w-4" /> সেট যোগ</Button>
      </div>
      {sets.map((s) => (
        <PlanningSetCard key={s.id} set={s} expanded={expanded === s.id}
          onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
          onDelete={async () => { await deleteSet.mutateAsync(s.id); toast.success("মুছে ফেলা হয়েছে"); }}
          upsertSet={upsertSet} upsertT={upsertT} deleteT={deleteT} />
      ))}
    </div>
  );
}

function PlanningSetCard({ set, expanded, onToggle, onDelete, upsertSet, upsertT, deleteT }: {
  set: PlanningTaskSet; expanded: boolean; onToggle: () => void; onDelete: () => void;
  upsertSet: ReturnType<typeof useUpsertPlanningTaskSet>;
  upsertT: ReturnType<typeof useUpsertPlanningTask>;
  deleteT: ReturnType<typeof useDeletePlanningTask>;
}) {
  const [title, setTitle] = useState(set.title);
  const [courseId, setCourseId] = useState(set.course_id ?? "");
  const [free, setFree] = useState(set.is_free ?? false);
  const tasks = (set.planning_tasks ?? []).sort((a, b) => a.order_index - b.order_index);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  async function addTask() {
    await upsertT.mutateAsync({ set_id: set.id, heading: "নতুন টাস্ক", body: "", image_url: "", idea: "", order_index: tasks.length });
  }

  return (
    <div>
      <SetHeader expanded={expanded} onToggle={onToggle}
        title={set.title} badge={`${tasks.length} টাস্ক`} onDelete={onDelete} />
      {expanded && (
        <div className="mt-1 rounded-lg border border-border bg-muted/20 p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="শিরোনাম"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
            <Field label="কোর্স"><CourseSelect value={courseId} onChange={setCourseId} /></Field>
          </div>
          <Field label="ফ্রি প্রিভিউ">
            <div className="flex items-center gap-2 pt-1"><Switch checked={free} onCheckedChange={setFree} /><span className="text-sm text-green-600">{free ? "ফ্রি" : "প্রিমিয়াম"}</span></div>
          </Field>
          <Button size="sm" onClick={async () => { await upsertSet.mutateAsync({ id: set.id, title, is_free: free, course_id: courseId || undefined }); toast.success("সংরক্ষিত"); }}>
            <Save className="mr-2 h-3.5 w-3.5" /> সেট সংরক্ষণ
          </Button>
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">টাস্কসমূহ</p>
              <Button size="sm" variant="outline" onClick={addTask}><Plus className="mr-1 h-3.5 w-3.5" /> টাস্ক</Button>
            </div>
            {tasks.map((t, i) => (
              <PlanningTaskCard key={t.id} task={t} index={i} expanded={expandedTask === t.id}
                onToggle={() => setExpandedTask(expandedTask === t.id ? null : t.id)}
                upsertT={upsertT} deleteT={deleteT} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlanningTaskCard({ task, index, expanded, onToggle, upsertT, deleteT }: {
  task: PlanningTask; index: number; expanded: boolean; onToggle: () => void;
  upsertT: ReturnType<typeof useUpsertPlanningTask>;
  deleteT: ReturnType<typeof useDeletePlanningTask>;
}) {
  const [heading, setHeading] = useState(task.heading);
  const [body, setBody] = useState(task.body);
  const [imageUrl, setImageUrl] = useState(task.image_url);
  const [idea, setIdea] = useState(task.idea);

  async function save() {
    await upsertT.mutateAsync({ id: task.id, set_id: task.set_id, heading, body, image_url: imageUrl, idea, order_index: index });
    toast.success("সংরক্ষিত");
  }

  return (
    <div className="rounded-md border border-border bg-card">
      <div className="flex items-center gap-2 px-3 py-2">
        <button onClick={onToggle} className="flex flex-1 items-center gap-2 text-left text-sm">
          {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          <span className="font-medium">{index + 1}. {task.heading || "শিরোনাম নেই"}</span>
        </button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteT.mutateAsync(task.id)}><X className="h-3.5 w-3.5" /></Button>
      </div>
      {expanded && (
        <div className="border-t border-border px-3 py-3 space-y-3">
          <Field label="শিরোনাম (Heading)">
            <Input value={heading} onChange={(e) => setHeading(e.target.value)} placeholder="পরিকল্পনার শিরোনাম" />
          </Field>
          <Field label="ছবি (Map / Diagram)">
            <ImageUpload value={imageUrl} onChange={setImageUrl} folder="thumbnails" />
          </Field>
          <Field label="বিবরণ (Scenario Text)">
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5}
              placeholder="পরিস্থিতির বিস্তারিত বিবরণ লিখুন..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </Field>
          <Field label="Idea / হিন্ট">
            <Input value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="পরিকল্পনার সম্ভাব্য দিকনির্দেশনা..." />
          </Field>
          <Button size="sm" onClick={save}><Save className="mr-2 h-3.5 w-3.5" /> সংরক্ষণ</Button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROOT PAGE
// ═══════════════════════════════════════════════════════════════

export default function ISSBAdmin() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">ISSB কন্টেন্ট ম্যানেজমেন্ট</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">IQ, WAT, IST, Extempore ও ছবির পরীক্ষার কন্টেন্ট তৈরি করুন</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" /> রিফ্রেশ
        </Button>
      </div>

      <Tabs defaultValue="iq">
        <TabsList className="mb-6 flex w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="iq">IQ কুইজ</TabsTrigger>
          <TabsTrigger value="wat">WAT</TabsTrigger>
          <TabsTrigger value="ist">IST</TabsTrigger>
          <TabsTrigger value="extempore">Extempore</TabsTrigger>
          <TabsTrigger value="pictures">ছবির পরীক্ষা</TabsTrigger>
          <TabsTrigger value="stories">অসম্পূর্ণ গল্প</TabsTrigger>
          <TabsTrigger value="planning">প্ল্যানিং টাস্ক</TabsTrigger>
        </TabsList>

        <TabsContent value="iq"><IQTab /></TabsContent>
        <TabsContent value="wat"><WATTab /></TabsContent>
        <TabsContent value="ist"><ISTTab /></TabsContent>
        <TabsContent value="extempore"><ExtemporeTab /></TabsContent>
        <TabsContent value="pictures"><PictureTab /></TabsContent>
        <TabsContent value="stories"><IncompleteStoryTab /></TabsContent>
        <TabsContent value="planning"><PlanningTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// Full ISSB content editor embedded in the Course Editor.
// Shows the same UI as /admin/issb but scoped to a single courseId.
import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
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
} from "@/hooks/useISSBAdmin";
import type {
  IQSet, IQQuestion, IQOption,
  WATSet, ISTSet, ISTSentence,
  ExtemporeSet, ExtemporeTopic,
  PPDTSet, PPDTPicture,
  PictureStorySet, PictureStoryPicture,
  IncompleteStorySet, IncompleteStory,
} from "@/lib/issb/types";

const uid = () => Math.random().toString(36).slice(2, 10);

// ─── Shared ──────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function SetHeader({ expanded, onToggle, title, badge, onDelete }: {
  expanded: boolean; onToggle: () => void;
  title: string; badge?: string;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
      <button onClick={onToggle} className="flex flex-1 items-center gap-2 text-left">
        {expanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
        <span className="text-sm font-medium text-foreground">{title}</span>
        {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
      </button>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive shrink-0" onClick={onDelete}>
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

// ─── IQ TAB ──────────────────────────────────────────────────────────────────

function IQTab({ courseId }: { courseId: string }) {
  const { data: sets = [] } = useAdminIQSets(courseId);
  const upsertSet = useUpsertIQSet();
  const deleteSet = useDeleteIQSet();
  const upsertQ = useUpsertIQQuestion();
  const deleteQ = useDeleteIQQuestion();
  const [expanded, setExpanded] = useState<string | null>(null);

  async function addSet() {
    await upsertSet.mutateAsync({ title: "নতুন IQ সেট", timer_seconds: 300, is_published: true, is_free: false, course_id: courseId });
    toast.success("IQ সেট যোগ হয়েছে");
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">MCQ প্রশ্ন সেট — সঠিক উত্তর চিহ্নিত করুন</p>
        <Button size="sm" onClick={addSet}><Plus className="mr-1 h-3.5 w-3.5" /> সেট যোগ</Button>
      </div>
      {sets.map((s) => (
        <IQSetCard key={s.id} set={s} expanded={expanded === s.id}
          onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
          onDelete={async () => { await deleteSet.mutateAsync(s.id); toast.success("মুছে ফেলা হয়েছে"); }}
          upsertSet={upsertSet} upsertQ={upsertQ} deleteQ={deleteQ} />
      ))}
      {sets.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">কোনো IQ সেট নেই।</p>}
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

  async function save() {
    await upsertSet.mutateAsync({ id: set.id, title, timer_seconds: Number(timer), is_published: pub, is_free: free, course_id: set.course_id });
    toast.success("সংরক্ষিত");
  }

  async function addQuestion() {
    const opts: IQOption[] = [
      { id: uid(), text: "অপশন ১" }, { id: uid(), text: "অপশন ২" },
      { id: uid(), text: "অপশন ৩" }, { id: uid(), text: "অপশন ৪" },
    ];
    await upsertQ.mutateAsync({ set_id: set.id, text: "নতুন প্রশ্ন", options: opts, correct: opts[0].id, order_index: (set.iq_questions?.length ?? 0) });
  }

  const questions = (set.iq_questions ?? []).sort((a, b) => a.order_index - b.order_index);

  return (
    <div>
      <SetHeader expanded={expanded} onToggle={onToggle}
        title={set.title} badge={`${questions.length} প্রশ্ন`} onDelete={onDelete} />
      {expanded && (
        <div className="mt-1 rounded-lg border border-border bg-muted/20 p-3 space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="শিরোনাম"><Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 text-sm" /></Field>
            <Field label="সময় (সেকেন্ড)"><Input type="number" value={timer} onChange={(e) => setTimer(e.target.value)} className="h-8 text-sm" /></Field>
          </div>
          <div className="flex items-center gap-4">
            <Field label="প্রকাশিত">
              <div className="flex items-center gap-1.5 pt-1"><Switch checked={pub} onCheckedChange={setPub} /><span className="text-xs">{pub ? "হ্যাঁ" : "না"}</span></div>
            </Field>
            <Field label="ফ্রি প্রিভিউ">
              <div className="flex items-center gap-1.5 pt-1"><Switch checked={free} onCheckedChange={setFree} /><span className="text-xs text-green-600">{free ? "ফ্রি" : "প্রিমিয়াম"}</span></div>
            </Field>
          </div>
          <Button size="sm" onClick={save}><Save className="mr-1.5 h-3 w-3" /> সংরক্ষণ</Button>

          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">প্রশ্নসমূহ</p>
              <Button size="sm" variant="outline" onClick={addQuestion}><Plus className="mr-1 h-3 w-3" /> প্রশ্ন</Button>
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
    <div className="rounded-md border border-border bg-card p-2.5 space-y-2">
      <div className="flex items-start gap-2">
        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-accent/10 text-xs font-bold text-accent">{index + 1}</span>
        <Input value={text} onChange={(e) => { setText(e.target.value); setDirty(true); }} placeholder="প্রশ্নের টেক্সট" className="flex-1 h-8 text-sm" />
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-destructive" onClick={onDelete}><X className="h-3 w-3" /></Button>
      </div>
      <div className="grid grid-cols-2 gap-1.5 pl-7">
        {options.map((o, i) => (
          <div key={o.id} className={`flex items-center gap-1.5 rounded border px-2 py-1 ${correct === o.id ? "border-success bg-success/10" : "border-border"}`}>
            <input type="radio" name={`correct-${question.id}`} checked={correct === o.id}
              onChange={() => { setCorrect(o.id); setDirty(true); }} className="accent-success shrink-0" />
            <Input value={o.text} onChange={(e) => setOpt(i, e.target.value)}
              className="h-6 border-0 bg-transparent px-1 text-xs focus-visible:ring-0 flex-1" placeholder={`অপশন ${i + 1}`} />
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
        {dirty && <Button size="sm" className="h-7 text-xs" onClick={save}><Save className="mr-1 h-3 w-3" /> সংরক্ষণ</Button>}
      </div>
    </div>
  );
}

// ─── WAT TAB ─────────────────────────────────────────────────────────────────

function WATTab({ courseId }: { courseId: string }) {
  const { data: sets = [] } = useAdminWATSets(courseId);
  const upsert = useUpsertWATSet();
  const del = useDeleteWATSet();
  const [expanded, setExpanded] = useState<string | null>(null);

  async function addSet() {
    await upsert.mutateAsync({ title: "নতুন WAT সেট", words: [], word_seconds: 10, is_published: true, is_free: false, course_id: courseId });
    toast.success("WAT সেট যোগ হয়েছে");
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">শব্দ তালিকা — প্রতি লাইনে একটি শব্দ</p>
        <Button size="sm" onClick={addSet}><Plus className="mr-1 h-3.5 w-3.5" /> সেট যোগ</Button>
      </div>
      {sets.map((s) => (
        <WATSetCard key={s.id} set={s} expanded={expanded === s.id}
          onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
          onDelete={async () => { await del.mutateAsync(s.id); toast.success("মুছে ফেলা হয়েছে"); }}
          upsert={upsert} />
      ))}
      {sets.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">কোনো WAT সেট নেই।</p>}
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
  const [wordsText, setWordsText] = useState((set.words ?? []).join("\n"));
  const wordCount = wordsText.split("\n").filter((w) => w.trim()).length;

  async function save() {
    const words = wordsText.split("\n").map((w) => w.trim()).filter(Boolean);
    await upsert.mutateAsync({ id: set.id, title, words, word_seconds: Number(wordSec), is_published: pub, is_free: free, course_id: set.course_id });
    toast.success("WAT সেট সংরক্ষিত");
  }

  return (
    <div>
      <SetHeader expanded={expanded} onToggle={onToggle} title={set.title} badge={`${wordCount} শব্দ`} onDelete={onDelete} />
      {expanded && (
        <div className="mt-1 rounded-lg border border-border bg-muted/20 p-3 space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="শিরোনাম"><Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 text-sm" /></Field>
            <Field label="প্রতি শব্দ (সেকেন্ড)"><Input type="number" value={wordSec} onChange={(e) => setWordSec(e.target.value)} className="h-8 text-sm" /></Field>
          </div>
          <div className="flex items-center gap-4">
            <Field label="প্রকাশিত">
              <div className="flex items-center gap-1.5 pt-1"><Switch checked={pub} onCheckedChange={setPub} /></div>
            </Field>
            <Field label="ফ্রি প্রিভিউ">
              <div className="flex items-center gap-1.5 pt-1"><Switch checked={free} onCheckedChange={setFree} /><span className="text-xs text-green-600">{free ? "ফ্রি" : "প্রিমিয়াম"}</span></div>
            </Field>
          </div>
          <Field label={`শব্দ তালিকা — ${wordCount}টি শব্দ`}>
            <textarea value={wordsText} onChange={(e) => setWordsText(e.target.value)} rows={8}
              placeholder={"অগ্নি\nবীর\nদেশ\n..."}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </Field>
          <Button size="sm" onClick={save}><Save className="mr-1.5 h-3 w-3" /> সংরক্ষণ</Button>
        </div>
      )}
    </div>
  );
}

// ─── IST TAB ─────────────────────────────────────────────────────────────────

function ISTTab({ courseId }: { courseId: string }) {
  const { data: sets = [] } = useAdminISTSets(courseId);
  const upsertSet = useUpsertISTSet();
  const deleteSet = useDeleteISTSet();
  const upsertS = useUpsertISTSentence();
  const deleteS = useDeleteISTSentence();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">অসম্পূর্ণ বাক্য সেট — stem ও উদাহরণ উত্তর</p>
        <Button size="sm" onClick={async () => { await upsertSet.mutateAsync({ title: "নতুন IST সেট", timer_seconds: 300, is_published: true, is_free: false, course_id: courseId }); toast.success("IST সেট যোগ হয়েছে"); }}>
          <Plus className="mr-1 h-3.5 w-3.5" /> সেট যোগ
        </Button>
      </div>
      {sets.map((s) => (
        <ISTSetCard key={s.id} set={s} expanded={expanded === s.id}
          onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
          onDelete={async () => { await deleteSet.mutateAsync(s.id); toast.success("মুছে ফেলা হয়েছে"); }}
          upsertSet={upsertSet} upsertS={upsertS} deleteS={deleteS} />
      ))}
      {sets.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">কোনো IST সেট নেই।</p>}
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
  const [free, setFree] = useState(set.is_free ?? false);
  const sentences = (set.ist_sentences ?? []).sort((a, b) => a.order_index - b.order_index);

  return (
    <div>
      <SetHeader expanded={expanded} onToggle={onToggle} title={set.title} badge={`${sentences.length} বাক্য`} onDelete={onDelete} />
      {expanded && (
        <div className="mt-1 rounded-lg border border-border bg-muted/20 p-3 space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="শিরোনাম"><Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 text-sm" /></Field>
            <Field label="সময় (সেকেন্ড)"><Input type="number" value={timer} onChange={(e) => setTimer(e.target.value)} className="h-8 text-sm" /></Field>
          </div>
          <Field label="ফ্রি প্রিভিউ">
            <div className="flex items-center gap-1.5 pt-1"><Switch checked={free} onCheckedChange={setFree} /><span className="text-xs text-green-600">{free ? "ফ্রি" : "প্রিমিয়াম"}</span></div>
          </Field>
          <Button size="sm" onClick={async () => { await upsertSet.mutateAsync({ id: set.id, title, timer_seconds: Number(timer), is_free: free, course_id: set.course_id }); toast.success("সংরক্ষিত"); }}>
            <Save className="mr-1.5 h-3 w-3" /> সংরক্ষণ
          </Button>
          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">বাক্যসমূহ</p>
              <Button size="sm" variant="outline" onClick={() => upsertS.mutateAsync({ set_id: set.id, stem: "আমি...", example: "", order_index: sentences.length })}>
                <Plus className="mr-1 h-3 w-3" /> বাক্য
              </Button>
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
      <span className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-accent/10 text-xs font-bold text-accent">{index + 1}</span>
      <div className="flex-1 space-y-1">
        <Input value={stem} onChange={(e) => { setStem(e.target.value); setDirty(true); }} placeholder="বাক্যের stem" className="h-7 text-xs" />
        <Input value={example} onChange={(e) => { setExample(e.target.value); setDirty(true); }} placeholder="উদাহরণ উত্তর (ঐচ্ছিক)" className="h-7 text-xs text-muted-foreground" />
      </div>
      {dirty && <Button size="sm" variant="outline" className="h-7 shrink-0" onClick={async () => { await upsertS.mutateAsync({ id: sentence.id, set_id: sentence.set_id, stem, example, order_index: index }); setDirty(false); }}><Save className="h-3 w-3" /></Button>}
      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-destructive" onClick={() => deleteS.mutateAsync(sentence.id)}><X className="h-3 w-3" /></Button>
    </div>
  );
}

// ─── EXTEMPORE TAB ────────────────────────────────────────────────────────────

function ExtemporeTab({ courseId }: { courseId: string }) {
  const { data: sets = [] } = useAdminExtemporeSets(courseId);
  const upsertSet = useUpsertExtemporeSet();
  const deleteSet = useDeleteExtemporeSet();
  const upsertT = useUpsertExtemporeTopic();
  const deleteT = useDeleteExtemporeTopic();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">বিষয় সেট — hint, model points ও essay</p>
        <Button size="sm" onClick={async () => { await upsertSet.mutateAsync({ title: "নতুন Essay Writing সেট", timer_seconds: 1500, is_published: true, is_free: false, course_id: courseId }); toast.success("সেট যোগ হয়েছে"); }}>
          <Plus className="mr-1 h-3.5 w-3.5" /> সেট যোগ
        </Button>
      </div>
      {sets.map((s) => (
        <ExtemporeSetCard key={s.id} set={s} expanded={expanded === s.id}
          onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
          onDelete={async () => { await deleteSet.mutateAsync(s.id); toast.success("মুছে ফেলা হয়েছে"); }}
          upsertSet={upsertSet} upsertT={upsertT} deleteT={deleteT} />
      ))}
      {sets.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">কোনো Essay Writing সেট নেই।</p>}
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
  const [free, setFree] = useState(set.is_free ?? false);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const topics = (set.extempore_topics ?? []).sort((a, b) => a.order_index - b.order_index);

  return (
    <div>
      <SetHeader expanded={expanded} onToggle={onToggle} title={set.title} badge={`${topics.length} বিষয়`} onDelete={onDelete} />
      {expanded && (
        <div className="mt-1 rounded-lg border border-border bg-muted/20 p-3 space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="শিরোনাম"><Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 text-sm" /></Field>
            <Field label="সময় (সেকেন্ড)"><Input type="number" value={timer} onChange={(e) => setTimer(e.target.value)} className="h-8 text-sm" /></Field>
          </div>
          <Field label="ফ্রি প্রিভিউ">
            <div className="flex items-center gap-1.5 pt-1"><Switch checked={free} onCheckedChange={setFree} /><span className="text-xs text-green-600">{free ? "ফ্রি" : "প্রিমিয়াম"}</span></div>
          </Field>
          <Button size="sm" onClick={async () => { await upsertSet.mutateAsync({ id: set.id, title, timer_seconds: Number(timer), is_free: free, course_id: set.course_id }); toast.success("সংরক্ষিত"); }}>
            <Save className="mr-1.5 h-3 w-3" /> সংরক্ষণ
          </Button>
          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">বিষয়সমূহ</p>
              <Button size="sm" variant="outline" onClick={() => upsertT.mutateAsync({ set_id: set.id, topic: "নতুন বিষয়", category: "general", hint: "", model_points: [], model_essay: "", order_index: topics.length })}>
                <Plus className="mr-1 h-3 w-3" /> বিষয়
              </Button>
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
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <span className="text-xs font-medium">{index + 1}. {topic.topic}</span>
        </button>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteT.mutateAsync(topic.id)}><X className="h-3 w-3" /></Button>
      </div>
      {expanded && (
        <div className="border-t px-3 py-2.5 space-y-2.5">
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="বিষয়"><Input value={t} onChange={(e) => setT(e.target.value)} className="h-7 text-sm" /></Field>
            <Field label="ক্যাটাগরি">
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["general","current_affairs","abstract","social","ethics","quote"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Hint">
            <Input value={hint} onChange={(e) => setHint(e.target.value)} placeholder="সংক্ষিপ্ত চিন্তার সংকেত..." className="h-7 text-sm" />
          </Field>
          <Field label="Model Points (প্রতি লাইনে একটি)">
            <textarea value={pointsText} onChange={(e) => setPointsText(e.target.value)} rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </Field>
          <Field label="Model Essay">
            <textarea value={essay} onChange={(e) => setEssay(e.target.value)} rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </Field>
          <Button size="sm" onClick={save}><Save className="mr-1.5 h-3 w-3" /> সংরক্ষণ</Button>
        </div>
      )}
    </div>
  );
}

// ─── PPDT + PICTURE STORY TAB ─────────────────────────────────────────────────

function PictureTab({ courseId }: { courseId: string }) {
  return (
    <Tabs defaultValue="ppdt">
      <TabsList className="mb-3 h-8">
        <TabsTrigger value="ppdt" className="text-xs">PPDT</TabsTrigger>
        <TabsTrigger value="picture-story" className="text-xs">Picture Story</TabsTrigger>
      </TabsList>
      <TabsContent value="ppdt"><PPDTSection courseId={courseId} /></TabsContent>
      <TabsContent value="picture-story"><PictureStorySection courseId={courseId} /></TabsContent>
    </Tabs>
  );
}

function PPDTSection({ courseId }: { courseId: string }) {
  const { data: sets = [] } = useAdminPPDTSets(courseId);
  const upsertSet = useUpsertPPDTSet();
  const deleteSet = useDeletePPDTSet();
  const upsertP = useUpsertPPDTPicture();
  const deleteP = useDeletePPDTPicture();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">ছবি আপলোড করুন, পর্যবেক্ষণ ও লেখার সময় সেট করুন</p>
        <Button size="sm" onClick={async () => { await upsertSet.mutateAsync({ title: "নতুন PPDT সেট", observe_seconds: 30, write_seconds: 270, is_published: true, is_free: false, course_id: courseId }); toast.success("সেট যোগ হয়েছে"); }}>
          <Plus className="mr-1 h-3.5 w-3.5" /> সেট যোগ
        </Button>
      </div>
      {sets.map((s) => (
        <PictureSetCard key={s.id} set={s} expanded={expanded === s.id}
          onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
          onDelete={async () => { await deleteSet.mutateAsync(s.id); }}
          upsertSet={upsertSet} upsertP={upsertP} deleteP={deleteP}
          pictures={(s.ppdt_pictures ?? []).sort((a, b) => a.order_index - b.order_index)} />
      ))}
      {sets.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">কোনো PPDT সেট নেই।</p>}
    </div>
  );
}

function PictureStorySection({ courseId }: { courseId: string }) {
  const { data: sets = [] } = useAdminPictureStorySets(courseId);
  const upsertSet = useUpsertPictureStorySet();
  const deleteSet = useDeletePictureStorySet();
  const upsertP = useUpsertPictureStoryPicture();
  const deleteP = useDeletePictureStoryPicture();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Picture Story সেটে ছবি ও idea যোগ করুন</p>
        <Button size="sm" onClick={async () => { await upsertSet.mutateAsync({ title: "নতুন Picture Story সেট", observe_seconds: 30, write_seconds: 60, is_published: true, is_free: false, course_id: courseId }); toast.success("সেট যোগ হয়েছে"); }}>
          <Plus className="mr-1 h-3.5 w-3.5" /> সেট যোগ
        </Button>
      </div>
      {sets.map((s) => (
        <PictureSetCard key={s.id} set={s} expanded={expanded === s.id}
          onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
          onDelete={async () => { await deleteSet.mutateAsync(s.id); }}
          upsertSet={upsertSet} upsertP={upsertP} deleteP={deleteP}
          pictures={(s.picture_story_pictures ?? []).sort((a, b) => a.order_index - b.order_index)} />
      ))}
      {sets.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">কোনো Picture Story সেট নেই।</p>}
    </div>
  );
}

function PictureSetCard({ set, expanded, onToggle, onDelete, upsertSet, upsertP, deleteP, pictures }: {
  set: PPDTSet | PictureStorySet; expanded: boolean; onToggle: () => void; onDelete: () => void;
  upsertSet: ReturnType<typeof useUpsertPPDTSet> | ReturnType<typeof useUpsertPictureStorySet>;
  upsertP: ReturnType<typeof useUpsertPPDTPicture> | ReturnType<typeof useUpsertPictureStoryPicture>;
  deleteP: ReturnType<typeof useDeletePPDTPicture> | ReturnType<typeof useDeletePictureStoryPicture>;
  pictures: (PPDTPicture | PictureStoryPicture)[];
}) {
  const [title, setTitle] = useState(set.title);
  const [obsS, setObsS] = useState(String(set.observe_seconds));
  const [wrS, setWrS] = useState(String(set.write_seconds));
  const [free, setFree] = useState(set.is_free ?? false);

  return (
    <div>
      <SetHeader expanded={expanded} onToggle={onToggle} title={set.title} badge={`${pictures.length} ছবি`} onDelete={onDelete} />
      {expanded && (
        <div className="mt-1 rounded-lg border border-border bg-muted/20 p-3 space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <Field label="শিরোনাম"><Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 text-sm" /></Field>
            <Field label="পর্যবেক্ষণ (সেকেন্ড)"><Input type="number" value={obsS} onChange={(e) => setObsS(e.target.value)} className="h-8 text-sm" /></Field>
            <Field label="লেখার সময় (সেকেন্ড)"><Input type="number" value={wrS} onChange={(e) => setWrS(e.target.value)} className="h-8 text-sm" /></Field>
          </div>
          <Field label="ফ্রি প্রিভিউ">
            <div className="flex items-center gap-1.5 pt-1"><Switch checked={free} onCheckedChange={setFree} /><span className="text-xs text-green-600">{free ? "ফ্রি" : "প্রিমিয়াম"}</span></div>
          </Field>
          <Button size="sm" onClick={async () => {
            await (upsertSet as ReturnType<typeof useUpsertPPDTSet>).mutateAsync({ id: set.id, title, observe_seconds: Number(obsS), write_seconds: Number(wrS), is_free: free, course_id: set.course_id });
            toast.success("সংরক্ষিত");
          }}>
            <Save className="mr-1.5 h-3 w-3" /> সংরক্ষণ
          </Button>
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ছবিসমূহ</p>
              <Button size="sm" variant="outline" onClick={() => (upsertP as ReturnType<typeof useUpsertPPDTPicture>).mutateAsync({ set_id: set.id, picture_number: pictures.length + 1, image_url: "", title: "", idea: "", order_index: pictures.length })}>
                <Plus className="mr-1 h-3 w-3" /> ছবি
              </Button>
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
    await (upsertP as ReturnType<typeof useUpsertPPDTPicture>).mutateAsync({ id: picture.id, set_id: setId, picture_number: index + 1, image_url: url, title, idea, order_index: index });
    toast.success("ছবি সংরক্ষিত");
  }

  return (
    <div className="rounded-md border border-border bg-card p-2.5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">ছবি {index + 1}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => (deleteP as ReturnType<typeof useDeletePPDTPicture>).mutateAsync(picture.id)}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      <ImageUpload value={url} onChange={setUrl} folder="thumbnails" />
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ছবির শিরোনাম" className="h-7 text-sm" />
      <Input value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Idea / হিন্ট" className="h-7 text-sm" />
      <Button size="sm" className="w-full h-7 text-xs" onClick={save}><Save className="mr-1.5 h-3 w-3" /> সংরক্ষণ</Button>
    </div>
  );
}

// ─── INCOMPLETE STORY TAB ─────────────────────────────────────────────────────

function IncompleteStoryTab({ courseId }: { courseId: string }) {
  const { data: sets = [] } = useAdminIncompleteStorySets(courseId);
  const upsertSet = useUpsertIncompleteStorySet();
  const deleteSet = useDeleteIncompleteStorySet();
  const upsertS = useUpsertIncompleteStory();
  const deleteS = useDeleteIncompleteStory();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">অসম্পূর্ণ গল্পের body, word limit ও idea</p>
        <Button size="sm" onClick={async () => { await upsertSet.mutateAsync({ title: "নতুন গল্প সেট", is_published: true, is_free: false, course_id: courseId }); toast.success("সেট যোগ হয়েছে"); }}>
          <Plus className="mr-1 h-3.5 w-3.5" /> সেট যোগ
        </Button>
      </div>
      {sets.map((s) => (
        <IncompleteStorySetCard key={s.id} set={s} expanded={expanded === s.id}
          onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
          onDelete={async () => { await deleteSet.mutateAsync(s.id); toast.success("মুছে ফেলা হয়েছে"); }}
          upsertSet={upsertSet} upsertS={upsertS} deleteS={deleteS} />
      ))}
      {sets.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">কোনো গল্প সেট নেই।</p>}
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
  const [free, setFree] = useState(set.is_free ?? false);
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const stories = (set.incomplete_stories ?? []).sort((a, b) => a.order_index - b.order_index);

  return (
    <div>
      <SetHeader expanded={expanded} onToggle={onToggle} title={set.title} badge={`${stories.length} গল্প`} onDelete={onDelete} />
      {expanded && (
        <div className="mt-1 rounded-lg border border-border bg-muted/20 p-3 space-y-3">
          <Field label="শিরোনাম"><Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 text-sm" /></Field>
          <Field label="ফ্রি প্রিভিউ">
            <div className="flex items-center gap-1.5 pt-1"><Switch checked={free} onCheckedChange={setFree} /><span className="text-xs text-green-600">{free ? "ফ্রি" : "প্রিমিয়াম"}</span></div>
          </Field>
          <Button size="sm" onClick={async () => { await upsertSet.mutateAsync({ id: set.id, title, is_free: free, course_id: set.course_id }); toast.success("সংরক্ষিত"); }}>
            <Save className="mr-1.5 h-3 w-3" /> সংরক্ষণ
          </Button>
          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">গল্পসমূহ</p>
              <Button size="sm" variant="outline" onClick={() => upsertS.mutateAsync({ set_id: set.id, title: "নতুন গল্প", body: "গল্পটি শুরু হয়েছিল...", word_limit: 200, time_guide_minutes: 10, idea: "", order_index: stories.length })}>
                <Plus className="mr-1 h-3 w-3" /> গল্প
              </Button>
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
      <div className="flex items-center gap-2 px-2.5 py-2">
        <button onClick={onToggle} className="flex flex-1 items-center gap-2 text-left">
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <span className="text-xs font-medium">{index + 1}. {story.title}</span>
        </button>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteS.mutateAsync(story.id)}><X className="h-3 w-3" /></Button>
      </div>
      {expanded && (
        <div className="border-t px-2.5 py-2.5 space-y-2">
          <div className="grid gap-2 sm:grid-cols-3">
            <Field label="শিরোনাম"><Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-7 text-sm" /></Field>
            <Field label="শব্দ সীমা"><Input type="number" value={wordLimit} onChange={(e) => setWordLimit(e.target.value)} className="h-7 text-sm" /></Field>
            <Field label="সময় (মিনিট)"><Input type="number" value={timeGuide} onChange={(e) => setTimeGuide(e.target.value)} className="h-7 text-sm" /></Field>
          </div>
          <Field label="নির্দেশনা">
            <Input value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="গল্প সম্পূর্ণ করুন..." className="h-7 text-sm" />
          </Field>
          <Field label="গল্পের body (অসম্পূর্ণ)">
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="গল্পটি শুরু হয়েছিল..."
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </Field>
          <Field label="Idea (হিন্ট)">
            <Input value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="গল্পের দিকনির্দেশনা..." className="h-7 text-sm" />
          </Field>
          <Button size="sm" onClick={save}><Save className="mr-1.5 h-3 w-3" /> সংরক্ষণ</Button>
        </div>
      )}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "iq",        label: "IQ" },
  { id: "wat",       label: "WAT" },
  { id: "ist",       label: "IST" },
  { id: "extempore", label: "Essay Writing" },
  { id: "pictures",  label: "PPDT / Picture" },
  { id: "stories",   label: "গল্প" },
] as const;

type TabId = typeof TABS[number]["id"];

export function ISSBCourseEditor({ courseId }: { courseId: string }) {
  const [active, setActive] = useState<TabId>("iq");

  return (
    <div className="mt-3 rounded-lg border border-accent/20 bg-accent/5 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-accent">
        ISSB কন্টেন্ট — এই কোর্সের জন্য
      </p>

      {/* Manual tabs — only the active tab mounts, preventing 6 simultaneous queries */}
      <div className="mb-4 flex flex-wrap gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={[
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              active === tab.id
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "iq"        && <IQTab courseId={courseId} />}
      {active === "wat"       && <WATTab courseId={courseId} />}
      {active === "ist"       && <ISTTab courseId={courseId} />}
      {active === "extempore" && <ExtemporeTab courseId={courseId} />}
      {active === "pictures"  && <PictureTab courseId={courseId} />}
      {active === "stories"   && <IncompleteStoryTab courseId={courseId} />}
    </div>
  );
}

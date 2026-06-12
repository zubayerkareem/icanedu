import { useState } from "react";
import { Plus, Trash2, Save, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import {
  useAdminSuccessStories,
  useUpsertSuccessStory,
  useDeleteSuccessStory,
} from "@/hooks/useAdminSuccessStories";
import type { SuccessStory } from "@/hooks/useSuccessStories";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function StoryCard({
  story,
  expanded,
  onToggle,
  upsert,
  onDelete,
}: {
  story: SuccessStory;
  expanded: boolean;
  onToggle: () => void;
  upsert: ReturnType<typeof useUpsertSuccessStory>;
  onDelete: () => void;
}) {
  const [name, setName] = useState(story.name);
  const [category, setCategory] = useState<"issb" | "cadet">(story.category);
  const [imageUrl, setImageUrl] = useState(story.image_url ?? "");
  const [description, setDescription] = useState(story.description ?? "");
  const [showOnHomepage, setShowOnHomepage] = useState(story.show_on_homepage);
  const [isPublished, setIsPublished] = useState(story.is_published);

  async function save() {
    if (!name.trim()) { toast.error("নাম লিখুন"); return; }
    await upsert.mutateAsync({
      id: story.id,
      name: name.trim(),
      category,
      image_url: imageUrl || undefined,
      description: description.trim() || undefined,
      show_on_homepage: showOnHomepage,
      is_published: isPublished,
      order_index: story.order_index,
    });
    toast.success("সংরক্ষিত হয়েছে");
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={onToggle} className="flex flex-1 items-center gap-3 text-left min-w-0">
          {expanded ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
          {story.image_url && (
            <img src={story.image_url} alt={story.name} className="h-10 w-14 rounded object-cover shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{story.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className={`text-[10px] ${story.category === "issb" ? "text-blue-600 border-blue-200" : "text-green-600 border-green-200"}`}>
                {story.category.toUpperCase()}
              </Badge>
              {story.show_on_homepage && (
                <Badge className="text-[10px] bg-accent/10 text-accent border-accent/20">হোমপেজ</Badge>
              )}
              {!story.is_published && (
                <Badge variant="secondary" className="text-[10px]">আনপাবলিশড</Badge>
              )}
            </div>
          </div>
        </button>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="নাম / শিরোনাম">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="110+ Green Card Achievements" />
            </Field>
            <Field label="ক্যাটাগরি">
              <Select value={category} onValueChange={(v) => setCategory(v as "issb" | "cadet")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="issb">ISSB</SelectItem>
                  <SelectItem value="cadet">ক্যাডেট</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="ছবি">
            <ImageUpload value={imageUrl} onChange={setImageUrl} folder="thumbnails" />
          </Field>

          <Field label="বিবরণ">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="সাফল্যের বিস্তারিত বিবরণ..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </Field>

          <div className="flex flex-wrap items-center gap-6">
            <Field label="প্রকাশিত">
              <div className="flex items-center gap-2 pt-1">
                <Switch checked={isPublished} onCheckedChange={setIsPublished} />
                <span className="text-sm">{isPublished ? "হ্যাঁ" : "না"}</span>
              </div>
            </Field>
            <Field label="হোমপেজে দেখাবে">
              <div className="flex items-center gap-2 pt-1">
                <Switch checked={showOnHomepage} onCheckedChange={setShowOnHomepage} />
                <span className="text-sm text-accent">{showOnHomepage ? "হ্যাঁ" : "না"}</span>
              </div>
            </Field>
          </div>

          <Button onClick={save} disabled={upsert.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {upsert.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}
          </Button>
        </div>
      )}
    </div>
  );
}

function AddStoryForm({ onClose }: { onClose: () => void }) {
  const upsert = useUpsertSuccessStory();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"issb" | "cadet">("issb");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [showOnHomepage, setShowOnHomepage] = useState(false);

  async function save() {
    if (!name.trim()) { toast.error("নাম লিখুন"); return; }
    await upsert.mutateAsync({
      name: name.trim(),
      category,
      image_url: imageUrl || undefined,
      description: description.trim() || undefined,
      show_on_homepage: showOnHomepage,
      is_published: true,
      order_index: 0,
    });
    toast.success("গল্প যোগ হয়েছে");
    onClose();
  }

  return (
    <div className="rounded-lg border-2 border-accent/30 bg-accent/5 p-4 space-y-4">
      <p className="text-sm font-semibold text-accent">নতুন সাফল্যের গল্প</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="নাম / শিরোনাম">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="110+ Green Card Achievements" autoFocus />
        </Field>
        <Field label="ক্যাটাগরি">
          <Select value={category} onValueChange={(v) => setCategory(v as "issb" | "cadet")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="issb">ISSB</SelectItem>
              <SelectItem value="cadet">ক্যাডেট</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field label="ছবি">
        <ImageUpload value={imageUrl} onChange={setImageUrl} folder="thumbnails" />
      </Field>
      <Field label="বিবরণ">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="সাফল্যের বিস্তারিত বিবরণ..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </Field>
      <Field label="হোমপেজে দেখাবে">
        <div className="flex items-center gap-2 pt-1">
          <Switch checked={showOnHomepage} onCheckedChange={setShowOnHomepage} />
          <span className="text-sm text-accent">{showOnHomepage ? "হ্যাঁ — হোমপেজে দেখাবে" : "না"}</span>
        </div>
      </Field>
      <div className="flex gap-2">
        <Button onClick={save} disabled={upsert.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {upsert.isPending ? "যোগ হচ্ছে..." : "যোগ করুন"}
        </Button>
        <Button variant="outline" onClick={onClose}>বাতিল</Button>
      </div>
    </div>
  );
}

export default function SuccessAdmin() {
  const { data: stories = [], isLoading } = useAdminSuccessStories();
  const upsert = useUpsertSuccessStory();
  const del = useDeleteSuccessStory();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const issb = stories.filter((s) => s.category === "issb");
  const cadet = stories.filter((s) => s.category === "cadet");

  function toggle(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  async function handleDelete(id: string) {
    await del.mutateAsync(id);
    toast.success("মুছে ফেলা হয়েছে");
  }

  if (isLoading) return <div className="py-16 text-center text-sm text-muted-foreground">লোড হচ্ছে...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
        </div>
        {!adding && (
          <Button onClick={() => setAdding(true)}>
            <Plus className="mr-2 h-4 w-4" /> নতুন গল্প
          </Button>
        )}
      </div>

      {adding && <AddStoryForm onClose={() => setAdding(false)} />}

      {/* ISSB */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">ISSB</h2>
          <Badge variant="secondary">{issb.length}</Badge>
        </div>
        {issb.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-foreground rounded-lg border border-dashed border-border">কোনো ISSB গল্প নেই।</p>
        )}
        {issb.map((s) => (
          <StoryCard key={s.id} story={s} expanded={expanded === s.id}
            onToggle={() => toggle(s.id)} upsert={upsert}
            onDelete={() => handleDelete(s.id)} />
        ))}
      </div>

      {/* Cadet */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">ক্যাডেট</h2>
          <Badge variant="secondary">{cadet.length}</Badge>
        </div>
        {cadet.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-foreground rounded-lg border border-dashed border-border">কোনো ক্যাডেট গল্প নেই।</p>
        )}
        {cadet.map((s) => (
          <StoryCard key={s.id} story={s} expanded={expanded === s.id}
            onToggle={() => toggle(s.id)} upsert={upsert}
            onDelete={() => handleDelete(s.id)} />
        ))}
      </div>
    </div>
  );
}

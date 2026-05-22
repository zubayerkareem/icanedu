import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { t } from "@/lib/strings";
import type { AnySection, SectionType } from "@/lib/page-builder/types";
import { makeSection } from "@/lib/page-builder/defaults";
import { SECTION_META } from "@/lib/page-builder/registry";
import { AddSectionDialog } from "@/components/page-builder/AddSectionDialog";
import { SectionListItem } from "@/components/page-builder/SectionListItem";
import { SectionPreview } from "@/components/page-builder/SectionPreview";
import { SectionEditor } from "@/components/page-builder/SectionEditor";

type DraftRow = {
  sections_json: AnySection[];
};

export default function PageBuilder() {
  const { user } = useAuth();
  const [sections, setSections] = useState<AnySection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  // Load draft on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("homepage_config")
        .select("sections_json")
        .eq("status", "draft")
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        toast.error(t.builder.saveFailed);
      } else {
        const rows = (data as DraftRow | null)?.sections_json ?? [];
        setSections(Array.isArray(rows) ? rows : []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(
    () => sections.find((s) => s.id === selectedId) ?? null,
    [sections, selectedId],
  );

  const handleAdd = (type: SectionType) => {
    const next = makeSection(type, sections.length);
    setSections((prev) => [...prev, next]);
    setSelectedId(next.id);
  };

  const handleDelete = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i })));
    if (selectedId === id) setSelectedId(null);
  };

  const handleToggle = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)));
  };

  const handleUpdate = (next: AnySection) => {
    setSections((prev) => prev.map((s) => (s.id === next.id ? next : s)));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      return arrayMove(prev, oldIndex, newIndex).map((s, i) => ({ ...s, order: i }));
    });
  };

  const persist = async (status: "draft" | "published") => {
    const payload = {
      status,
      sections_json: sections.map((s, i) => ({ ...s, order: i })),
      updated_at: new Date().toISOString(),
      updated_by: user?.id ?? null,
    };
    const { error } = await supabase
      .from("homepage_config")
      .upsert(payload, { onConflict: "status" });
    if (error) throw error;
  };

  const onSaveDraft = async () => {
    setSaving(true);
    try {
      await persist("draft");
      toast.success(t.builder.saved);
    } catch {
      toast.error(t.builder.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const onPublish = async () => {
    setPublishing(true);
    try {
      await persist("draft");
      await persist("published");
      toast.success(t.builder.published);
    } catch {
      toast.error(t.builder.saveFailed);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="-m-6 flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground">{t.builder.title}</h1>
          <p className="text-xs text-muted-foreground">{t.builder.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onSaveDraft} disabled={saving || publishing}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? t.builder.saving : t.builder.saveDraft}
          </Button>
          <Button onClick={onPublish} disabled={saving || publishing}>
            {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
            {publishing ? t.builder.publishing : t.builder.publish}
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — 30% */}
        <aside className="flex w-[30%] min-w-[280px] max-w-[420px] flex-col border-r border-border bg-card">
          <div className="border-b border-border p-3">
            <AddSectionDialog onPick={handleAdd} />
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.builder.activeSections}
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : sections.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                {t.builder.noSections}
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {sections.map((s) => (
                      <SectionListItem
                        key={s.id}
                        section={s}
                        selected={s.id === selectedId}
                        onSelect={() => setSelectedId(s.id)}
                        onToggleVisibility={() => handleToggle(s.id)}
                        onDelete={() => handleDelete(s.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </aside>

        {/* Right panel — 70% */}
        <main className="flex-1 overflow-y-auto bg-muted/30">
          {selected ? (
            <div className="mx-auto max-w-2xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t.builder.sectionEditor}
                  </div>
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    {SECTION_META[selected.type].name}
                  </h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
                  <ArrowLeft className="h-4 w-4" />
                  {t.builder.backToPreview}
                </Button>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <SectionEditor section={selected} onChange={handleUpdate} />
              </div>
              <div className="mt-6">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t.builder.livePreview}
                </div>
                <div className="overflow-hidden rounded-lg border border-border bg-background">
                  <SectionPreview section={selected} />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-3 rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                {t.builder.previewPlaceholder}
              </div>
              <div className="overflow-hidden rounded-lg border border-border bg-background">
                {sections.filter((s) => s.visible).length === 0 ? (
                  <div className="p-12 text-center text-sm text-muted-foreground">{t.builder.noSections}</div>
                ) : (
                  sections
                    .filter((s) => s.visible)
                    .map((s) => <SectionPreview key={s.id} section={s} />)
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

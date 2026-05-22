import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import type { AnySection } from "@/lib/page-builder/types";
import { t } from "@/lib/strings";
import { Field, ColorInput } from "./editors/_fields";

interface Props {
  section: AnySection;
  onChange: (next: AnySection) => void;
}

// Helper to update config immutably with proper typing.
function patchConfig<S extends AnySection>(s: S, patch: Partial<S["config"]>): S {
  return { ...s, config: { ...s.config, ...patch } } as S;
}

export function SectionEditor({ section, onChange }: Props) {
  switch (section.type) {
    case "hero": {
      const c = section.config;
      return (
        <div className="space-y-4">
          <Field label={t.builder.fields.heading}>
            <Input value={c.heading} onChange={(e) => onChange(patchConfig(section, { heading: e.target.value }))} />
          </Field>
          <Field label={t.builder.fields.subheading}>
            <Textarea value={c.subheading} onChange={(e) => onChange(patchConfig(section, { subheading: e.target.value }))} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.builder.fields.buttonText}>
              <Input value={c.buttonText} onChange={(e) => onChange(patchConfig(section, { buttonText: e.target.value }))} />
            </Field>
            <Field label={t.builder.fields.buttonLink}>
              <Input value={c.buttonLink} onChange={(e) => onChange(patchConfig(section, { buttonLink: e.target.value }))} />
            </Field>
          </div>
          <Field label={t.builder.fields.backgroundType}>
            <Select value={c.backgroundType} onValueChange={(v) => onChange(patchConfig(section, { backgroundType: v as typeof c.backgroundType }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">{t.builder.bgType.solid}</SelectItem>
                <SelectItem value="gradient">{t.builder.bgType.gradient}</SelectItem>
                <SelectItem value="image">{t.builder.bgType.image}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {c.backgroundType !== "image" && (
            <Field label={t.builder.fields.backgroundColor}>
              <ColorInput value={c.backgroundColor} onChange={(v) => onChange(patchConfig(section, { backgroundColor: v }))} />
            </Field>
          )}
          {c.backgroundType === "image" && (
            <>
              <Field label={t.builder.fields.backgroundImage}>
                <Input value={c.backgroundImage} onChange={(e) => onChange(patchConfig(section, { backgroundImage: e.target.value }))} placeholder="https://..." />
              </Field>
              <Field label={`${t.builder.fields.overlayOpacity} (${c.overlayOpacity}%)`}>
                <Slider min={0} max={100} step={5} value={[c.overlayOpacity]} onValueChange={([v]) => onChange(patchConfig(section, { overlayOpacity: v }))} />
              </Field>
            </>
          )}
          <Field label={t.builder.fields.textAlign}>
            <Select value={c.textAlign} onValueChange={(v) => onChange(patchConfig(section, { textAlign: v as typeof c.textAlign }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="left">{t.builder.align.left}</SelectItem>
                <SelectItem value="center">{t.builder.align.center}</SelectItem>
                <SelectItem value="right">{t.builder.align.right}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      );
    }

    case "stats": {
      const c = section.config;
      const setItems = (items: typeof c.items) => onChange(patchConfig(section, { items }));
      return (
        <div className="space-y-4">
          <Field label={t.builder.fields.backgroundColor}>
            <ColorInput value={c.backgroundColor} onChange={(v) => onChange(patchConfig(section, { backgroundColor: v }))} />
          </Field>
          <div className="space-y-3">
            {c.items.map((it, i) => (
              <div key={i} className="rounded-md border border-border bg-muted/30 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">আইটেম #{i + 1}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" disabled={c.items.length <= 2} onClick={() => setItems(c.items.filter((_, j) => j !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Field label={t.builder.fields.icon}>
                    <Input value={it.icon} onChange={(e) => setItems(c.items.map((x, j) => (j === i ? { ...x, icon: e.target.value } : x)))} placeholder="Users" />
                  </Field>
                  <Field label={t.builder.fields.value}>
                    <Input value={it.value} onChange={(e) => setItems(c.items.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
                  </Field>
                  <Field label={t.builder.fields.label}>
                    <Input value={it.label} onChange={(e) => setItems(c.items.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                  </Field>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" disabled={c.items.length >= 6} onClick={() => setItems([...c.items, { icon: "Star", value: "০", label: "নতুন" }])}>
              {t.builder.addItem}
            </Button>
          </div>
        </div>
      );
    }

    case "featured_courses":
    case "featured_products": {
      const c = section.config;
      return (
        <div className="space-y-4">
          <Field label={t.builder.fields.heading}>
            <Input value={c.heading} onChange={(e) => onChange(patchConfig(section, { heading: e.target.value }))} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.builder.fields.count}>
              <Select value={String(c.count)} onValueChange={(v) => onChange(patchConfig(section, { count: Number(v) as 3 | 6 | 9 }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">৩</SelectItem>
                  <SelectItem value="6">৬</SelectItem>
                  <SelectItem value="9">৯</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label={t.builder.fields.source}>
              <Select value={c.source} onValueChange={(v) => onChange(patchConfig(section, { source: v as typeof c.source }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">{t.builder.courseSource.latest}</SelectItem>
                  <SelectItem value="popular">{t.builder.courseSource.popular}</SelectItem>
                  <SelectItem value="manual">{t.builder.courseSource.manual}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          {c.source === "manual" && (
            <p className="text-xs text-muted-foreground">ম্যানুয়াল নির্বাচন পরবর্তী ফেজে যুক্ত হবে (যখন কোর্স/প্রোডাক্ট তৈরি হবে)।</p>
          )}
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <Label className="text-sm">{t.builder.fields.showSeeAll}</Label>
            <Switch checked={c.showSeeAll} onCheckedChange={(v) => onChange(patchConfig(section, { showSeeAll: v }))} />
          </div>
        </div>
      );
    }

    case "how_it_works": {
      const c = section.config;
      const setSteps = (steps: typeof c.steps) => onChange(patchConfig(section, { steps }));
      return (
        <div className="space-y-4">
          <Field label={t.builder.fields.heading}>
            <Input value={c.heading} onChange={(e) => onChange(patchConfig(section, { heading: e.target.value }))} />
          </Field>
          <div className="space-y-3">
            {c.steps.map((s, i) => (
              <div key={i} className="rounded-md border border-border bg-muted/30 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">ধাপ #{i + 1}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" disabled={c.steps.length <= 2} onClick={() => setSteps(c.steps.filter((_, j) => j !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Field label={t.builder.fields.icon}>
                    <Input value={s.icon} onChange={(e) => setSteps(c.steps.map((x, j) => (j === i ? { ...x, icon: e.target.value } : x)))} placeholder="UserPlus" />
                  </Field>
                  <Field label={t.builder.fields.title}>
                    <Input value={s.title} onChange={(e) => setSteps(c.steps.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
                  </Field>
                  <Field label={t.builder.fields.description}>
                    <Textarea value={s.description} onChange={(e) => setSteps(c.steps.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} />
                  </Field>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" disabled={c.steps.length >= 5} onClick={() => setSteps([...c.steps, { icon: "Check", title: "নতুন ধাপ", description: "বিবরণ" }])}>
              {t.builder.addItem}
            </Button>
          </div>
        </div>
      );
    }

    case "testimonials": {
      const c = section.config;
      const setItems = (items: typeof c.items) => onChange(patchConfig(section, { items }));
      return (
        <div className="space-y-4">
          <Field label={t.builder.fields.heading}>
            <Input value={c.heading} onChange={(e) => onChange(patchConfig(section, { heading: e.target.value }))} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <Label className="text-sm">{t.builder.fields.autoSlide}</Label>
              <Switch checked={c.autoSlide} onCheckedChange={(v) => onChange(patchConfig(section, { autoSlide: v }))} />
            </div>
            <Field label={t.builder.fields.intervalSeconds}>
              <Input type="number" min={2} max={20} value={c.intervalSeconds} onChange={(e) => onChange(patchConfig(section, { intervalSeconds: Number(e.target.value) }))} />
            </Field>
          </div>
          <div className="space-y-3">
            {c.items.map((it, i) => (
              <div key={i} className="rounded-md border border-border bg-muted/30 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">মতামত #{i + 1}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setItems(c.items.filter((_, j) => j !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Field label={t.builder.fields.quote}>
                    <Textarea value={it.quote} onChange={(e) => setItems(c.items.map((x, j) => (j === i ? { ...x, quote: e.target.value } : x)))} />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label={t.builder.fields.name}>
                      <Input value={it.name} onChange={(e) => setItems(c.items.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                    </Field>
                    <Field label={t.builder.fields.course}>
                      <Input value={it.course} onChange={(e) => setItems(c.items.map((x, j) => (j === i ? { ...x, course: e.target.value } : x)))} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label={`${t.builder.fields.rating} (১-৫)`}>
                      <Input type="number" min={1} max={5} value={it.rating} onChange={(e) => setItems(c.items.map((x, j) => (j === i ? { ...x, rating: Math.max(1, Math.min(5, Number(e.target.value))) } : x)))} />
                    </Field>
                    <Field label={t.builder.fields.avatar}>
                      <Input value={it.avatar ?? ""} onChange={(e) => setItems(c.items.map((x, j) => (j === i ? { ...x, avatar: e.target.value } : x)))} />
                    </Field>
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setItems([...c.items, { quote: "", name: "", course: "", rating: 5 }])}>
              {t.builder.addItem}
            </Button>
          </div>
        </div>
      );
    }

    case "cta_banner": {
      const c = section.config;
      return (
        <div className="space-y-4">
          <Field label={t.builder.fields.heading}>
            <Input value={c.heading} onChange={(e) => onChange(patchConfig(section, { heading: e.target.value }))} />
          </Field>
          <Field label={t.builder.fields.subheading}>
            <Textarea value={c.subheading} onChange={(e) => onChange(patchConfig(section, { subheading: e.target.value }))} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.builder.fields.buttonText}>
              <Input value={c.buttonText} onChange={(e) => onChange(patchConfig(section, { buttonText: e.target.value }))} />
            </Field>
            <Field label={t.builder.fields.buttonLink}>
              <Input value={c.buttonLink} onChange={(e) => onChange(patchConfig(section, { buttonLink: e.target.value }))} />
            </Field>
          </div>
          <Field label={t.builder.fields.backgroundType}>
            <Select value={c.backgroundType} onValueChange={(v) => onChange(patchConfig(section, { backgroundType: v as typeof c.backgroundType }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">{t.builder.bgType.solid}</SelectItem>
                <SelectItem value="gradient">{t.builder.bgType.gradient}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {c.backgroundType === "solid" ? (
            <Field label={t.builder.fields.backgroundColor}>
              <ColorInput value={c.backgroundColor} onChange={(v) => onChange(patchConfig(section, { backgroundColor: v }))} />
            </Field>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Field label={t.builder.fields.gradientFrom}>
                <ColorInput value={c.gradientFrom} onChange={(v) => onChange(patchConfig(section, { gradientFrom: v }))} />
              </Field>
              <Field label={t.builder.fields.gradientTo}>
                <ColorInput value={c.gradientTo} onChange={(v) => onChange(patchConfig(section, { gradientTo: v }))} />
              </Field>
            </div>
          )}
        </div>
      );
    }

    case "text_block": {
      const c = section.config;
      return (
        <div className="space-y-4">
          <Field label={t.builder.fields.content}>
            <Textarea rows={10} value={c.content} onChange={(e) => onChange(patchConfig(section, { content: e.target.value }))} />
          </Field>
          <Field label={t.builder.fields.background}>
            <Select value={c.background} onValueChange={(v) => onChange(patchConfig(section, { background: v as typeof c.background }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="white">{t.builder.bg.white}</SelectItem>
                <SelectItem value="muted">{t.builder.bg.muted}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      );
    }

    case "image_banner": {
      const c = section.config;
      return (
        <div className="space-y-4">
          <Field label={t.builder.fields.imageUrl}>
            <Input value={c.imageUrl} onChange={(e) => onChange(patchConfig(section, { imageUrl: e.target.value }))} placeholder="https://..." />
          </Field>
          <Field label={t.builder.fields.caption}>
            <Input value={c.caption} onChange={(e) => onChange(patchConfig(section, { caption: e.target.value }))} />
          </Field>
          <Field label={t.builder.fields.link}>
            <Input value={c.link} onChange={(e) => onChange(patchConfig(section, { link: e.target.value }))} />
          </Field>
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <Label className="text-sm">{t.builder.fields.fullWidth}</Label>
            <Switch checked={c.fullWidth} onCheckedChange={(v) => onChange(patchConfig(section, { fullWidth: v }))} />
          </div>
        </div>
      );
    }

    case "video_embed": {
      const c = section.config;
      return (
        <div className="space-y-4">
          <Field label={t.builder.fields.heading}>
            <Input value={c.heading} onChange={(e) => onChange(patchConfig(section, { heading: e.target.value }))} />
          </Field>
          <Field label={t.builder.fields.videoUrl}>
            <Input value={c.videoUrl} onChange={(e) => onChange(patchConfig(section, { videoUrl: e.target.value }))} placeholder="https://youtube.com/watch?v=..." />
          </Field>
          <Field label={t.builder.fields.description}>
            <Textarea value={c.description} onChange={(e) => onChange(patchConfig(section, { description: e.target.value }))} />
          </Field>
        </div>
      );
    }

    case "faq": {
      const c = section.config;
      const setItems = (items: typeof c.items) => onChange(patchConfig(section, { items }));
      return (
        <div className="space-y-4">
          <Field label={t.builder.fields.heading}>
            <Input value={c.heading} onChange={(e) => onChange(patchConfig(section, { heading: e.target.value }))} />
          </Field>
          <div className="space-y-3">
            {c.items.map((it, i) => (
              <div key={i} className="rounded-md border border-border bg-muted/30 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">FAQ #{i + 1}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setItems(c.items.filter((_, j) => j !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Field label={t.builder.fields.question}>
                    <Input value={it.question} onChange={(e) => setItems(c.items.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)))} />
                  </Field>
                  <Field label={t.builder.fields.answer}>
                    <Textarea value={it.answer} onChange={(e) => setItems(c.items.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)))} />
                  </Field>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setItems([...c.items, { question: "", answer: "" }])}>
              {t.builder.addItem}
            </Button>
          </div>
        </div>
      );
    }

    case "notice_preview": {
      const c = section.config;
      return (
        <div className="space-y-4">
          <Field label={t.builder.fields.heading}>
            <Input value={c.heading} onChange={(e) => onChange(patchConfig(section, { heading: e.target.value }))} />
          </Field>
          <Field label={t.builder.fields.count}>
            <Select value={String(c.count)} onValueChange={(v) => onChange(patchConfig(section, { count: Number(v) as 3 | 5 }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">৩</SelectItem>
                <SelectItem value="5">৫</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      );
    }
  }
}

import type { TextBlockConfig } from "@/lib/page-builder/types";

export function TextBlockSection({ config }: { config: TextBlockConfig }) {
  return (
    <section
      className={config.background === "muted" ? "bg-muted/40 py-12" : "bg-background py-12"}
    >
      <div className="container max-w-3xl">
        <div className="prose prose-slate max-w-none whitespace-pre-wrap font-body text-foreground">
          {config.content}
        </div>
      </div>
    </section>
  );
}

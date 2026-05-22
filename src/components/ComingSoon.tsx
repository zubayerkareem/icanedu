import { t } from "@/lib/strings";
import { Construction } from "lucide-react";

export function ComingSoon({ title }: { title?: string }) {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
        <Construction className="h-7 w-7" />
      </div>
      <h2 className="mt-4 font-heading text-2xl font-bold text-foreground">
        {title ?? t.common.comingSoon}
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{t.common.comingSoonDesc}</p>
    </div>
  );
}

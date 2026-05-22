import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ALL_SECTION_TYPES, SECTION_META } from "@/lib/page-builder/registry";
import type { SectionType } from "@/lib/page-builder/types";
import { t } from "@/lib/strings";
import { Plus } from "lucide-react";

interface Props {
  onPick: (type: SectionType) => void;
}

export function AddSectionDialog({ onPick }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className="w-full" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        {t.builder.addSection}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.builder.chooseSection}</DialogTitle>
          </DialogHeader>
          <div className="grid max-h-[60vh] grid-cols-1 gap-3 overflow-y-auto p-1 sm:grid-cols-2">
            {ALL_SECTION_TYPES.map((type) => {
              const meta = SECTION_META[type];
              const Icon = meta.icon;
              return (
                <Card
                  key={type}
                  className="cursor-pointer transition-colors hover:border-accent hover:bg-accent/5"
                  onClick={() => {
                    onPick(type);
                    setOpen(false);
                  }}
                >
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground">{meta.name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{meta.description}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

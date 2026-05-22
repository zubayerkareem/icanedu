import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { SECTION_META } from "@/lib/page-builder/registry";
import type { AnySection } from "@/lib/page-builder/types";
import { t } from "@/lib/strings";
import { cn } from "@/lib/utils";

interface Props {
  section: AnySection;
  selected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
}

export function SectionListItem({ section, selected, onSelect, onToggleVisibility, onDelete }: Props) {
  const meta = SECTION_META[section.type];
  const Icon = meta.icon;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-card p-2 transition-colors",
        selected ? "border-accent ring-1 ring-accent" : "border-border",
        isDragging && "opacity-60",
        !section.visible && "opacity-60",
      )}
    >
      <button
        type="button"
        className="flex h-7 w-7 cursor-grab items-center justify-center text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="drag"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <Icon className="h-4 w-4 shrink-0 text-accent" />
        <span className="truncate text-sm font-medium text-foreground">{meta.name}</span>
      </button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onToggleVisibility}
        aria-label={section.visible ? t.builder.hide : t.builder.show}
      >
        {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onSelect}
        aria-label={t.builder.edit}
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            aria-label={t.builder.delete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.builder.confirmDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.builder.confirmDeleteDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.builder.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>{t.builder.confirm}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

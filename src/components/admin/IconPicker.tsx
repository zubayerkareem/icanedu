import { useState } from "react";
import {
  Award, BadgeCheck, BookOpen, Brain, Briefcase, Calendar, Camera, CheckCircle2,
  Clock, Cloud, Code, Compass, Crown, Download, Edit, FileText, Film, Flag,
  Gift, GraduationCap, Headphones, Heart, HelpCircle, Home, Image, Infinity,
  Key, Languages, Laptop, Layers, Library, Lightbulb, ListChecks, Lock, Mail,
  Map, MessageSquare, Mic, Monitor, Moon, Newspaper, Notebook, Package, PenLine,
  Phone, PlayCircle, Presentation, Puzzle, Quote, Rocket, Sparkles, Star, Sun,
  Target, ThumbsUp, Timer, Trophy, Tv, Users, Video, Wallet, Zap, ShieldCheck,
  Medal, Bookmark, Bell, Globe, Pencil, FileQuestion, ClipboardList, BarChart,
  TrendingUp, CheckCheck, Eye, Folder, Database, Wifi, Smile, Coffee,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const ICON_MAP: Record<string, LucideIcon> = {
  Award, BadgeCheck, BookOpen, Brain, Briefcase, Calendar, Camera, CheckCircle2,
  Clock, Cloud, Code, Compass, Crown, Download, Edit, FileText, Film, Flag,
  Gift, GraduationCap, Headphones, Heart, HelpCircle, Home, Image, Infinity,
  Key, Languages, Laptop, Layers, Library, Lightbulb, ListChecks, Lock, Mail,
  Map, MessageSquare, Mic, Monitor, Moon, Newspaper, Notebook, Package, PenLine,
  Phone, PlayCircle, Presentation, Puzzle, Quote, Rocket, Sparkles, Star, Sun,
  Target, ThumbsUp, Timer, Trophy, Tv, Users, Video, Wallet, Zap, ShieldCheck,
  Medal, Bookmark, Bell, Globe, Pencil, FileQuestion, ClipboardList, BarChart,
  TrendingUp, CheckCheck, Eye, Folder, Database, Wifi, Smile, Coffee,
};

const ICON_NAMES = Object.keys(ICON_MAP);

/** Render a lucide icon by name (falls back to a check icon). */
export function DynamicIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = (name && ICON_MAP[name]) || CheckCircle2;
  return <Icon className={className} />;
}

export function IconPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="icon" className="shrink-0">
          <DynamicIcon name={value} className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="আইকন খুঁজুন..." />
          <CommandList>
            <CommandEmpty>কোনো আইকন নেই</CommandEmpty>
            <CommandGroup>
              <div className="grid grid-cols-6 gap-1 p-1">
                {ICON_NAMES.map((name) => {
                  const Icon = ICON_MAP[name];
                  return (
                    <CommandItem
                      key={name}
                      value={name}
                      onSelect={() => {
                        onChange(name);
                        setOpen(false);
                      }}
                      className={[
                        "flex h-9 w-9 items-center justify-center rounded p-0",
                        value === name ? "bg-accent text-accent-foreground" : "",
                      ].join(" ")}
                      title={name}
                    >
                      <Icon className="h-4 w-4" />
                    </CommandItem>
                  );
                })}
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

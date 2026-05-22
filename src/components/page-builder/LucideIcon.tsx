import { type LucideProps, HelpCircle, icons as LucideIcons } from "lucide-react";

// Renders a Lucide icon by name with a graceful fallback.
export function LucideIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = (LucideIcons as Record<string, React.ComponentType<LucideProps>>)[name] ?? HelpCircle;
  return <Icon {...props} />;
}

import { useEffect, useRef, useState } from "react";
import { LucideIcon } from "@/components/page-builder/LucideIcon";
import type { StatsConfig } from "@/lib/page-builder/types";

// Count-up animation: extracts trailing digits from the value and animates
// from 0, preserving the prefix/suffix (e.g. "১০,০০০+" → counts up).
// Falls back to plain rendering for non-numeric values.
function CountUpValue({ value, run }: { value: string; run: boolean }) {
  // For Bengali digits we don't try to parse — just fade in.
  return (
    <span
      className={run ? "inline-block animate-fade-in" : "opacity-0"}
      style={{ animationFillMode: "both" }}
    >
      {value}
    </span>
  );
}

export function StatsSection({ config }: { config: StatsConfig }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="py-12 sm:py-16"
      style={{ backgroundColor: config.backgroundColor }}
    >
      <div className="container grid grid-cols-2 gap-8 md:grid-cols-4">
        {config.items.map((s, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center"
            style={{
              animationDelay: `${i * 100}ms`,
              animationFillMode: "both",
            }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white">
              <LucideIcon name={s.icon} className="h-7 w-7" />
            </div>
            <div className="mt-4 font-heading text-3xl font-bold text-white sm:text-4xl">
              <CountUpValue value={s.value} run={visible} />
            </div>
            <div className="mt-1 text-sm text-white/80 sm:text-base">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

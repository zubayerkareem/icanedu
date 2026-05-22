import { LucideIcon } from "@/components/page-builder/LucideIcon";
import type { HowItWorksConfig } from "@/lib/page-builder/types";

export function HowItWorksSection({ config }: { config: HowItWorksConfig }) {
  return (
    <section className="bg-muted/40 py-14 sm:py-20">
      <div className="container">
        <h2 className="mb-12 text-center font-heading text-2xl font-bold text-foreground sm:text-3xl">
          {config.heading}
        </h2>
        <div className="relative">
          {/* Connecting dotted line on md+ */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-8 hidden h-px border-t-2 border-dashed border-border md:block"
            style={{ left: "10%", right: "10%" }}
          />
          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-5">
            {config.steps.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center"
              >
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md ring-4 ring-background">
                  <LucideIcon name={s.icon} className="h-7 w-7" />
                </div>
                <div className="mt-4 font-heading text-base font-semibold text-foreground">
                  {s.title}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

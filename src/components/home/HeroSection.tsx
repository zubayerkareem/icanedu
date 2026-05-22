import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { HeroConfig } from "@/lib/page-builder/types";

export function HeroSection({ config }: { config: HeroConfig }) {
  const align =
    config.textAlign === "left"
      ? "text-left items-start"
      : config.textAlign === "right"
        ? "text-right items-end"
        : "text-center items-center";

  const bg =
    config.backgroundType === "image" && config.backgroundImage
      ? {
          backgroundImage: `url(${config.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : config.backgroundType === "gradient"
        ? {
            background: `linear-gradient(135deg, ${config.backgroundColor}, hsl(var(--accent)))`,
          }
        : { backgroundColor: config.backgroundColor };

  const isDarkBg = config.backgroundType !== "solid" || true; // hero is dark by default
  const textColor = isDarkBg ? "text-white" : "text-foreground";

  return (
    <section className="relative overflow-hidden" style={bg}>
      {config.backgroundType === "image" && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: (config.overlayOpacity ?? 0) / 100 }}
        />
      )}
      <div
        className={`container relative flex min-h-[420px] flex-col justify-center gap-5 py-20 sm:py-28 ${align} ${textColor}`}
      >
        <h1
          className="font-heading text-4xl font-bold leading-tight animate-fade-in sm:text-5xl md:text-6xl"
          style={{ animationDelay: "0ms", animationFillMode: "both" }}
        >
          {config.heading || "—"}
        </h1>
        {config.subheading && (
          <p
            className="max-w-2xl text-base opacity-90 animate-fade-in sm:text-lg"
            style={{ animationDelay: "120ms", animationFillMode: "both" }}
          >
            {config.subheading}
          </p>
        )}
        {config.buttonText && (
          <div
            className="animate-fade-in"
            style={{ animationDelay: "240ms", animationFillMode: "both" }}
          >
            <Button asChild size="lg" variant="gradient">
              <Link to={config.buttonLink || "#"}>{config.buttonText}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { CtaBannerConfig } from "@/lib/page-builder/types";

export function CtaBannerSection({ config }: { config: CtaBannerConfig }) {
  const bg =
    config.backgroundType === "gradient"
      ? {
          background: `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo})`,
        }
      : { backgroundColor: config.backgroundColor };

  return (
    <section style={bg} className="text-white">
      <div className="container flex flex-col items-center gap-5 py-14 text-center sm:py-20">
        <h2 className="font-heading text-2xl font-bold sm:text-4xl">{config.heading}</h2>
        {config.subheading && (
          <p className="max-w-2xl text-base opacity-90 sm:text-lg">{config.subheading}</p>
        )}
        {config.buttonText && (
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-2 animate-[float_3s_ease-in-out_infinite]"
          >
            <Link to={config.buttonLink || "#"}>{config.buttonText}</Link>
          </Button>
        )}
      </div>
    </section>
  );
}

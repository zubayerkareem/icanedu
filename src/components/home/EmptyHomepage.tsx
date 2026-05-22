import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/strings";

export function EmptyHomepage() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary to-accent">
      <div className="container flex min-h-[480px] flex-col items-center justify-center gap-5 py-20 text-center text-white">
        <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
          {t.brand.tagline}
        </span>
        <h1 className="font-heading text-4xl font-bold sm:text-5xl md:text-6xl">
          {t.home.welcome}
        </h1>
        <p className="max-w-xl text-base opacity-90 sm:text-lg">{t.home.welcomeSub}</p>
        <Button
          asChild
          size="lg"
          variant="secondary"
          className="mt-2"
        >
          <Link to="/courses">{t.home.seeCourses}</Link>
        </Button>
      </div>
    </section>
  );
}

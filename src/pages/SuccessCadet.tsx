import { Link } from "react-router-dom";
import { Trophy, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUCCESS_STORIES } from "@/lib/success/stories";


export default function SuccessCadet() {
  return (
    <>
      {/* Hero */}
      <section className="bg-primary py-14 text-white sm:py-20">
        <div className="container text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <GraduationCap className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="mt-4 font-heading text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            ক্যাডেট সাফল্যের গল্প
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
            iCANBD-এর ক্যাডেট কলেজ প্রস্তুতি কোর্স থেকে সফল হওয়া শিক্ষার্থীদের অনুপ্রেরণামূলক গল্প।
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="bg-white text-primary hover:bg-white/90">
              <Link to="/courses">ক্যাডেট কোর্স দেখুন</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="py-12 sm:py-16">
        <div className="container">
          <div className="mb-8 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              শিক্ষার্থীদের সাফল্যের কথা
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">আমাদের শিক্ষার্থীরা যা অর্জন করেছেন</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SUCCESS_STORIES.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="w-full overflow-hidden rounded-lg bg-muted">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="w-full h-auto object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground text-base">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/30 py-12">
        <div className="container text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            আপনার সন্তানের স্বপ্ন পূরণ করুন!
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            আজই আমাদের ক্যাডেট কলেজ প্রস্তুতি কোর্সে ভর্তি করান এবং সন্তানের উজ্জ্বল ভবিষ্যৎ নিশ্চিত করুন।
          </p>
          <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/courses">এখনই ভর্তি হোন</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

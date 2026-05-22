import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function FounderSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0f1e] via-[#0d1530] to-[#1a0a2e] py-16 sm:py-20">
      {/* Subtle gradient orbs */}
      <div className="pointer-events-none absolute -left-32 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-rose-500/10 blur-3xl" />

      <div className="container relative">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">

          {/* Image */}
          <div className="flex justify-center md:justify-start">
            <div className="relative h-[340px] w-[280px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 shadow-2xl sm:h-[400px] sm:w-[320px]">
              {/* Placeholder */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500">
                <svg className="h-20 w-20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
                <span className="text-sm">ছবি শীঘ্রই আসছে</span>
              </div>
              {/* Bottom gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col gap-5">
            <h2 className="font-heading text-2xl font-bold leading-tight text-accent sm:text-3xl md:text-4xl">
              সকল উদ্যমী নেতা ও পরিবর্তনকামীদের প্রতি শুভেচ্ছা
            </h2>

            <div className="space-y-4 text-sm leading-relaxed text-slate-300 sm:text-base">
              <p>
                যখন আমি iCAN Academy-র স্বপ্ন দেখেছিলাম, তখন শুধু একটি শিক্ষাপ্রতিষ্ঠান গড়ার কথা ভাবিনি — আমি চেয়েছিলাম এমন একটি আলোকবর্তিকা তৈরি করতে যা তরুণদের আশা, ক্ষমতায়ন ও উৎকর্ষতার পথ দেখাবে।
              </p>
              <p>
                আমাদের বিশ্ব দ্রুত পরিবর্তিত হচ্ছে। আগামীর নেতাদের শুধু একাডেমিক সাফল্য নয় — দরকার মানসিক দৃঢ়তা, অভিযোজন ক্ষমতা, নৈতিকতা এবং অটল আত্মবিশ্বাস। আমি বিশ্বাস করি, প্রতিটি তরুণের মধ্যে অপার সম্ভাবনা লুকিয়ে আছে।
              </p>
            </div>

            <div className="pt-2">
              <Button asChild size="lg" variant="gradient">
                <Link to="/about">আরও জানুন</Link>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import { Trophy, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORIES = [
  {
    id: 1,
    name: "আরিফুল ইসলাম",
    college: "ঝিনাইদহ ক্যাডেট কলেজ",
    year: "২০২৫",
    avatar: "আ",
    quote:
      "iCANBD-এর ক্যাডেট কলেজ প্যাকেজ আমার জন্য আশীর্বাদ। গণিত, বিজ্ঞান, ইংরেজি — সব বিষয়ে একসাথে প্রস্তুতি নিতে পেরেছি।",
    result: "মৌখিক পরীক্ষায় উত্তীর্ণ",
  },
  {
    id: 2,
    name: "ফারহান রহমান",
    college: "রাজশাহী ক্যাডেট কলেজ",
    year: "২০২৫",
    avatar: "ফ",
    quote:
      "লিখিত পরীক্ষার প্রস্তুতিতে iCANBD-এর প্রশ্নব্যাংক ও মডেল টেস্টগুলো অনেক কাজে লেগেছে। প্রতিটি বিষয়ে আত্মবিশ্বাস বেড়েছে।",
    result: "সফলভাবে ভর্তি",
  },
  {
    id: 3,
    name: "নাফিসা আক্তার",
    college: "ময়মনসিংহ গার্লস ক্যাডেট কলেজ",
    year: "২০২৫",
    avatar: "ন",
    quote:
      "মেয়েদের জন্য ক্যাডেট কলেজে সুযোগ পাওয়া সত্যিই কঠিন। iCANBD-এর বিশেষ গাইডেন্সে আমি সফল হয়েছি।",
    result: "সফলভাবে ভর্তি",
  },
  {
    id: 4,
    name: "সাইফুল হক",
    college: "সিলেট ক্যাডেট কলেজ",
    year: "২০২৪",
    avatar: "স",
    quote:
      "শারীরিক পরীক্ষার গাইডলাইন এবং মনোবিজ্ঞান টেস্টের প্রস্তুতি — দুটোই অনেক সাহায্য করেছে। স্যারদের ধন্যবাদ।",
    result: "সফলভাবে ভর্তি",
  },
  {
    id: 5,
    name: "তাহমিদ হোসেন",
    college: "বরিশাল ক্যাডেট কলেজ",
    year: "২০২৪",
    avatar: "ত",
    quote:
      "বাংলা রচনা ও ইংরেজি কম্পোজিশন সেকশনগুলো বিশেষভাবে উপকারী ছিল। আমার লেখার দক্ষতা অনেক উন্নত হয়েছে।",
    result: "প্রথম সুযোগে সফল",
  },
  {
    id: 6,
    name: "সুমাইয়া বেগম",
    college: "কুমিল্লা ক্যাডেট কলেজ",
    year: "২০২৫",
    avatar: "সু",
    quote:
      "লাইভ মক পরীক্ষা এবং বিস্তারিত ফিডব্যাক সেশনগুলো অনেক সাহায্য করেছে। প্রতিটি দুর্বলতা চিহ্নিত করে উন্নতি করতে পেরেছি।",
    result: "সফলভাবে ভর্তি",
  },
];


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
            {STORIES.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gradient-to-br from-muted to-secondary">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="h-12 w-12 text-muted-foreground/30" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                    </svg>
                  </div>
                </div>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">"{s.quote}"</p>
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

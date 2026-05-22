import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORIES = [
  {
    id: 1,
    name: "মোঃ রাকিবুল হাসান",
    batch: "ISSB ২০২৫",
    force: "বাংলাদেশ সেনাবাহিনী",
    avatar: "র",
    quote:
      "iCANBD-এর ISSB কোর্সটি আমার জীবন বদলে দিয়েছে। মনোবিজ্ঞান পরীক্ষার প্রস্তুতি থেকে শুরু করে শারীরিক পরীক্ষার গাইডলাইন — সবকিছুই এখানে পেয়েছি।",
    result: "সফলভাবে উত্তীর্ণ",
  },
  {
    id: 2,
    name: "তানভীর আহমেদ",
    batch: "ISSB ২০২৫",
    force: "বাংলাদেশ নৌবাহিনী",
    avatar: "ত",
    quote:
      "গ্রুপ ডিসকাশন এবং লেকচারেট প্র্যাকটিস সেশনগুলো অসাধারণ ছিল। স্যারদের গাইডেন্সে আমি আত্মবিশ্বাসী হয়ে পরীক্ষা দিতে পেরেছিলাম।",
    result: "সফলভাবে উত্তীর্ণ",
  },
  {
    id: 3,
    name: "সাদিয়া ইসলাম",
    batch: "ISSB ২০২৪",
    force: "বাংলাদেশ বিমানবাহিনী",
    avatar: "স",
    quote:
      "মেয়ে হিসেবে সশস্ত্র বাহিনীতে যোগ দেওয়ার স্বপ্ন ছিল। iCANBD-এর কোর্স আমাকে সেই স্বপ্ন পূরণে সাহায্য করেছে।",
    result: "সফলভাবে উত্তীর্ণ",
  },
  {
    id: 4,
    name: "মাহমুদুল করিম",
    batch: "ISSB ২০২৪",
    force: "বাংলাদেশ সেনাবাহিনী",
    avatar: "ম",
    quote:
      "দুবার ব্যর্থ হওয়ার পর iCANBD-এ ভর্তি হই। তৃতীয়বার ISSB-তে উত্তীর্ণ হই। সঠিক গাইডেন্স কতটা গুরুত্বপূর্ণ তা এখন বুঝি।",
    result: "৩য় চেষ্টায় সফল",
  },
  {
    id: 5,
    name: "রিফাত হোসেন",
    batch: "ISSB ২০২৫",
    force: "বাংলাদেশ সেনাবাহিনী",
    avatar: "রি",
    quote:
      "সাইকোলজিক্যাল টেস্টের প্রস্তুতি নিয়ে খুব চিন্তায় ছিলাম। iCANBD-এর বিশেষ মডিউলগুলো আমার সব ভয় দূর করে দিয়েছে।",
    result: "সফলভাবে উত্তীর্ণ",
  },
  {
    id: 6,
    name: "নুসরাত জাহান",
    batch: "ISSB ২০২৫",
    force: "বাংলাদেশ নৌবাহিনী",
    avatar: "ন",
    quote:
      "লাইভ ক্লাসগুলো অনেক কার্যকর ছিল। বিশেষত গ্রুপ ডিসকাশনের মক সেশনগুলো আমাকে অনেক আত্মবিশ্বাসী করে তুলেছিল।",
    result: "সফলভাবে উত্তীর্ণ",
  },
];


export default function SuccessISSB() {
  return (
    <>
      {/* Hero */}
      <section className="bg-primary py-14 text-white sm:py-20">
        <div className="container text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <Trophy className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="mt-4 font-heading text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            ISSB সাফল্যের গল্প
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
            iCANBD-এর ISSB প্রস্তুতি কোর্স থেকে পাস করা শিক্ষার্থীদের অনুপ্রেরণামূলক গল্পগুলো পড়ুন।
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="bg-white text-primary hover:bg-white/90">
              <Link to="/courses">ISSB কোর্স দেখুন</Link>
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
            আপনিও সফল হতে পারেন!
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            আজই আমাদের ISSB প্রস্তুতি কোর্সে যোগ দিন এবং আপনার স্বপ্নের সশস্ত্র বাহিনীতে যোগ দেওয়ার পথ সুগম করুন।
          </p>
          <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/courses">এখনই ভর্তি হোন</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

const REVIEWS = [
  {
    id: 1,
    name: "মোহাম্মদ রাফিউল হাসান",
    course: "ISSB Complete Bundle",
    rating: 5,
    comment:
      "iCANBD-এর ISSB কোর্সটি আমার জীবন বদলে দিয়েছে। কোর্সের গাইডলাইন অনুসরণ করে আমি প্রথমবারেই ISSB পাস করেছি। শিক্ষকদের অভিজ্ঞতা ও শেখানোর ধরন অতুলনীয়।",
    date: "এপ্রিল ২০২৬",
  },
  {
    id: 2,
    name: "সাবরিনা আক্তার",
    course: "ক্যাডেট কলেজ সম্পূর্ণ প্যাকেজ",
    rating: 5,
    comment:
      "আমার ছেলে এই কোর্সটি করে ফৌজদারহাট ক্যাডেট কলেজে ভর্তির সুযোগ পেয়েছে। কোর্সের প্রতিটি বিষয় এত সুন্দরভাবে সাজানো যে পড়তে ভালো লাগে।",
    date: "মার্চ ২০২৬",
  },
  {
    id: 3,
    name: "তানভীর আহমেদ",
    course: "ISSB Written Test Preparation",
    rating: 5,
    comment:
      "লিখিত পরীক্ষার প্রস্তুতিটা আগে কীভাবে নেব বুঝতাম না। এই কোর্সের পর সব পরিষ্কার হয়ে গেছে। মডেল টেস্টগুলো বিশেষভাবে সহায়ক ছিল।",
    date: "মার্চ ২০২৬",
  },
  {
    id: 4,
    name: "ফারহান মাহমুদ",
    course: "ক্যাডেট কলেজ গণিত প্রস্তুতি",
    rating: 5,
    comment:
      "গণিতে আগে অনেক দুর্বল ছিলাম। এই কোর্সের পর গণিত আমার প্রিয় বিষয় হয়ে গেছে। শিক্ষক মহোদয়ের ব্যাখ্যা এতটাই সহজ যে কঠিন বিষয়ও সহজ লাগে।",
    date: "ফেব্রুয়ারি ২০২৬",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < count ? "text-yellow-400" : "text-muted-foreground/30"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function ReviewsSection() {
  return (
    <section className="bg-muted/30 py-12 sm:py-16">
      <div className="container">
        <div className="mb-8 text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            শিক্ষার্থীদের মতামত
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            আমাদের শিক্ষার্থীরা যা বলছেন
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {REVIEWS.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <StarRating count={r.rating} />

              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                "{r.comment}"
              </p>

              <div className="border-t border-border pt-4">
                <p className="text-sm font-semibold text-foreground">{r.name}</p>
                <p className="mt-0.5 text-xs text-accent">{r.course}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

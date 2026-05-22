const STORIES = [
  {
    id: 1,
    quote:
      "iCANBD-এর কোর্স করে আমি মাত্র ৬ মাসে একটি সফটওয়্যার কোম্পানিতে চাকরি পেয়েছি। এই প্ল্যাটফর্ম আমার জীবন বদলে দিয়েছে।",
  },
  {
    id: 2,
    quote:
      "ঘরে বসেই বিশ্বমানের ডিজাইন শিখতে পেরেছি। এখন প্রতি মাসে ভালো আয় করছি। iCANBD আমার স্বপ্নকে বাস্তবে রূপ দিয়েছে।",
  },
  {
    id: 3,
    quote:
      "কোর্সের কন্টেন্ট এত সহজ ও গোছানো যে শেখাটা আনন্দদায়ক হয়ে ওঠে। শিক্ষকরা সবসময় সাহায্য করেছেন।",
  },
  {
    id: 4,
    quote:
      "iCANBD-এর হাত ধরে আমি আজ একজন সফল কন্টেন্ট ক্রিয়েটর। লক্ষাধিক মানুষের কাছে পৌঁছাতে পারছি।",
  },
];

export function SuccessStoriesSection() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container">
        <div className="mb-8 text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            আমাদের অর্জন এক নজরে
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            আমাদের শিক্ষার্থীরা যা অর্জন করেছেন
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STORIES.map((story) => (
            <div
              key={story.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              {/* Placeholder image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gradient-to-br from-muted to-secondary">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="h-12 w-12 text-muted-foreground/30"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                </div>
              </div>

              {/* Quote */}
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                "{story.quote}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import { CheckCircle2, BookOpen, Eye, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WHY_US = [
  {
    title: "অভিজ্ঞ ও যোগ্য প্রশিক্ষক",
    desc: "অবসরপ্রাপ্ত সামরিক কর্মকর্তা ও প্রাক্তন ক্যাডেটদের নিয়ে গঠিত আমাদের দল বাস্তব অভিজ্ঞতা শ্রেণিকক্ষে নিয়ে আসেন, শিক্ষার্থীদের অতুলনীয় অন্তর্দৃষ্টি প্রদান করেন।",
  },
  {
    title: "লার্নিং ম্যানেজমেন্ট সিস্টেম",
    desc: "আমরা একটি সম্পূর্ণ স্বয়ংক্রিয় সিস্টেম ব্যবহার করি যা শিক্ষার্থী ও প্রশিক্ষকদের অগ্রগতি নির্বিঘ্নে ট্র্যাক ও মূল্যায়ন করতে সক্ষম করে শেখার মান উন্নত করে।",
  },
  {
    title: "প্রতিষ্ঠাতার দৃষ্টিভঙ্গি",
    desc: "iCAN একাডেমি আমাদের প্রতিষ্ঠাতার দৃষ্টিভঙ্গির সরাসরি প্রতিফলন, যা শিক্ষার্থীদের প্রকৃত বিকাশ ও ক্ষমতায়নকে সর্বোচ্চ গুরুত্ব দেয়।",
  },
  {
    title: "সামগ্রিক শিক্ষাপদ্ধতি",
    desc: "একাডেমিক শিক্ষার বাইরে আমরা শারীরিক সুস্থতা, মানসিক দৃঢ়তা এবং জীবনদক্ষতার উপর গুরুত্ব দিই, যা একটি পূর্ণাঙ্গ শিক্ষা নিশ্চিত করে।",
  },
];

export default function About() {
  return (
    <>
      {/* Page header */}
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
        <div className="container py-10 sm:py-14">
          <nav aria-label="breadcrumb" className="text-sm text-muted-foreground">
            <ol className="flex items-center gap-2">
              <li>
                <Link to="/" className="hover:text-foreground">
                  হোম
                </Link>
              </li>
              <li aria-hidden>›</li>
              <li className="text-foreground">আমাদের সম্পর্কে</li>
            </ol>
          </nav>
          <h1 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            আমাদের সম্পর্কে
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            আমাদের গল্প জানুন
          </p>
        </div>
      </section>

      {/* Founder's message */}
      <section className="py-12 sm:py-16">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[2fr_3fr] items-start">

            {/* Founder image */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border shadow-md">
                <img
                  src="/chairman.png"
                  alt="Lt Col M A Yousuf"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-center">
                <p className="font-heading font-bold text-foreground">
                  লে. কর্নেল এম এ ইউসুফ
                </p>
                <p className="text-sm text-muted-foreground">বিপিএম, পিএসসি, এমএসসি, এমবিএ (অব.)</p>
                <p className="text-sm font-medium text-accent mt-0.5">প্রতিষ্ঠাতা, iCAN একাডেমি</p>
              </div>
            </div>

            {/* Message */}
            <div>
              <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent mb-4">
                প্রতিষ্ঠাতার বার্তা
              </span>
              <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl leading-snug">
                সকল উদীয়মান নেতা ও পরিবর্তনকারীদের প্রতি শুভেচ্ছা
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
                <p>
                  যখন আমি iCAN একাডেমির স্বপ্ন দেখেছিলাম, তখন আমার লক্ষ্য ছিল না কেবল আরেকটি শিক্ষাপ্রতিষ্ঠান গড়ে তোলা; বরং আমি চেয়েছিলাম এমন একটি আলোকবর্তিকা তৈরি করতে, যা আগামীর প্রতিশ্রুতিবাহী তরুণ মনের জন্য আশা, ক্ষমতায়ন ও উৎকর্ষতার প্রতীক হবে। আমাদের পৃথিবী দ্রুত পরিবর্তিত হচ্ছে, এবং সেই সাথে আসছে নতুন চ্যালেঞ্জ ও সুযোগ। আগামীর নেতাদের শুধু একাডেমিক উৎকর্ষতা নয়, প্রয়োজন দৃঢ়তা, অভিযোজন ক্ষমতা, নৈতিকতা এবং অটল আত্মবিশ্বাস।
                </p>
                <p>
                  বছরের পর বছর ধরে আমি অসংখ্য মেধাবী তরুণকে দেখেছি, যারা সম্ভাবনায় পরিপূর্ণ কিন্তু আত্মসন্দেহ বা সামগ্রিক দিকনির্দেশনার অভাবে পিছিয়ে পড়েছে। তাদের চোখে সেই আলো এবং পরিবর্তন আনার অদম্য ইচ্ছাই আমাকে iCAN একাডেমির ভিত্তি গড়ে তুলতে অনুপ্রাণিত করেছে। এখানে আমরা কেবল পরীক্ষার জন্য প্রস্তুত করি না; আমরা জীবনের জন্য প্রস্তুত করি।
                </p>
                <p>
                  আমাদের লক্ষ্যের কেন্দ্রে রয়েছে <span className="font-semibold text-foreground">"Make It Possible"</span> নীতিবাক্য। এটি কেবল একটি স্লোগান নয়, বরং স্বপ্নকে বাস্তবে রূপান্তরের প্রতি আমাদের অঙ্গীকারের প্রমাণ। iCAN-এর প্রতিটি মডিউল, প্রতিটি পাঠ এবং প্রতিটি মিথস্ক্রিয়া এই সম্ভাবনার মনোভাব লালন করতে ডিজাইন করা হয়েছে। আমরা প্রতিটি শিক্ষার্থীর সীমাহীন সম্ভাবনায় বিশ্বাস রাখি।
                </p>
                <p>
                  iCAN একাডেমিতে আপনার যাত্রায় আপনি শুধু বিশেষজ্ঞ প্রশিক্ষক ও আধুনিক সুবিধাই পাবেন না, পাবেন এমন একটি সম্প্রদায় যা পারস্পরিক সম্মান, সহযোগিতা ও অংশীদারিত্বমূলক প্রবৃদ্ধিতে বিশ্বাস করে। চেয়ারম্যান ও প্রতিষ্ঠাতা হিসেবে আমি আপনাকে আমাদের পরিবারের অংশ হতে আমন্ত্রণ জানাচ্ছি।
                </p>
                <p className="font-medium text-foreground">
                  আপনার সকল প্রচেষ্টায় সাফল্য কামনা করছি।
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About iCAN Academy — tabs */}
      <section className="bg-muted/30 py-12 sm:py-16">
        <div className="container max-w-4xl">
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl mb-8 text-center">
            iCAN একাডেমি সম্পর্কে
          </h2>
          <Tabs defaultValue="history">
            <TabsList className="w-full grid grid-cols-3 mb-8">
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                সংক্ষিপ্ত ইতিহাস
              </TabsTrigger>
              <TabsTrigger value="mission" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                লক্ষ্য
              </TabsTrigger>
              <TabsTrigger value="vision" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                দৃষ্টিভঙ্গি
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                  iCAN একাডেমিতে আমরা একটি গভীর প্রয়োজনীয়তা উপলব্ধি করেছিলাম: আগামী প্রজন্মকে কেবল পরীক্ষার জন্য নয়, জীবনের জন্য প্রস্তুত করা। আমরা এমন একটি প্রতিষ্ঠানের স্বপ্ন দেখেছিলাম যা ঐতিহ্যগত শিক্ষার বাইরে গিয়ে একাডেমিক উৎকর্ষতার পাশাপাশি শারীরিক স্বাস্থ্য, মানসিক দৃঢ়তা এবং প্রয়োজনীয় জীবনদক্ষতা লালন করবে। আমাদের একাডেমি সামগ্রিক বিকাশের প্রতি আমাদের অঙ্গীকারের প্রমাণ, এবং আমাদের অটল বিশ্বাসের প্রতিফলন যে সঠিক দিকনির্দেশনায় প্রতিটি শিক্ষার্থী আত্মবিশ্বাসের সাথে বলতে পারবে, <span className="font-semibold text-foreground">'আমি এটা সম্ভব করতে পারি।'</span>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="mission">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                  আমাদের লক্ষ্য হলো প্রতিটি শিক্ষার্থীকে একাডেমিক, শারীরিক ও মানসিকভাবে সুসংহতভাবে গড়ে তোলা। আমরা বিশ্বাস করি যে শিক্ষার সঠিক পরিবেশ ও দিকনির্দেশনা পেলে প্রতিটি তরুণ তার স্বপ্নকে বাস্তবে পরিণত করতে সক্ষম। iCAN একাডেমি সেই পরিবেশ নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ — যেখানে শিক্ষার্থীরা কেবল পরীক্ষায় উত্তীর্ণ হওয়ার নয়, জীবনের প্রতিটি ক্ষেত্রে সফল হওয়ার সক্ষমতা অর্জন করে।
                </p>
              </div>
            </TabsContent>

            <TabsContent value="vision">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                  আমাদের দৃষ্টিভঙ্গি হলো বাংলাদেশে এমন একটি শিক্ষা আন্দোলন গড়ে তোলা, যেখানে প্রতিটি শিক্ষার্থী আত্মবিশ্বাসী, দায়িত্বশীল ও দক্ষ নাগরিক হিসেবে গড়ে উঠবে। আমরা স্বপ্ন দেখি এমন একটি ভবিষ্যতের, যেখানে iCAN-এর শিক্ষার্থীরা দেশের সর্বোচ্চ পর্যায়ে নেতৃত্ব দেবে এবং জাতীয় উন্নয়নে অবদান রাখবে।
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Why we are different */}
      <section className="py-12 sm:py-16">
        <div className="container">
          <div className="text-center mb-10">
            <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent mb-3">
              কেন আমরা
            </span>
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              কেন আমরা আলাদা
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-heading font-semibold text-foreground text-base">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-6">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

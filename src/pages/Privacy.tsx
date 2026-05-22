import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export default function Privacy() {
  return (
    <>
      <div className="border-b border-border bg-muted/30">
        <div className="container py-4">
          <nav className="text-sm text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link to="/" className="hover:text-foreground">হোম</Link></li>
              <li aria-hidden>›</li>
              <li className="text-foreground">গোপনীয়তা নীতি</li>
            </ol>
          </nav>
        </div>
      </div>

      <section className="container max-w-3xl py-10 sm:py-14">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
            <Shield className="h-5 w-5 text-accent" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground">গোপনীয়তা নীতি</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">সর্বশেষ আপডেট: মে ২০২৬</p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">১. তথ্য সংগ্রহ</h2>
            <p className="mt-2">
              iCANBD আপনার নিবন্ধনের সময় প্রদত্ত নাম, ইমেইল, ফোন নম্বর এবং ঠিকানা সংগ্রহ করে। এছাড়াও আমরা স্বয়ংক্রিয়ভাবে আপনার ডিভাইসের তথ্য, আইপি ঠিকানা এবং ব্রাউজিং কার্যকলাপ সংগ্রহ করি।
            </p>
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">২. তথ্য ব্যবহার</h2>
            <p className="mt-2">আপনার তথ্য নিম্নলিখিত উদ্দেশ্যে ব্যবহার করা হয়:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>অ্যাকাউন্ট পরিচালনা ও পরিষেবা প্রদান</li>
              <li>অর্ডার প্রক্রিয়াকরণ ও ডেলিভারি নিশ্চিত করা</li>
              <li>কোর্স সংক্রান্ত আপডেট ও বিজ্ঞপ্তি পাঠানো</li>
              <li>গ্রাহক সেবা উন্নত করা</li>
              <li>আইনি বাধ্যবাধকতা পূরণ</li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">৩. তথ্য সুরক্ষা</h2>
            <p className="mt-2">
              আমরা আপনার ব্যক্তিগত তথ্য সুরক্ষার জন্য শিল্পমান এনক্রিপশন ও নিরাপত্তা ব্যবস্থা ব্যবহার করি। তৃতীয় পক্ষের সাথে আপনার তথ্য শুধুমাত্র পরিষেবা প্রদানের প্রয়োজনে শেয়ার করা হয়।
            </p>
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">৪. তৃতীয় পক্ষ</h2>
            <p className="mt-2">
              iCANBD কখনো বাণিজ্যিক উদ্দেশ্যে তৃতীয় পক্ষের কাছে আপনার ব্যক্তিগত তথ্য বিক্রি করে না। পেমেন্ট প্রক্রিয়াকরণ বা ডেলিভারির জন্য বিশ্বস্ত অংশীদারদের সাথে সীমিত তথ্য শেয়ার করা হতে পারে।
            </p>
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">৫. কুকিজ</h2>
            <p className="mt-2">
              আমাদের ওয়েবসাইট কুকিজ ব্যবহার করে আপনার অভিজ্ঞতা উন্নত করতে। আপনি যেকোনো সময় ব্রাউজার সেটিংসে কুকিজ অক্ষম করতে পারেন।
            </p>
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">৬. আপনার অধিকার</h2>
            <p className="mt-2">আপনার নিম্নলিখিত অধিকার রয়েছে:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>আপনার সংরক্ষিত তথ্য দেখার অধিকার</li>
              <li>ভুল তথ্য সংশোধনের অধিকার</li>
              <li>তথ্য মুছে ফেলার অনুরোধের অধিকার</li>
              <li>মার্কেটিং যোগাযোগ থেকে অপ্ট-আউটের অধিকার</li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">৭. যোগাযোগ</h2>
            <p className="mt-2">
              গোপনীয়তা সংক্রান্ত যেকোনো প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন:{" "}
              <a href="mailto:icanedu23@gmail.com" className="text-accent hover:underline">
                icanedu23@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

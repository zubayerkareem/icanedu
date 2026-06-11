import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";

export default function Refund() {
  return (
    <>
      <div className="border-b border-border bg-muted/30">
        <div className="container py-4">
          <nav className="text-sm text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link to="/" className="hover:text-foreground">হোম</Link></li>
              <li aria-hidden>›</li>
              <li className="text-foreground">রিফান্ড নীতি</li>
            </ol>
          </nav>
        </div>
      </div>

      <section className="container max-w-3xl py-10 sm:py-14">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
            <RefreshCw className="h-5 w-5 text-accent" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground">রিফান্ড নীতি</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">সর্বশেষ আপডেট: মে ২০২৬</p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">১. কোর্স রিফান্ড নীতি</h2>
            <p className="mt-2">
              iCANBD-এর কোর্সগুলো ডিজিটাল শিক্ষামূলক পণ্য। কোর্স কেনার পর সাধারণত রিফান্ড প্রযোজ্য নয়। তবে কোর্সে কোনো প্রযুক্তিগত ত্রুটির কারণে কন্টেন্ট অ্যাক্সেস সম্পূর্ণ অসম্ভব হলে আমাদের সাথে যোগাযোগ করুন — আমরা যথাযথ ব্যবস্থা নেব।
            </p>
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">২. প্রোডাক্ট রিফান্ড</h2>
            <p className="mt-2">
              ফিজিক্যাল প্রোডাক্ট (বই, নোট, গাইড) এর ক্ষেত্রে ডেলিভারির ৭ দিনের মধ্যে পণ্যে কোনো ত্রুটি থাকলে বিনামূল্যে প্রতিস্থাপন বা অর্থ ফেরত দেওয়া হবে। পণ্যটি অব্যবহৃত ও মূল প্যাকেজিংসহ ফেরত দিতে হবে।
            </p>
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">৩. রিফান্ড প্রক্রিয়া</h2>
            <p className="mt-2">রিফান্ডের জন্য নিচের পদক্ষেপগুলো অনুসরণ করুন:</p>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>icanedu23@gmail.com-এ ইমেইল করুন</li>
              <li>অর্ডার নম্বর ও সমস্যার বিবরণ উল্লেখ করুন</li>
              <li>আমাদের টিম ৪৮ ঘণ্টার মধ্যে যোগাযোগ করবে</li>
              <li>যাচাই সম্পন্ন হলে ৫-৭ কার্যদিবসের মধ্যে অর্থ ফেরত দেওয়া হবে</li>
            </ol>
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">৪. রিফান্ডযোগ্য নয়</h2>
            <p className="mt-2">নিম্নলিখিত ক্ষেত্রে রিফান্ড প্রযোজ্য নয়:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>ডিজিটাল কোর্স (একবার অ্যাক্সেস প্রদানের পর)</li>
              <li>ডাউনলোডযোগ্য ডিজিটাল কন্টেন্ট (ডাউনলোডের পর)</li>
              <li>মেয়াদোত্তীর্ণ অফার বা বিশেষ ছাড়ের কোর্স</li>
              <li>গিফট কার্ড বা ভাউচার</li>
              <li>ইন্টারনেট সংযোগ সমস্যাজনিত ক্ষেত্র</li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">৫. যোগাযোগ</h2>
            <p className="mt-2">
              রিফান্ড সংক্রান্ত যেকোনো জিজ্ঞাসায় আমাদের সাথে যোগাযোগ করুন:{" "}
              <a href="mailto:icanedu23@gmail.com" className="text-accent hover:underline">
                icanedu23@gmail.com
              </a>{" "}
              অথবা কল করুন <span className="text-foreground font-medium">01894734002</span>।
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

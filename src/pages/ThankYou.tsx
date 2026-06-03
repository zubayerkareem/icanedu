import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, ShoppingBag, Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThankYou() {
  const [params] = useSearchParams();
  const isCourse = params.get("type") === "course";

  if (isCourse) {
    return (
      <section className="container flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <Clock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
        </div>

        <h1 className="mt-6 font-heading text-3xl font-bold text-foreground sm:text-4xl">
          নিবন্ধন সম্পন্ন!
        </h1>
        <p className="mt-3 max-w-md text-base text-muted-foreground">
          আপনার পেমেন্ট তথ্য আমরা পেয়েছি। যাচাইয়ের পর সাধারণত <strong className="text-foreground">২৪ ঘণ্টার মধ্যে</strong> কোর্সের অ্যাকসেস চালু করা হবে।
        </p>

        <div className="mt-5 w-full max-w-sm space-y-3">
          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-5 py-4 text-sm text-left space-y-2">
            <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400">
              <Clock className="h-4 w-4 shrink-0" />
              পেমেন্ট যাচাইয়ের অপেক্ষায়
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              আপনার bKash Transaction ID যাচাই করে অ্যাকসেস চালু করা হবে। অ্যাকসেস চালু হলে ড্যাশবোর্ডের <strong className="text-foreground">আমার কোর্স</strong> থেকে পাবেন।
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 px-5 py-4 text-sm text-left">
            <p className="text-muted-foreground">যেকোনো প্রশ্নে যোগাযোগ করুন:</p>
            <p className="mt-1 font-heading font-bold text-foreground text-lg">01894734002</p>
            <p className="text-xs text-muted-foreground">(bKash / WhatsApp)</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/dashboard/courses">
              <BookOpen className="mr-2 h-4 w-4" />
              আমার কোর্স
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              হোমে ফিরুন
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="container flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
      </div>

      <h1 className="mt-6 font-heading text-3xl font-bold text-foreground sm:text-4xl">
        ধন্যবাদ!
      </h1>
      <p className="mt-3 max-w-md text-base text-muted-foreground">
        আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
      </p>

      <div className="mt-4 rounded-lg border border-border bg-muted/40 px-6 py-4 text-sm text-muted-foreground max-w-sm w-full">
        <p>যেকোনো প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন:</p>
        <p className="mt-1 font-medium text-foreground">01894734005</p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link to="/products">
            <ShoppingBag className="mr-2 h-4 w-4" />
            আরও পণ্য দেখুন
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            হোমে ফিরুন
          </Link>
        </Button>
      </div>
    </section>
  );
}

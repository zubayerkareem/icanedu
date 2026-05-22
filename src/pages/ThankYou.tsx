import { Link } from "react-router-dom";
import { CheckCircle2, ShoppingBag, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThankYou() {
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

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/strings";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <p className="font-heading text-7xl font-bold text-accent">৪০৪</p>
        <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">{t.common.notFound}</h1>
        <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
          <Link to="/">{t.common.backHome}</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

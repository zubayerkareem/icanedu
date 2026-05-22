import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, User as UserIcon, LayoutDashboard, LogOut, Sun, Moon, ChevronDown, Trophy, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { t } from "@/lib/strings";
import { toast } from "sonner";

const NAV = [
  { to: "/", label: t.nav.home, end: true },
  { to: "/courses", label: t.nav.courses },
  { to: "/products", label: t.nav.products },
  { to: "/gallery", label: t.nav.gallery },
  { to: "/notices", label: t.nav.notices },
  { to: "/contact", label: t.nav.contact },
];

function linkClass({ isActive }: { isActive: boolean }) {
  return [
    "relative px-1 py-2 text-sm font-medium transition-colors",
    isActive
      ? "text-foreground after:absolute after:-bottom-0.5 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-accent"
      : "text-muted-foreground hover:text-foreground",
  ].join(" ");
}

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { data: settings } = useSiteSettings();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast.success(t.toast.logoutSuccess);
    navigate("/");
  };

  const initial = (profile?.full_name ?? user?.email ?? "U").trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={settings?.logo_url || "/icanbdlogo.webp"}
            alt={t.brand.name}
            className="h-10 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
          {/* আমাদের সাফল্য dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="relative flex items-center gap-1 px-1 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground outline-none">
              আমাদের সাফল্য <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem asChild>
                <Link to="/success/issb" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-accent" />
                  ISSB সাফল্য
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/success/cadet" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-accent" />
                  ক্যাডেট সাফল্য
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-muted">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? ""} />
                    <AvatarFallback className="bg-accent text-accent-foreground">{initial}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{profile?.full_name ?? user.email}</div>
                  <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  {t.nav.dashboard}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  {t.nav.profile}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t.nav.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/login">{t.nav.login}</Link>
              </Button>
              <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/register">{t.nav.register}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label={t.nav.menu}>
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="mt-8 flex flex-col gap-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    [
                      "rounded-md px-3 py-2 text-base font-medium transition-colors",
                      isActive ? "bg-accent/10 text-accent" : "text-foreground hover:bg-muted",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                আমাদের সাফল্য
              </div>
              <Link
                to="/success/issb"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
              >
                <Trophy className="h-4 w-4 text-accent" /> ISSB সাফল্য
              </Link>
              <Link
                to="/success/cadet"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
              >
                <GraduationCap className="h-4 w-4 text-accent" /> ক্যাডেট সাফল্য
              </Link>
              <div className="mt-4 border-t border-border pt-4 flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={toggle}
                  className="w-full justify-start gap-2"
                >
                  {theme === "dark" ? (
                    <><Sun className="h-4 w-4" /> Light Mode</>
                  ) : (
                    <><Moon className="h-4 w-4" /> Dark Mode</>
                  )}
                </Button>
              </div>
              <div className="mt-2 border-t border-border pt-4">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" asChild onClick={() => setOpen(false)}>
                      <Link to="/dashboard">{t.nav.dashboard}</Link>
                    </Button>
                    <Button
                      onClick={async () => {
                        setOpen(false);
                        await handleLogout();
                      }}
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      {t.nav.logout}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" asChild onClick={() => setOpen(false)}>
                      <Link to="/login">{t.nav.login}</Link>
                    </Button>
                    <Button asChild onClick={() => setOpen(false)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                      <Link to="/register">{t.nav.register}</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

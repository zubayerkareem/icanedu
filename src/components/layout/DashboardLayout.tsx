import { Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, ShoppingBag, ClipboardList, User, LogOut, Sun, Moon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { t } from "@/lib/strings";
import { toast } from "sonner";

const items = [
  { title: t.dashboard.overview,  url: "/dashboard",          icon: LayoutDashboard, end: true },
  { title: "আমার কোর্স",          url: "/dashboard/courses",  icon: BookOpen },
  { title: "আমার অর্ডার",         url: "/dashboard/orders",   icon: ShoppingBag },
  { title: "পরীক্ষা",             url: "/dashboard/exams",    icon: ClipboardList },
  { title: t.nav.profile,         url: "/dashboard/profile",  icon: User },
];

function StudentSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success(t.toast.logoutSuccess);
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="border-b border-sidebar-border px-4 py-4">
          {!collapsed ? (
            <span className="font-heading text-lg font-bold text-sidebar-primary">{t.brand.name}</span>
          ) : (
            <span className="font-heading text-lg font-bold text-sidebar-primary">I</span>
          )}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>{t.dashboard.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-accent font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {!collapsed && <span>{t.nav.logout}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      title={theme === "dark" ? "লাইট মোড" : "ডার্ক মোড"}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <StudentSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b border-border bg-background px-3">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="ml-1 font-heading text-base font-semibold">{t.dashboard.title}</span>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

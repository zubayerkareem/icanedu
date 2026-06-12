import { Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Package,
  ShoppingBag,
  Users,
  Bell,
  Settings,
  LogOut,
  Brain,
  Trophy,
} from "lucide-react";
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
import { t } from "@/lib/strings";
import { toast } from "sonner";

const items = [
  { title: t.admin.dashboard, url: "/admin", icon: LayoutDashboard, end: true },
  { title: t.admin.courses, url: "/admin/courses", icon: BookOpen },
  { title: t.admin.products, url: "/admin/products", icon: Package },
  { title: t.admin.orders, url: "/admin/orders", icon: ShoppingBag },
  { title: t.admin.students, url: "/admin/students", icon: Users },
  { title: "নোটিশ", url: "/admin/notices", icon: Bell },
  { title: "ISSB কন্টেন্ট", url: "/admin/issb", icon: Brain },
  { title: "সাক্সেস স্টোরি", url: "/admin/success", icon: Trophy },
  { title: t.admin.settings, url: "/admin/settings", icon: Settings },
];

function AdminSidebar() {
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
            <div>
              <img src="/icanbdlogo.webp" alt="iCANBD" className="h-8 w-auto" />
              <div className="mt-1 text-xs text-muted-foreground">{t.admin.title}</div>
            </div>
          ) : (
            <img src="/icanbdlogo.webp" alt="iCANBD" className="h-7 w-auto" />
          )}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>{t.admin.title}</SidebarGroupLabel>
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

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center border-b border-border bg-background px-3">
            <SidebarTrigger />
            <span className="ml-3 font-heading text-base font-semibold">{t.admin.title}</span>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

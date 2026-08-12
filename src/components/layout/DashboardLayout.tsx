import { useRef, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, ShoppingBag, User, LogOut, Sun, Moon, Camera, Upload, MessageSquare, Bell } from "lucide-react";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useMyMessages } from "@/hooks/useAdminMessages";
import { useMyCadetNotifications } from "@/hooks/useCadetNotifications";
import { supabase } from "@/lib/supabase";
import { t } from "@/lib/strings";
import { toast } from "sonner";

const items = [
  { title: t.dashboard.overview, url: "/dashboard",          icon: LayoutDashboard, end: true },
  { title: "আমার কোর্স",         url: "/dashboard/courses",  icon: BookOpen },
  { title: "আমার অর্ডার",        url: "/dashboard/orders",   icon: ShoppingBag },
  { title: "মেসেজ",              url: "/dashboard/messages", icon: MessageSquare },
  { title: t.nav.profile,        url: "/dashboard/profile",  icon: User },
];

function StudentSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut, isCadetStudent } = useAuth();
  const navigate = useNavigate();
  const { data: msgs = [] } = useMyMessages();
  const unreadCount = msgs.filter((m) => !m.read_at).length;
  const { data: cadetNotifs = [] } = useMyCadetNotifications();
  const cadetUnread = cadetNotifs.filter((n) => !n.is_read).length;

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
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <span className="flex flex-1 items-center justify-between">
                          {item.title}
                          {item.url === "/dashboard/messages" && unreadCount > 0 && (
                            <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                              {unreadCount}
                            </span>
                          )}
                        </span>
                      )}
                      {collapsed && item.url === "/dashboard/messages" && unreadCount > 0 && (
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Cadet notifications — only for cadet-enrolled students */}
              {isCadetStudent && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/dashboard/cadet"
                      className="hover:bg-sidebar-accent relative"
                      activeClassName="bg-sidebar-accent text-accent font-medium"
                    >
                      <Bell className="mr-2 h-4 w-4 shrink-0 text-cyan-600" />
                      {!collapsed && (
                        <span className="flex flex-1 items-center justify-between">
                          <span className="text-cyan-700 dark:text-cyan-400 font-medium">ক্যাডেট নোটিফিকেশন</span>
                          {cadetUnread > 0 && (
                            <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-600 px-1 text-[10px] font-bold text-white">
                              {cadetUnread}
                            </span>
                          )}
                        </span>
                      )}
                      {collapsed && cadetUnread > 0 && (
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-cyan-500" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
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

// ─── Mandatory profile photo popup ───────────────────────────────────────────

function ProfilePhotoPopup() {
  const { user, profile, refreshProfile } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const open = !!user && !profile?.avatar_url;

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("শুধু ছবি আপলোড করা যাবে।");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("ছবির আকার সর্বোচ্চ ২ MB হতে হবে।");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    if (!preview || !user) return;
    setUploading(true);
    try {
      // Convert data URL back to blob
      const res = await fetch(preview);
      const blob = await res.blob();
      const ext = blob.type.split("/")[1] ?? "jpg";
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { upsert: true, contentType: blob.type });
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);
      if (updateErr) throw updateErr;

      await refreshProfile();
      toast.success("প্রোফাইল ছবি সেট হয়েছে!");
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? "আপলোড ব্যর্থ হয়েছে।");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-sm gap-0 p-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        // Remove the default Radix close button
        hideClose
      >
        {/* Header */}
        <div className="bg-accent/10 px-6 py-5 text-center border-b border-border">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
            <Camera className="h-6 w-6 text-accent" />
          </div>
          <h2 className="font-heading text-lg font-bold text-foreground">প্রোফাইল ছবি যোগ করুন</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            ড্যাশবোর্ড ব্যবহার করতে প্রোফাইল ছবি আপলোড করা আবশ্যক।
          </p>
        </div>

        {/* Body */}
        <div className="flex flex-col items-center gap-4 px-6 py-6">
          {/* Preview circle */}
          <div
            className="relative h-28 w-28 cursor-pointer overflow-hidden rounded-full border-4 border-dashed border-accent/40 bg-muted transition-colors hover:border-accent"
            onClick={() => inputRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                <Upload className="h-6 w-6" />
                <span className="text-[11px]">ছবি বেছে নিন</span>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          />

          {/* Buttons */}
          <div className="flex w-full flex-col gap-2">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4" /> গ্যালারি থেকে বেছে নিন
            </Button>
            {/* Camera capture (mobile) */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.setAttribute("capture", "user");
                  inputRef.current.click();
                  inputRef.current.removeAttribute("capture");
                }
              }}
            >
              <Camera className="h-4 w-4" /> ক্যামেরা দিয়ে তুলুন
            </Button>
            <Button
              className="w-full"
              disabled={!preview || uploading}
              onClick={handleUpload}
            >
              {uploading ? "আপলোড হচ্ছে…" : "সেভ করুন ও চালিয়ে যান"}
            </Button>
          </div>

          <p className="text-center text-[11px] text-muted-foreground">
            সর্বোচ্চ ২ MB · JPG, PNG বা WebP
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function DashboardLayout() {
  const location = useLocation();
  const onCourseLearn = /^\/dashboard\/courses\/[^/]+$/.test(location.pathname);

  if (onCourseLearn) {
    return (
      <div className="min-h-screen w-full bg-background">
        <Outlet />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <ProfilePhotoPopup />
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

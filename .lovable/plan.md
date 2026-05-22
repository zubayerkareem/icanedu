
# Phase 1 — IcanBD Foundation (Bengali UI, Dynamic Fonts, Auth, App Shell)

Build the foundation for IcanBD: design system, dynamic font loader, public/dashboard/admin layouts, all routes stubbed, Supabase wired up, and working email/password authentication. Every visible string is in বাংলা.

## 1. Supabase Setup (external project)
- Add a small onboarding step in chat where you paste your **Supabase URL** and **anon key** — I'll wire them into the client.
- Create initial schema:
  - `profiles` (id → auth.users, full_name, phone, avatar_url, created_at) with RLS: users read/update own row, auto-insert via `handle_new_user` trigger on signup.
  - `user_roles` (id, user_id, role enum: `admin` | `student`) + `has_role()` security-definer function. Roles live in their own table (never on profiles).
  - `site_settings` (key text PK, value jsonb) — seeded with defaults: `heading_font="Hind Siliguri"`, `body_font="Hind Siliguri"`, `primary_color="#1a2332"`, `accent_color="#2563eb"`, `logo_url`, `tagline`, contact info, social links. Public read; admin-only write.
- Email confirmation **disabled** by default so signup works immediately in dev (you can enable later in Supabase dashboard).

## 2. Design System (defaults — admin-overridable later)
- Colors via HSL CSS variables in `index.css`:
  - background `#ffffff`, primary `#1a2332` (deep navy), **accent `#2563eb` (Royal Blue)**, muted `#f8fafc`, muted-foreground `#64748b`, success `#22c55e`, destructive `#ef4444`.
- Tailwind tokens extended: `font-heading`, `font-body`, `bg-accent`, `text-accent`, semantic surfaces.
- Radii: cards `rounded-lg`, hero `rounded-xl`. Shadows: `shadow-sm` → `shadow-md` on hover with 200ms transition.
- Button variants: `primary` (navy bg, white text), `cta` (royal blue bg, white text), `outline`, `ghost`.

## 3. Dynamic Font Loader
- `FontProvider` component wraps the app. On mount + whenever `site_settings` change:
  1. Reads `heading_font` and `body_font` from settings (falls back to `Hind Siliguri`).
  2. Injects/replaces a `<link>` to `https://fonts.googleapis.com/css2?family={heading}:wght@400;500;600;700;800&family={body}:wght@300;400;500;600&display=swap`.
  3. Sets `--font-heading` and `--font-body` on `:root`. Same mechanism applied to `--primary` and `--accent` colors.
- `useSiteSettings()` hook: React Query fetches all rows from `site_settings`, returns a typed key-value map, cached and shared across the app. Single source of truth for fonts, colors, branding, contact info.

## 4. Bengali UI — i18n strategy
- All strings live in `src/lib/strings.ts` as a flat Bengali dictionary (`t.nav.home = "হোম"`, `t.auth.login = "লগইন"`, etc.). Imported wherever needed. This keeps copy editable in one place and guarantees no English leaks.
- Numbers in user-facing copy use Bengali numerals where natural (e.g. footer year `২০২৬`).

## 5. Layouts & Navigation
- **PublicLayout** — sticky Navbar + Footer.
  - Navbar: logo (image from `logo_url` or text "IcanBD" in heading font) · centered links (হোম, কোর্সসমূহ, প্রোডাক্ট, গ্যালারি, নোটিশবোর্ড, যোগাযোগ) · right side shows "লগইন" + "রেজিস্টার করুন" (guest) **or** avatar dropdown with ড্যাশবোর্ড / প্রোফাইল / লগআউট (logged in). Mobile: hamburger → slide-in Sheet. Active link gets royal-blue underline.
  - Footer: 4 columns (brand+socials, দ্রুত লিংক, সহায়তা, যোগাযোগ তথ্য) → stacks on mobile. Bottom bar `© ২০২৬ IcanBD। সর্বস্বত্ব সংরক্ষিত।`.
- **DashboardLayout** — student sidebar (shadcn Sidebar, `collapsible="icon"`) with placeholder items: ওভারভিউ, আমার কোর্স, প্রোফাইল, লগআউট. Always-visible `SidebarTrigger` in the top header.
- **AdminLayout** — admin sidebar shell with placeholder groups (ড্যাশবোর্ড, কোর্স, প্রোডাক্ট, শিক্ষার্থী, পেজ বিল্ডার, সেটিংস). Route-guarded: requires `admin` role via `has_role()`; otherwise redirects to `/`.

## 6. Authentication (working in this phase)
- **Register** (`/register`): full name, email, phone, password, confirm password — all Bengali labels, validation, error toasts. Calls `supabase.auth.signUp` with `emailRedirectTo: window.location.origin`. Trigger creates the `profiles` row and assigns default `student` role.
- **Login** (`/login`): email + password. Uses `onAuthStateChange` listener set up **before** `getSession()` to avoid race conditions. On success → `/dashboard`.
- **Forgot password** (`/forgot-password`): enters email, calls `resetPasswordForEmail` with `redirectTo: ${origin}/reset-password`.
- **Reset password** (`/reset-password`): public route, detects recovery hash, calls `updateUser({ password })`.
- `useAuth()` hook exposes `{ user, session, profile, role, loading, signOut }`. `<ProtectedRoute>` for `/dashboard/*`, `<AdminRoute>` for `/admin/*`.

## 7. Routing — every route reachable
React Router routes wired up; pages not built this phase render a Bengali "শীঘ্রই আসছে" placeholder inside the correct layout:

- Public (PublicLayout): `/`, `/courses`, `/courses/:id`, `/products`, `/products/:id`, `/gallery`, `/notices`, `/contact`, `/about`
- Auth (no layout chrome): `/login`, `/register`, `/forgot-password`, `/reset-password`
- Student (DashboardLayout, protected): `/dashboard`, `/dashboard/courses`, `/dashboard/courses/:id`, `/dashboard/profile`
- Admin (AdminLayout, admin-only): `/admin` and stub children (`/admin/courses`, `/admin/products`, `/admin/students`, `/admin/pages`, `/admin/settings`)

## 8. Out of scope (later phases)
Course/product browsing UI, page builder, admin CRUD, payments, device management, SMTP, OTP reset, gallery, notices — covered in subsequent phases.

## Deliverable check
After this phase you can: visit any route (Bengali shell renders), register a new student, log in, see the student dashboard placeholder, log out, and (after manually granting yourself the admin role in Supabase) reach `/admin`. Fonts and accent color are already driven by `site_settings`, so swapping them in a later admin UI will instantly restyle the whole site.

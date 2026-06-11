# iCANBD Academy — Project Memory

## Links
| | |
|---|---|
| **GitHub** | https://github.com/zubayerkareem/iCANBD |
| **Vercel (Production)** | https://icanbd.com |
| **Vercel (Alias)** | https://icanbd.vercel.app |
| **Supabase Project** | Dashboard → supabase.com |

---

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite 5 (SWC) |
| Styling | Tailwind CSS + Shadcn UI (Radix) |
| Routing | React Router DOM 6 |
| State / Data | TanStack React Query |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) |
| Deployment | Vercel (`vercel --prod`) |
| Language | Bilingual — Bengali (default) + English |

---

## Project Structure

```
icanlatest/
├── src/
│   ├── App.tsx                        # Routes (public / dashboard / admin)
│   ├── main.tsx
│   │
│   ├── pages/
│   │   ├── Index.tsx                  # Homepage (page-builder driven)
│   │   ├── Courses.tsx                # Course listing
│   │   ├── CourseDetail.tsx           # Single course page
│   │   ├── LessonView.tsx             # Video lesson player
│   │   ├── Products.tsx               # Product grid (paginated)
│   │   ├── ProductDetail.tsx          # Product detail + order CTA
│   │   ├── Contact.tsx                # Contact page (uses BRANCHES)
│   │   ├── About.tsx
│   │   ├── Gallery.tsx
│   │   ├── Notices.tsx
│   │   ├── SuccessISSB.tsx            # ISSB success stories (DB-backed)
│   │   ├── SuccessCadet.tsx           # Cadet success stories (DB-backed)
│   │   ├── IQPracticeHome / Exam      # IQ practice module
│   │   ├── PPDTTest.tsx               # PPDT drawing test
│   │   ├── WATHome / WATTest          # WAT (word association)
│   │   ├── ISTHome / ISTTest          # IST module
│   │   ├── ExtemporeHome / Test       # Essay Writing module
│   │   ├── IncompleteStoryHome / Detail
│   │   ├── PictureStoryTest.tsx
│   │   ├── Checkout / ThankYou        # Order flow
│   │   ├── Privacy / Refund
│   │   │
│   │   ├── auth/                      # Login, Register, ForgotPassword, ResetPassword
│   │   │
│   │   ├── dashboard/                 # Protected student dashboard
│   │   │   ├── DashboardHome.tsx
│   │   │   ├── MyCourses.tsx          # Enrolled courses + validity dates
│   │   │   ├── MyOrders.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── CourseLearn.tsx        # ISSB module boxes + lesson access
│   │   │   └── Exams.tsx
│   │   │
│   │   └── admin/                     # Admin panel (role-gated)
│   │       ├── AdminHome.tsx          # Dashboard stats
│   │       ├── Courses.tsx            # Course list
│   │       ├── CourseEditor.tsx       # Add/edit course + multi-teacher
│   │       ├── ISSBAdmin.tsx          # ISSB content editor (IQ, WAT, etc.)
│   │       ├── Products.tsx           # Product CRUD
│   │       ├── Orders.tsx             # Order management
│   │       ├── Students.tsx           # Students + manual enrollment + create account
│   │       ├── SuccessAdmin.tsx       # Success stories CRUD
│   │       ├── Notices.tsx
│   │       └── PageBuilder.tsx        # Drag-drop homepage builder
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── PublicLayout.tsx       # Navbar + Footer wrapper
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── AdminLayout.tsx        # Sidebar nav for admin
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx             # 4-col branch boxes
│   │   │
│   │   ├── home/                      # Homepage section components
│   │   │   ├── HeroSlider.tsx
│   │   │   ├── FeaturedCoursesSection.tsx
│   │   │   ├── FeaturedProductsSection.tsx
│   │   │   ├── SuccessStoriesSection.tsx  # DB-backed (falls back to hardcoded)
│   │   │   └── ... (FAQ, Reviews, Stats, etc.)
│   │   │
│   │   ├── admin/
│   │   │   └── ImageUpload.tsx        # Uploads to Supabase Storage course-media bucket
│   │   │
│   │   ├── products/
│   │   │   └── ProductCard.tsx
│   │   │
│   │   └── ui/                        # Shadcn components
│   │
│   ├── hooks/
│   │   ├── useAuth.tsx                # Supabase auth context
│   │   ├── useCourse.ts               # Single course (teachers JSONB)
│   │   ├── useCourses.ts              # Course listing
│   │   ├── useAdminCourses.ts
│   │   ├── useEnrollment.ts           # Checks order status + valid_until
│   │   ├── useOrders.ts               # My orders / all orders
│   │   ├── useAdminEnrollments.ts     # Manual enrollment, validity, student creation
│   │   ├── useProducts.ts
│   │   ├── useAdminProducts.ts
│   │   ├── useStudents.ts             # Admin: list users via RPC
│   │   ├── useSuccessStories.ts       # Public success stories hook
│   │   ├── useAdminSuccessStories.ts  # Admin CRUD for success stories
│   │   ├── useISSBAdmin.ts            # ISSB content admin
│   │   ├── useISSBContent.ts          # ISSB content public
│   │   ├── useNotices.ts
│   │   ├── useSiteSettings.ts
│   │   └── useHomepageConfig.ts
│   │
│   └── lib/
│       ├── supabase.ts                # Supabase client
│       ├── storage.ts                 # uploadCourseMedia → course-media bucket
│       ├── branches.ts                # BRANCHES array (Farmgate, Mirpur, Dhanmondi, Rangpur)
│       ├── strings.ts / i18n.tsx      # Translation strings
│       ├── courses/
│       │   ├── types.ts               # Course type + ISSB_ELEMENT_DEFS (module order)
│       │   └── mock.ts                # Fallback mock courses
│       ├── products/types.ts
│       ├── success/stories.ts         # Hardcoded fallback success stories
│       └── page-builder/              # Page builder block types
│
├── supabase/                          # SQL migrations (run in Supabase SQL editor)
│   ├── phase-1-schema.sql             # Core tables
│   ├── phase-2-schema.sql
│   ├── supabase_products_migration.sql
│   ├── supabase_orders_migration.sql
│   ├── supabase_courses_migration.sql
│   ├── supabase_issb_migration.sql
│   ├── add_teachers_column.sql        # courses.teachers JSONB
│   ├── add_success_stories.sql        # success_stories table + RLS
│   ├── add_enrollment_validity.sql    # orders.valid_until + admin_enroll_student RPC + admin_create_student RPC
│   └── fix_storage_public.sql         # Makes course-media bucket public
│
└── public/                            # Static assets
```

---

## Key Database Tables
| Table | Purpose |
|---|---|
| `profiles` | User profiles (full_name, phone, avatar_url) |
| `user_roles` | Admin / student roles |
| `courses` | Courses with JSONB modules, lessons, teachers |
| `orders` | Course enrollments + product orders (`valid_until` for timed access) |
| `products` | Physical/digital products |
| `notices` | Announcements |
| `issb_content` | ISSB practice content (IQ sets, WAT, etc.) |
| `success_stories` | ISSB + Cadet success stories (show_on_homepage flag) |
| `homepage_config` | Page builder layout config |
| `site_settings` | Logo, tagline, etc. |

---

## Branches (Physical Locations)
| Branch | Phone |
|---|---|
| Farmgate | 01894734002 |
| Mirpur 12 | 01894734003 |
| Dhanmondi 32 (Ground Session only) | 01894734002 |
| Rangpur | 01894734005 |

---

## Important Notes
- **Course access** = `orders` row with `status` in `['confirmed','shipped','delivered']` AND `valid_until IS NULL OR valid_until > now()`
- **ISSB module order** = defined in `ISSB_ELEMENT_DEFS` in `src/lib/courses/types.ts`
- **Admin enrollment RPC** = `admin_enroll_student(email, course_id, course_name, valid_until)` — looks up user by email from `auth.users`
- **Create student RPC** = `admin_create_student(email, password)` — inserts directly into `auth.users`
- **Image uploads** go to Supabase Storage bucket `course-media` (must be public — run `fix_storage_public.sql`)
- **Deploy** = `vercel --prod` from project root (never `git push` unless explicitly asked)
- **Teachers** stored as JSONB array in `courses.teachers`, mirrored to flat columns for backward compat

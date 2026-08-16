-- Branch/location list — admin-managed (footer + contact page).
-- Run once in your Supabase SQL editor.
-- Replaces the previously hardcoded src/lib/branches.ts.

create table if not exists public.branches (
  id           uuid primary key default gen_random_uuid(),
  name_en      text not null unique,
  name_bn      text not null,
  address_en   text,
  address_bn   text,
  phone        text,
  email        text,
  map_url      text,
  order_index  int not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz default now()
);

alter table public.branches enable row level security;

create policy "public read published"
  on public.branches for select
  using (is_published = true);

create policy "admin full access"
  on public.branches for all
  using (public.has_role(auth.uid(), 'admin'));

-- Seed today's 4 branches so the footer/contact page don't regress on go-live.
insert into public.branches (name_en, name_bn, address_en, address_bn, phone, email, map_url, order_index) values
  (
    'Farmgate Branch', 'ফার্মগেট শাখা',
    'Room No-212-213, RH Home Center, Green Road, Farmgate, Dhaka',
    'রুম নং ২১২-২১৩, আরএইচ হোম সেন্টার, গ্রিন রোড, ফার্মগেট, ঢাকা',
    '01894734002', 'icanedu23@gmail.com',
    'https://www.google.com/maps/dir/23.7013164,90.4246481/iCAN+Academy+Farmgate+Branch+(ISSB,+Cadet+College),+74%2FB%2F1+Room+no+211,212,213,+R+H+Home+Centre,+18+Green+Rd,+Dhaka+1215/@23.7252123,90.3712112,13z/data=!3m1!4b1!4m9!4m8!1m1!4e1!1m5!1m1!1s0x3755b9006b97113d:0x252e63af34149ef4!2m2!1d90.3889921!2d23.7545164?entry=ttu&g_ep=EgoyMDI2MDUyMC4wIKXMDSoASAFQAw%3D%3D',
    0
  ),
  (
    'Mirpur 12 Branch', 'মিরপুর ১২ শাখা',
    'House 73, 2nd Floor, Rd No. 6, Pallabi Metro, Mirpur, Dhaka 1216',
    'হাউস ৭৩, ২য় তলা, রোড নং ৬, পল্লবী মেট্রো, মিরপুর, ঢাকা ১২১৬',
    '01894734003', 'icanedu23@gmail.com',
    'https://www.google.com/maps/search/iCAN+Academy+Mirpur+Dhaka',
    1
  ),
  (
    'Dhanmondi Branch (Ground Session)', 'ধানমন্ডি শাখা (গ্রাউন্ড সেশন)',
    'Dhanmondi 32, Beside Taqwa Mosjid, Dhaka',
    'ধানমন্ডি ৩২, তাকওয়া মসজিদের পাশে, ঢাকা',
    '01894734002', 'icanedu23@gmail.com',
    'https://maps.app.goo.gl/KDESbsee8M5Kc6mZA',
    2
  ),
  (
    'Rangpur Branch', 'রংপুর শাখা',
    'iCAN Building, Lalkuthi More, Rangpur',
    'আইক্যান বিল্ডিং, লালকুঠি মোড়, রংপুর',
    '01894734005', 'icanedu23@gmail.com',
    'https://www.google.com/maps/search/iCAN+Academy+Rangpur',
    3
  )
on conflict (name_en) do nothing;

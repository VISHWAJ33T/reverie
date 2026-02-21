-- =============================================================================
-- Migration: Add is_admin to profiles, about_page table, and admin-only RLS
-- Purpose: Allow only admins to manage categories, set is_admin on users, and edit about page.
-- Run this in Supabase SQL Editor after applying.
--
-- First admin: After running this migration, set your first admin in SQL Editor:
--   update public.profiles set is_admin = true where id = 'YOUR_USER_UUID';
-- =============================================================================

-- 1. Add is_admin to profiles (only settable by existing admins via app logic + RLS)
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

comment on column public.profiles.is_admin is 'Only another admin can set this via the app.';

-- 2. Allow admins to update any profile (so they can set is_admin on others).
--    Keep existing "Users can update their own profile" so users can still edit their own non-admin fields.
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  to authenticated
  using (
    (select p.is_admin from public.profiles p where p.id = (select auth.uid())) = true
  )
  with check (true);

-- 3. Categories: restrict insert/update/delete to admins only
drop policy if exists "Authenticated users can manage categories" on public.categories;
drop policy if exists "Authenticated users can update categories" on public.categories;
drop policy if exists "Authenticated users can delete categories" on public.categories;
drop policy if exists "Admins can insert categories" on public.categories;
drop policy if exists "Admins can update categories" on public.categories;
drop policy if exists "Admins can delete categories" on public.categories;

create policy "Admins can insert categories"
  on public.categories for insert
  to authenticated
  with check (
    (select p.is_admin from public.profiles p where p.id = (select auth.uid())) = true
  );

create policy "Admins can update categories"
  on public.categories for update
  to authenticated
  using (
    (select p.is_admin from public.profiles p where p.id = (select auth.uid())) = true
  )
  with check (true);

create policy "Admins can delete categories"
  on public.categories for delete
  to authenticated
  using (
    (select p.is_admin from public.profiles p where p.id = (select auth.uid())) = true
  );

-- 4. About page content table (single row per site; admins edit)
create table if not exists public.about_page (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'About',
  sub_title text not null default '',
  description text not null default '',
  features jsonb not null default '[]'::jsonb,
  updated_at timestamptz null default now()
);

alter table public.about_page enable row level security;

drop policy if exists "About page is viewable by everyone" on public.about_page;
drop policy if exists "Admins can insert about page" on public.about_page;
drop policy if exists "Admins can update about page" on public.about_page;
drop policy if exists "Admins can delete about page" on public.about_page;

-- Everyone can read about page content (public page)
create policy "About page is viewable by everyone"
  on public.about_page for select
  to anon, authenticated
  using (true);

-- Only admins can insert (e.g. seed)
create policy "Admins can insert about page"
  on public.about_page for insert
  to authenticated
  with check (
    (select p.is_admin from public.profiles p where p.id = (select auth.uid())) = true
  );

-- Only admins can update
create policy "Admins can update about page"
  on public.about_page for update
  to authenticated
  using (
    (select p.is_admin from public.profiles p where p.id = (select auth.uid())) = true
  )
  with check (true);

-- Only admins can delete
create policy "Admins can delete about page"
  on public.about_page for delete
  to authenticated
  using (
    (select p.is_admin from public.profiles p where p.id = (select auth.uid())) = true
  );

-- Seed one row so the about page works (run once; safe to run multiple due to insert conflict)
insert into public.about_page (id, title, sub_title, description, features)
values (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'About',
  'Reverie - Blogging Platform',
  'Reverie is a modern, multi-user blogging platform designed for writers and creators who want to share their thoughts and stories with the world.',
  '[
    {"name":"Frontend","description":"Morbi viverra dui mi arcu sed. Tellus semper adipiscing suspendisse semper morbi. Odio urna massa nunc massa."},
    {"name":"Trust","description":"Sit quis amet rutrum tellus ullamcorper ultricies libero dolor eget. Sem sodales gravida quam turpis enim lacus amet."},
    {"name":"Compassion","description":"Quisque est vel vulputate cursus. Risus proin diam nunc commodo. Lobortis auctor congue commodo diam neque."},
    {"name":"Leadership","description":"Arcu egestas dolor vel iaculis in ipsum mauris. Tincidunt mattis aliquet hac quis. Id hac maecenas ac donec pharetra eget."}
  ]'::jsonb
)
on conflict (id) do nothing;

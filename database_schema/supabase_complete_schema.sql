-- =============================================================================
-- Supabase Database Schema
-- Purpose: Complete schema for aspion-blogs matching types/supabase.ts
-- Tables: authors, categories, comments, bookmarks, posts, profiles, drafts
-- Includes: extensions, triggers, RLS policies, indexes
-- =============================================================================

-- enable required extensions
create extension if not exists "uuid-ossp";

-- =============================================================================
-- moddatetime trigger function
-- Updates the named column (e.g. updated_at) to now() on row update.
-- =============================================================================
create or replace function public.moddatetime()
returns trigger
language plpgsql
as $$
declare
  col text := coalesce(TG_ARGV[0], 'updated_at');
begin
  if col = 'updated_at' then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

-- =============================================================================
-- profiles (depends on auth.users)
-- User profiles extending Supabase auth.users
-- =============================================================================
create table if not exists public.profiles (
  id uuid not null,
  updated_at timestamp with time zone null default now(),
  username text null,
  full_name text null,
  avatar_url text null,
  website text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_username_key unique (username),
  constraint profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade,
  constraint username_length check ((char_length(username) >= 3) or username is null)
) tablespace pg_default;

comment on table public.profiles is 'User profiles extending auth.users with display info.';

-- =============================================================================
-- authors
-- Blog authors (can be distinct from profiles for guest/legacy authors)
-- =============================================================================
create table if not exists public.authors (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null default now(),
  name text null,
  email text null,
  title text null,
  image text null,
  constraint authors_pkey primary key (id)
) tablespace pg_default;

comment on table public.authors is 'Blog authors for posts (distinct from user profiles).';

-- =============================================================================
-- categories
-- Blog post categories
-- =============================================================================
create table if not exists public.categories (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone null default now(),
  title text null default ''::text,
  slug text null,
  show_in_nav boolean not null default true,
  sort_order integer not null default 0,
  constraint categories_pkey primary key (id),
  constraint categories_slug_key unique (slug)
) tablespace pg_default;

comment on table public.categories is 'Categories for organizing blog posts.';

-- =============================================================================
-- posts
-- Published blog posts
-- =============================================================================
create table if not exists public.posts (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  title text null,
  slug text null default ''::text,
  description text null,
  content text null,
  image text null,
  published boolean null default false,
  author_id uuid null,
  category_id uuid null,
  constraint posts_pkey primary key (id),
  constraint posts_slug_key unique (slug),
  constraint posts_author_id_fkey foreign key (author_id) references public.profiles (id) on delete set null,
  constraint posts_category_id_fkey foreign key (category_id) references public.categories (id) on delete set null
) tablespace pg_default;

comment on table public.posts is 'Published blog posts.';

drop trigger if exists handle_updated_at on public.posts;
create trigger handle_updated_at
  before update on public.posts
  for each row
  execute function moddatetime (updated_at);

-- =============================================================================
-- drafts
-- Unpublished post drafts
-- =============================================================================
create table if not exists public.drafts (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null default now(),
  title text null default 'Untitled'::text,
  slug text null default 'untitled'::text,
  description text null,
  content text null,
  image text null,
  status text null,
  author_id uuid null,
  category_id uuid null,
  post_id uuid null,
  constraint drafts_pkey primary key (id),
  constraint drafts_author_id_fkey foreign key (author_id) references public.profiles (id) on delete set null,
  constraint drafts_category_id_fkey foreign key (category_id) references public.categories (id) on delete set null,
  constraint drafts_post_id_fkey foreign key (post_id) references public.posts (id) on delete set null
) tablespace pg_default;

comment on table public.drafts is 'Unpublished post drafts.';

drop trigger if exists handle_updated_at on public.drafts;
create trigger handle_updated_at
  before update on public.drafts
  for each row
  execute function moddatetime (updated_at);

-- =============================================================================
-- comments
-- User comments on posts
-- =============================================================================
create table if not exists public.comments (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone null default now(),
  comment text null default ''::text,
  post_id uuid null,
  user_id uuid null,
  constraint comments_pkey primary key (id),
  constraint comments_post_id_fkey foreign key (post_id) references public.posts (id) on delete cascade,
  constraint comments_user_id_fkey foreign key (user_id) references public.profiles (id) on delete cascade
) tablespace pg_default;

comment on table public.comments is 'User comments on blog posts.';

-- =============================================================================
-- bookmarks
-- User bookmarks for posts (composite key: user + post)
-- =============================================================================
create table if not exists public.bookmarks (
  id uuid not null,
  user_id uuid null,
  created_at timestamp with time zone null default now(),
  constraint bookmarks_pkey primary key (id, user_id),
  constraint bookmarks_id_fkey foreign key (id) references public.posts (id) on delete cascade,
  constraint bookmarks_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
) tablespace pg_default;

comment on table public.bookmarks is 'User bookmarks for posts.';

-- =============================================================================
-- indexes (for RLS performance and common queries)
-- =============================================================================
create index if not exists posts_author_id_idx on public.posts (author_id);
create index if not exists posts_category_id_idx on public.posts (category_id);
create index if not exists posts_published_idx on public.posts (published) where published = true;
create index if not exists posts_slug_idx on public.posts (slug);

create index if not exists drafts_author_id_idx on public.drafts (author_id);
create index if not exists drafts_category_id_idx on public.drafts (category_id);

create index if not exists comments_post_id_idx on public.comments (post_id);
create index if not exists comments_user_id_idx on public.comments (user_id);

create index if not exists bookmarks_user_id_idx on public.bookmarks (user_id);
create index if not exists bookmarks_id_idx on public.bookmarks (id);

-- =============================================================================
-- row level security (RLS)
-- =============================================================================

-- drop existing policies if any (for re-run safety)
do $$
declare
  r record;
begin
  for r in (
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
  ) loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- profiles
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can delete their own profile"
  on public.profiles for delete
  to authenticated
  using ((select auth.uid()) = id);

-- authors (public read, authenticated write for admin-like usage)
alter table public.authors enable row level security;

create policy "Authors are viewable by everyone"
  on public.authors for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can insert authors"
  on public.authors for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update authors"
  on public.authors for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete authors"
  on public.authors for delete
  to authenticated
  using (true);

-- categories (public read)
alter table public.categories enable row level security;

create policy "Categories are viewable by everyone"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can manage categories"
  on public.categories for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update categories"
  on public.categories for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete categories"
  on public.categories for delete
  to authenticated
  using (true);

-- posts (public read published, authenticated write)
alter table public.posts enable row level security;

create policy "Published posts are viewable by everyone"
  on public.posts for select
  to anon, authenticated
  using (published = true or author_id = (select auth.uid()));

create policy "Authenticated users can create posts"
  on public.posts for insert
  to authenticated
  with check ((select auth.uid()) = author_id);

create policy "Authors can update their own posts"
  on public.posts for update
  to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

create policy "Authors can delete their own posts"
  on public.posts for delete
  to authenticated
  using ((select auth.uid()) = author_id);

-- drafts (authenticated only, authors own their drafts)
alter table public.drafts enable row level security;

create policy "Users can view their own drafts"
  on public.drafts for select
  to authenticated
  using ((select auth.uid()) = author_id);

create policy "Authenticated users can create drafts"
  on public.drafts for insert
  to authenticated
  with check ((select auth.uid()) = author_id);

create policy "Authors can update their own drafts"
  on public.drafts for update
  to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

create policy "Authors can delete their own drafts"
  on public.drafts for delete
  to authenticated
  using ((select auth.uid()) = author_id);

-- comments
alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can add comments"
  on public.comments for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own comments"
  on public.comments for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own comments"
  on public.comments for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- bookmarks
alter table public.bookmarks enable row level security;

create policy "Users can view their own bookmarks"
  on public.bookmarks for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own bookmarks"
  on public.bookmarks for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own bookmarks"
  on public.bookmarks for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- =============================================================================
-- trigger: auto-create profile on user signup
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, updated_at)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    now()
  );
  return new;
end;
$$;

-- only create trigger if it doesn't exist (drop first if re-running)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

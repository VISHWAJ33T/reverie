-- =============================================================================
-- Migration: Add published_at to posts (display date), remove website from profiles
-- Run in Supabase SQL Editor.
-- =============================================================================

-- 1. Add published_at to posts (the date shown as "published" in UI)
alter table public.posts
  add column if not exists published_at timestamptz null;

comment on column public.posts.published_at is 'Date shown as publish date in UI. Set on publish; admins can change.';

-- Backfill: existing rows get published_at = created_at so UI is unchanged
update public.posts
  set published_at = created_at
  where published_at is null and created_at is not null;

-- 2. Remove website from profiles
alter table public.profiles
  drop column if exists website;

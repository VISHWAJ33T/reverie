-- =============================================================================
-- Migration: Add email to profiles
-- Purpose: Store email on profile for display on admin Users page (synced from auth).
-- Run this in Supabase SQL Editor.
-- =============================================================================

alter table public.profiles
  add column if not exists email text;

comment on column public.profiles.email is 'Synced from auth; read-only in app, used for admin Users list.';

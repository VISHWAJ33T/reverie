-- =============================================================================
-- Migration: Add content column to about_page (single rich-text/markdown block)
-- Purpose: Replace structured title/subtitle/description/features with one editable content field.
-- Run this in Supabase SQL Editor.
-- =============================================================================

alter table public.about_page
  add column if not exists content text;

comment on column public.about_page.content is 'HTML content from admin WYSIWYG editor; shown on public /about page.';

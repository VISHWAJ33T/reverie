-- Link drafts to their published post so we can update the post when editing a published draft.
-- Run this after the initial schema (drafts and posts tables exist).

alter table public.drafts
  add column if not exists post_id uuid null;

-- Add FK only if not already present (avoid errors on re-run)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'drafts_post_id_fkey'
  ) then
    alter table public.drafts
      add constraint drafts_post_id_fkey
      foreign key (post_id) references public.posts (id) on delete set null;
  end if;
end $$;

comment on column public.drafts.post_id is 'Set when draft is published; links to the post row.';

-- Backfill post_id for drafts that are already published (match by slug + author_id)
update public.drafts d
set post_id = p.id
from public.posts p
where d.status = 'published'
  and d.post_id is null
  and d.slug is not null
  and d.slug = p.slug
  and d.author_id is not null
  and d.author_id = p.author_id;

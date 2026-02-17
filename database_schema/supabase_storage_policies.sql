-- =============================================================================
-- Supabase Storage RLS Policies
-- Enables avatar uploads (profile bucket) and post images (posts bucket)
-- Run this in Supabase SQL Editor to fix "new row violates row-level security"
-- =============================================================================

-- ensure storage buckets exist (create if not)
insert into storage.buckets (id, name, public)
values ('profile', 'profile', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('posts', 'posts', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('cover-image', 'cover-image', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('gallery-image', 'gallery-image', true)
on conflict (id) do nothing;

-- =============================================================================
-- profile bucket: avatars at path {user_id}/filename
-- =============================================================================

drop policy if exists "Users can upload avatar to own folder" on storage.objects;
drop policy if exists "Users can update own avatar" on storage.objects;
drop policy if exists "Users can delete own avatar" on storage.objects;
drop policy if exists "Avatar images are publicly readable" on storage.objects;

-- allow authenticated users to upload to their own folder
create policy "Users can upload avatar to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'profile'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- allow users to update their own avatars
create policy "Users can update own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'profile'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'profile'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- allow users to delete their own avatars
create policy "Users can delete own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'profile'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- allow public read (avatars displayed on blog)
create policy "Avatar images are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'profile');

-- =============================================================================
-- posts bucket: images at path {user_id}/{post_id}/filename
-- =============================================================================

drop policy if exists "Users can upload post images to own folder" on storage.objects;
drop policy if exists "Users can update own post images" on storage.objects;
drop policy if exists "Users can delete own post images" on storage.objects;
drop policy if exists "Post images are publicly readable" on storage.objects;

-- allow authenticated users to upload to their own folder
create policy "Users can upload post images to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'posts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- allow users to update their own post images
create policy "Users can update own post images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'posts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'posts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- allow users to delete their own post images
create policy "Users can delete own post images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'posts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- allow public read (post images displayed on blog)
create policy "Post images are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'posts');

-- =============================================================================
-- cover-image bucket: cover images at path {user_id}/{post_id}/filename
-- =============================================================================

drop policy if exists "Users can upload cover images to own folder" on storage.objects;
drop policy if exists "Users can update own cover images" on storage.objects;
drop policy if exists "Users can delete own cover images" on storage.objects;
drop policy if exists "Cover images are publicly readable" on storage.objects;

create policy "Users can upload cover images to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'cover-image'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can update own cover images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'cover-image'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'cover-image'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete own cover images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'cover-image'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Cover images are publicly readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'cover-image');

-- =============================================================================
-- gallery-image bucket: gallery images at path {user_id}/{post_id}/filename
-- =============================================================================

drop policy if exists "Users can upload gallery images to own folder" on storage.objects;
drop policy if exists "Users can update own gallery images" on storage.objects;
drop policy if exists "Users can delete own gallery images" on storage.objects;
drop policy if exists "Gallery images are publicly readable" on storage.objects;

create policy "Users can upload gallery images to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'gallery-image'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can update own gallery images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'gallery-image'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'gallery-image'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete own gallery images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'gallery-image'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Gallery images are publicly readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'gallery-image');

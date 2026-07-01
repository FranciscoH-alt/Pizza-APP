-- Storage bucket for partner-uploaded trivia battle images.
-- Public read (so <Image>/<img> tags can load by URL); no public write —
-- uploads only happen server-side via the service-role client (bypasses storage RLS),
-- same pattern already used for all privileged writes to the `battles` table.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('battle-images', 'battle-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

drop policy if exists "public can read battle-images" on storage.objects;
create policy "public can read battle-images"
  on storage.objects for select
  using (bucket_id = 'battle-images');

-- No insert/update/delete policy for anon/authenticated — all uploads and deletes
-- go through the service-role key server-side (app/api/admin/battles routes).

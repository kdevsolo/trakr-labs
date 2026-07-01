-- Create the widget-feedback storage bucket (run in Supabase SQL editor if not created via dashboard)
-- Private bucket: the API signs media URLs when serving issues to authorized users.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'widget-feedback',
  'widget-feedback',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

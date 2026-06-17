-- Create the widget-feedback storage bucket (run in Supabase SQL editor if not created via dashboard)
-- Public bucket for v1 so issue media renders directly in the dashboard.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'widget-feedback',
  'widget-feedback',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

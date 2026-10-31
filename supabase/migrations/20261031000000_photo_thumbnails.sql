-- A small copy of each photo (384 px on its longest side) for icons and
-- gallery tiles, so lists don't download full-size photos. Same folder as the
-- photo. Null for photos uploaded before copies existed, until
-- scripts/make-thumbnails.ts makes theirs; the app falls back to the photo.

alter table public.goat_photos add column thumb_path text unique
  check (thumb_path like herd_id::text || '/' || goat_id::text || '/%');

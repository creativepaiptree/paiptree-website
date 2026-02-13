begin;

alter table public.project_release_notes
  drop constraint if exists project_release_notes_project_id_check;

alter table public.project_release_notes
  add constraint project_release_notes_project_id_check
  check (project_id ~ '^[a-z0-9][a-z0-9_-]{1,63}$');

commit;

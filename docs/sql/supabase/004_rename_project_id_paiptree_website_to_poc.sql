begin;

update public.project_release_notes
set project_id = 'poc',
    updated_at = now()
where project_id = 'paiptree-website';

commit;

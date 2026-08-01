-- Revising forks a fresh draft that points back at the rejected revision,
-- which is also how the editor finds the feedback to show.
alter table public.guide_revisions
  add column revised_from_revision_id uuid
    references public.guide_revisions (id) on delete set null;

create unique index guide_revisions_revise_draft_unique
  on public.guide_revisions (revised_from_revision_id)
  where status = 'draft' and revised_from_revision_id is not null;

-- Fork a rejected revision into a new editable draft. Prereqs and
-- todos hang off the guide base, not the revision, so they carry over untouched.
create or replace function public.revise_guide_revision(p_revision_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_new_id uuid;
begin
  -- Closed cases are publicly-readable, so the author check is what stops a stranger
  -- from forking someone else's rejected work.
  perform 1
    from public.guide_revisions gr
    join public.guide_review_cases grc on grc.guide_revision_id = gr.id
    join public.review_cases rc on rc.id = grc.case_id
    where gr.id = p_revision_id
      and gr.author_id = (select auth.uid())
      and rc.status = 'rejected';

  if not found then
    raise exception 'Revision not found or not a rejected submission'
      using errcode = 'no_data_found';
  end if;

  begin
    insert into public.guide_revisions (
      guide_id, title, summary, body, change_summary,
      author_id, status, revised_from_revision_id
    )
    select
      gr.guide_id,
      gr.title, gr.summary, gr.body, gr.change_summary,
      (select auth.uid()), 'draft', gr.id
    from public.guide_revisions gr
    where gr.id = p_revision_id
    returning id into v_new_id;
  exception when unique_violation then
    -- A draft is already open for this rejection, so resume that one.
    select id into v_new_id
      from public.guide_revisions
      where revised_from_revision_id = p_revision_id
        and status = 'draft'
      limit 1;

    return v_new_id;
  end;

  insert into public.guide_revision_subjects (guide_revision_id, subject_id)
    select v_new_id, subject_id
      from public.guide_revision_subjects
      where guide_revision_id = p_revision_id;

  return v_new_id;
end;
$$;

grant execute on function public.revise_guide_revision(uuid) to authenticated;

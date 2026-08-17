-- Same as 20260623130000_drop_revision_number.sql except the base now records
-- whether its creator holds the official role.
create or replace function public.create_guide(
  p_title text default null,
  p_knowledge_type public.knowledge_type default 'theoretical',
  p_summary text default null,
  p_body text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_base_id uuid := gen_random_uuid();
  v_guide_id uuid := gen_random_uuid();
  v_revision_id uuid := gen_random_uuid();
begin
  -- knowledge_type defaults to theoretical and is changeable
  -- in the editor while the topic is a draft.
  insert into public.guide_bases (id, knowledge_type, status, is_official)
    values (v_base_id, p_knowledge_type, 'draft', public.has_role('official'));

  insert into public.guides (id, guide_base_id, author_id, status)
    values (v_guide_id, v_base_id, auth.uid(), 'draft');

  insert into public.guide_revisions
    (id, guide_id, title, summary, body, author_id, status)
    values (v_revision_id, v_guide_id, p_title, p_summary, p_body, auth.uid(), 'draft');

  -- Return the draft revision id so the client routes straight to its editor.
  return v_revision_id;
end;
$$;

grant execute on function public.create_guide(
  text, public.knowledge_type, text, text
) to authenticated;

-- Checks if guide base is official, which gates if a variant can be created for it.
create or replace function public.create_variant(
  p_guide_base_id uuid,
  p_title text default null,
  p_summary text default null,
  p_body text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_guide_id uuid := gen_random_uuid();
  v_revision_id uuid := gen_random_uuid();
begin
  if exists (
    select 1 from public.guide_bases
    where id = p_guide_base_id and is_official
  ) then
    raise exception 'Official guides do not take variants'
      using errcode = 'check_violation';
  end if;

  insert into public.guides (id, guide_base_id, author_id, status)
    values (v_guide_id, p_guide_base_id, auth.uid(), 'draft');

  insert into public.guide_revisions
    (id, guide_id, title, summary, body, author_id, status)
    values (v_revision_id, v_guide_id, p_title, p_summary, p_body, auth.uid(), 'draft');

  return v_revision_id;
end;
$$;

grant execute on function public.create_variant(
  uuid, text, text, text
) to authenticated;

create or replace function public.reject_official_variant()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.guide_bases b
    where b.id = new.guide_base_id and b.is_official
  ) and exists (
    select 1 from public.guides g
    where g.guide_base_id = new.guide_base_id and g.id <> new.id
  ) then
    raise exception 'Official guides do not take variants'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

revoke execute on function public.reject_official_variant() from public;

create trigger guides_reject_official_variant
  before insert on public.guides
  for each row
  execute function public.reject_official_variant();

-- Same as 20260716140000_guide_contribution_flow.sql except an official base
-- opens the admin-decided case types.
create or replace function public.submit_guide_revision(p_revision_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_guide_id uuid;
  v_current_revision_id uuid;
  v_is_official boolean;
  v_case_type public.case_type;
  v_case_id uuid;
  v_title text;
  v_summary text;
  v_body text;
  v_tag_count integer;
begin
  select title, summary, body into v_title, v_summary, v_body
    from public.guide_revisions
    where id = p_revision_id and status = 'draft';

  if not found then
    raise exception 'Revision not found or not an editable draft'
      using errcode = 'no_data_found';
  end if;

  select count(*) into v_tag_count
    from public.guide_revision_subjects
    where guide_revision_id = p_revision_id;

  if coalesce(btrim(v_title), '') = ''
     or coalesce(btrim(v_summary), '') = ''
     or coalesce(btrim(v_body), '') = ''
     or v_tag_count = 0 then
    raise exception 'Revision is missing a title, summary, body, or tag'
      using errcode = 'check_violation';
  end if;

  update public.guide_revisions
    set status = 'submitted'
    where id = p_revision_id
    returning guide_id into v_guide_id;

  select g.current_revision_id, b.is_official
    into v_current_revision_id, v_is_official
    from public.guides g
    join public.guide_bases b on b.id = g.guide_base_id
    where g.id = v_guide_id;

  v_case_type := case
    when v_is_official and v_current_revision_id is null then 'official_publish'
    when v_is_official then 'official_edit'
    when v_current_revision_id is null then 'guide_publish'
    else 'guide_edit'
  end;

  insert into public.review_cases (case_type, created_by)
    values (v_case_type, auth.uid())
    returning id into v_case_id;

  insert into public.guide_review_cases (case_id, guide_revision_id)
    values (v_case_id, p_revision_id);

  return v_case_id;
end;
$$;

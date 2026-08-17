create or replace function public.eligible_panel_admins(
  p_created_by uuid,
  p_panel_id uuid default null
)
returns table (id uuid)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id
    from public.user_roles ur
    join public.profiles p on p.id = ur.user_id
    where ur.role = 'admin'
      and p.is_suspended = false
      and p.id is distinct from p_created_by
      and (
        p_panel_id is null
        or not exists (
          select 1
            from public.panel_members pm
            where pm.panel_id = p_panel_id
              and pm.member_id = p.id
        )
      );
$$;

revoke execute on function public.eligible_panel_admins(uuid, uuid) from public;
grant execute on function public.eligible_panel_admins(uuid, uuid) to service_role;

-- Same as 20260805120000_review_time_limits.sql except exclude official seats because they
-- never expire.
create or replace function public.set_panel_member_expires_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.expires_at is null then
    select coalesce(new.assigned_at, now()) + coalesce(rc.time_limit, interval '2 days')
      into new.expires_at
      from public.review_panels rp
      join public.review_cases rc on rc.id = rp.case_id
      where rp.id = new.panel_id
        and rc.case_type not in ('official_publish', 'official_edit');
  end if;
  return new;
end;
$$;

revoke execute on function public.set_panel_member_expires_at() from public;

-- Same as 20260805120000_review_time_limits.sql for the verifier case types, but for an
-- official case, it seats every eligible admin instead of drawing a random panel,
-- so target_seat_count records how many were seated and carries no odd size check.
create or replace function public.assemble_review_panel(
  p_case_id uuid,
  p_policy_default integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status public.case_status;
  v_case_type public.case_type;
  v_created_by uuid;
  v_pool_size integer;
  v_target integer;
  v_panel_id uuid;
begin
  select status, case_type, created_by
    into v_status, v_case_type, v_created_by
    from public.review_cases
    where id = p_case_id
    for update;

  if not found then
    raise exception 'Review case not found' using errcode = 'no_data_found';
  end if;

  if v_status <> 'pending' then
    return null;
  end if;
  if exists (
    select 1 from public.review_panels
    where case_id = p_case_id and closed_at is null
  ) then
    return null;
  end if;

  if v_case_type in ('official_publish', 'official_edit') then
    select count(*)
      into v_pool_size
      from public.eligible_panel_admins(v_created_by);

    if v_pool_size < 2 then
      return null;
    end if;

    insert into public.review_panels (case_id, target_seat_count)
      values (p_case_id, v_pool_size)
      returning id into v_panel_id;

    insert into public.panel_members (panel_id, member_id)
    select v_panel_id, id
      from public.eligible_panel_admins(v_created_by);
  else
    select count(*)
      into v_pool_size
      from public.eligible_panel_verifiers(v_created_by);

    v_target := least(p_policy_default, v_pool_size);
    if v_target % 2 = 0 then
      v_target := v_target - 1;
    end if;
    if v_target < 3 then
      return null;
    end if;

    insert into public.review_panels (case_id, target_seat_count)
      values (p_case_id, v_target)
      returning id into v_panel_id;

    insert into public.panel_members (panel_id, member_id)
    select v_panel_id, id
      from public.eligible_panel_verifiers(v_created_by)
      order by random()
      limit v_target;
  end if;

  update public.review_cases
    set status = 'in_review'
    where id = p_case_id;

  return v_panel_id;
end;
$$;

revoke execute on function public.assemble_review_panel(uuid, integer) from public;
grant execute on function public.assemble_review_panel(uuid, integer) to service_role;

-- Same as 20260802120100_resolve_claimed_todos_on_publish.sql except official
-- cases need two matching votes rather than a normal majority vote from the seats.
create or replace function public.close_review_panel(p_case_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_panel_id uuid;
  v_target integer;
  v_case_type public.case_type;
  v_threshold integer;
  v_approve integer;
  v_reject integer;
  v_outcome public.review_outcome;
  v_revision_id uuid;
  v_guide_id uuid;
  v_base_id uuid;
  v_base_slug text;
  v_title text;
  v_slug_base text;
  v_slug text;
  v_suffix integer;
  v_subject record;
begin
  select rp.id, rp.target_seat_count, rc.case_type
    into v_panel_id, v_target, v_case_type
    from public.review_panels rp
    join public.review_cases rc on rc.id = rp.case_id
    where rp.case_id = p_case_id and rp.closed_at is null
    for update of rp;

  if not found then
    return;
  end if;

  v_threshold := case
    when v_case_type in ('official_publish', 'official_edit') then 2
    else v_target / 2 + 1
  end;

  select
    count(*) filter (where d.decision = 'approved'),
    count(*) filter (where d.decision = 'rejected')
    into v_approve, v_reject
    from public.panel_members pm
    join public.review_decisions d on d.panel_member_id = pm.id
    where pm.panel_id = v_panel_id;

  if v_approve >= v_threshold then
    v_outcome := 'approved';
  elsif v_reject >= v_threshold then
    v_outcome := 'rejected';
  else
    return;
  end if;

  update public.review_panels
    set outcome = v_outcome, closed_at = now()
    where id = v_panel_id;

  update public.review_cases
    set status = v_outcome::text::public.case_status
    where id = p_case_id;

  if v_outcome <> 'approved' then
    return;
  end if;

  select grc.guide_revision_id, gr.guide_id, g.guide_base_id, gr.title, b.slug
    into v_revision_id, v_guide_id, v_base_id, v_title, v_base_slug
    from public.guide_review_cases grc
    join public.guide_revisions gr on gr.id = grc.guide_revision_id
    join public.guides g on g.id = gr.guide_id
    join public.guide_bases b on b.id = g.guide_base_id
    where grc.case_id = p_case_id;

  update public.guide_revisions
    set approved_at = now()
    where id = v_revision_id;

  if v_case_type in ('guide_publish', 'official_publish') then
    v_slug_base := lower(
      trim(both '-' from regexp_replace(coalesce(v_title, ''), '[^a-zA-Z0-9]+', '-', 'g'))
    );
    if v_slug_base = '' then
      v_slug_base := 'guide';
    end if;
    v_slug := v_slug_base;
    v_suffix := 1;
    while exists (
      select 1 from public.guides
      where guide_base_id = v_base_id and slug = v_slug and id <> v_guide_id
    ) loop
      v_suffix := v_suffix + 1;
      v_slug := v_slug_base || '-' || v_suffix;
    end loop;

    update public.guides
      set current_revision_id = v_revision_id,
          status = 'published',
          slug = coalesce(slug, v_slug)
      where id = v_guide_id;

    if v_base_slug is null then
      v_slug := v_slug_base;
      v_suffix := 1;
      while exists (
        select 1 from public.guide_bases where slug = v_slug and id <> v_base_id
      ) loop
        v_suffix := v_suffix + 1;
        v_slug := v_slug_base || '-' || v_suffix;
      end loop;
      v_base_slug := v_slug;
    end if;

    update public.guide_bases
      set status = 'published',
          canonical_guide_id = coalesce(canonical_guide_id, v_guide_id),
          slug = coalesce(slug, v_base_slug)
      where id = v_base_id;

    update public.todo_prerequisites
      set status = 'resolved',
          resolved_guide_base_id = v_base_id
      where status = 'open'
        and id in (
          select tc.todo_id
          from public.todo_claims tc
          where tc.guide_base_id = v_base_id
        );
  else
    update public.guides
      set current_revision_id = v_revision_id
      where id = v_guide_id;
  end if;

  for v_subject in
    select s.id, s.name
      from public.subjects s
      join public.guide_revision_subjects grs on grs.subject_id = s.id
      where grs.guide_revision_id = v_revision_id
        and s.slug is null
      for update of s
  loop
    v_slug_base := lower(
      trim(both '-' from regexp_replace(coalesce(v_subject.name, ''), '[^a-zA-Z0-9]+', '-', 'g'))
    );
    if v_slug_base = '' then
      v_slug_base := 'subject';
    end if;
    v_slug := v_slug_base;
    v_suffix := 1;
    while exists (
      select 1 from public.subjects where slug = v_slug
    ) loop
      v_suffix := v_suffix + 1;
      v_slug := v_slug_base || '-' || v_suffix;
    end loop;

    update public.subjects set slug = v_slug where id = v_subject.id;
  end loop;

  update public.subjects s
    set status = 'published'
    from public.guide_revision_subjects grs
    where grs.guide_revision_id = v_revision_id
      and grs.subject_id = s.id
      and s.status <> 'published';
end;
$$;

grant execute on function public.close_review_panel(uuid) to authenticated, service_role;

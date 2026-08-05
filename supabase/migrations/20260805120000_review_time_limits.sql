-- Set default time limit of 2 days (48 hours) on review cases.
alter table public.review_cases
  alter column time_limit set default interval '2 days';

update public.review_cases
  set time_limit = interval '2 days'
  where time_limit is null;

-- Update submit_guide_revision to set 48h time limit on created review cases.
create or replace function public.submit_guide_revision(p_revision_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_guide_id uuid;
  v_current_revision_id uuid;
  v_case_type public.case_type;
  v_case_id uuid;
  v_title text;
  v_summary text;
  v_body text;
  v_tag_count integer;
begin
  -- RLS confines this to the caller's own draft, so zero rows means the revision
  -- is missing, not theirs, or already submitted.
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

  select current_revision_id into v_current_revision_id
    from public.guides where id = v_guide_id;

  -- No live revision yet means this is the first publish (otherwise it's a revision).
  v_case_type := case
    when v_current_revision_id is null then 'guide_publish'
    else 'guide_edit'
  end;

  insert into public.review_cases (case_type, created_by, time_limit)
    values (v_case_type, auth.uid(), interval '2 days')
    returning id into v_case_id;

  insert into public.guide_review_cases (case_id, guide_revision_id)
    values (v_case_id, p_revision_id);

  return v_case_id;
end;
$$;

grant execute on function public.submit_guide_revision(uuid) to authenticated;

-- Sweep expired review panel seats (>48 hours without decision) and backfill under-seated panels.
create or replace function public.sweep_expired_review_seats()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lock_acquired boolean;
  v_seat record;
  v_panel record;
  v_new_member record;
  v_active_seats integer;
  v_needed integer;
  v_replaced_count integer := 0;
  v_assigned_count integer := 0;
  v_pending_count integer := 0;
  v_filled integer := 0;
begin
  -- Use transaction-level advisory lock to prevent concurrent sweeps
  v_lock_acquired := pg_try_advisory_xact_lock(hashtext('sweep_expired_review_seats'));
  if not v_lock_acquired then
    return jsonb_build_object(
      'replaced_count', 0,
      'assigned_count', 0,
      'skipped', true
    );
  end if;

  -- Phase 1: Expire uncompleted seats exceeding the time limit
  for v_seat in (
    select
      pm.id as seat_id,
      pm.panel_id
    from public.panel_members pm
    join public.review_panels rp on rp.id = pm.panel_id
    join public.review_cases rc on rc.id = rp.case_id
    where rp.closed_at is null
      and rc.status in ('pending', 'in_review')
      and pm.status = 'assigned'
      and now() > pm.assigned_at + coalesce(rc.time_limit, interval '2 days')
    order by pm.assigned_at asc
    limit 100
    for update of pm skip locked
  ) loop
    update public.panel_members
      set status = 'replaced'
      where id = v_seat.seat_id;
    v_replaced_count := v_replaced_count + 1;
  end loop;

  -- Phase 2: Backfill any active panel that has fewer active/completed seats than target_seat_count
  for v_panel in (
    select
      rp.id as panel_id,
      rp.target_seat_count,
      rc.created_by
    from public.review_panels rp
    join public.review_cases rc on rc.id = rp.case_id
    where rp.closed_at is null
      and rc.status in ('pending', 'in_review')
    for update of rp
  ) loop
    select count(*)
      into v_active_seats
      from public.panel_members
      where panel_id = v_panel.panel_id
        and status in ('assigned', 'completed');

    v_needed := v_panel.target_seat_count - v_active_seats;

    if v_needed > 0 then
      v_filled := 0;
      for v_new_member in (
        select p.id
        from public.user_roles ur
        join public.profiles p on p.id = ur.user_id
        where ur.role = 'verifier'
          and p.is_suspended = false
          and p.id is distinct from v_panel.created_by
          and p.id not in (
            select member_id
            from public.panel_members
            where panel_id = v_panel.panel_id and member_id is not null
          )
        order by random()
        limit v_needed
      ) loop
        insert into public.panel_members (panel_id, member_id, status, assigned_at)
          values (v_panel.panel_id, v_new_member.id, 'assigned', now());
        v_assigned_count := v_assigned_count + 1;
        v_filled := v_filled + 1;
      end loop;
      
      -- Insert pending seats for the shortfall to maintain target_seat_count
      if v_filled < v_needed then
        for i in 1 .. (v_needed - v_filled) loop
          insert into public.panel_members (panel_id, member_id, status)
            values (v_panel.panel_id, null, 'pending');
          v_pending_count := v_pending_count + 1;
        end loop;
      end if;
    end if;
  end loop;

  return jsonb_build_object(
    'replaced_count', v_replaced_count,
    'assigned_count', v_assigned_count,
    'pending_count', v_pending_count,
    'skipped', false
  );
end;
$$;

grant execute on function public.sweep_expired_review_seats() to service_role, authenticated;

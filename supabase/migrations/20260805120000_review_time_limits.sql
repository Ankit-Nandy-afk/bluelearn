alter table public.review_cases
  alter column time_limit set default interval '2 days';

alter table public.panel_members
  add column expires_at timestamptz;

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
      where rp.id = new.panel_id;
  end if;
  return new;
end;
$$;

revoke execute on function public.set_panel_member_expires_at() from public;

create trigger panel_members_set_expires_at
  before insert on public.panel_members
  for each row
  execute function public.set_panel_member_expires_at();

create or replace function public.eligible_panel_verifiers(
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
    where ur.role = 'verifier'
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

revoke execute on function public.eligible_panel_verifiers(uuid, uuid) from public;
grant execute on function public.eligible_panel_verifiers(uuid, uuid) to service_role;

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
  v_created_by uuid;
  v_pool_size integer;
  v_target integer;
  v_panel_id uuid;
begin
  select status, created_by
    into v_status, v_created_by
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

  update public.review_cases
    set status = 'in_review'
    where id = p_case_id;

  return v_panel_id;
end;
$$;

revoke execute on function public.assemble_review_panel(uuid, integer) from public;
grant execute on function public.assemble_review_panel(uuid, integer) to service_role;

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
  v_replaced_count integer := 0;
  v_assigned_count integer := 0;
begin
  v_lock_acquired := pg_try_advisory_xact_lock(hashtext('sweep_expired_review_seats'));
  if not v_lock_acquired then
    return jsonb_build_object(
      'replaced_count', 0,
      'assigned_count', 0,
      'skipped', true
    );
  end if;

  for v_seat in (
    select pm.id as seat_id
      from public.panel_members pm
      join public.review_panels rp on rp.id = pm.panel_id
      join public.review_cases rc on rc.id = rp.case_id
      where rp.closed_at is null
        and rc.status = 'in_review'
        and pm.status = 'assigned'
        and now() > pm.expires_at
      order by pm.expires_at asc
      limit 100
      for update of pm skip locked
  ) loop
    update public.panel_members
      set status = 'replaced'
      where id = v_seat.seat_id;
    v_replaced_count := v_replaced_count + 1;
  end loop;

  for v_panel in (
    select
      rp.id as panel_id,
      rc.created_by,
      rp.target_seat_count - count(pm.id) filter (
        where pm.status in ('assigned', 'completed')
      ) as needed
      from public.review_panels rp
      join public.review_cases rc on rc.id = rp.case_id
      left join public.panel_members pm on pm.panel_id = rp.id
      where rp.closed_at is null
        and rc.status = 'in_review'
      group by rp.id, rp.target_seat_count, rc.created_by
      having rp.target_seat_count - count(pm.id) filter (
        where pm.status in ('assigned', 'completed')
      ) > 0
      limit 100
  ) loop
    for v_new_member in (
      select id
        from public.eligible_panel_verifiers(v_panel.created_by, v_panel.panel_id)
        order by random()
        limit v_panel.needed
    ) loop
      insert into public.panel_members (panel_id, member_id, status, assigned_at)
        values (v_panel.panel_id, v_new_member.id, 'assigned', now());
      v_assigned_count := v_assigned_count + 1;
    end loop;
  end loop;

  return jsonb_build_object(
    'replaced_count', v_replaced_count,
    'assigned_count', v_assigned_count,
    'skipped', false
  );
end;
$$;

revoke execute on function public.sweep_expired_review_seats() from public;
grant execute on function public.sweep_expired_review_seats() to service_role;

create or replace function public.cast_review_decision(
  p_case_id uuid,
  p_decision public.review_outcome,
  p_notes text default null,
  p_reasons public.decision_reason[] default '{}'
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_panel_id uuid;
  v_member_id uuid;
  v_seat_status public.seat_status;
  v_expires_at timestamptz;
  v_decision_id uuid;
  v_created_at timestamptz;
  v_reasons public.decision_reason[];
begin
  select id into v_panel_id
    from public.review_panels
    where case_id = p_case_id and closed_at is null;
  if not found then
    raise exception 'No active review panel for this case'
      using errcode = 'invalid_parameter_value';
  end if;

  select id, status, expires_at
    into v_member_id, v_seat_status, v_expires_at
    from public.panel_members
    where panel_id = v_panel_id
      and member_id = (select auth.uid())
      and status in ('assigned', 'completed');
  if not found then
    raise exception 'You are not an active panelist on this case'
      using errcode = 'insufficient_privilege';
  end if;

  if v_seat_status = 'assigned'
     and v_expires_at is not null
     and now() > v_expires_at then
    raise exception 'Your review window for this case has closed'
      using errcode = 'check_violation';
  end if;

  insert into public.review_decisions (panel_member_id, decision, notes)
    values (v_member_id, p_decision, p_notes)
    on conflict (panel_member_id) do update
      set decision = excluded.decision, notes = excluded.notes
    returning id, created_at into v_decision_id, v_created_at;

  delete from public.review_decision_reasons where decision_id = v_decision_id;
  if p_decision = 'rejected' and p_reasons is not null then
    insert into public.review_decision_reasons (decision_id, reason)
    select v_decision_id, r from unnest(p_reasons) r;
  end if;

  update public.panel_members set status = 'completed' where id = v_member_id;

  v_reasons := case
    when p_decision = 'rejected' then coalesce(p_reasons, '{}')
    else '{}'
  end;

  return jsonb_build_object(
    'id', v_decision_id,
    'decision', p_decision,
    'notes', p_notes,
    'reasons', to_jsonb(v_reasons),
    'created_at', v_created_at
  );
end;
$$;

grant execute on function public.cast_review_decision(
  uuid, public.review_outcome, text, public.decision_reason[]
) to authenticated;

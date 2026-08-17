alter table public.review_cases
  alter column time_limit set default interval '1 day';

create or replace function public.set_panel_member_expires_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.expires_at is null then
    select coalesce(new.assigned_at, now()) + coalesce(rc.time_limit, interval '1 day')
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
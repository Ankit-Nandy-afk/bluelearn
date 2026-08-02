-- Tracks who has started writing a guide for a todo, so the board can show a
-- topic is already being worked on and publish knows which todos to close.
create table public.todo_claims (
  todo_id uuid not null references public.todo_prerequisites (id) on delete cascade,
  guide_base_id uuid not null references public.guide_bases (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (todo_id, guide_base_id)
);

create index todo_claims_guide_base_id_idx on public.todo_claims (guide_base_id);
alter table public.todo_claims enable row level security;

-- Public so the board can count the number of claims on an open todo.
create policy "Todo claims are viewable by everyone"
  on public.todo_claims for select
  using (true);

create policy "Authors can claim todos for their draft guides"
  on public.todo_claims for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.guides g
      join public.guide_bases b on b.id = g.guide_base_id
      where g.guide_base_id = todo_claims.guide_base_id
        and g.author_id = (select auth.uid())
        and b.status = 'draft'
    )
  );

create policy "Authors can release claims on their draft guides"
  on public.todo_claims for delete
  to authenticated
  using (
    exists (
      select 1
      from public.guides g
      join public.guide_bases b on b.id = g.guide_base_id
      where g.guide_base_id = todo_claims.guide_base_id
        and g.author_id = (select auth.uid())
        and b.status = 'draft'
    )
  );

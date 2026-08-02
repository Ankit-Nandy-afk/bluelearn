-- What the requester wants the missing guide to cover.
alter table public.todo_prerequisites
  add column summary text not null;

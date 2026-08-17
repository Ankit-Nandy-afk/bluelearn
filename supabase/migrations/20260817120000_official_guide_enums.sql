alter type public.app_role add value 'official';
alter type public.case_type add value 'official_publish';
alter type public.case_type add value 'official_edit';
alter table public.guide_bases
  add column is_official boolean not null default false;

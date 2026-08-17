create or replace view public.published_guides with (security_invoker = on) as
select
  gb.id,
  gb.slug as base_slug,
  gb.knowledge_type,
  gb.status,
  gb.created_at,
  g.id as guide_id,
  g.slug as guide_slug,
  g.author_id,
  r.id as revision_id,
  r.title,
  r.summary,
  r.word_count,
  (
    select coalesce(array_agg(grs.subject_id), '{}'::uuid[])
    from public.guide_revision_subjects grs
    where grs.guide_revision_id = r.id
  ) as subject_ids,
  gb.is_official
from public.guide_bases gb
join public.guides g on g.id = gb.canonical_guide_id
join public.guide_revisions r on r.id = g.current_revision_id
where gb.status = 'published';

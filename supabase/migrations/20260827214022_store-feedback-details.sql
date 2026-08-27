alter table public.assessments
	add column if not exists suggested_recommendations jsonb not null default '{}'::jsonb,
	add column if not exists final_recommendations jsonb not null default '{}'::jsonb;

drop policy if exists "Anyone can read assessments" on public.assessments;
create policy "Anyone can read assessments"
	on public.assessments for select
	using (true);

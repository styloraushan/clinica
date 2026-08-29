alter table public.assessments
	add column if not exists clinic_name text not null default 'CliniAi';

create index if not exists assessments_clinic_name_created_at_idx
	on public.assessments (clinic_name, created_at desc);

drop policy if exists "Anyone can read assessments" on public.assessments;
drop policy if exists "Clinic users can read their assessments" on public.assessments;
create policy "Clinic users can read their assessments"
	on public.assessments for select
	to authenticated
	using (clinic_name = (auth.jwt() -> 'user_metadata' ->> 'clinic_name'));

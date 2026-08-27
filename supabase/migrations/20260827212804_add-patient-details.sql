alter table public.assessments
	add column if not exists patient_details jsonb not null default '{}'::jsonb;

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  symptoms jsonb not null,
  doctor_diagnosis jsonb not null,
  top_prediction text not null,
  feedback_submitted boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.assessments enable row level security;
drop policy if exists "Anyone can insert assessments" on public.assessments;
create policy "Anyone can insert assessments"
  on public.assessments for insert
  with check (true);

create table if not exists public.symptoms (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.symptoms (name) values
  ('Fever'),
  ('Headache'),
  ('Body pain'),
  ('Joint pain'),
  ('Rash'),
  ('Fatigue'),
  ('Nausea'),
  ('Cough'),
  ('Vomiting'),
  ('Diarrhea'),
  ('Abdominal pain'),
  ('Chest pain'),
  ('Back pain'),
  ('Sore throat'),
  ('Runny nose'),
  ('Nasal congestion'),
  ('Shortness of breath'),
  ('Difficulty breathing'),
  ('Dizziness'),
  ('Chills'),
  ('Sweating'),
  ('Loss of appetite'),
  ('Weakness'),
  ('Muscle pain'),
  ('Muscle weakness'),
  ('Fever with chills'),
  ('Dry cough'),
  ('Productive cough'),
  ('Wheezing'),
  ('Palpitations'),
  ('Swelling'),
  ('Skin itching'),
  ('Red eyes'),
  ('Blurred vision'),
  ('Ear pain'),
  ('Toothache'),
  ('Frequent urination'),
  ('Painful urination'),
  ('Blood in urine'),
  ('Constipation'),
  ('Bloating'),
  ('Heartburn'),
  ('Weight loss'),
  ('Weight gain'),
  ('Night sweats'),
  ('Confusion'),
  ('Fainting'),
  ('Seizures'),
  ('Loss of consciousness'),
  ('Difficulty swallowing')
on conflict (name) do nothing;

alter table public.symptoms enable row level security;
drop policy if exists "Anyone can read active symptoms" on public.symptoms;
create policy "Anyone can read active symptoms"
  on public.symptoms for select
  using (active = true);

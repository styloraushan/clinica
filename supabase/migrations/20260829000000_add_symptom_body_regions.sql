alter table public.symptoms add column if not exists body_region text;

create index if not exists symptoms_active_body_region_idx
  on public.symptoms (body_region)
  where active = true;

update public.symptoms
set body_region = case name
  when 'Headache' then 'Head'
  when 'Dizziness' then 'Head'
  when 'Confusion' then 'Head'
  when 'Fainting' then 'Head'
  when 'Seizures' then 'Head'
  when 'Loss of consciousness' then 'Head'
  when 'Blurred vision' then 'Eyes'
  when 'Red eyes' then 'Eyes'
  when 'Ear pain' then 'Ears'
  when 'Runny nose' then 'Nose'
  when 'Nasal congestion' then 'Nose'
  when 'Sore throat' then 'Mouth / Throat'
  when 'Toothache' then 'Mouth / Throat'
  when 'Difficulty swallowing' then 'Mouth / Throat'
  when 'Chest pain' then 'Chest'
  when 'Cough' then 'Chest'
  when 'Dry cough' then 'Chest'
  when 'Productive cough' then 'Chest'
  when 'Shortness of breath' then 'Chest'
  when 'Difficulty breathing' then 'Chest'
  when 'Wheezing' then 'Chest'
  when 'Palpitations' then 'Chest'
  when 'Abdominal pain' then 'Abdomen'
  when 'Nausea' then 'Abdomen'
  when 'Vomiting' then 'Abdomen'
  when 'Diarrhea' then 'Abdomen'
  when 'Constipation' then 'Abdomen'
  when 'Bloating' then 'Abdomen'
  when 'Loss of appetite' then 'Abdomen'
  when 'Heartburn' then 'Abdomen'
  when 'Frequent urination' then 'Pelvis'
  when 'Painful urination' then 'Pelvis'
  when 'Blood in urine' then 'Pelvis'
  when 'Back pain' then 'Lower Back'
  when 'Rash' then 'Skin'
  when 'Skin itching' then 'Skin'
  when 'Fever' then 'Skin'
  when 'Fever with chills' then 'Skin'
  when 'Chills' then 'Skin'
  when 'Sweating' then 'Skin'
  when 'Night sweats' then 'Skin'
  when 'Body pain' then 'Skin'
  when 'Joint pain' then 'Skin'
  when 'Fatigue' then 'Skin'
  when 'Weakness' then 'Skin'
  when 'Muscle pain' then 'Skin'
  when 'Muscle weakness' then 'Skin'
  when 'Swelling' then 'Skin'
  else body_region
end
where body_region is null;

insert into public.symptoms (name, body_region)
values
  ('Eye pain', 'Eyes'), ('Watery eyes', 'Eyes'), ('Dry eyes', 'Eyes'), ('Eye discharge', 'Eyes'), ('Light sensitivity', 'Eyes'),
  ('Hearing loss', 'Ears'), ('Ringing in ears', 'Ears'), ('Ear discharge', 'Ears'),
  ('Sneezing', 'Nose'), ('Nosebleed', 'Nose'), ('Loss of smell', 'Nose'),
  ('Dry mouth', 'Mouth / Throat'), ('Mouth sores', 'Mouth / Throat'), ('Bad breath', 'Mouth / Throat'), ('Hoarseness', 'Mouth / Throat'), ('Difficulty speaking', 'Mouth / Throat'),
  ('Neck pain', 'Neck'), ('Neck stiffness', 'Neck'), ('Swollen neck', 'Neck'),
  ('Chest tightness', 'Chest'), ('Chest congestion', 'Chest'), ('Coughing blood', 'Chest'),
  ('Indigestion', 'Abdomen'), ('Stomach pain', 'Abdomen'), ('Abdominal swelling', 'Abdomen'), ('Gas', 'Abdomen'), ('Acid reflux', 'Abdomen'),
  ('Upper back pain', 'Upper Back'), ('Lower back pain', 'Lower Back'), ('Middle back pain', 'Middle Back'), ('Back stiffness', 'Back'),
  ('Pelvic pain', 'Pelvis'), ('Urinary urgency', 'Pelvis'), ('Difficulty urinating', 'Pelvis'), ('Incontinence', 'Pelvis'),
  ('Arm pain', 'Arms'), ('Arm weakness', 'Arms'), ('Shoulder pain', 'Shoulders'), ('Shoulder stiffness', 'Shoulders'),
  ('Hand pain', 'Hands'), ('Hand swelling', 'Hands'), ('Numbness in hands', 'Hands'), ('Tingling in hands', 'Hands'),
  ('Leg pain', 'Legs'), ('Leg swelling', 'Legs'), ('Leg weakness', 'Legs'), ('Calf pain', 'Legs'), ('Knee pain', 'Legs'), ('Knee swelling', 'Legs'), ('Hip pain', 'Legs'),
  ('Foot pain', 'Feet'), ('Foot swelling', 'Feet'), ('Heel pain', 'Feet'), ('Toe pain', 'Feet'),
  ('Dry skin', 'Skin'), ('Skin redness', 'Skin'), ('Skin lesions', 'Skin'), ('Skin discoloration', 'Skin'), ('Skin peeling', 'Skin'), ('Blisters', 'Skin'), ('Hives', 'Skin'), ('Skin irritation', 'Skin'),
  ('Weight loss', 'General / Whole Body'), ('Weight gain', 'General / Whole Body'), ('Dehydration', 'General / Whole Body'), ('Loss of energy', 'General / Whole Body')
on conflict (name) do nothing;

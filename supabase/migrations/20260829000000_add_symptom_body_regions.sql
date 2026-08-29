-- =========================================================
-- ADD BODY REGION
-- =========================================================

alter table public.symptoms
add column if not exists body_region text;

-- Index for fast active symptom filtering by body region
create index if not exists symptoms_active_body_region_idx
on public.symptoms (body_region)
where active = true;


-- =========================================================
-- UPDATE EXISTING SYMPTOMS
-- =========================================================

update public.symptoms
set body_region = case name

  -- HEAD
  when 'Headache' then 'Head'
  when 'Dizziness' then 'Head'
  when 'Confusion' then 'Head'
  when 'Fainting' then 'Head'
  when 'Seizures' then 'Head'
  when 'Loss of consciousness' then 'Head'

  -- EYES
  when 'Blurred vision' then 'Eyes'
  when 'Red eyes' then 'Eyes'
  when 'Eye pain' then 'Eyes'
  when 'Watery eyes' then 'Eyes'
  when 'Dry eyes' then 'Eyes'
  when 'Eye discharge' then 'Eyes'
  when 'Light sensitivity' then 'Eyes'

  -- EARS
  when 'Ear pain' then 'Ears'
  when 'Hearing loss' then 'Ears'
  when 'Ringing in ears' then 'Ears'
  when 'Ear discharge' then 'Ears'

  -- NOSE
  when 'Runny nose' then 'Nose'
  when 'Nasal congestion' then 'Nose'
  when 'Sneezing' then 'Nose'
  when 'Nosebleed' then 'Nose'
  when 'Loss of smell' then 'Nose'

  -- MOUTH / THROAT
  when 'Sore throat' then 'Mouth / Throat'
  when 'Toothache' then 'Mouth / Throat'
  when 'Difficulty swallowing' then 'Mouth / Throat'
  when 'Dry mouth' then 'Mouth / Throat'
  when 'Mouth sores' then 'Mouth / Throat'
  when 'Bad breath' then 'Mouth / Throat'
  when 'Hoarseness' then 'Mouth / Throat'
  when 'Difficulty speaking' then 'Mouth / Throat'

  -- NECK
  when 'Neck pain' then 'Neck'
  when 'Neck stiffness' then 'Neck'
  when 'Swollen neck' then 'Neck'

  -- CHEST
  when 'Chest pain' then 'Chest'
  when 'Cough' then 'Chest'
  when 'Dry cough' then 'Chest'
  when 'Productive cough' then 'Chest'
  when 'Shortness of breath' then 'Chest'
  when 'Difficulty breathing' then 'Chest'
  when 'Wheezing' then 'Chest'
  when 'Palpitations' then 'Chest'
  when 'Chest tightness' then 'Chest'
  when 'Chest congestion' then 'Chest'
  when 'Coughing blood' then 'Chest'

  -- ABDOMEN
  when 'Abdominal pain' then 'Abdomen'
  when 'Nausea' then 'Abdomen'
  when 'Vomiting' then 'Abdomen'
  when 'Diarrhea' then 'Abdomen'
  when 'Constipation' then 'Abdomen'
  when 'Bloating' then 'Abdomen'
  when 'Loss of appetite' then 'Abdomen'
  when 'Heartburn' then 'Abdomen'
  when 'Indigestion' then 'Abdomen'
  when 'Stomach pain' then 'Abdomen'
  when 'Abdominal swelling' then 'Abdomen'
  when 'Gas' then 'Abdomen'
  when 'Acid reflux' then 'Abdomen'

  -- BACK
  when 'Back pain' then 'Lower Back'
  when 'Upper back pain' then 'Upper Back'
  when 'Lower back pain' then 'Lower Back'
  when 'Middle back pain' then 'Middle Back'
  when 'Back stiffness' then 'Back'

  -- PELVIS / URINARY
  when 'Frequent urination' then 'Pelvis'
  when 'Painful urination' then 'Pelvis'
  when 'Blood in urine' then 'Pelvis'
  when 'Pelvic pain' then 'Pelvis'
  when 'Urinary urgency' then 'Pelvis'
  when 'Difficulty urinating' then 'Pelvis'
  when 'Incontinence' then 'Pelvis'

  -- ARMS
  when 'Arm pain' then 'Arms'
  when 'Left arm pain' then 'Left Arm'
  when 'Right arm pain' then 'Right Arm'
  when 'Arm weakness' then 'Arms'
  when 'Shoulder pain' then 'Shoulders'
  when 'Shoulder stiffness' then 'Shoulders'

  -- HANDS
  when 'Hand pain' then 'Hands'
  when 'Hand swelling' then 'Hands'
  when 'Numbness in hands' then 'Hands'
  when 'Tingling in hands' then 'Hands'

  -- LEGS
  when 'Leg pain' then 'Legs'
  when 'Leg swelling' then 'Legs'
  when 'Leg weakness' then 'Legs'
  when 'Calf pain' then 'Legs'
  when 'Knee pain' then 'Legs'
  when 'Knee swelling' then 'Legs'
  when 'Hip pain' then 'Legs'

  -- FEET
  when 'Foot pain' then 'Feet'
  when 'Foot swelling' then 'Feet'
  when 'Heel pain' then 'Feet'
  when 'Toe pain' then 'Feet'

  -- SKIN
  when 'Rash' then 'Skin'
  when 'Skin itching' then 'Skin'
  when 'Dry skin' then 'Skin'
  when 'Skin redness' then 'Skin'
  when 'Skin lesions' then 'Skin'
  when 'Skin discoloration' then 'Skin'
  when 'Skin peeling' then 'Skin'
  when 'Blisters' then 'Skin'
  when 'Hives' then 'Skin'
  when 'Skin irritation' then 'Skin'

  -- GENERAL / WHOLE BODY
  when 'Fever' then 'General / Whole Body'
  when 'Fever with chills' then 'General / Whole Body'
  when 'Chills' then 'General / Whole Body'
  when 'Sweating' then 'General / Whole Body'
  when 'Night sweats' then 'General / Whole Body'
  when 'Body pain' then 'General / Whole Body'
  when 'Joint pain' then 'General / Whole Body'
  when 'Fatigue' then 'General / Whole Body'
  when 'Weakness' then 'General / Whole Body'
  when 'Muscle pain' then 'General / Whole Body'
  when 'Muscle weakness' then 'General / Whole Body'
  when 'Swelling' then 'General / Whole Body'
  when 'Weight loss' then 'General / Whole Body'
  when 'Weight gain' then 'General / Whole Body'
  when 'Dehydration' then 'General / Whole Body'
  when 'Loss of energy' then 'General / Whole Body'

  else body_region

end

where body_region is null;
insert into public.symptoms (name) values
	('Vomiting'), ('Diarrhea'), ('Abdominal pain'), ('Chest pain'), ('Back pain'),
	('Sore throat'), ('Runny nose'), ('Nasal congestion'), ('Shortness of breath'),
	('Difficulty breathing'), ('Dizziness'), ('Chills'), ('Sweating'),
	('Loss of appetite'), ('Weakness'), ('Muscle pain'), ('Muscle weakness'),
	('Fever with chills'), ('Dry cough'), ('Productive cough'), ('Wheezing'),
	('Palpitations'), ('Swelling'), ('Skin itching'), ('Red eyes'),
	('Blurred vision'), ('Ear pain'), ('Toothache'), ('Frequent urination'),
	('Painful urination'), ('Blood in urine'), ('Constipation'), ('Bloating'),
	('Heartburn'), ('Weight loss'), ('Weight gain'), ('Night sweats'),
	('Confusion'), ('Fainting'), ('Seizures'), ('Loss of consciousness'),
	('Difficulty swallowing')
on conflict (name) do nothing;

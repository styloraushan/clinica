import { supabase } from '../utils/supabase'
const fallbackSymptoms = ['Fever', 'Headache', 'Body pain', 'Joint pain', 'Rash', 'Fatigue', 'Nausea', 'Cough']

export async function getSymptoms() {
	if (!supabase) return fallbackSymptoms
	const { data, error } = await supabase.from('symptoms').select('name').eq('active', true).order('name')
	if (error) throw new Error('Unable to load the symptom catalog from Supabase.')
	return data.map((symptom) => symptom.name)
}

export async function signIn(email: string, password: string) {
	if (!supabase) throw new Error('Supabase authentication is not configured.')
	const { data, error } = await supabase.auth.signInWithPassword({ email, password })
	if (error) throw new Error(error.message || 'Unable to sign in. Check your email and password.')
	return data.user
}

export async function getCurrentUser() {
	if (!supabase) return null
	const { data, error } = await supabase.auth.getSession()
	if (error) return null
	return data.session?.user ?? null
}

export async function signOut() {
	if (!supabase) return
	const { error } = await supabase.auth.signOut()
	if (error) throw new Error(error.message || 'Unable to sign out. Please try again.')
}

export async function createClinicAccount(doctorName: string, clinicName: string, email: string, password: string) {
	if (!supabase) throw new Error('Supabase authentication is not configured.')
	const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { doctor_name: doctorName, clinic_name: clinicName } } })
	if (error) throw new Error(error.message || 'Unable to create the clinic account.')
	return data
}

export async function getAssessments(clinicName = 'Clinica') {
	if (!supabase) {
		const saved = localStorage.getItem('clinica:last-assessment')
		const record = saved ? JSON.parse(saved) : null
		return record && (record.clinic_name || record.patient?.clinic || 'Clinica') === clinicName ? [record] : []
	}
	const { data, error } = await supabase.from('assessments').select('id, clinic_name, patient_details, symptoms, doctor_diagnosis, top_prediction, feedback_submitted, suggested_recommendations, final_recommendations, created_at').eq('clinic_name', clinicName).order('created_at', { ascending: false })
	if (error) throw new Error('Unable to load prediction history from Supabase.')
	return data
}

export async function saveAssessment(record: { clinicName: string; patient: { name: string; patientId: string; age: string }; symptoms: string[]; diagnosis: string[]; topPrediction: string; feedbackSubmitted: boolean; suggestedRecommendations?: unknown; finalRecommendations?: unknown }) { if (!supabase) { localStorage.setItem('clinica:last-assessment', JSON.stringify({ ...record, clinic_name: record.clinicName, created_at: new Date().toISOString() })); return } const { error } = await supabase.from('assessments').insert({ clinic_name: record.clinicName, patient_details: record.patient, symptoms: record.symptoms, doctor_diagnosis: record.diagnosis, top_prediction: record.topPrediction, feedback_submitted: record.feedbackSubmitted, suggested_recommendations: record.suggestedRecommendations || {}, final_recommendations: record.finalRecommendations || {} }); if (error) throw new Error('Assessment completed, but the record could not be saved.') }

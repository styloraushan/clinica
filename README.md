# Clinica AI Assistant

Clinical decision-support UI built with React, Vite, TypeScript, Lucide, and Supabase.

## Run locally

```bash
npm install
copy .env.example .env
npm run dev
```

Set the four API variables in `.env` to deployed services, or use `127.0.0.1` ports for local services. `VITE_EXTRACT_API_URL` may be the exact endpoint `http://155.248.254.195:5000/extract`; the service avoids double-appending `/extract`. In development, `VITE_USE_API_PROXY=true` routes requests through Vite to avoid browser CORS errors. Set it to `false` only when your APIs explicitly allow the browser origin.

## Supabase

Run `supabase-schema.sql` in the Supabase SQL editor to create the `assessments` and `symptoms` tables and seed the common symptom catalog. The app loads active symptoms from Supabase on startup, then sends the selected names unchanged to the prediction backend as `{ symptoms: string[] }`. Add the project URL and anon key to `.env`. Without Supabase credentials, the symptom catalog and last completed assessment use local fallbacks so API work can still be tested.

Only the public anon key belongs in Vite environment variables. Never expose a service-role key.

## Safety

Predictions and recommendations are decision support and clinician-reviewed suggestions. The application never presents an AI prediction as a confirmed diagnosis or automatically prescribes medication.

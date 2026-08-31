// These are Supabase's publishable client identifiers (URL + anon key), not secrets.
// Hardcoded rather than read from env: this Vercel project has a Storage/Supabase
// integration that auto-injects NEXT_PUBLIC_SUPABASE_URL/ANON_KEY for a different
// (unused) Supabase project and takes precedence over our own .env values.
export const SUPABASE_URL = "https://lfdgwaonniuoolgqdjph.supabase.co"
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZGd3YW9ubml1b29sZ3FkanBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMjEyNzcsImV4cCI6MjEwMzY5NzI3N30.dVWltV7M8gauZB0oCly38ghojidTh0twokx6cq64QTw"

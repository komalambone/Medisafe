CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  setup_for TEXT,
  patient_name TEXT,
  two_factor_secret TEXT,
  two_factor_enabled INTEGER DEFAULT 0,
  recovery_codes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  reminder_lead_minutes INTEGER DEFAULT 10,
  notifications_browser INTEGER DEFAULT 1,
  notifications_email INTEGER DEFAULT 1,
  notifications_sms INTEGER DEFAULT 0,
  notifications_sound INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS medications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  name TEXT,
  dosage TEXT,
  frequency TEXT,
  times JSONB,
  food_requirement TEXT,
  notes TEXT,
  is_active INTEGER DEFAULT 1,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS reminder_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  medication_id TEXT REFERENCES medications(id),
  scheduled_time TEXT,
  status TEXT,
  taken_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

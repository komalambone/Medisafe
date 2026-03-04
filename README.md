# 💊 MediSafe — AI-Powered Medication Safety Platform

<div align="center">

![MediSafe Banner](https://img.shields.io/badge/MediSafe-Medication%20Safety%20Reimagined-2563EB?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xOSAzSDVhMiAyIDAgMCAwLTIgMnYxNGEyIDIgMCAwIDAgMiAyaDE0YTIgMiAwIDAgMCAyLTJWNWEyIDIgMCAwIDAtMi0yem0tNyAxNEg5di0yaDN2MnptMC00SDl2LTJoM3Yyek0xNSAxM2gtMlY5aDJ2NHoiLz48L3N2Zz4=)

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Claude AI](https://img.shields.io/badge/Anthropic-Claude%20API-D97706?style=flat-square)](https://anthropic.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

**AI-powered drug interaction detection, plain-language scheduling, and real-time caregiver alerts — built for the 50M+ Americans managing complex medication regimens every day.**

[Live Demo](https://medisafe.app) · [Report a Bug](https://github.com/yourusername/medisafe/issues) · [Request a Feature](https://github.com/yourusername/medisafe/issues)

</div>

---

## 📸 Screenshots

| Dashboard | Safety Alerts | AI Assistant |
|-----------|--------------|--------------|
| ![Dashboard](https://via.placeholder.com/320x200/07132B/3B82F6?text=Dashboard) | ![Safety](https://via.placeholder.com/320x200/07132B/EF4444?text=Safety+Alerts) | ![AI Chat](https://via.placeholder.com/320x200/07132B/22C55E?text=AI+Assistant) |

---

## ✨ Features

### 🔴 Drug Interaction Detection
- Scans every drug pair in real-time against FDA-verified databases
- Color-coded severity levels: 🔴 High · 🟠 Moderate · 🟡 Mild · 🟢 Safe
- Plain-language explanations — no pharmacology jargon
- One-tap "Ask AI" to get personalized advice on any alert

### 💊 Smart Daily Schedule
- Auto-generates Morning → Noon → Evening → Bedtime medication timeline
- Food pairing advice (take with food, avoid grapefruit, etc.)
- One-tap "Mark Taken" with real-time progress tracking
- Shareable daily reports for caregivers and doctors

### 💬 AI Medication Assistant
- Powered by **Anthropic Claude** (`claude-sonnet-4-20250514`)
- Ask natural questions: *"Can I drink coffee with Metformin?"*
- Personalized answers based on the patient's exact medication list
- Quick-chip suggestions for common questions

### 📊 Adherence Tracking
- 7-day history bar chart with color-coded compliance
- Per-medication progress bars and weekly averages
- Streak tracking with personal best records
- Exportable reports for healthcare providers

### 👨‍👩‍👧 Caregiver Access
- Invite up to 5 caregivers per patient
- Real-time status sharing (doses taken, alerts triggered)
- One-tap daily report delivery
- Doctor-specific view with prescription context

### 🔔 Smart Reminders
- Push notifications (via OneSignal)
- Email digests (via SendGrid / Resend)
- SMS alerts (via Twilio)
- Configurable per-medication reminder timing

### 🔐 Authentication
- Secure email + password auth via **Supabase Auth**
- 2-step sign-up with role selection (Patient / Caregiver)
- Password strength meter with live feedback
- Session persistence with auto-refresh

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, CSS-in-JS |
| **Auth & Database** | Supabase (PostgreSQL + Row Level Security) |
| **AI Engine** | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| **Drug Database** | DrugBank API / FDA RxNav |
| **Email** | SendGrid / Resend |
| **SMS** | Twilio |
| **Push Notifications** | OneSignal |
| **Fonts** | Plus Jakarta Sans, Instrument Serif (Google Fonts) |
| **Deployment** | Vercel / Netlify |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v18+`
- npm `v9+` or yarn
- A [Supabase](https://supabase.com) account (free)
- An [Anthropic](https://console.anthropic.com) API key

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/medisafe.git
cd medisafe
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Anthropic Claude
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional: Notifications
VITE_ONESIGNAL_APP_ID=your-onesignal-app-id
VITE_TWILIO_ACCOUNT_SID=your-twilio-sid
VITE_SENDGRID_API_KEY=your-sendgrid-key
```

> ⚠️ **Never commit your `.env` file.** It's already in `.gitignore`.

### 4. Set up Supabase

Go to your [Supabase Dashboard](https://app.supabase.com) and run these SQL migrations:

```sql
-- Users profile table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'patient',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications table
CREATE TABLE medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dose TEXT,
  frequency TEXT,
  times TEXT[],
  notes TEXT,
  color TEXT DEFAULT '#3B82F6',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dose logs table
CREATE TABLE dose_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMPTZ NOT NULL,
  taken_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- pending | taken | missed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Caregivers table
CREATE TABLE caregivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  caregiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can manage own medications" ON medications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own dose logs" ON dose_logs FOR ALL USING (auth.uid() = user_id);
```

### 5. Enable Supabase Auth

In your Supabase dashboard:
1. Go to **Authentication → Providers**
2. Enable **Email** provider
3. Go to **Authentication → URL Configuration**
4. Add your app URL to **Redirect URLs** (e.g. `http://localhost:5173`)

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
medisafe/
├── public/
│   └── favicon.ico
├── src/
│   ├── App.jsx                 # Root component + auth router
│   ├── main.jsx                # Entry point
│   ├── lib/
│   │   └── supabase.js         # Supabase client setup
│   ├── context/
│   │   └── AuthContext.jsx     # Global auth state
│   ├── pages/
│   │   ├── SignIn.jsx           # Sign in page
│   │   ├── SignUp.jsx           # 2-step sign up flow
│   │   └── Dashboard.jsx        # Main app dashboard
│   ├── components/
│   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   ├── Schedule.jsx         # Daily medication schedule
│   │   ├── SafetyAlerts.jsx     # Drug interaction alerts
│   │   ├── Adherence.jsx        # Adherence tracker
│   │   ├── AIChat.jsx           # Claude AI assistant
│   │   ├── Caregivers.jsx       # Caregiver management
│   │   ├── Settings.jsx         # User preferences
│   │   └── ui/
│   │       ├── Ring.jsx         # SVG progress ring
│   │       └── Toggle.jsx       # Settings toggle
│   ├── hooks/
│   │   ├── useMedications.js    # Medication CRUD
│   │   └── useDoseLogs.js       # Adherence tracking
│   └── styles/
│       └── globals.css          # Global CSS variables
├── .env                         # Environment variables (not committed)
├── .env.example                 # Template for env vars
├── .gitignore
├── index.html
├── vite.config.js
└── package.json
```

---

## 🔌 API Integrations

### Anthropic Claude AI
```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{ role: "user", content: userMessage }],
    system: "You are a medication safety assistant..."
  })
});
```

### Supabase Auth
```javascript
// Sign up
const { data, error } = await supabase.auth.signUp({ email, password });

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  setUser(session?.user ?? null);
});
```

---

## 🧪 Running Tests

```bash
# Unit tests
npm run test

# With coverage
npm run test:coverage

# E2E tests (Playwright)
npm run test:e2e
```

---

## 🚢 Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add your environment variables in the Vercel dashboard under **Project → Settings → Environment Variables**.

### Deploy to Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

### Environment Variables (Production)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `VITE_ANTHROPIC_API_KEY` | Anthropic API key for Claude |
| `VITE_ONESIGNAL_APP_ID` | OneSignal app ID for push notifications |

---

## 🗺️ Roadmap

- [x] Email + password authentication (Supabase)
- [x] Drug interaction alerts (UI)
- [x] Daily schedule with mark-taken
- [x] Adherence tracking + streaks
- [x] AI medication assistant (Claude)
- [x] Caregiver dashboard
- [x] Settings + preferences
- [ ] Real DrugBank API integration
- [ ] iOS + Android app (React Native)
- [ ] Push notifications (OneSignal)
- [ ] SMS reminders (Twilio)
- [ ] EHR integration (Epic / FHIR)
- [ ] Multi-language support
- [ ] Offline mode (PWA)

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development guidelines.

---

## ⚕️ Medical Disclaimer

> **MediSafe is an educational tool and does not constitute medical advice.** Drug interaction information is provided for awareness purposes only. Always consult a licensed physician or pharmacist before making any changes to your medication regimen. Never stop or alter medications based solely on information provided by this application.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Anthropic](https://anthropic.com) — Claude AI for medication intelligence
- [Supabase](https://supabase.com) — Auth and database infrastructure
- [FDA RxNav](https://rxnav.nlm.nih.gov) — Drug interaction data
- [Google Fonts](https://fonts.google.com) — Plus Jakarta Sans & Instrument Serif
- [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) — Pitch deck generation

---

<div align="center">

Made with ❤️ for patients, caregivers, and healthcare workers everywhere.

**[medisafe.app](https://medisafe.app)** · [Twitter](https://twitter.com/medisafeapp) · [invest@medisafe.app](mailto:invest@medisafe.app)

</div>

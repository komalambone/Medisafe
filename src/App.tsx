import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MessageSquare,
  X,
  Send,
  Calendar,
  Info,
  ChevronRight,
  Bell,
  BellOff,
  BarChart3,
  User,
  Settings as SettingsIcon,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Search,
  ChevronLeft,
  Menu,
  Lock,
  Smartphone,
  ShieldAlert,
  Edit2,
  Volume2,
  VolumeX,
  Smartphone as Phone,
  Star,
  Sparkles,
  Play,
  LayoutDashboard,
  CalendarRange,
  Zap,
  Pill,
  Sun,
  Moon,
  PanelLeft,
  PanelLeftClose,
  Camera,
  Upload,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

import { Medication, Interaction, SEVERITY_COLORS, SEVERITY_ICONS } from './types';
import { checkInteractions, askMedicationQuestion } from './services/geminiService';
import { useMedStore } from './store';
import { supabase } from './lib/supabase';
import {
  syncMedication,
  syncProfile,
  uploadMedicationImage,
  syncInteractions,
  syncLog,
  deleteMedication,
  clearAllMedications,
  fetchSession,
  fetchMedications,
  fetchTodayLogs
} from './services/supabaseService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Landing Page ---
const LandingPage = () => {
  const { setScreen } = useMedStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    { id: 'reminders', title: 'Smart Alarms', desc: 'Precise medication reminders tailored to your schedule.', icon: <Clock className="w-8 h-8" /> },
    { id: 'safety', title: 'Interaction Shield', desc: 'AI-powered checks to prevent harmful drug-to-drug effects.', icon: <ShieldAlert className="w-8 h-8" /> },
    { id: 'vault', title: 'Secure Vault', desc: 'Encryption for all your health data and medical history.', icon: <Lock className="w-8 h-8" /> },
    { id: 'ai', title: 'AI Companion', desc: 'Ask natural language questions about your care plan.', icon: <Sparkles className="w-8 h-8" /> }
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base overflow-x-hidden selection:bg-accent/10">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-5 lg:px-20 border-b border-card-border/50 backdrop-blur-md bg-bg-base/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 100 100" className="drop-shadow-lg scale-90">
              <path d="M 50 10 L 15 20 C 15 60 30 85 50 95 Z" fill="#3B82F6" />
              <path d="M 50 10 L 85 20 C 85 60 70 85 50 95 Z" fill="#10B981" />
              <rect x="42" y="30" width="16" height="40" rx="4" fill="white" />
              <rect x="30" y="42" width="40" height="16" rx="4" fill="white" />
            </svg>
            <span className="text-2xl font-serif font-bold text-primary">MediSafe</span>
          </div>
          <div className="hidden md:flex items-center gap-10 font-bold text-sm text-text-muted">
            <button onClick={() => scrollTo('hero')} className="hover:text-accent transition-colors">Home</button>
            <button onClick={() => scrollTo('features')} className="hover:text-accent transition-colors">Features</button>
            <button onClick={() => scrollTo('safety')} className="hover:text-accent transition-colors">Safety</button>
            <button
              onClick={() => setScreen('auth')}
              className="bg-accent text-white px-8 py-3 rounded-xl shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all outline-none"
            >
              Sign In
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-primary hover:bg-accent/5 rounded-xl transition-all"
          >
            {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 overflow-hidden"
            >
              <div className="flex flex-col gap-4 py-4 border-t border-card-border/50">
                <button onClick={() => scrollTo('hero')} className="text-left font-bold text-lg text-primary py-2 px-2 hover:bg-accent/5 rounded-xl transition-all">Home</button>
                <button onClick={() => scrollTo('features')} className="text-left font-bold text-lg text-primary py-2 px-2 hover:bg-accent/5 rounded-xl transition-all">Features</button>
                <button onClick={() => scrollTo('safety')} className="text-left font-bold text-lg text-primary py-2 px-2 hover:bg-accent/5 rounded-xl transition-all">Safety</button>
                <button
                  onClick={() => setScreen('auth')}
                  className="w-full bg-accent text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-accent/20 transition-all active:scale-[0.98]"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section id="hero" className="pt-40 lg:pt-52 pb-20 px-6 relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px] -mr-96 -mt-96 animate-pulse" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-accent/20">
              <Sparkles className="w-4 h-4" />
              AI-Powered Care Management
            </div>
            <h1 className="text-6xl lg:text-8xl font-serif font-bold text-primary leading-[1.1] mb-8">
              Take Charge of Your <span className="text-accent italic">Recovery.</span>
            </h1>
            <p className="text-2xl text-text-muted leading-relaxed mb-12 max-w-xl">
              MediSafe is more than just a timer. It's your personal health companion that proactively monitors safety and ensures peace of mind.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <button
                onClick={() => setScreen('auth')}
                className="bg-accent text-white px-10 py-6 rounded-2xl font-bold text-xl shadow-2xl shadow-accent/20 hover:scale-110 active:scale-95 transition-all flex items-center justify-center gap-4"
              >
                Get Started
                <ArrowRight className="w-6 h-6" />
              </button>
              <button className="bg-card-bg border-2 border-card-border text-primary px-10 py-6 rounded-2xl font-bold text-xl hover:bg-bg-base transition-all flex items-center justify-center gap-3">
                <Play className="w-5 h-5 fill-current" />
                Watch Demo
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/5 rounded-[4rem] blur-3xl rotate-6" />
            <div className="bg-card-bg p-8 rounded-[4rem] shadow-2xl border border-card-border relative overflow-hidden group">
              <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-inner bg-bg-base/50">
                <img
                  src="/hero-mockup.png"
                  alt="MediSafe App Preview"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent group-hover:opacity-0 transition-opacity duration-1000" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-primary mb-6">Designed for Reliability</h2>
          <p className="text-xl text-text-muted max-w-2xl mx-auto">We've built MediSafe with a focus on ease of use and medical precision.</p>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              id={f.id === 'safety' ? 'safety' : undefined}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card-bg p-10 rounded-[2.5rem] border border-card-border hover:shadow-2xl hover:border-accent/20 transition-all group scroll-mt-32"
            >
              <div className="w-16 h-16 bg-accent/5 rounded-2xl flex items-center justify-center text-accent mb-8 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">{f.title}</h3>
              <p className="text-text-muted leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="py-20 border-t border-card-border">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-8">
            <svg width="32" height="32" viewBox="0 0 100 100">
              <path d="M 50 10 L 15 20 C 15 60 30 85 50 95 Z" fill="#3B82F6" />
              <path d="M 50 10 L 85 20 C 85 60 70 85 50 95 Z" fill="#10B981" />
            </svg>
            <span className="text-xl font-serif font-bold text-primary">MediSafe</span>
          </div>
          <p className="text-text-subtle text-sm">© 2026 MediSafe Personal Health Intelligence. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// --- Components ---

const AuthPage = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const { setSession, setScreen, setLocalMode, setHasCompletedOnboarding, setUserProfile, addMedication } = useMedStore();

  const handleDemoMode = () => {
    // Create a fake session object for local mode
    const fakeSession = { user: { id: 'demo-user-' + Date.now(), email: 'demo@medisafe.com' } };
    setSession(fakeSession);
    setLocalMode(true);
    setScreen('onboarding');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInfo('');

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setSession(data.session);
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSession(data.session);
        setScreen('onboarding');
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setInfo('Password reset link sent! Check your email.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -ml-48 -mb-48" />

      <div className="absolute top-8 left-8 z-20">
        <button
          onClick={() => setScreen('landing')}
          className="flex items-center gap-2 px-4 py-2 bg-card-bg/50 backdrop-blur-sm border border-card-border rounded-xl text-xs font-bold text-text-muted hover:text-primary transition-all shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card-bg rounded-[3rem] shadow-2xl p-10 border border-card-border relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <svg width="50" height="50" viewBox="0 0 100 100" className="mb-4 drop-shadow-xl">
            <path d="M 50 10 L 15 20 C 15 60 30 85 50 95 Z" fill="#3B82F6" />
            <path d="M 50 10 L 85 20 C 85 60 70 85 50 95 Z" fill="#10B981" />
            <rect x="42" y="30" width="16" height="40" rx="4" fill="white" />
            <rect x="30" y="42" width="40" height="16" rx="4" fill="white" />
          </svg>
          <h1 className="text-3xl font-serif font-bold text-primary">MediSafe</h1>
          <p className="text-text-muted mt-1 font-medium italic text-sm">
            {mode === 'reset' ? 'Password Recovery' : 'Your Personal Health Vault'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-primary opacity-60 uppercase tracking-widest ml-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-6 py-4 bg-bg-base border border-card-border rounded-2xl outline-none focus:ring-4 focus:ring-accent/10 transition-all font-medium text-primary placeholder:text-text-subtle"
              placeholder="elderly-care@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {mode !== 'reset' && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-primary opacity-60 uppercase tracking-widest">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                className="w-full px-6 py-4 bg-bg-base border border-card-border rounded-2xl outline-none focus:ring-4 focus:ring-accent/10 transition-all font-medium text-primary placeholder:text-text-subtle"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          {error && <p className="text-red-600 text-xs font-bold text-center px-4 py-2 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">{error}</p>}
          {info && <p className="text-accent text-xs font-bold text-center px-4 py-2 bg-accent/5 rounded-xl border border-accent/20">{info}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {isLoading ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> :
              (mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link')}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-sage-100"></div></div>
          <div className="relative flex justify-center text-[10px] font-black text-text-subtle uppercase bg-[var(--card-bg)] px-3 tracking-widest">Or Continue With</div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-card-bg border border-card-border text-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-4 hover:bg-bg-base transition-all active:scale-95 shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Sign in with Google
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-sage-100"></div></div>
          <div className="relative flex justify-center text-[10px] font-black text-text-subtle uppercase bg-[var(--card-bg)] px-3 tracking-widest">Or Try Offline</div>
        </div>

        <button
          onClick={handleDemoMode}
          className="w-full bg-primary/5 border-2 border-primary/10 text-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary/10 hover:border-primary/20 transition-all active:scale-95 shadow-sm group"
        >
          <Sparkles className="w-5 h-5 text-accent group-hover:rotate-12 transition-transform" />
          Try Demo Mode
        </button>

        <div className="mt-6 text-center pt-6 border-t border-sage-50">
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-sage-500 font-bold hover:text-accent transition-colors text-sm"
          >
            {mode === 'login' ? "New to MediSafe? Create an account" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const OnboardingWizard = () => {
  const { setUserProfile, setHasCompletedOnboarding, setScreen, addMedication } = useMedStore();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    name: '',
    setupFor: 'myself' as 'myself' | 'someone_else',
    patientName: '',
    reminderLeadTime: 5,
    notifications: { browser: true, email: true, sms: false, sound: true }
  });
  const [firstMed, setFirstMed] = useState<any>({
    name: '',
    dosage: '',
    frequency: 'Daily',
    times: ['08:00'],
    foodRequirement: 'none'
  });

  const handleComplete = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (userId) {
      await syncProfile(userId, profile as any);
      setUserProfile(profile as any);

      if (firstMed.name && firstMed.dosage) {
        const med = {
          ...firstMed as Medication,
          id: crypto.randomUUID()
        };
        await syncMedication(userId, med);
        addMedication(med);
      }
    }

    setHasCompletedOnboarding(true);
    setScreen('dashboard');
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <motion.div
        layout
        className="w-full max-w-2xl bg-[var(--card-bg)] rounded-[3rem] shadow-2xl shadow-sage-700/10 overflow-hidden border border-sage-100"
      >
        <div className="p-12">
          <div className="flex items-center justify-between mb-12">
            <div className="flex gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  step >= i ? "w-12 bg-accent" : "w-4 bg-sage-200"
                )} />
              ))}
            </div>
            <span className="text-xs font-bold text-primary opacity-60 uppercase tracking-[0.2em]">Step {step} of 4</span>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div>
                  <h2 className="text-4xl font-serif font-bold mb-3 text-primary">Welcome to MediSafe</h2>
                  <p className="text-xl text-text-muted">Let's get your profile set up.</p>
                </div>
                <div className="space-y-8">
                  <div>
                    <label className="block text-xs font-black text-primary opacity-60 uppercase tracking-widest mb-3">Your Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-8 py-5 bg-card-bg border border-card-border rounded-[1.5rem] focus:ring-4 focus:ring-accent/10 outline-none text-lg font-medium transition-all text-primary placeholder:text-text-subtle"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-primary opacity-60 uppercase tracking-widest mb-3">Who is this for?</label>
                    <div className="grid grid-cols-2 gap-6">
                      <button
                        onClick={() => setProfile({ ...profile, setupFor: 'myself' })}
                        className={cn(
                          "p-8 rounded-[2rem] border-2 transition-all text-left shadow-sm group",
                          profile.setupFor === 'myself' ? "border-accent bg-accent/5" : "border-card-border hover:border-accent/30"
                        )}
                      >
                        <div className={cn("font-bold text-xl mb-2 transition-colors", profile.setupFor === 'myself' ? "text-accent" : "text-primary")}>Myself</div>
                        <div className="text-sm text-text-muted leading-relaxed">I'm managing my own medications</div>
                      </button>
                      <button
                        onClick={() => setProfile({ ...profile, setupFor: 'someone_else' })}
                        className={cn(
                          "p-8 rounded-[2rem] border-2 transition-all text-left shadow-sm group",
                          profile.setupFor === 'someone_else' ? "border-accent bg-accent/5" : "border-card-border hover:border-accent/30"
                        )}
                      >
                        <div className={cn("font-bold text-xl mb-2 transition-colors", profile.setupFor === 'someone_else' ? "text-accent" : "text-primary")}>Someone Else</div>
                        <div className="text-sm text-text-muted leading-relaxed">I'm a caregiver for a patient</div>
                      </button>
                    </div>
                  </div>
                  {profile.setupFor === 'someone_else' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <label className="block text-xs font-black text-primary opacity-60 uppercase tracking-widest mb-3">Patient's Name</label>
                      <input
                        type="text"
                        value={profile.patientName}
                        onChange={e => setProfile({ ...profile, patientName: e.target.value })}
                        className="w-full px-8 py-5 bg-card-bg border border-card-border rounded-[1.5rem] focus:ring-4 focus:ring-accent/10 outline-none text-lg font-medium transition-all text-primary placeholder:text-text-subtle"
                        placeholder="e.g. Maria"
                      />
                    </motion.div>
                  )}
                </div>
                <button
                  disabled={!profile.name || (profile.setupFor === 'someone_else' && !profile.patientName)}
                  onClick={() => setStep(2)}
                  className="w-full bg-accent text-white py-6 rounded-[2rem] font-bold text-xl shadow-2xl shadow-accent/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all font-serif"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div>
                  <h2 className="text-4xl font-serif font-bold mb-3 text-primary">Add First Medication</h2>
                  <p className="text-xl text-text-muted">You can add more later.</p>
                </div>
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-subtle w-6 h-6" />
                    <input
                      type="text"
                      placeholder="Drug Name (e.g. Metformin)"
                      value={firstMed.name}
                      onChange={e => setFirstMed({ ...firstMed, name: e.target.value })}
                      className="w-full pl-16 pr-8 py-5 bg-card-bg border border-card-border rounded-[1.5rem] outline-none text-lg font-medium text-primary placeholder:text-text-subtle"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 500mg)"
                    value={firstMed.dosage}
                    onChange={e => setFirstMed({ ...firstMed, dosage: e.target.value })}
                    className="w-full px-8 py-5 bg-card-bg border border-card-border rounded-[1.5rem] outline-none text-lg font-medium text-primary placeholder:text-text-subtle"
                  />
                  <div className="grid grid-cols-2 gap-6">
                    <select
                      value={firstMed.frequency}
                      onChange={e => setFirstMed({ ...firstMed, frequency: e.target.value })}
                      className="w-full px-8 py-5 bg-card-bg border border-card-border rounded-[1.5rem] outline-none text-lg font-medium appearance-none text-primary"
                    >
                      <option className="bg-card-bg">Daily</option>
                      <option className="bg-card-bg">Twice Daily</option>
                      <option className="bg-white">As Needed</option>
                    </select>
                    <input
                      type="time"
                      value={firstMed.times?.[0]}
                      onChange={e => setFirstMed({ ...firstMed, times: [e.target.value] })}
                      className="w-full px-8 py-5 bg-card-bg border border-card-border rounded-[1.5rem] outline-none text-lg font-medium text-primary"
                    />
                  </div>
                </div>
                <div className="flex gap-6">
                  <button onClick={() => setStep(1)} className="flex-1 py-6 rounded-[2rem] font-bold text-text-muted hover:bg-sage-50 transition-all">Back</button>
                  <button onClick={() => setStep(3)} className="flex-[2] bg-sage-700 text-white py-6 rounded-[2rem] font-bold text-xl shadow-2xl shadow-sage-700/20 hover:bg-sage-800 transition-all">Continue</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div>
                  <h2 className="text-4xl font-serif font-bold mb-3 text-cream">Reminder Preferences</h2>
                  <p className="text-xl text-text-muted">How should we notify you?</p>
                </div>
                <div className="space-y-4">
                  {[
                    { id: 'browser', label: 'Browser Notifications', icon: Bell, color: 'bg-sage-100/10 text-sage-700' },
                    { id: 'email', label: 'Email Digest (7am)', icon: Calendar, color: 'bg-amber-100/10 text-amber-500' },
                    { id: 'sms', label: 'SMS Alerts', icon: MessageSquare, color: 'bg-blue-100/10 text-blue-400' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setProfile({
                        ...profile,
                        notifications: { ...profile.notifications, [opt.id]: !profile.notifications[opt.id as keyof typeof profile.notifications] }
                      })}
                      className={cn(
                        "w-full p-8 rounded-[2rem] border-2 flex items-center justify-between transition-all",
                        profile.notifications[opt.id as keyof typeof profile.notifications] ? "border-sage-700 bg-sage-100" : "border-sage-100"
                      )}
                    >
                      <div className="flex items-center gap-6">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-colors", profile.notifications[opt.id as keyof typeof profile.notifications] ? opt.color : "bg-sage-100 text-text-muted")}>
                          <opt.icon className="w-7 h-7" />
                        </div>
                        <span className="font-bold text-xl text-cream">{opt.label}</span>
                      </div>
                      <div className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                        profile.notifications[opt.id as keyof typeof profile.notifications] ? "bg-sage-700 border-sage-700" : "border-sage-200"
                      )}>
                        {profile.notifications[opt.id as keyof typeof profile.notifications] && <CheckCircle2 className="w-5 h-5 text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-6">
                  <button onClick={() => setStep(2)} className="flex-1 py-6 rounded-[2rem] font-bold text-text-muted hover:bg-sage-100 transition-all">Back</button>
                  <button onClick={() => setStep(4)} className="flex-[2] bg-sage-700 text-white py-6 rounded-[2rem] font-bold text-xl shadow-2xl shadow-sage-700/20 hover:bg-sage-800 transition-all">Continue</button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10 text-center"
              >
                <div className="w-32 h-32 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <Bell className="w-16 h-16" />
                </div>
                <div>
                  <h2 className="text-4xl font-serif font-bold mb-4 text-primary">Enable Notifications</h2>
                  <p className="text-xl text-text-muted leading-relaxed">We'll send you a quick alert when it's time for your next dose.</p>
                </div>
                <div className="space-y-4">
                  <button
                    onClick={handleComplete}
                    className="w-full bg-accent text-white py-6 rounded-[2rem] font-bold text-xl shadow-2xl shadow-accent/20 hover:scale-[1.05] active:scale-95 transition-all"
                  >
                    Enable & Finish
                  </button>
                  <button onClick={handleComplete} className="text-primary opacity-60 font-bold hover:opacity-100 transition-all py-4 block w-full">I'll do it later</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = () => {
  const { medications, interactions, userProfile, setScreen, logs, setLogs, removeMedication, setIsMobileMenuOpen, isSidebarVisible, setIsSidebarVisible } = useMedStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const schedule = useMemo(() => {
    const items: { time: string, med: Medication }[] = [];
    medications.forEach(med => {
      med.times.forEach(time => {
        items.push({ time, med });
      });
    });
    return items.sort((a, b) => a.time.slice(0, 5).localeCompare(b.time.slice(0, 5)));
  }, [medications]);

  const adherence = useMemo(() => {
    if (schedule.length === 0) return { percent: 0, taken: 0, total: 0 };

    // Filter logs to only include taken status for TODAY and meds that are currently in the schedule
    const medIds = new Set(medications.map(m => m.id));
    const taken = logs.filter(l => {
      if (l.status !== 'TAKEN' || !l.takenAt) return false;
      if (!medIds.has(l.medicationId)) return false;
      try {
        const date = new Date(l.takenAt);
        return !isNaN(date.getTime()) && format(date, 'yyyy-MM-dd') === today;
      } catch (e) {
        return false;
      }
    }).length;
    const total = schedule.length;
    return {
      percent: Math.round((taken / total) * 100),
      taken,
      total
    };
  }, [schedule, logs, medications]);

  const handleMarkTaken = async (medId: string, time: string) => {
    const log = {
      id: crypto.randomUUID(),
      medicationId: medId,
      scheduledTime: time,
      status: 'TAKEN' as const,
      takenAt: new Date().toISOString()
    };

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await syncLog(session.user.id, log);
    }
    setLogs([...logs, log]);
  };

  const handleDeleteMed = async (id: string) => {
    if (!confirm('Are you sure you want to remove this medication and all its logs?')) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await deleteMedication(session.user.id, id);
    }
    removeMedication(id);
  };

  const severeInteractions = interactions.filter(i => i.severity === 'severe');

  return (
    <div className="space-y-8 h-full">
      {/* SaaS Greeting Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 lg:px-0">
        <div className="flex items-center gap-5">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-[var(--text-subtle)] hover:text-primary transition-all shadow-sm"
          >
            <Menu className="w-6 h-6" />
          </button>
          <button
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            className="hidden lg:flex p-3 bg-[var(--bg-base)] border border-[var(--card-border)] rounded-full text-[var(--text-subtle)] hover:text-primary transition-all shadow-sm active:scale-95 group relative"
            title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
          >
            {isSidebarVisible ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            {!isSidebarVisible && <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-ping" />}
          </button>
          <div>
            <h2 className="text-3xl font-serif font-bold text-primary mb-1">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}{userProfile?.name ? `, ${userProfile.name.split(' ')[0]}` : ''}
            </h2>
            <div className="flex items-center gap-3 text-[var(--text-muted)] font-medium text-sm">
              <Calendar className="w-4 h-4 text-accent/60" />
              <span>{format(new Date(), 'EEEE, MMMM do')}</span>
              <span className="w-1.5 h-1.5 bg-[var(--card-border)] rounded-full" />
              <div className="flex items-center gap-2 text-[var(--text-subtle)]">
                <span className="font-bold">{medications.length}</span> medications
                {Notification.permission === 'default' && (
                  <button
                    onClick={() => Notification.requestPermission()}
                    className="flex items-center gap-1.5 px-2 py-0.5 bg-accent/10 text-accent rounded-full text-[10px] uppercase tracking-tighter font-black hover:bg-accent/20 transition-all border border-accent/20"
                  >
                    <Bell className="w-3 h-3" /> Enable Notifications
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScreen('schedule')}
            className="px-6 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl font-bold text-sm text-[var(--text-muted)] hover:text-primary hover:border-accent/40 transition-all shadow-sm"
          >
            Full View
          </button>
          <button
            onClick={() => {
              setEditingMed(null);
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-accent text-[var(--text-on-accent)] rounded-xl font-bold text-sm shadow-lg shadow-accent/20 hover:bg-accent/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Medication
          </button>
        </div>
      </header>

      {/* Main SaaS Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pb-10">

        {/* Statistics & Timeline (Large Col) */}
        <div className="lg:col-span-8 space-y-8 flex flex-col">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="dashboard-card border border-[var(--card-border)] flex items-center gap-5">
              <div className="relative w-16 h-16 flex items-center gap-5 justify-center shrink-0">
                <svg className="w-full h-full -rotate-90 text-primary/5">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="4" />
                  <circle
                    cx="32" cy="32" r="28" fill="transparent" stroke="#10b981" strokeWidth="4"
                    strokeDasharray="175.9"
                    strokeDashoffset={175.9 - (175.9 * adherence.percent) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{adherence.percent}%</span>
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-primary text-sm mb-0.5">Today's Progress</h3>
                <p className="text-[var(--text-muted)] text-[10px] uppercase font-black tracking-widest leading-relaxed">
                  {adherence.taken} OF {adherence.total} DOSES LOGGED
                </p>
              </div>
            </div>

            <div className={cn(
              "dashboard-card border flex items-center gap-5 transition-colors",
              severeInteractions.length > 0 ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20"
            )}>
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                severeInteractions.length > 0 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
              )}>
                {severeInteractions.length > 0 ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <div className="min-w-0">
                <h4 className={cn("font-bold text-sm", severeInteractions.length > 0 ? "text-red-500" : "text-emerald-500")}>
                  {severeInteractions.length > 0 ? "Potential Risk" : "Safety: Verified"}
                </h4>
                <p className="text-text-muted text-[11px] truncate">
                  {severeInteractions.length > 0 ? "Check interaction report" : "Systems monitored & safe"}
                </p>
              </div>
            </div>
          </div>

          <section className="dashboard-card flex-1 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-8 shrink-0">
              <h3 className="text-xl font-serif font-bold text-primary">Daily Plan</h3>
              <div className="h-2 w-16 bg-[var(--surface-tint)] rounded-full overflow-hidden">
                <div className="h-full bg-accent/60 w-1/3" />
              </div>
            </div>

            <div className="space-y-4 flex-1">
              {schedule.length > 0 ? schedule.map((item, idx) => {
                const isTaken = logs.some(l => {
                  if (l.medicationId !== item.med.id || l.scheduledTime !== item.time || l.status !== 'TAKEN' || !l.takenAt) return false;
                  try {
                    const date = new Date(l.takenAt);
                    return !isNaN(date.getTime()) && format(date, 'yyyy-MM-dd') === today;
                  } catch (e) {
                    return false;
                  }
                });
                return (
                  <div key={idx} className="p-4 rounded-xl border border-[var(--card-border)] hover:bg-[var(--surface-tint)] transition-all flex items-center gap-6 group">
                    <div className="w-14 font-serif font-bold text-primary text-base shrink-0">{item.time}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-bold text-primary text-sm truncate">{item.med.name}</h4>
                        <span className="px-1.5 py-0.5 bg-primary/5 text-primary text-[8px] font-black rounded-sm uppercase">{item.med.dosage}</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] italic">
                        {item.med.foodRequirement !== 'none' ? `With ${item.med.foodRequirement} food` : 'Take anytime'}
                      </p>
                    </div>
                    <button
                      onClick={() => !isTaken && handleMarkTaken(item.med.id, item.time)}
                      disabled={isTaken}
                      className={cn(
                        "w-11 h-11 rounded-lg transition-all flex items-center justify-center shrink-0",
                        isTaken
                          ? "bg-emerald-500 text-[var(--text-on-accent)] shadow-xl shadow-emerald-500/20"
                          : "bg-[var(--surface-tint)] text-[var(--text-muted)] hover:bg-accent hover:text-[var(--text-on-accent)] hover:shadow-xl hover:shadow-accent/20"
                      )}
                    >
                      <CheckCircle2 className="w-5 h-5 transition-transform group-hover:scale-110" />
                    </button>
                  </div>
                );
              }) : (
                <div className="flex-1 flex flex-col items-center justify-center py-20 bg-emerald-50/10 rounded-3xl border border-dashed border-sage-100/50">
                  <div className="w-20 h-20 bg-white dark:bg-sage-900/20 text-sage-200 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-primary/5 relative">
                    <CalendarRange className="w-10 h-10 relative z-10" />
                    <div className="absolute inset-0 bg-emerald-500/5 rounded-full animate-pulse" />
                  </div>
                  <h4 className="font-serif font-bold text-lg text-primary mb-2">Your Timeline Awaits</h4>
                  <p className="text-xs text-text-muted max-w-[200px] text-center leading-relaxed">Add your first medication to see your personalized daily health schedule.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Management Sidebar (Right Col) */}
        <div className="lg:col-span-4 space-y-8 flex flex-col">

          <section className="dashboard-card bg-[var(--surface-tint)] border-dashed border-[var(--card-border)] p-8 shadow-none">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6 font-sans">Quick Shortcuts</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'schedule', label: 'Schedule', icon: CalendarRange },
                { id: 'interactions', label: 'Safety', icon: ShieldCheck },
                { id: 'chat', label: 'Assistant', icon: MessageSquare },
                { id: 'settings', label: 'Settings', icon: SettingsIcon },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setScreen(item.id as any)}
                  className="p-4 bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] hover:border-accent hover:shadow-xl hover:shadow-accent/5 transition-all text-left group"
                >
                  <item.icon className="w-5 h-5 text-[var(--text-subtle)] group-hover:text-accent mb-3 transition-colors" />
                  <span className="text-[11px] font-bold text-primary block">{item.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="dashboard-card bg-bg-base/20 border border-card-border p-6 shadow-none">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted font-sans">Notification Status</h3>
              <button
                onClick={() => setShowNotificationModal(true)}
                className="text-[10px] font-black uppercase text-accent hover:underline"
              >
                Manage
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-primary">Lead Time</span>
                </div>
                <span className="text-xs font-black text-accent bg-accent/5 px-2.5 py-1 rounded-lg">
                  {userProfile?.reminderLeadTime || 10}m
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'browser', icon: Bell, label: 'Web' },
                  { id: 'email', icon: MessageSquare, label: 'Email' },
                  { id: 'sms', icon: Phone, label: 'SMS' },
                  { id: 'sound', icon: Volume2, label: 'Sound' }
                ].map(opt => {
                  const isActive = userProfile?.notifications?.[opt.id as keyof typeof userProfile.notifications] ?? false;
                  return (
                    <div
                      key={opt.id}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                        isActive
                          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600"
                          : "bg-bg-base/50 border-card-border text-text-subtle opacity-50"
                      )}
                      title={opt.label}
                    >
                      <opt.icon className="w-4 h-4" />
                      <span className="text-[8px] font-black uppercase tracking-tighter">{opt.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="dashboard-card flex-1 flex flex-col h-full max-h-[500px]">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h3 className="text-xl font-serif font-bold text-primary">Medications</h3>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
              {medications.map(med => (
                <div key={med.id} className="p-3.5 rounded-xl border border-sage-50 bg-paper/30 flex items-center justify-between group hover:border-accent/30 transition-colors">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-primary truncate">{med.name}</p>
                    <p className="text-[10px] text-text-muted font-medium">{med.dosage} · {med.frequency}</p>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingMed(med); setShowAddModal(true); }} className="p-1 text-text-subtle hover:text-primary transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteMed(med.id)} className="p-1 text-text-subtle hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {medications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 bg-accent/5 rounded-2xl border border-dashed border-accent/20">
                  <div className="w-14 h-14 bg-white dark:bg-sage-900/20 text-accent/30 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                    <Pill className="w-7 h-7" />
                  </div>
                  <p className="text-xs font-bold text-primary mb-1">No Medications</p>
                  <p className="text-[10px] text-text-muted font-medium mb-4">Start by adding your first med.</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Add Now
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="dashboard-card bg-primary text-white dark:text-[#0F3D3E] border-none overflow-hidden relative shrink-0 min-h-[220px]">
            <Zap className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 dark:text-primary/10" />
            <div className="relative z-10 flex flex-col h-full">
              <span className="text-[9px] uppercase tracking-widest text-orange-600 mb-2 font-black italic">Medical Context</span>
              <p className="text-[13px] leading-relaxed mb-6 font-medium text-white/90 dark:text-[#0F3D3E]/90">Taking meds with food can reduce stomach irritation and improve absorption for certain drugs.</p>
              <button
                onClick={() => setScreen('chat')}
                className="mt-auto py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
              >
                Talk to MediAI
              </button>
            </div>
          </section>
        </div>
      </div>
      <AddMedModal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setEditingMed(null); }} initialMed={editingMed} />
      <NotificationPreferencesModal isOpen={showNotificationModal} onClose={() => setShowNotificationModal(false)} />
    </div>
  );
};

const InteractionReport = () => {
  const { interactions, setScreen, medications, isSidebarVisible, setIsSidebarVisible } = useMedStore();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const SEVERITY_ICONS = {
    severe: '❌',
    moderate: '⚠️',
    mild: 'ℹ️'
  };

  return (
    <div className="bg-paper flex flex-col">
      <header className="bg-paper text-cream border-b border-sage-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-6 h-24 flex items-center gap-6">
          <button onClick={() => setScreen('dashboard')} className="p-3 hover:bg-sage-50 rounded-2xl transition-all text-text-muted hover:text-sage-700">
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            className="hidden lg:flex p-2.5 bg-sage-50 border border-sage-100 rounded-full text-text-muted hover:text-primary transition-all shadow-sm active:scale-95 group"
            title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
          >
            {isSidebarVisible ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
          </button>
          <h1 className="text-2xl font-serif font-bold text-cream">Safety Report</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        <div className="bg-[var(--card-bg)] p-10 rounded-[3rem] border border-sage-100 shadow-sm text-center">
          <div className="w-24 h-24 bg-sage-50 text-sage-700 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <ShieldCheck className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-serif font-bold mb-3 text-cream">Safety Check Complete</h2>
          <p className="text-xl text-text-muted leading-relaxed">We've cross-referenced your {medications.length} medications with FDA & RxNorm databases.</p>
        </div>

        {['severe', 'moderate', 'mild'].map(severity => {
          const filtered = interactions.filter(i => i.severity === severity);
          if (filtered.length === 0) return null;
          return (
            <div key={severity} className="space-y-6">
              <h3 className={cn(
                "text-xs font-black uppercase tracking-[0.3em] px-6",
                severity === 'severe' ? "text-red-600" : severity === 'moderate' ? "text-amber-600" : "text-sage-600"
              )}>
                {severity} Interactions ({filtered.length})
              </h3>
              <div className="space-y-6">
                {filtered.map((interaction, idx) => (
                  <motion.div
                    key={idx}
                    layout
                    onClick={() => setExpandedId(expandedId === idx ? null : idx)}
                    className="bg-[var(--card-bg)] p-10 rounded-[3rem] border border-sage-100 shadow-sm cursor-pointer hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{(SEVERITY_ICONS as any)[interaction.severity]}</span>
                        <h4 className="text-2xl font-serif font-bold text-cream">{interaction.drugs.join(' ↔ ')}</h4>
                      </div>
                      <div className={cn(
                        "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        severity === 'severe' ? "bg-red-50 text-red-600" : severity === 'moderate' ? "bg-amber-50 text-amber-600" : "bg-sage-50 text-sage-600"
                      )}>
                        {severity}
                      </div>
                    </div>

                    <p className="text-text-muted leading-relaxed text-xl mb-6">{interaction.explanation}</p>

                    <AnimatePresence>
                      {expandedId === idx && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-sage-50 p-8 rounded-[2rem] space-y-6 mt-6">
                            <div>
                              <span className="text-xs font-black uppercase tracking-widest text-text-muted block mb-3">What to do</span>
                              <p className="text-primary font-medium text-lg leading-relaxed">{interaction.recommendation}</p>
                            </div>
                            <div className="flex items-center justify-between pt-6 border-t border-sage-100">
                              <div className="flex items-center gap-2 text-text-muted">
                                <Info className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">{interaction.source || 'FDA Database'}</span>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); setScreen('chat'); }} className="bg-[var(--card-bg)] text-sage-700 px-6 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-sage-50 transition-colors">
                                Ask AI
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}

        {interactions.length === 0 && (
          <div className="bg-[var(--card-bg)] p-16 rounded-[3rem] border border-sage-100 text-center">
            <div className="w-20 h-20 bg-sage-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-sage-700" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-cream mb-3">No Interactions Found</h3>
            <p className="text-xl text-text-muted leading-relaxed">Your current medications are safe to take together based on our latest data.</p>
          </div>
        )}
      </main>
    </div>
  );
};

const ScheduleScreen = () => {
  const { medications, setScreen, isSidebarVisible, setIsSidebarVisible } = useMedStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const monthlyData = useMemo(() => [
    { date: '1 Feb', adherence: 92 },
    { date: '5 Feb', adherence: 88 },
    { date: '10 Feb', adherence: 94 },
    { date: '15 Feb', adherence: 96 },
    { date: '20 Feb', adherence: 89 },
    { date: '25 Feb', adherence: 98 },
    { date: '28 Feb', adherence: 100 },
  ], []);

  const chartData = useMemo(() => [
    { day: 'Mon', adherence: 100 },
    { day: 'Tue', adherence: 85 },
    { day: 'Wed', adherence: 100 },
    { day: 'Thu', adherence: 92 },
    { day: 'Fri', adherence: 100 },
    { day: 'Sat', adherence: 75 },
    { day: 'Sun', adherence: 95 },
  ], []);

  const fullSchedule = useMemo(() => {
    const items: { time: string, med: Medication }[] = [];
    medications.forEach(med => {
      med.times.forEach(time => {
        items.push({ time, med });
      });
    });
    return items.sort((a, b) => a.time.slice(0, 5).localeCompare(b.time.slice(0, 5)));
  }, [medications]);

  const bestDay = useMemo(() => {
    return [...chartData].sort((a, b) => b.adherence - a.adherence)[0]?.day || 'N/A';
  }, [chartData]);

  const avgAdherence = useMemo(() => {
    return Math.round(chartData.reduce((acc, curr) => acc + curr.adherence, 0) / chartData.length);
  }, [chartData]);

  return (
    <div className="bg-bg-base min-h-screen flex flex-col">
      <header className="bg-[var(--card-bg)] border-b border-sage-100/50 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setScreen('dashboard')}
              className="p-2.5 hover:bg-sage-50 rounded-xl transition-all text-text-muted hover:text-primary"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="hidden lg:flex p-2.5 bg-sage-50 border border-sage-100 rounded-full text-text-muted hover:text-primary transition-all shadow-sm active:scale-95 group"
              title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
            >
              {isSidebarVisible ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            </button>
            <h1 className="text-xl font-serif font-bold text-primary">Health Analytics</h1>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-subtle bg-bg-base px-3 py-1.5 rounded-lg border border-card-border">
            <Calendar className="w-3.5 h-3.5" />
            Last 7 Days
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-6 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Weekly Adherence Card */}
          <section className="dashboard-card flex flex-col">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-subtle mb-2">Weekly Adherence</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-serif font-bold text-primary">{avgAdherence}%</span>
                  <div className="trend-up">
                    <ArrowRight className="w-3 h-3 -rotate-45" />
                    +5%
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>

            <div className="relative w-full" style={{ height: 224 }}>
              {isMounted && (
                <ResponsiveContainer width="100%" height={224} minWidth={0} minHeight={1} debounce={100}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0F3D3E" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#0F3D3E" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="barGradientHighlight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }}
                      dy={10}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(15, 61, 62, 0.03)', radius: 8 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-primary text-white px-3 py-2 rounded-lg shadow-xl text-xs font-bold border border-white/10 backdrop-blur-md">
                              {payload[0].value}% Taken
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="adherence" radius={[6, 6, 0, 0]} animationDuration={1500}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.day === bestDay ? "url(#barGradientHighlight)" : "url(#barGradient)"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="chart-insight">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Best Day: <span className="text-primary">{bestDay}</span> — Perfect 100% adherence</span>
            </div>
          </section>

          {/* Monthly Progress Card */}
          <section className="dashboard-card flex flex-col">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2">Monthly Progress</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-serif font-bold text-primary">Stable</span>
                  <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase border border-emerald-100">
                    Premium
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 bg-accent/5 rounded-xl flex items-center justify-center text-accent">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="relative w-full" style={{ height: 224 }}>
              {isMounted && (
                <ResponsiveContainer width="100%" height={224} minWidth={0} minHeight={1} debounce={100}>
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[var(--card-bg)] p-3 rounded-xl shadow-2xl border border-sage-100 min-w-[100px]">
                              <p className="text-[10px] uppercase font-black text-text-muted mb-1">{payload[0].payload.date}</p>
                              <p className="font-serif font-bold text-primary text-lg">{payload[0].value}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="adherence"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#areaGradient)"
                      dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="chart-insight">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span>Consistency improving over last 30 days</span>
            </div>
          </section>
        </div>

        <section className="space-y-8">
          <div className="flex items-center justify-between px-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-muted">Daily Timeline</h3>
            <span className="text-xs font-bold text-text-muted bg-sage-50 px-4 py-1.5 rounded-full">{format(new Date(), 'EEEE, MMM do')}</span>
          </div>
          <div className="space-y-4">
            {fullSchedule.map((item, idx) => (
              <div key={idx} className="dashboard-card !p-6 flex items-center gap-6 group">
                <div className="text-center min-w-[70px]">
                  <div className="text-xl font-serif font-bold text-primary">{item.time}</div>
                  <div className="text-[10px] text-text-muted font-black uppercase tracking-widest">{parseInt(item.time.split(':')[0]) < 12 ? 'AM' : 'PM'}</div>
                </div>
                <div className="w-px h-8 bg-sage-50 group-hover:bg-sage-100 transition-colors" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-bold text-primary text-lg truncate mb-0.5">{item.med.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted text-[11px] font-medium">{item.med.dosage}</span>
                    <span className="w-1 h-1 bg-sage-200 rounded-full" />
                    <span className="text-text-muted text-[11px] font-medium capitalize">{item.med.foodRequirement} food</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-sage-50 flex items-center justify-center text-sage-200 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all cursor-pointer">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            ))}
            {fullSchedule.length === 0 && (
              <div className="text-center py-24 bg-[var(--card-bg)] rounded-[3rem] border-2 border-dashed border-sage-100">
                <div className="w-20 h-20 bg-sage-50 text-sage-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-cream mb-2">Nothing scheduled</h4>
                <p className="text-text-muted">Take a deep breath and enjoy your day.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

const ChatScreen = () => {
  const { medications, setScreen, isSidebarVisible, setIsSidebarVisible } = useMedStore();
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsgText = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsgText }]);
    setInput('');
    setIsTyping(true);
    try {
      const aiResponse = await askMedicationQuestion(userMsgText, medications);
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg-base relative overflow-hidden">
      {/* Header */}
      <header className="bg-[var(--card-bg)]/90 backdrop-blur-xl border-b border-sage-100/50 h-20 flex items-center px-6 sticky top-0 z-30 shrink-0">
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setScreen('dashboard')}
              className="p-2.5 hover:bg-sage-50 rounded-xl transition-all text-text-muted hover:text-primary lg:hidden"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="hidden lg:flex p-2.5 bg-sage-50 border border-sage-100 rounded-full text-text-muted hover:text-primary transition-all shadow-sm active:scale-95 group"
              title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
            >
              {isSidebarVisible ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-serif font-bold text-primary">MediAI Assistant</h1>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] text-text-muted uppercase tracking-widest font-black">AI Active</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Beta v2.0</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-10 space-y-8 max-w-4xl mx-auto w-full pb-48 scroll-smooth">
        {messages.length === 0 && (
          <div className="max-w-xl mx-auto py-12">
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 bg-[var(--card-bg)] rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/5 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent opacity-50 group-hover:rotate-12 transition-transform duration-700" />
                <Sparkles className="w-10 h-10 text-accent relative z-10 animate-pulse" />
              </motion.div>
              <h2 className="text-3xl font-serif font-bold text-primary mb-3">Your Health Assistant</h2>
              <p className="text-text-muted font-medium">Safe, reliable medication guidance at your fingertips.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { q: "Can I take Dolo with coffee?", desc: "Check caffeine interactions" },
                { q: "What if I miss my dose?", desc: "Managing missed schedule" },
                { q: "Food warnings for my meds", desc: "Dietary guidance" },
                { q: "Potential side effects", desc: "Safety awareness" }
              ].map((item, idx) => (
                <motion.button
                  key={item.q}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setInput(item.q)}
                  className="p-5 bg-[var(--card-bg)] border border-sage-100 rounded-2xl text-left hover:border-accent hover:shadow-xl hover:shadow-accent/5 transition-all group"
                >
                  <p className="text-sm font-bold text-primary mb-1">{item.q}</p>
                  <p className="text-[10px] uppercase font-black tracking-widest text-text-subtle group-hover:text-accent transition-colors">{item.desc}</p>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex items-start gap-4", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-2",
              msg.role === 'user' ? "bg-primary text-white" : "bg-accent/20 text-accent"
            )}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div className={cn(
              "max-w-[80%] p-6 rounded-2xl shadow-sm leading-relaxed",
              msg.role === 'user'
                ? "bg-primary text-white rounded-tr-none"
                : "bg-[var(--card-bg)] text-primary rounded-tl-none border border-sage-100 shadow-xl shadow-primary/[0.02]"
            )}>
              <div className="markdown-body prose prose-sm max-w-none prose-sage">
                <Markdown>{msg.text}</Markdown>
              </div>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center shrink-0 mt-2">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-[var(--card-bg)] p-5 rounded-2xl rounded-tl-none border border-sage-100 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-accent/30 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-accent/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-accent/30 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-[10px] font-black text-text-subtle uppercase tracking-widest">Assistant is thinking</span>
            </div>
          </div>
        )}
      </main>

      {/* Chat Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-bg-base via-bg-base to-transparent z-40">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute inset-0 bg-accent/20 rounded-[2rem] blur-2xl opacity-0 group-focus-within:opacity-30 transition-opacity" />
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="w-full pl-8 pr-32 py-6 bg-[var(--card-bg)] rounded-[1.5rem] border border-sage-100 shadow-2xl shadow-primary/[0.05] focus:ring-4 focus:ring-accent/5 focus:border-accent text-sm font-medium outline-none text-primary placeholder:text-text-muted transition-all"
            />
            <div className="absolute right-3 flex items-center gap-2">
              <button className="p-3 text-text-subtle hover:text-accent transition-colors">
                <Volume2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center justify-center group-active:scale-95"
              >
                <Send className={cn("w-5 h-5", isTyping ? "animate-pulse" : "")} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black text-text-subtle uppercase tracking-widest">Medical Guidance Mode</span>
              <div className="w-1 h-1 bg-emerald-500 rounded-full" />
            </div>
            <p className="text-[9px] text-text-muted uppercase tracking-widest font-bold opacity-60">
              Not for emergencies
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Settings = () => {
  const { userProfile, setUserProfile, setScreen, setHasCompletedOnboarding, setTwoFactorVerified, clearMedications, isSidebarVisible, setIsSidebarVisible, logout } = useMedStore();
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isNotificationPrefsOpen, setIsNotificationPrefsOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [disableToken, setDisableToken] = useState('');
  const [error, setError] = useState('');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
  };

  const handleClearMeds = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await clearAllMedications(session.user.id);
    }
    clearMedications();
    setIsClearConfirmOpen(false);
  };

  const handleDisable2FA = async () => {
    setError('');
    try {
      const resp = await fetch('/api/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: disableToken })
      });
      const data = await resp.json();
      if (data.success) {
        setTwoFactorVerified(false);
        if (userProfile) setUserProfile({ ...userProfile, twoFactorEnabled: false });
        setIsDisabling(false);
        setDisableToken('');
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch (e) {
      setError('Connection error');
    }
  };

  return (
    <div className="bg-bg-base flex flex-col">
      <header className="bg-[var(--card-bg)]/90 backdrop-blur-xl border-b border-sage-100/50 h-20 flex items-center px-6 sticky top-0 z-30 shrink-0">
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setScreen('dashboard')}
              className="p-2.5 hover:bg-[var(--surface-tint)] rounded-xl transition-all text-[var(--text-muted)] hover:text-primary lg:hidden"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="hidden lg:flex p-2.5 bg-[var(--surface-tint)] border border-[var(--card-border)] rounded-full text-[var(--text-muted)] hover:text-primary transition-all shadow-sm active:scale-95 group"
              title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
            >
              {isSidebarVisible ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            </button>
            <h1 className="text-lg font-serif font-bold text-primary ml-2">Settings & Profile</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <section className="bg-[var(--card-bg)] rounded-[3rem] border border-[var(--card-border)] shadow-sm overflow-hidden">
          <div className="p-10 border-b border-[var(--card-border)] flex items-center gap-8">
            <div className="w-24 h-24 bg-[var(--surface-tint)] text-primary rounded-[2rem] flex items-center justify-center text-3xl font-bold border border-[var(--card-border)]">
              {userProfile?.name[0]}
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold text-cream mb-1">{userProfile?.name}</h2>
              <p className="text-lg text-[var(--text-muted)]">Managing meds for {userProfile?.setupFor === 'myself' ? 'themselves' : userProfile?.patientName}</p>
            </div>
          </div>
          <div className="p-6">
            <button onClick={() => setIsEditProfileOpen(true)} className="w-full p-6 rounded-[1.5rem] flex items-center justify-between hover:bg-[var(--surface-tint)] transition-all group">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-[var(--surface-tint)] text-[var(--text-muted)] rounded-2xl flex items-center justify-center group-hover:bg-[var(--bg-base)] group-hover:text-primary transition-all shadow-sm">
                  <User className="w-6 h-6" />
                </div>
                <span className="font-bold text-lg text-cream">Edit Profile</span>
              </div>
              <ChevronRight className="w-6 h-6 text-[var(--card-border)]" />
            </button>
            <button onClick={() => setIsNotificationPrefsOpen(true)} className="w-full p-6 rounded-[1.5rem] flex items-center justify-between hover:bg-[var(--surface-tint)] transition-all group">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-[var(--surface-tint)] text-[var(--text-muted)] rounded-2xl flex items-center justify-center group-hover:bg-[var(--bg-base)] group-hover:text-primary transition-all shadow-sm">
                  <Bell className="w-6 h-6" />
                </div>
                <span className="font-bold text-lg text-cream">Notification Preferences</span>
              </div>
              <ChevronRight className="w-6 h-6 text-[var(--card-border)]" />
            </button>
            {[
              { icon: ShieldCheck, label: "Privacy & Data", onClick: () => setIsPrivacyModalOpen(true) },
              { icon: Info, label: "Help & Support", onClick: () => setIsSupportModalOpen(true) }
            ].map((item, i) => (
              <button key={i} onClick={item.onClick} className="w-full p-6 rounded-[1.5rem] flex items-center justify-between hover:bg-[var(--surface-tint)] transition-all group">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-[var(--surface-tint)] text-[var(--text-muted)] rounded-2xl flex items-center justify-center group-hover:bg-[var(--bg-base)] group-hover:text-primary transition-all shadow-sm">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-lg text-cream">{item.label}</span>
                </div>
                <ChevronRight className="w-6 h-6 text-[var(--card-border)]" />
              </button>
            ))}
          </div>
        </section>

        <section className="bg-[var(--card-bg)] rounded-[3rem] border border-sage-100 shadow-sm p-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center shadow-sm">
                <Trash2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-cream">Clear Medications</h3>
                <p className="text-[var(--text-muted)]">Remove all medications from your list.</p>
              </div>
            </div>
            <button
              onClick={() => setIsClearConfirmOpen(true)}
              className="px-6 py-3 rounded-2xl font-bold bg-red-500 text-[var(--text-on-accent)] hover:bg-red-600 shadow-lg shadow-red-500/10 transition-all active:scale-95"
            >
              Clear All
            </button>
          </div>
        </section>

        <AnimatePresence>
          {isClearConfirmOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsClearConfirmOpen(false)}
                className="absolute inset-0 bg-sage-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-[var(--card-bg)] rounded-[2.5rem] shadow-2xl p-10 text-center border border-[var(--card-border)]"
              >
                <div className="w-20 h-20 bg-red-900/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-cream mb-3">Clear All Data?</h3>
                <p className="text-[var(--text-muted)] mb-8 leading-relaxed">
                  This will permanently remove all medications from your list. This action cannot be undone.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleClearMeds}
                    className="w-full bg-red-600 text-[var(--text-on-accent)] py-4 rounded-2xl font-bold text-lg shadow-xl shadow-red-900/20 hover:bg-red-700 transition-all active:scale-95"
                  >
                    Yes, Clear Everything
                  </button>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                    }}
                    className="w-full bg-amber-600 text-[var(--text-on-accent)] py-4 rounded-2xl font-bold text-lg shadow-xl shadow-amber-900/20 hover:bg-amber-700 transition-all active:scale-95"
                  >
                    Reset App Completely
                  </button>
                  <button
                    onClick={() => setIsClearConfirmOpen(false)}
                    className="w-full py-4 text-[var(--text-muted)] font-bold hover:text-primary transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <section className="bg-[var(--card-bg)] rounded-[3rem] border border-sage-100 shadow-sm p-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center shadow-sm">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-cream">Two-Factor Authentication</h3>
                <p className="text-[var(--text-muted)]">Add an extra layer of security to your account.</p>
              </div>
            </div>
            <button
              onClick={() => userProfile?.twoFactorEnabled ? setIsDisabling(true) : setIs2FAModalOpen(true)}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold transition-all",
                userProfile?.twoFactorEnabled
                  ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                  : "bg-sage-700 text-[var(--text-on-accent)] hover:bg-sage-800 shadow-lg shadow-sage-700/20"
              )}
            >
              {userProfile?.twoFactorEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>

          {isDisabling && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-6 border-t border-sage-100 space-y-4">
              <p className="text-sm font-bold text-cream">Enter your 6-digit code to disable 2FA:</p>
              <div className="flex gap-4">
                <input
                  type="text"
                  maxLength={6}
                  value={disableToken}
                  onChange={e => setDisableToken(e.target.value)}
                  placeholder="000000"
                  className="flex-1 px-6 py-4 bg-[var(--surface-tint)] rounded-xl outline-none font-mono tracking-widest text-primary placeholder:text-[var(--text-muted)]"
                />
                <button onClick={handleDisable2FA} className="bg-red-600 text-[var(--text-on-accent)] px-8 py-4 rounded-xl font-bold">Confirm</button>
                <button onClick={() => setIsDisabling(false)} className="px-6 py-4 text-[var(--text-muted)] font-bold">Cancel</button>
              </div>
              {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
            </motion.div>
          )}

          {userProfile?.twoFactorEnabled && (
            <div className="bg-sage-50 p-6 rounded-2xl flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-sage-600 mt-1" />
              <p className="text-sage-700 text-sm leading-relaxed">
                Two-factor authentication is currently <strong>active</strong>. You will be asked for a code whenever you sign in.
              </p>
            </div>
          )}
        </section>

        <section className="bg-[var(--card-bg)] rounded-[3rem] border border-sage-100 shadow-sm p-6">
          <button
            onClick={handleLogout}
            className="w-full p-6 rounded-[1.5rem] flex items-center gap-6 text-red-600 hover:bg-red-50 transition-all font-bold text-lg group"
          >
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center group-hover:bg-red-100 transition-all shadow-sm">
              <LogOut className="w-6 h-6" />
            </div>
            <span>Log Out</span>
          </button>
        </section>

        <div className="text-center pt-12">
          <p className="text-xs text-text-muted font-bold uppercase tracking-[0.2em] mb-3">MediSafe v1.0.0</p>
          <p className="text-sm text-text-subtle leading-relaxed px-12 italic">
            Your data is stored locally on this device. We do not sell your health information.
          </p>
        </div>
      </main>

      <TwoFactorModal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        onEnabled={() => {
          if (userProfile) setUserProfile({ ...userProfile, twoFactorEnabled: true });
        }}
      />
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
      <NotificationPreferencesModal
        isOpen={isNotificationPrefsOpen}
        onClose={() => setIsNotificationPrefsOpen(false)}
      />
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </div>
  );
};

const TwoFactorModal = ({ isOpen, onClose, onEnabled }: { isOpen: boolean, onClose: () => void, onEnabled: () => void }) => {
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const { setTwoFactorVerified } = useMedStore();

  useEffect(() => {
    if (isOpen && step === 1) {
      const fetchSetup = async () => {
        try {
          const resp = await fetch('/api/2fa/setup', { method: 'POST' });
          const data = await resp.json();
          setQrCode(data.qrCodeUrl);
          setSecret(data.secret);
        } catch (e) {
          setError('Failed to contact server');
        }
      };
      fetchSetup();
    }
  }, [isOpen, step]);

  const handleVerify = async () => {
    setError('');
    try {
      const resp = await fetch('/api/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, token })
      });
      const data = await resp.json();
      if (data.success) {
        setRecoveryCodes(data.recoveryCodes);
        setStep(3);
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch (e) {
      setError('Connection error');
    }
  };

  const handleFinish = () => {
    onEnabled();
    onClose();
    setStep(1);
    setToken('');
    setRecoveryCodes([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-sage-900/40 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-[var(--card-bg)] rounded-[3rem] shadow-2xl overflow-hidden p-10 border border-sage-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-serif font-bold text-cream">Secure Your Account</h2>
              {step !== 3 && <button onClick={onClose} className="p-2 hover:bg-sage-50 rounded-xl transition-all"><X className="w-6 h-6 text-text-muted" /></button>}
            </div>

            {step === 1 ? (
              <div className="space-y-6 text-center">
                <p className="text-text-muted">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
                {qrCode ? (
                  <div className="bg-white p-4 rounded-3xl border-2 border-sage-100 inline-block">
                    <img src={qrCode} className="w-48 h-48" />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-sage-50 rounded-3xl animate-pulse mx-auto" />
                )}
                <div className="bg-sage-50 p-4 rounded-2xl text-xs font-mono text-primary break-all">
                  Manual Entry: {secret}
                </div>
                <button onClick={() => setStep(2)} className="w-full bg-sage-700 text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:bg-sage-800 transition-all">
                  I've Scanned It
                </button>
              </div>
            ) : step === 2 ? (
              <div className="space-y-6">
                <p className="text-text-muted text-center">Enter the 6-digit code from your app to verify setup.</p>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  className="w-full px-8 py-5 bg-sage-50 border-none rounded-2xl outline-none text-center text-3xl font-mono tracking-[0.5em] focus:ring-4 focus:ring-sage-700/10 text-primary placeholder:text-text-muted"
                />
                {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-5 rounded-2xl font-bold text-text-muted hover:bg-sage-50 transition-all">Back</button>
                  <button onClick={handleVerify} className="flex-[2] bg-sage-700 text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:bg-sage-800 transition-all">Verify & Enable</button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-accent/10 p-6 rounded-3xl border border-accent/20">
                  <div className="flex items-center gap-3 text-accent font-bold mb-2">
                    <ShieldAlert className="w-5 h-5" />
                    <span>Save Recovery Codes</span>
                  </div>
                  <p className="text-sm text-primary opacity-80 leading-relaxed font-medium">
                    If you lose access to your authenticator app, you can use these codes to sign in. Each code can only be used once.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 bg-bg-base/50 p-6 rounded-3xl font-mono text-sm border border-sage-100">
                  {recoveryCodes.map(code => (
                    <div key={code} className="bg-paper px-3 py-2 rounded-xl text-center border border-sage-100 text-primary font-bold shadow-sm">{code}</div>
                  ))}
                </div>
                <button onClick={handleFinish} className="w-full bg-sage-700 text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:bg-sage-800 transition-all">
                  I've Saved Them
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const TwoFactorVerifyScreen = () => {
  const { setTwoFactorVerified, setHasCompletedOnboarding, setScreen, logout } = useMedStore();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);

  const handleVerify = async () => {
    setError('');
    try {
      const endpoint = useRecovery ? '/api/2fa/recovery' : '/api/2fa/verify';
      const body = useRecovery ? { code: token } : { token };

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await resp.json();
      if (data.success) {
        setTwoFactorVerified(true);
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch (e) {
      setError('Server error');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-[var(--card-bg)] rounded-[3rem] shadow-2xl p-12 text-center border border-sage-100">
        <div className="w-20 h-20 bg-sage-50 text-sage-700 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-cream mb-4">Security Verification</h2>
        <p className="text-text-muted mb-10">
          {useRecovery
            ? 'Enter one of your 8-character recovery codes.'
            : 'Enter the 6-digit code from your authenticator app to continue.'}
        </p>

        <div className="space-y-6">
          <input
            type="text"
            maxLength={useRecovery ? 8 : 6}
            placeholder={useRecovery ? "Recovery Code" : "000000"}
            value={token}
            onChange={e => setToken(e.target.value)}
            className={cn(
              "w-full px-8 py-6 bg-sage-50 border-none rounded-2xl outline-none text-center font-mono focus:ring-4 focus:ring-sage-700/10 text-primary placeholder:text-text-muted",
              useRecovery ? "text-2xl tracking-widest" : "text-4xl tracking-[0.5em]"
            )}
          />
          {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
          <button onClick={handleVerify} className="w-full bg-sage-700 text-white py-6 rounded-2xl font-bold text-xl shadow-2xl shadow-sage-700/20 hover:bg-sage-800 transition-all active:scale-95">
            Verify Identity
          </button>

          <div className="pt-4 border-t border-sage-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setUseRecovery(!useRecovery);
                setToken('');
                setError('');
              }}
              className="text-text-muted font-bold hover:text-sage-600 transition-all text-sm"
            >
              {useRecovery ? 'Use Authenticator App' : 'Lost access? Use a recovery code'}
            </button>
            <button onClick={handleLogout} className="py-2 text-text-muted font-bold hover:text-sage-600 transition-all text-sm">
              Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AddMedModal = ({ isOpen, onClose, initialMed }: { isOpen: boolean, onClose: () => void, initialMed?: Medication | null }) => {
  const { addMedication, updateMedication } = useMedStore();
  const [newMed, setNewMed] = useState<any>({
    name: '',
    dosage: '',
    frequency: 'Daily',
    times: ['08:00'],
    foodRequirement: 'none'
  });

  useEffect(() => {
    if (initialMed) {
      setNewMed(initialMed);
    } else {
      setNewMed({ name: '', dosage: '', frequency: 'Daily', times: ['08:00'], foodRequirement: 'none' });
    }
  }, [initialMed, isOpen]);

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not logged in');
      const url = await uploadMedicationImage(session.user.id, file);
      setNewMed({ ...newMed, imageUrl: url });
    } catch (err) {
      alert("Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!newMed.name || !newMed.dosage) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      let savedMed;
      if (initialMed) {
        savedMed = { ...newMed as Medication };
        if (session) {
          await syncMedication(session.user.id, savedMed);
        }
        updateMedication(savedMed);
      } else {
        savedMed = {
          ...newMed as Medication,
          id: crypto.randomUUID()
        };

        if (session) {
          await syncMedication(session.user.id, savedMed);
        }
        addMedication(savedMed);
      }

      // Automatic Safety Alert Check
      const updatedMeds = useMedStore.getState().medications;
      if (updatedMeds.length >= 2) {
        const alerts = await checkInteractions(updatedMeds);
        const { setInteractions } = useMedStore.getState();
        setInteractions(alerts);
        if (session) {
          await syncInteractions(session.user.id, alerts);
        }
      }

      setNewMed({ name: '', dosage: '', frequency: 'Daily', times: ['08:00'], foodRequirement: 'none' });
      onClose();
    } catch (e) {
      alert("Error saving medication. Please check your connection.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-sage-900/40 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-[var(--card-bg)] rounded-[3rem] shadow-2xl overflow-hidden p-12 border border-sage-100">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-4xl font-serif font-bold text-cream">{initialMed ? 'Edit' : 'Add'} Medication</h2>
              <button onClick={onClose} className="p-3 hover:bg-sage-50 rounded-2xl transition-all"><X className="w-7 h-7 text-text-muted" /></button>
            </div>
            <div className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-primary opacity-60 uppercase tracking-widest mb-3">Drug Name</label>
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-subtle w-6 h-6" />
                    <input type="text" placeholder="e.g. Metformin" value={newMed.name} onChange={e => setNewMed({ ...newMed, name: e.target.value })} className="w-full pl-16 pr-8 py-5 bg-bg-base border border-card-border rounded-[1.5rem] outline-none text-lg font-medium text-primary placeholder:text-text-subtle" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-primary opacity-60 uppercase tracking-widest mb-3">Dosage</label>
                  <input type="text" placeholder="e.g. 500mg" value={newMed.dosage} onChange={e => setNewMed({ ...newMed, dosage: e.target.value })} className="w-full px-8 py-5 bg-bg-base border border-card-border rounded-[1.5rem] outline-none text-lg font-medium text-primary placeholder:text-text-subtle" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-primary opacity-60 uppercase tracking-widest mb-3">Frequency</label>
                    <select value={newMed.frequency} onChange={e => setNewMed({ ...newMed, frequency: e.target.value })} className="w-full px-8 py-5 bg-bg-base border border-card-border rounded-[1.5rem] outline-none text-lg font-medium appearance-none text-primary">
                      <option className="bg-card-bg">Daily</option>
                      <option className="bg-card-bg">Twice Daily</option>
                      <option className="bg-card-bg">As Needed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-primary opacity-60 uppercase tracking-widest mb-3">Time</label>
                    <input type="time" value={newMed.times?.[0]} onChange={e => setNewMed({ ...newMed, times: [e.target.value] })} className="w-full px-8 py-5 bg-bg-base border border-card-border rounded-[1.5rem] outline-none text-lg font-medium text-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Photo Identification (Recommended)</label>
                  <div className="flex items-center gap-6">
                    <div className="relative w-32 h-32 rounded-3xl bg-sage-50 border-2 border-dashed border-sage-100 flex items-center justify-center overflow-hidden group">
                      {newMed.imageUrl ? (
                        <img src={newMed.imageUrl} className="w-full h-full object-cover" alt="Medication" />
                      ) : (
                        <Camera className="w-8 h-8 text-text-subtle group-hover:text-text-muted transition-colors" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {isUploading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-text-muted leading-relaxed font-medium">
                        Upload a photo of your medicine bottle or pill to help you visually identify it later. This is stored securely in your health vault.
                      </p>
                      <button className="mt-3 flex items-center gap-2 text-xs font-black text-accent uppercase tracking-widest hover:underline">
                        <Upload className="w-3 h-3" /> Select Image
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={!newMed.name || !newMed.dosage}
                className="w-full bg-accent text-white py-6 rounded-[2rem] font-bold text-xl shadow-2xl shadow-accent/20 hover:scale-[1.02] disabled:opacity-50 transition-all active:scale-95 disabled:hover:scale-100"
              >
                Save Medication
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const NotificationPreferencesModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { userProfile, setUserProfile } = useMedStore();
  const [prefs, setPrefs] = useState({
    reminderLeadTime: userProfile?.reminderLeadTime || 10,
    notifications: userProfile?.notifications || {
      browser: true,
      email: true,
      sms: false,
      sound: true
    }
  });

  useEffect(() => {
    if (userProfile) {
      setPrefs({
        reminderLeadTime: userProfile.reminderLeadTime,
        notifications: { ...userProfile.notifications }
      });
    }
  }, [userProfile, isOpen]);

  const handleSave = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await syncProfile(session.user.id, { ...userProfile, ...prefs });
      }
      if (userProfile) {
        setUserProfile({ ...userProfile, ...prefs });
      }
      onClose();
    } catch (e) {
      alert("Error saving preferences.");
    }
  };

  const toggleNotification = (key: keyof typeof prefs.notifications) => {
    setPrefs({
      ...prefs,
      notifications: {
        ...prefs.notifications,
        [key]: !prefs.notifications[key]
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-sage-900/40 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-xl bg-[var(--card-bg)] rounded-[3rem] shadow-2xl overflow-hidden p-12 border border-sage-100">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-4xl font-serif font-bold text-cream">Notifications</h2>
              <button onClick={onClose} className="p-3 hover:bg-sage-50 rounded-2xl transition-all"><X className="w-7 h-7 text-text-muted" /></button>
            </div>

            <div className="space-y-10">
              <section>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-6">Reminder Lead Time</label>
                <div className="flex items-center gap-6">
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={prefs.reminderLeadTime}
                    onChange={e => setPrefs({ ...prefs, reminderLeadTime: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-sage-50 rounded-lg appearance-none cursor-pointer accent-sage-700"
                  />
                  <span className="min-w-[80px] text-center font-bold text-sage-700 bg-sage-50 px-4 py-2 rounded-xl">
                    {prefs.reminderLeadTime} min
                  </span>
                </div>
                <p className="text-sm text-text-muted mt-4 italic">How long before your dose should we remind you?</p>
              </section>

              <section className="space-y-4">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-6">Delivery Methods</label>
                {[
                  { key: 'browser', label: 'Browser Notifications', icon: Bell },
                  { key: 'email', label: 'Email Alerts', icon: MessageSquare },
                  { key: 'sms', label: 'SMS Reminders', icon: Phone },
                  { key: 'sound', label: 'Sound Alerts', icon: prefs.notifications.sound ? Volume2 : VolumeX }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => toggleNotification(item.key as any)}
                    className={cn(
                      "w-full p-6 rounded-2xl flex items-center justify-between transition-all border-2",
                      prefs.notifications[item.key as keyof typeof prefs.notifications]
                        ? "bg-sage-50 border-sage-100"
                        : "bg-[var(--card-bg)] border-transparent hover:bg-sage-50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        prefs.notifications[item.key as keyof typeof prefs.notifications] ? "bg-sage-700 text-white" : "bg-sage-50 text-text-muted"
                      )}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-cream">{item.label}</span>
                    </div>
                    <div className={cn(
                      "w-12 h-6 rounded-full relative transition-all",
                      prefs.notifications[item.key as keyof typeof prefs.notifications] ? "bg-sage-700" : "bg-sage-100"
                    )}>
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                        prefs.notifications[item.key as keyof typeof prefs.notifications] ? "left-7" : "left-1"
                      )} />
                    </div>
                  </button>
                ))}
              </section>

              <button onClick={handleSave} className="w-full bg-sage-700 text-white py-6 rounded-[2rem] font-bold text-xl shadow-2xl shadow-sage-700/20 hover:bg-sage-800 transition-all active:scale-95">
                Save Preferences
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const EditProfileModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { userProfile, setUserProfile } = useMedStore();
  const [profile, setProfile] = useState({
    name: userProfile?.name || '',
    setupFor: userProfile?.setupFor || 'myself',
    patientName: userProfile?.patientName || ''
  });

  useEffect(() => {
    if (userProfile) {
      setProfile({
        name: userProfile.name,
        setupFor: userProfile.setupFor,
        patientName: userProfile.patientName || ''
      });
    }
  }, [userProfile, isOpen]);

  const handleSave = async () => {
    if (!profile.name) return;
    try {
      const updatedProfile = { ...userProfile!, ...profile };
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await syncProfile(session.user.id, updatedProfile);
      }
      setUserProfile(updatedProfile);
      onClose();
    } catch (e) {
      alert("Error updating profile.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-sage-900/40 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-xl bg-[var(--card-bg)] rounded-[3rem] shadow-2xl overflow-hidden p-12 border border-[var(--card-border)]">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-4xl font-serif font-bold text-cream">Edit Profile</h2>
              <button onClick={onClose} className="p-3 hover:bg-[var(--surface-tint)] rounded-2xl transition-all"><X className="w-7 h-7 text-[var(--text-muted)]" /></button>
            </div>
            <div className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Your Name</label>
                  <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full px-8 py-5 bg-[var(--surface-tint)] border-none rounded-[1.5rem] outline-none text-lg font-medium text-primary placeholder:text-[var(--text-muted)]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Managing For</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['myself', 'someone_else'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setProfile({ ...profile, setupFor: opt as any })}
                        className={cn(
                          "py-4 rounded-2xl font-bold capitalize border-2 transition-all",
                          profile.setupFor === opt ? "bg-sage-700 text-[var(--text-on-accent)] border-sage-700" : "bg-[var(--surface-tint)] text-[var(--text-muted)] border-[var(--surface-tint)] hover:border-[var(--card-border)]"
                        )}
                      >
                        {opt.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                {profile.setupFor === 'someone_else' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Patient Name</label>
                    <input type="text" value={profile.patientName} onChange={e => setProfile({ ...profile, patientName: e.target.value })} className="w-full px-8 py-5 bg-[var(--surface-tint)] border-none rounded-[1.5rem] outline-none text-lg font-medium text-primary placeholder:text-[var(--text-muted)]" />
                  </motion.div>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 bg-[var(--surface-tint)] text-primary py-6 rounded-[2rem] font-bold text-xl hover:bg-[var(--card-border)] transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!profile.name || (profile.setupFor === 'someone_else' && !profile.patientName)}
                  className="flex-[2] bg-sage-700 text-[var(--text-on-accent)] py-6 rounded-[2rem] font-bold text-xl shadow-2xl shadow-sage-700/20 hover:bg-sage-800 disabled:opacity-50 transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const PrivacyModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-sage-900/40 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-[var(--card-bg)] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-sage-100">
            <div className="p-12 border-b border-sage-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-sage-50 text-sage-600 rounded-2xl flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-4xl font-serif font-bold text-cream">Privacy & Data</h2>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-sage-50 rounded-2xl transition-all"><X className="w-7 h-7 text-text-muted" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              <div className="space-y-10">
                <div className="bg-[var(--surface-tint)] p-8 rounded-[2rem] border border-sage-100">
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-3">
                    <Lock className="w-5 h-5 text-sage-600" />
                    How We Handle Your Data
                  </h3>
                  <p className="text-text-muted leading-relaxed">
                    MediSafe is designed with a "privacy-first" approach. Most of your sensitive health data stays right on your device.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-[var(--card-bg)] border border-sage-100 rounded-2xl">
                    <h4 className="font-bold text-cream mb-2 uppercase text-xs tracking-widest">Local Storage</h4>
                    <p className="text-sm text-text-muted">Medication names, dosages, and schedules are stored in your browser's secure data storage.</p>
                  </div>
                  <div className="p-6 bg-[var(--card-bg)] border border-sage-100 rounded-2xl">
                    <h4 className="font-bold text-cream mb-2 uppercase text-xs tracking-widest">Cloud Sync</h4>
                    <p className="text-sm text-text-muted">If you're signed in, your data is encrypted and synced with our secure database for cross-device access.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-cream">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    {[
                      { q: "Do you sell my health data?", a: "Absolutely not. We never sell your personal information or health records to third-party advertisers or insurance companies." },
                      { q: "Is my data encrypted?", a: "Yes, all data transmitted between your device and our servers is encrypted using industry-standard TLS protocols. Your account can also be secured with 2FA." },
                      { q: "Can I delete my data?", a: "Yes, you can use the 'Clear All Data' option in Settings to wipe your account and local storage at any time." }
                    ].map((item, i) => (
                      <div key={i} className="p-6 rounded-2xl border border-sage-100 bg-[var(--surface-tint)]">
                        <p className="font-bold text-primary mb-2 text-sm">{item.q}</p>
                        <p className="text-xs text-text-muted leading-relaxed">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-sage-600/10 rounded-[2rem] border border-sage-600/20">
                  <p className="text-xs text-sage-600 font-medium leading-relaxed italic">
                    "Your health is personal. Our mission is to provide the best tools for medication management without compromising your digital rights."
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8 border-t border-sage-100 flex justify-end shrink-0">
              <button onClick={onClose} className="px-10 py-4 bg-sage-700 text-white rounded-[1.5rem] font-bold text-lg hover:bg-sage-800 transition-all active:scale-95 shadow-xl shadow-sage-700/20">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const SupportModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-sage-900/40 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-[var(--card-bg)] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-sage-100">
            <div className="p-12 border-b border-sage-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center shadow-sm">
                  <Info className="w-8 h-8" />
                </div>
                <h2 className="text-4xl font-serif font-bold text-cream">Help & Support</h2>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-sage-50 rounded-2xl transition-all"><X className="w-7 h-7 text-text-muted" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              <div className="space-y-10">
                <section>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-muted mb-6">Quick Guide</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: "Adding Meds", desc: "Tap the + icon on the dashboard to add a new medication and set its schedule." },
                      { title: "Tracking", desc: "Mark medications as 'Taken' to track your adherence and see your trends." },
                      { title: "AI Assistant", desc: "Ask our MediAI questions about interactions, food warnings, or missed doses." },
                      { title: "Syncing", desc: "Sign in with Google to sync your data across your phone and tablet." }
                    ].map((step, i) => (
                      <div key={i} className="p-5 bg-[var(--surface-tint)] rounded-2xl border border-sage-100 group hover:bg-[var(--card-bg)] hover:shadow-xl hover:shadow-primary/5 transition-all">
                        <div className="w-8 h-8 bg-[var(--card-bg)] rounded-lg flex items-center justify-center text-xs font-bold text-primary mb-3 shadow-sm group-hover:bg-primary group-hover:text-[var(--text-on-accent)] transition-colors border border-sage-100">
                          {i + 1}
                        </div>
                        <h4 className="font-bold text-primary text-sm mb-1">{step.title}</h4>
                        <p className="text-xs text-text-muted leading-relaxed">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10">
                  <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-accent" />
                    Contact Support
                  </h3>
                  <p className="text-sm text-text-muted mb-6 leading-relaxed">
                    Having trouble? Our support team is here to help you get the most out of MediSafe.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a href="mailto:support@medisafe.example" className="flex-1 flex items-center justify-center gap-3 bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                      Email Support
                    </a>
                    <button className="flex-1 flex items-center justify-center gap-3 bg-[var(--card-bg)] text-primary border border-sage-100 py-4 rounded-xl font-bold hover:bg-sage-50 transition-all">
                      Live Chat
                    </button>
                  </div>
                </section>

                <div className="flex items-center justify-center gap-8 py-4 opacity-40">
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Version</p>
                    <p className="text-sm font-bold text-primary">1.0.0 (Beta)</p>
                  </div>
                  <div className="w-px h-8 bg-sage-200" />
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Status</p>
                    <p className="text-sm font-bold text-primary">All Systems Operational</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8 border-t border-sage-100 flex justify-end shrink-0">
              <button onClick={onClose} className="px-10 py-4 bg-accent text-white rounded-[1.5rem] font-bold text-lg hover:bg-accent/90 transition-all active:scale-95 shadow-xl shadow-accent/20">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Sidebar Component ---

const Sidebar = ({ currentScreen, setScreen, onClose, isMobile = false }: { currentScreen: string, setScreen: (s: any) => void, onClose?: () => void, isMobile?: boolean }) => {
  const { userProfile, theme, setTheme, isSidebarCollapsed, setIsSidebarCollapsed, logout } = useMedStore();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'interactions', label: 'Safety Check', icon: ShieldCheck },
    { id: 'schedule', label: 'Calendar & Schedule', icon: CalendarRange },
    { id: 'chat', label: 'MediAI Assistant', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const collapsed = isSidebarCollapsed && !isMobile;

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-[#0F3D3E] text-white transition-all duration-500 ease-in-out relative border-r border-white/5",
        collapsed ? "w-[80px]" : "w-[260px]",
        isMobile ? "w-full" : ""
      )}
    >
      {/* Logo Section */}
      <div className={cn("p-4 mb-6 flex items-center", collapsed ? "justify-center" : "")}>
        {collapsed ? (
          /* Collapsed — show only the shield icon portion */
          <div className="group cursor-pointer">
            <svg width="40" height="40" viewBox="0 0 100 100" className="h-10 w-auto group-hover:scale-105 transition-transform duration-300 drop-shadow-md">
              <path d="M 50 10 L 15 20 C 15 60 30 85 50 95 Z" fill="#3B82F6" />
              <path d="M 50 10 L 85 20 C 85 60 70 85 50 95 Z" fill="#10B981" />
              <rect x="42" y="30" width="16" height="40" rx="4" fill="white" />
              <rect x="30" y="42" width="40" height="16" rx="4" fill="white" />
            </svg>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <svg width="36" height="36" viewBox="0 0 100 100" className="h-9 w-auto group-hover:scale-105 transition-transform duration-300 drop-shadow-md">
              <path d="M 50 10 L 15 20 C 15 60 30 85 50 95 Z" fill="#3B82F6" />
              <path d="M 50 10 L 85 20 C 85 60 70 85 50 95 Z" fill="#10B981" />
              <rect x="42" y="30" width="16" height="40" rx="4" fill="white" />
              <rect x="30" y="42" width="40" height="16" rx="4" fill="white" />
            </svg>
            <span className="text-2xl font-serif font-bold tracking-tight text-white group-hover:text-accent transition-colors">
              MediSafe
            </span>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setScreen(item.id);
                onClose?.();
              }}
              className={cn(
                "w-full flex items-center gap-4 px-3 py-3 rounded-xl font-medium transition-all group relative",
                isActive
                  ? "bg-white/10 text-accent shadow-sm"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute left-0 w-1 h-6 bg-accent rounded-r-full"
                />
              )}
              <item.icon className={cn(
                "w-6 h-6 shrink-0 transition-transform group-hover:scale-110",
                isActive ? "text-accent" : "text-white/40 group-hover:text-white"
              )} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
              {collapsed && (
                <div className="absolute left-16 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle (Desktop only) */}
      {!isMobile && (
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-24 w-6 h-6 bg-[#0F3D3E] border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:border-accent hover:text-accent shadow-xl z-50 transition-all active:scale-90"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Divider */}
      <div className="mx-4 h-px bg-white/5 mb-6" />

      {/* User & Theme Toggle Section */}
      <div className="p-4 mt-auto">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-2xl bg-white/5 border border-white/10 transition-all",
          collapsed ? "flex-col justify-center" : "justify-between"
        )}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-accent/20 text-accent rounded-xl flex items-center justify-center font-bold text-lg border border-accent/20 shrink-0 relative overflow-hidden">
              {userProfile?.name?.[0] || 'U'}
              <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 border border-[#0F3D3E] rounded-full" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-bold truncate leading-none mb-1">{userProfile?.name || 'User'}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] text-white/40 uppercase tracking-widest font-black">Premium Account</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={cn(
                "p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-accent shrink-0",
                collapsed ? "w-10 h-10 flex items-center justify-center" : ""
              )}
              title={collapsed ? "Toggle Theme" : undefined}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => {
                supabase.auth.signOut();
                logout();
              }}
              className={cn(
                "p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all text-red-400 shrink-0",
                collapsed ? "w-10 h-10 flex items-center justify-center" : ""
              )}
              title={collapsed ? "Sign Out" : undefined}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const {
    medications,
    interactions,
    userProfile,
    hasCompletedOnboarding,
    currentScreen,
    addMedication,
    clearMedications,
    setInteractions,
    setUserProfile,
    setHasCompletedOnboarding,
    isTwoFactorVerified,
    setTwoFactorVerified,
    setScreen,
    setLogs,
    theme,
    setTheme,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isSidebarVisible,
    setIsSidebarVisible,
    session,
    setSession,
    logout,
    setMedications,
    isLocalMode
  } = useMedStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Initial Sync from Local API — runs once on mount
  useEffect(() => {
    const sync = async () => {
      try {
        // Skip sync in local demo mode unless session exists
        if (isLocalMode) {
          setIsLoading(false);
          return;
        }

        const data = await fetchSession();
        if (data) {
          setSession(data.session);
          setUserProfile(data.profile);
          setHasCompletedOnboarding(true);

          // 2. Sync Medications
          const medsData = await fetchMedications();
          if (medsData) {
            setMedications(medsData.map((m: any) => ({
              id: m.id,
              name: m.name,
              dosage: m.dosage,
              frequency: m.frequency,
              times: m.times,
              foodRequirement: m.food_requirement,
              notes: m.notes,
              imageUrl: m.image_url
            })));
          }

          // 3. Sync Logs
          const logsData = await fetchTodayLogs();
          if (logsData) {
            setLogs(logsData.map((l: any) => ({
              id: l.id,
              medicationId: l.medication_id,
              scheduledTime: l.scheduled_time,
              status: l.status,
              takenAt: l.taken_at
            })));
          }
        }
      } catch (e) {
        console.error("API Sync failed", e);
      } finally {
        setIsLoading(false);
      }
    };
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hasCompletedOnboarding && currentScreen === 'landing') {
      setScreen('dashboard');
    }
  }, [hasCompletedOnboarding, currentScreen]);

  useEffect(() => {
    if (medications.length > 1) {
      const check = async () => {
        try {
          const results = await checkInteractions(medications);
          setInteractions(results.filter(i => i.severity !== 'none'));
        } catch (e) { console.error(e); }
      };
      check();
    }
  }, [medications]);

  useEffect(() => {
    if (Notification.permission === 'granted' && medications.length > 0) {
      const interval = setInterval(() => {
        const now = format(new Date(), 'HH:mm');
        medications.forEach(med => {
          if (med.times.includes(now)) {
            new Notification(`Time for ${med.name}`, {
              body: `Take ${med.dosage} ${med.foodRequirement !== 'none' ? `(${med.foodRequirement} food)` : ''}`,
            });
          }
        });
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [medications]);

  const renderScreen = () => {
    if (isLoading) return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

    // 2FA Verification Gate
    if (hasCompletedOnboarding && userProfile?.twoFactorEnabled && !isTwoFactorVerified) {
      return <TwoFactorVerifyScreen />;
    }

    // Public Route Check
    if (!session && !isLocalMode) {
      if (currentScreen === 'auth') return <AuthPage />;
      return <LandingPage />;
    }

    if (!hasCompletedOnboarding) return <OnboardingWizard />;

    switch (currentScreen) {
      case 'landing': return <LandingPage />;
      case 'auth': return <AuthPage />;
      case 'onboarding': return <OnboardingWizard />;
      case 'dashboard': return <Dashboard />;
      case 'interactions': return <InteractionReport />;
      case 'settings': return <Settings />;
      case 'schedule': return <ScheduleScreen />;
      case 'chat': return <ChatScreen />;
      default: return <Dashboard />;
    }
  };

  const showSidebar = hasCompletedOnboarding && !['landing', 'onboarding'].includes(currentScreen);

  return (
    <div className="font-sans antialiased text-primary bg-bg-base min-h-screen selection:bg-accent/10">
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        {showSidebar && (
          <aside
            className={cn(
              "hidden lg:block h-full transition-all duration-500 ease-in-out shrink-0 overflow-hidden",
              !isSidebarVisible ? "w-0" : isSidebarCollapsed ? "w-[80px]" : "w-[260px]"
            )}
          >
            <Sidebar currentScreen={currentScreen} setScreen={setScreen} />
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Mobile Header */}
          {showSidebar && (
            <header className="lg:hidden bg-[var(--card-bg)] border-b border-sage-100 h-16 flex items-center px-4 shrink-0 z-40">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-text-muted hover:text-primary transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3 ml-4 group">
                <svg width="32" height="32" viewBox="0 0 100 100" className="h-8 w-auto transition-transform duration-300 drop-shadow-md">
                  <path d="M 50 10 L 15 20 C 15 60 30 85 50 95 Z" fill="#3B82F6" />
                  <path d="M 50 10 L 85 20 C 85 60 70 85 50 95 Z" fill="#10B981" />
                  <rect x="42" y="30" width="16" height="40" rx="4" fill="white" />
                  <rect x="30" y="42" width="40" height="16" rx="4" fill="white" />
                </svg>
                <span className="text-xl font-serif font-bold tracking-tight text-primary">
                  MediSafe
                </span>
              </div>
              <button
                onClick={() => setScreen('settings')}
                className="ml-auto w-8 h-8 bg-sage-50 rounded-full flex items-center justify-center border border-sage-100 hover:bg-sage-100 transition-colors"
              >
                <SettingsIcon className="w-4 h-4 text-text-muted" />
              </button>
            </header>
          )}

          {/* Screen Content Wrapper */}
          <div className="flex-1 overflow-y-auto w-full relative">
            <div className={cn(
              "p-4 md:p-8 lg:p-10 w-full min-h-full transition-all duration-300",
              currentScreen === 'landing' ? "p-0 md:p-0 lg:p-0 max-w-none" : "max-w-[1600px] mx-auto"
            )}>
              {renderScreen()}
            </div>
          </div>
        </main>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-[100] lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute left-0 top-0 bottom-0 w-[280px] shadow-2xl"
              >
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-4 right-4 z-50 p-2 text-white/60 hover:text-white transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
                <Sidebar currentScreen={currentScreen} setScreen={setScreen} onClose={() => setIsMobileMenuOpen(false)} isMobile={true} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

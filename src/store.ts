import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Medication, Interaction } from './types';

interface UserProfile {
  name: string;
  setupFor: 'myself' | 'someone_else';
  patientName?: string;
  reminderLeadTime: number; // minutes
  notifications: {
    browser: boolean;
    email: boolean;
    sms: boolean;
    sound: boolean;
  };
  twoFactorEnabled?: boolean;
}

interface MedState {
  medications: Medication[];
  interactions: Interaction[];
  logs: any[];
  userProfile: UserProfile | null;
  hasCompletedOnboarding: boolean;
  isTwoFactorVerified: boolean;
  currentScreen: string;
  theme: 'light' | 'dark';
  isMobileMenuOpen: boolean;
  isSidebarCollapsed: boolean;
  isSidebarVisible: boolean;
  session: any | null;
  isLocalMode: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  setIsSidebarVisible: (visible: boolean) => void;
  setSession: (session: any | null) => void;
  setLocalMode: (isLocal: boolean) => void;
  logout: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setUserProfile: (profile: UserProfile) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setTwoFactorVerified: (verified: boolean) => void;
  setScreen: (screen: 'landing' | 'auth' | 'onboarding' | 'dashboard' | 'interactions' | 'settings' | 'schedule' | 'chat') => void;
  addMedication: (med: Medication) => void;
  updateMedication: (med: Medication) => void;
  removeMedication: (id: string) => void;
  clearMedications: () => void;
  setInteractions: (interactions: Interaction[]) => void;
  setLogs: (logs: any[]) => void;
  setMedications: (meds: Medication[]) => void;
}

export const useMedStore = create<MedState>()(
  persist(
    (set) => ({
      medications: [],
      interactions: [],
      logs: [],
      userProfile: null,
      hasCompletedOnboarding: false,
      isTwoFactorVerified: false,
      currentScreen: 'landing',
      theme: 'light',
      isMobileMenuOpen: false,
      isSidebarCollapsed: false,
      isSidebarVisible: true,
      session: null,
      isLocalMode: false,
      setIsMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
      setIsSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
      setIsSidebarVisible: (isSidebarVisible) => set({ isSidebarVisible }),
      setSession: (session) => set({ session }),
      setLocalMode: (isLocalMode) => set({ isLocalMode }),
      logout: () => set({
        session: null,
        userProfile: null,
        hasCompletedOnboarding: false,
        medications: [],
        currentScreen: 'landing',
        isLocalMode: false
      }),
      addMedication: (med) => set((state) => ({ medications: [...state.medications, med] })),
      updateMedication: (med) => set((state) => ({
        medications: state.medications.map((m) => m.id === med.id ? med : m)
      })),
      removeMedication: (id) => set((state) => ({ medications: state.medications.filter((m) => m.id !== id) })),
      clearMedications: () => set({ medications: [] }),
      setInteractions: (interactions) => set({ interactions }),
      setLogs: (logs) => set({ logs }),
      setTheme: (theme) => set({ theme }),
      setUserProfile: (userProfile) => set({ userProfile }),
      setHasCompletedOnboarding: (hasCompletedOnboarding) => set({ hasCompletedOnboarding }),
      setTwoFactorVerified: (isTwoFactorVerified) => set({ isTwoFactorVerified }),
      setScreen: (currentScreen) => set({ currentScreen }),
      setMedications: (medications) => set({ medications }),
    }),
    {
      name: 'medisafe-storage',
      partialize: (state) => {
        const { isTwoFactorVerified, ...rest } = state;
        return rest;
      },
    }
  )
);

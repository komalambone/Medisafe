import { supabase } from '../lib/supabase';
import { Medication } from '../types';

// Add this interface to handle types in the store
interface UserProfile {
    name: string;
    setupFor: 'myself' | 'someone_else';
    patientName?: string;
    reminderLeadTime: number;
    notifications: {
        browser: boolean;
        email: boolean;
        sms: boolean;
        sound: boolean;
    };
    twoFactorEnabled?: boolean;
}

const API_BASE = '/api';

export const fetchSession = async () => {
    const response = await fetch(`${API_BASE}/me`);
    const data = await response.json();
    if (data.authenticated) {
        return {
            session: {
                user: {
                    id: data.user.id,
                    email: data.user.email
                }
            },
            profile: {
                name: data.user.name,
                setupFor: data.user.setup_for,
                patientName: data.user.patient_name,
                reminderLeadTime: data.preferences.reminder_lead_minutes,
                notifications: {
                    browser: !!data.preferences.notifications_browser,
                    email: !!data.preferences.notifications_email,
                    sms: !!data.preferences.notifications_sms,
                    sound: !!data.preferences.notifications_sound
                },
                twoFactorEnabled: !!data.user.two_factor_enabled
            }
        };
    }
    return null;
};

export const syncMedication = async (_userId: string, med: Medication) => {
    const response = await fetch(`${API_BASE}/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(med)
    });
    return response.json();
};

export const deleteMedication = async (_userId: string, medId: string) => {
    const response = await fetch(`${API_BASE}/medications/${medId}`, {
        method: 'DELETE'
    });
    return response.json();
};

export const syncProfile = async (_userId: string, profile: UserProfile) => {
    await fetch(`${API_BASE}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: profile.name,
            setupFor: profile.setupFor,
            patientName: profile.patientName
        })
    });

    await fetch(`${API_BASE}/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            reminderLeadTime: profile.reminderLeadTime,
            notifications: profile.notifications
        })
    });
};

export const syncLog = async (_userId: string, log: any) => {
    await fetch(`${API_BASE}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
    });
};

export const fetchTodayLogs = async () => {
    const response = await fetch(`${API_BASE}/logs/today`);
    return response.json();
};

export const fetchMedications = async () => {
    const response = await fetch(`${API_BASE}/medications`);
    return response.json();
};

export const uploadMedicationImage = async (userId: string, file: File) => {
    // For local mode, we'll just return a base64 or a fake URL
    // since we don't have a real storage bucket locally usually, 
    // but the Supabase mock might work if it's set up.
    // For now, let's keep the mock approach for images or implement a simple upload.
    return URL.createObjectURL(file);
};

export const syncInteractions = async (userId: string, interactions: any[]) => {
    // Optionally sync interactions to profile safety_alerts field
};

export const clearAllMedications = async (_userId: string) => {
    await fetch(`${API_BASE}/medications`, {
        method: 'DELETE'
    });
};

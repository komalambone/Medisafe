import express from "express";
import { createClient } from "@supabase/supabase-js";
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
}

const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseKey || "placeholder");

const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

const MOCK_USER_ID = "user_123";

app.get("/api/me", async (req, res) => {
    const { data: user } = await supabase.from('users').select('*').eq('id', MOCK_USER_ID).single();
    if (!user) {
        return res.json({ authenticated: false });
    }
    const { data: prefs } = await supabase.from('user_preferences').select('*').eq('user_id', MOCK_USER_ID).single();
    res.json({ authenticated: true, user, preferences: prefs });
});

app.post("/api/setup", async (req, res) => {
    const { name, setupFor, patientName, reminderLeadTime, notifications } = req.body;

    await supabase.from('users').upsert({
        id: MOCK_USER_ID,
        email: "user@example.com",
        name,
        setup_for: setupFor,
        patient_name: patientName
    });

    await supabase.from('user_preferences').upsert({
        user_id: MOCK_USER_ID,
        reminder_lead_minutes: reminderLeadTime || 10,
        notifications_browser: notifications?.browser ? 1 : 0,
        notifications_email: notifications?.email ? 1 : 0,
        notifications_sms: notifications?.sms ? 1 : 0,
        notifications_sound: notifications?.sound ? 1 : 0
    });

    res.json({ success: true });
});

app.get("/api/medications", async (req, res) => {
    const { data: meds } = await supabase.from('medications')
        .select('*')
        .eq('user_id', MOCK_USER_ID)
        .eq('is_active', 1);

    if (!meds) return res.json([]);
    res.json(meds.map(m => ({
        ...m,
        times: typeof m.times === 'string' ? JSON.parse(m.times) : m.times
    })));
});

app.post("/api/medications", async (req, res) => {
    const { id, name, dosage, frequency, times, foodRequirement, notes } = req.body;
    await supabase.from('medications').upsert({
        id,
        user_id: MOCK_USER_ID,
        name,
        dosage,
        frequency,
        times,
        food_requirement: foodRequirement,
        notes,
        is_active: 1
    });
    res.json({ success: true });
});

app.delete("/api/medications/:id", async (req, res) => {
    await supabase.from('medications').update({ is_active: 0 }).eq('id', req.params.id).eq('user_id', MOCK_USER_ID);
    res.json({ success: true });
});

app.delete("/api/medications", async (req, res) => {
    await supabase.from('medications').update({ is_active: 0 }).eq('user_id', MOCK_USER_ID);
    res.json({ success: true });
});

app.put("/api/medications/:id", async (req, res) => {
    const { name, dosage, frequency, times, foodRequirement, notes } = req.body;
    await supabase.from('medications').update({
        name,
        dosage,
        frequency,
        times,
        food_requirement: foodRequirement,
        notes
    }).eq('id', req.params.id).eq('user_id', MOCK_USER_ID);
    res.json({ success: true });
});

app.post("/api/profile", async (req, res) => {
    const { name, setupFor, patientName } = req.body;
    await supabase.from('users').update({
        name,
        setup_for: setupFor,
        patient_name: patientName
    }).eq('id', MOCK_USER_ID);
    res.json({ success: true });
});

app.post("/api/preferences", async (req, res) => {
    const { reminderLeadTime, notifications } = req.body;
    await supabase.from('user_preferences').update({
        reminder_lead_minutes: reminderLeadTime,
        notifications_browser: notifications.browser ? 1 : 0,
        notifications_email: notifications.email ? 1 : 0,
        notifications_sms: notifications.sms ? 1 : 0,
        notifications_sound: notifications.sound ? 1 : 0
    }).eq('user_id', MOCK_USER_ID);
    res.json({ success: true });
});

app.get("/api/logs/today", async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const { data: logs } = await supabase.from('reminder_logs')
        .select('*')
        .eq('user_id', MOCK_USER_ID)
        .gte('created_at', today);
    res.json(logs || []);
});

app.post("/api/logs", async (req, res) => {
    const { id, medicationId, scheduledTime, status, takenAt } = req.body;
    await supabase.from('reminder_logs').upsert({
        id: id || crypto.randomUUID(),
        user_id: MOCK_USER_ID,
        medication_id: medicationId,
        scheduled_time: scheduledTime,
        status,
        taken_at: takenAt
    });
    res.json({ success: true });
});

app.post("/api/2fa/setup", async (req, res) => {
    const { data: user } = await supabase.from('users').select('*').eq('id', MOCK_USER_ID).single();
    if (!user) return res.status(404).json({ error: "User not found" });

    const secret = speakeasy.generateSecret({ name: `MediSafe (${user.email || "user@medisafe.app"})` });
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || "");

    res.json({ secret: secret.base32, qrCodeUrl });
});

app.post("/api/2fa/enable", async (req, res) => {
    const { secret, token } = req.body;
    const isValid = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token
    });

    if (isValid) {
        const recoveryCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex'));
        await supabase.from('users').update({
            two_factor_secret: secret,
            two_factor_enabled: 1,
            recovery_codes: JSON.stringify(recoveryCodes)
        }).eq('id', MOCK_USER_ID);
        res.json({ success: true, recoveryCodes });
    } else {
        res.status(400).json({ error: "Invalid token" });
    }
});

app.post("/api/2fa/recovery", async (req, res) => {
    const { code } = req.body;
    const { data: user } = await supabase.from('users').select('*').eq('id', MOCK_USER_ID).single();

    if (!user || !user.recovery_codes) return res.status(400).json({ error: "No recovery codes found" });

    const codes = typeof user.recovery_codes === 'string' ? JSON.parse(user.recovery_codes) : user.recovery_codes;
    const index = codes.indexOf(code);

    if (index !== -1) {
        codes.splice(index, 1);
        await supabase.from('users').update({ recovery_codes: JSON.stringify(codes) }).eq('id', MOCK_USER_ID);
        res.json({ success: true });
    } else {
        res.status(400).json({ error: "Invalid recovery code" });
    }
});

app.post("/api/2fa/disable", async (req, res) => {
    const { token } = req.body;
    const { data: user } = await supabase.from('users').select('*').eq('id', MOCK_USER_ID).single();

    if (!user || !user.two_factor_secret) return res.status(400).json({ error: "2FA not enabled" });

    const isValid = speakeasy.totp.verify({ secret: user.two_factor_secret, encoding: 'base32', token: token });

    if (isValid) {
        await supabase.from('users').update({
            two_factor_secret: null,
            two_factor_enabled: 0,
            recovery_codes: null
        }).eq('id', MOCK_USER_ID);
        res.json({ success: true });
    } else {
        res.status(400).json({ error: "Invalid token" });
    }
});

app.post("/api/2fa/verify", async (req, res) => {
    const { token } = req.body;
    const { data: user } = await supabase.from('users').select('*').eq('id', MOCK_USER_ID).single();

    if (!user || !user.two_factor_secret) return res.status(400).json({ error: "2FA not enabled" });

    const isValid = speakeasy.totp.verify({ secret: user.two_factor_secret, encoding: 'base32', token: token });

    if (isValid) {
        res.json({ success: true });
    } else {
        res.status(400).json({ error: "Invalid token" });
    }
});

export default app;

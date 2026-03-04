import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from 'url';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = process.env.DATABASE_URL || "medisafe.db";
const db = new Database(dbFile);

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    setup_for TEXT,
    patient_name TEXT,
    two_factor_secret TEXT,
    two_factor_enabled INTEGER DEFAULT 0,
    recovery_codes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS medications (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT,
    dosage TEXT,
    frequency TEXT,
    times TEXT, -- JSON array
    food_requirement TEXT,
    notes TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reminder_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    medication_id TEXT,
    scheduled_time TEXT,
    status TEXT, -- PENDING, TAKEN, SKIPPED
    taken_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(medication_id) REFERENCES medications(id)
  );

  CREATE TABLE IF NOT EXISTS user_preferences (
    user_id TEXT PRIMARY KEY,
    reminder_lead_minutes INTEGER DEFAULT 10,
    notifications_browser INTEGER DEFAULT 1,
    notifications_email INTEGER DEFAULT 1,
    notifications_sms INTEGER DEFAULT 0,
    notifications_sound INTEGER DEFAULT 1,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Migration: Add notifications_sound if it doesn't exist
try {
  const tableInfo = db.prepare("PRAGMA table_info(user_preferences)").all() as any[];
  const hasSound = tableInfo.some(col => col.name === 'notifications_sound');
  if (!hasSound) {
    db.exec("ALTER TABLE user_preferences ADD COLUMN notifications_sound INTEGER DEFAULT 1;");
    console.log("Migration: Added notifications_sound to user_preferences");
  }
} catch (e) {
  console.error("Migration error (user_preferences):", e);
}

try {
  const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
  const hasRecovery = tableInfo.some(col => col.name === 'recovery_codes');
  if (!hasRecovery) {
    db.exec("ALTER TABLE users ADD COLUMN recovery_codes TEXT;");
    console.log("Migration: Added recovery_codes to users");
  }
} catch (e) {
  console.error("Migration error (users):", e);
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // --- API Routes ---

  // Mock Auth - In a real app, this would be a proper session/JWT
  const MOCK_USER_ID = "user_123";

  app.get("/api/me", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(MOCK_USER_ID);
    if (!user) {
      return res.json({ authenticated: false });
    }
    const prefs = db.prepare("SELECT * FROM user_preferences WHERE user_id = ?").get(MOCK_USER_ID);
    res.json({ authenticated: true, user, preferences: prefs });
  });

  app.post("/api/setup", (req, res) => {
    const { name, setupFor, patientName, reminderLeadTime, notifications } = req.body;
    db.prepare("INSERT OR REPLACE INTO users (id, email, name, setup_for, patient_name) VALUES (?, ?, ?, ?, ?)")
      .run(MOCK_USER_ID, "user@example.com", name, setupFor, patientName);

    db.prepare(`
      INSERT INTO user_preferences (user_id, reminder_lead_minutes, notifications_browser, notifications_email, notifications_sms, notifications_sound)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        reminder_lead_minutes = excluded.reminder_lead_minutes,
        notifications_browser = excluded.notifications_browser,
        notifications_email = excluded.notifications_email,
        notifications_sms = excluded.notifications_sms,
        notifications_sound = excluded.notifications_sound
    `).run(
      MOCK_USER_ID,
      reminderLeadTime || 10,
      notifications?.browser ? 1 : 0,
      notifications?.email ? 1 : 0,
      notifications?.sms ? 1 : 0,
      notifications?.sound ? 1 : 0
    );

    res.json({ success: true });
  });

  app.get("/api/medications", (req, res) => {
    const meds = db.prepare("SELECT * FROM medications WHERE user_id = ? AND is_active = 1").all(MOCK_USER_ID);
    res.json(meds.map(m => ({
      ...m,
      times: JSON.parse(m.times as string)
    })));
  });

  app.post("/api/medications", (req, res) => {
    const { id, name, dosage, frequency, times, foodRequirement, notes } = req.body;
    db.prepare(`
      INSERT INTO medications (id, user_id, name, dosage, frequency, times, food_requirement, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, MOCK_USER_ID, name, dosage, frequency, JSON.stringify(times), foodRequirement, notes);
    res.json({ success: true });
  });

  app.delete("/api/medications/:id", (req, res) => {
    db.prepare("UPDATE medications SET is_active = 0 WHERE id = ? AND user_id = ?").run(req.params.id, MOCK_USER_ID);
    res.json({ success: true });
  });

  app.delete("/api/medications", (req, res) => {
    db.prepare("UPDATE medications SET is_active = 0 WHERE user_id = ?").run(MOCK_USER_ID);
    res.json({ success: true });
  });

  app.put("/api/medications/:id", (req, res) => {
    const { name, dosage, frequency, times, foodRequirement, notes } = req.body;
    db.prepare(`
      UPDATE medications 
      SET name = ?, dosage = ?, frequency = ?, times = ?, food_requirement = ?, notes = ?
      WHERE id = ? AND user_id = ?
    `).run(name, dosage, frequency, JSON.stringify(times), foodRequirement, notes, req.params.id, MOCK_USER_ID);
    res.json({ success: true });
  });

  app.post("/api/profile", (req, res) => {
    const { name, setupFor, patientName } = req.body;
    db.prepare("UPDATE users SET name = ?, setup_for = ?, patient_name = ? WHERE id = ?")
      .run(name, setupFor, patientName, MOCK_USER_ID);
    res.json({ success: true });
  });

  app.post("/api/preferences", (req, res) => {
    const { reminderLeadTime, notifications } = req.body;
    db.prepare(`
      UPDATE user_preferences 
      SET reminder_lead_minutes = ?, 
          notifications_browser = ?, 
          notifications_email = ?, 
          notifications_sms = ?, 
          notifications_sound = ?
      WHERE user_id = ?
    `).run(
      reminderLeadTime,
      notifications.browser ? 1 : 0,
      notifications.email ? 1 : 0,
      notifications.sms ? 1 : 0,
      notifications.sound ? 1 : 0,
      MOCK_USER_ID
    );
    res.json({ success: true });
  });

  app.get("/api/logs/today", (req, res) => {
    const logs = db.prepare(`
      SELECT * FROM reminder_logs 
      WHERE user_id = ? AND date(created_at) = date('now')
    `).all(MOCK_USER_ID);
    res.json(logs);
  });

  app.post("/api/logs", (req, res) => {
    const { id, medicationId, scheduledTime, status, takenAt } = req.body;
    db.prepare(`
      INSERT INTO reminder_logs (id, user_id, medication_id, scheduled_time, status, taken_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id || crypto.randomUUID(), MOCK_USER_ID, medicationId, scheduledTime, status, takenAt);
    res.json({ success: true });
  });

  // --- 2FA Routes ---
  app.post("/api/2fa/setup", async (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(MOCK_USER_ID) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    const secret = speakeasy.generateSecret({ name: `MediSafe (${user.email || "user@medisafe.app"})` });
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || "");

    res.json({ secret: secret.base32, qrCodeUrl });
  });

  app.post("/api/2fa/enable", (req, res) => {
    const { secret, token } = req.body;
    const isValid = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token
    });

    if (isValid) {
      // Generate 10 recovery codes
      const recoveryCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex'));
      db.prepare("UPDATE users SET two_factor_secret = ?, two_factor_enabled = 1, recovery_codes = ? WHERE id = ?")
        .run(secret, JSON.stringify(recoveryCodes), MOCK_USER_ID);
      res.json({ success: true, recoveryCodes });
    } else {
      res.status(400).json({ error: "Invalid token" });
    }
  });

  app.post("/api/2fa/recovery", (req, res) => {
    const { code } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(MOCK_USER_ID) as any;

    if (!user || !user.recovery_codes) {
      return res.status(400).json({ error: "No recovery codes found" });
    }

    const codes = JSON.parse(user.recovery_codes);
    const index = codes.indexOf(code);

    if (index !== -1) {
      // Remove used code
      codes.splice(index, 1);
      db.prepare("UPDATE users SET recovery_codes = ? WHERE id = ?")
        .run(JSON.stringify(codes), MOCK_USER_ID);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Invalid recovery code" });
    }
  });

  app.post("/api/2fa/disable", (req, res) => {
    const { token } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(MOCK_USER_ID) as any;

    if (!user || !user.two_factor_secret) {
      return res.status(400).json({ error: "2FA not enabled" });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: token
    });

    if (isValid) {
      db.prepare("UPDATE users SET two_factor_secret = NULL, two_factor_enabled = 0, recovery_codes = NULL WHERE id = ?")
        .run(MOCK_USER_ID);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Invalid token" });
    }
  });

  app.post("/api/2fa/verify", (req, res) => {
    const { token } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(MOCK_USER_ID) as any;

    if (!user || !user.two_factor_secret) {
      return res.status(400).json({ error: "2FA not enabled" });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: token
    });

    if (isValid) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Invalid token" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

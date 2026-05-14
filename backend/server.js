const express = require('express');
const session = require('express-session');
const cors    = require('cors');
const path    = require('path');

const authRoutes    = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const portalRoutes  = require('./routes/portalRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS — allow frontend origin ──────────────────────────
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// ── Body parsing ──────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Session ───────────────────────────────────────────────
app.use(session({
  secret: 'sms_secret_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 2, sameSite: 'lax' }
}));

// ── API Routes ────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/portal',   portalRoutes);

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SMS Backend API is running.', port: PORT });
});

// ── 404 for unknown API routes ────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

app.listen(PORT, () => {
  console.log('\n🎓 Smart Student Management System — BACKEND');
  console.log(`🚀 API running at http://localhost:${PORT}/api`);
  console.log(`📋 Admin:   POST /api/auth/admin/login   { username, password }`);
  console.log(`🎓 Student: POST /api/auth/student/login { usn, password }\n`);
});

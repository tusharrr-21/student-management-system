const express = require('express');
const router = express.Router();
const { validateAdmin } = require('../models/adminModel');
const { validateStudent } = require('../models/studentModel');

// POST /api/auth/admin/login
router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: 'Username and password required.' });

  const admin = validateAdmin(username, password);
  if (!admin)
    return res.status(401).json({ success: false, message: 'Invalid username or password.' });

  req.session.admin = admin;
  res.json({ success: true, message: 'Login successful.', data: admin });
});

// POST /api/auth/student/login
router.post('/student/login', (req, res) => {
  const { usn, password } = req.body;
  if (!usn || !password)
    return res.status(400).json({ success: false, message: 'USN and password required.' });

  const student = validateStudent(usn, password);
  if (!student)
    return res.status(401).json({ success: false, message: 'Invalid USN or password.' });

  req.session.student = { id: student.id, name: student.name, usn: student.usn };
  res.json({ success: true, message: 'Login successful.', data: req.session.student });
});

// POST /api/auth/admin/logout
router.post('/admin/logout', (req, res) => {
  req.session.admin = null;
  res.json({ success: true, message: 'Logged out.' });
});

// POST /api/auth/student/logout
router.post('/student/logout', (req, res) => {
  req.session.student = null;
  res.json({ success: true, message: 'Logged out.' });
});

// GET /api/auth/admin/me
router.get('/admin/me', (req, res) => {
  if (req.session && req.session.admin)
    return res.json({ success: true, data: req.session.admin });
  res.status(401).json({ success: false, message: 'Not authenticated.' });
});

// GET /api/auth/student/me
router.get('/student/me', (req, res) => {
  if (req.session && req.session.student)
    return res.json({ success: true, data: req.session.student });
  res.status(401).json({ success: false, message: 'Not authenticated.' });
});

module.exports = router;

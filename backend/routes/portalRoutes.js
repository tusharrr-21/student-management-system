const express = require('express');
const router = express.Router();
const m = require('../models/studentModel');
const { requireStudent } = require('../middleware/auth');

// GET /api/portal/me — student's own full data
router.get('/me', requireStudent, (req, res) => {
  const student = m.getById(req.session.student.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
  const { password, ...safe } = student;
  res.json({ success: true, data: safe });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const m = require('../models/studentModel');
const { requireAdmin } = require('../middleware/auth');

// GET /api/students — list / search / filter
router.get('/', requireAdmin, (req, res) => {
  const { search, dept, sem } = req.query;
  let students = search ? m.search(search) : m.getAll();
  if (dept) students = students.filter(s => s.department === dept);
  if (sem)  students = students.filter(s => s.semester === sem);
  // Strip passwords before sending
  const safe = students.map(({ password, ...s }) => s);
  res.json({ success: true, count: safe.length, data: safe });
});

// GET /api/students/stats
router.get('/stats', requireAdmin, (req, res) => {
  const stats = m.getStats();
  res.json({ success: true, data: stats });
});

// GET /api/students/:id
router.get('/:id', requireAdmin, (req, res) => {
  const student = m.getById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
  const { password, ...safe } = student;
  res.json({ success: true, data: safe });
});

// POST /api/students
router.post('/', requireAdmin, (req, res) => {
  const { name, usn, department, semester, email } = req.body;
  if (!name || !usn || !department || !semester || !email)
    return res.status(400).json({ success: false, message: 'All required fields must be filled.' });

  const dup = m.getAll().find(s => s.usn.toLowerCase() === usn.trim().toLowerCase());
  if (dup) return res.status(409).json({ success: false, message: `USN "${usn.toUpperCase()}" already exists.` });

  const student = m.create(req.body);
  const { password, ...safe } = student;
  res.status(201).json({ success: true, message: 'Student added successfully.', data: safe });
});

// PUT /api/students/:id
router.put('/:id', requireAdmin, (req, res) => {
  const { name, usn, department, semester, email } = req.body;
  if (!name || !usn || !department || !semester || !email)
    return res.status(400).json({ success: false, message: 'All required fields must be filled.' });

  const dup = m.getAll().find(s => s.usn.toLowerCase() === usn.trim().toLowerCase() && s.id !== req.params.id);
  if (dup) return res.status(409).json({ success: false, message: `USN "${usn.toUpperCase()}" already exists.` });

  const student = m.update(req.params.id, req.body);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
  const { password, ...safe } = student;
  res.json({ success: true, message: 'Student updated successfully.', data: safe });
});

// DELETE /api/students/:id
router.delete('/:id', requireAdmin, (req, res) => {
  const deleted = m.remove(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Student not found.' });
  res.json({ success: true, message: 'Student deleted successfully.' });
});

module.exports = router;

const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = 3000;

app.use(express.static(path.join(__dirname)));

// Default routes
app.get('/',         (req, res) => res.redirect('/admin/login.html'));
app.get('/admin',    (req, res) => res.redirect('/admin/login.html'));
app.get('/student',  (req, res) => res.redirect('/student/login.html'));

app.listen(PORT, () => {
  console.log('\n🎓 Smart Student Management System — FRONTEND');
  console.log(`🌐 Frontend running at http://localhost:${PORT}`);
  console.log(`📋 Admin:   http://localhost:${PORT}/admin/login.html`);
  console.log(`🎓 Student: http://localhost:${PORT}/student/login.html\n`);
});

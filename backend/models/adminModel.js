const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(__dirname, '../data/admin.json');

function getAdmin() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return null; }
}

function validateAdmin(username, password) {
  const admin = getAdmin();
  if (!admin) return null;
  if (admin.username !== username || admin.password !== password) return null;
  return { username: admin.username, name: admin.name, email: admin.email, role: admin.role };
}

module.exports = { validateAdmin };

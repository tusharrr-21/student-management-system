const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(__dirname, '../data/students.json');

function read() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return []; }
}
function write(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getAll() { return read(); }

function getById(id) { return read().find(s => s.id === id) || null; }

function generateId() {
  const students = read();
  if (!students.length) return 'STU001';
  const max = Math.max(...students.map(s => parseInt(s.id.replace('STU', ''))));
  return `STU${String(max + 1).padStart(3, '0')}`;
}

function create(data) {
  const students = read();
  const firstName = data.name.trim().split(' ')[0].toLowerCase();
  const student = {
    id: generateId(),
    name: data.name.trim(),
    usn: data.usn.trim().toUpperCase(),
    department: data.department.trim(),
    semester: data.semester,
    email: data.email.trim().toLowerCase(),
    password: data.password || firstName + '123',
    attendance: parseInt(data.attendance) || 0,
    marks: {
      mathematics: parseInt(data.mathematics) || 0,
      physics:     parseInt(data.physics)     || 0,
      chemistry:   parseInt(data.chemistry)   || 0,
      programming: parseInt(data.programming) || 0,
      english:     parseInt(data.english)     || 0
    },
    createdAt: new Date().toISOString()
  };
  students.push(student);
  write(students);
  return student;
}

function update(id, data) {
  const students = read();
  const i = students.findIndex(s => s.id === id);
  if (i === -1) return null;
  students[i] = {
    ...students[i],
    name: data.name.trim(),
    usn: data.usn.trim().toUpperCase(),
    department: data.department.trim(),
    semester: data.semester,
    email: data.email.trim().toLowerCase(),
    attendance: parseInt(data.attendance) || 0,
    marks: {
      mathematics: parseInt(data.mathematics) || 0,
      physics:     parseInt(data.physics)     || 0,
      chemistry:   parseInt(data.chemistry)   || 0,
      programming: parseInt(data.programming) || 0,
      english:     parseInt(data.english)     || 0
    },
    updatedAt: new Date().toISOString()
  };
  write(students);
  return students[i];
}

function remove(id) {
  const students = read();
  const i = students.findIndex(s => s.id === id);
  if (i === -1) return false;
  students.splice(i, 1);
  write(students);
  return true;
}

function search(q) {
  const query = q.toLowerCase();
  return read().filter(s =>
    s.name.toLowerCase().includes(query) ||
    s.usn.toLowerCase().includes(query) ||
    s.email.toLowerCase().includes(query) ||
    s.id.toLowerCase().includes(query) ||
    s.department.toLowerCase().includes(query)
  );
}

function validateStudent(usn, password) {
  return read().find(
    s => s.usn.toLowerCase() === usn.trim().toLowerCase() && s.password === password
  ) || null;
}

function getStats() {
  const students = read();
  const total = students.length;
  const deptCounts = {}, semCounts = {};
  students.forEach(s => {
    deptCounts[s.department] = (deptCounts[s.department] || 0) + 1;
    semCounts[`Sem ${s.semester}`] = (semCounts[`Sem ${s.semester}`] || 0) + 1;
  });
  const avgAttendance = total ? Math.round(students.reduce((a, s) => a + s.attendance, 0) / total) : 0;
  const avgMarks = total ? Math.round(
    students.reduce((a, s) => {
      const vals = Object.values(s.marks);
      return a + vals.reduce((x, y) => x + y, 0) / vals.length;
    }, 0) / total
  ) : 0;
  return {
    total,
    departments: Object.keys(deptCounts).length,
    avgAttendance,
    avgMarks,
    lowAttendance: students.filter(s => s.attendance < 75).length,
    deptCounts,
    semCounts,
    recentStudents: students.slice(-5).reverse()
  };
}

module.exports = { getAll, getById, create, update, remove, search, validateStudent, getStats };

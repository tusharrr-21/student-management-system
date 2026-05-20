const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

const students = [
  { id: 1, name: 'Alice Johnson', usn: 'USN001', course: 'Computer Science' },
  { id: 2, name: 'Bob Smith', usn: 'USN002', course: 'Information Technology' },
  { id: 3, name: 'Carol Davis', usn: 'USN003', course: 'Electronics' },
  { id: 4, name: 'David Wilson', usn: 'USN004', course: 'Mechanical Engineering' }
];

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.get('/students', (req, res) => {
  res.json(students);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT}`);
});

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Kubernetes internal DNS name for backend service
const BACKEND_URL = process.env.BACKEND_URL || 'http://sms-backend-service:5000';

app.use(express.static(path.join(__dirname, 'public')));

// Proxy: browser calls frontend, frontend calls backend inside cluster/network
app.get('/students', async (req, res) => {
  try {
    const response = await fetch(`${BACKEND_URL}/students`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach backend', details: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend running on port ${PORT}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
});

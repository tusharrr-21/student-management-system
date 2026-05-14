/* ── Central API helper ─────────────────────────────────── */
const API = 'http://localhost:5000/api';

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(API + endpoint, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
    ...options
  });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, message: data.message || 'Request failed' };
  return data;
}

const api = {
  // Auth
  adminLogin:   (body) => apiFetch('/auth/admin/login',   { method: 'POST', body: JSON.stringify(body) }),
  adminLogout:  ()     => apiFetch('/auth/admin/logout',  { method: 'POST' }),
  adminMe:      ()     => apiFetch('/auth/admin/me'),
  studentLogin: (body) => apiFetch('/auth/student/login', { method: 'POST', body: JSON.stringify(body) }),
  studentLogout:()     => apiFetch('/auth/student/logout',{ method: 'POST' }),
  studentMe:    ()     => apiFetch('/auth/student/me'),

  // Students (admin)
  getStudents:  (params = '') => apiFetch('/students' + params),
  getStats:     ()            => apiFetch('/students/stats'),
  getStudent:   (id)          => apiFetch(`/students/${id}`),
  createStudent:(body)        => apiFetch('/students',     { method: 'POST',   body: JSON.stringify(body) }),
  updateStudent:(id, body)    => apiFetch(`/students/${id}`,{ method: 'PUT',   body: JSON.stringify(body) }),
  deleteStudent:(id)          => apiFetch(`/students/${id}`,{ method: 'DELETE' }),

  // Student portal
  portalMe: () => apiFetch('/portal/me'),
};

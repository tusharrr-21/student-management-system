function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.status(401).json({ success: false, message: 'Unauthorized. Please login as admin.' });
}

function requireStudent(req, res, next) {
  if (req.session && req.session.student) return next();
  res.status(401).json({ success: false, message: 'Unauthorized. Please login as student.' });
}

module.exports = { requireAdmin, requireStudent };

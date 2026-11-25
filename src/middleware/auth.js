function requireLogin(req, res, next) {
  if (req.session.user) return next();
  res.status(401).json({ error: 'Silakan login terlebih dahulu.' });
}

function requireRole(role) {
  return (req, res, next) => {
    const { user } = req.session;

    if (!user) return res.status(401).json({ error: 'Silakan login terlebih dahulu.' });
    if (user.role !== role) return res.status(403).json({ error: 'Akses ditolak.' });

    next();
  };
}

module.exports = { requireLogin, requireRole };

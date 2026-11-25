module.exports = {
  port: process.env.PORT || 3000,
  dbPath: 'data/agency.db',
  sessionSecret: process.env.SESSION_SECRET || 'ganti-dengan-rahasia-panjang',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@kanvas.id',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
};

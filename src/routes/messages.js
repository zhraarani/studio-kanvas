const express = require('express');
const db = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/messages (admin)
router.get('/', requireRole('admin'), (req, res) => {
  const messages = db.prepare('SELECT * FROM messages ORDER BY id DESC').all();
  res.json(messages);
});

// POST /api/messages (publik, dari form Kontak)
router.post('/', (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim();
  const message = String(req.body.message || '').trim();

  if (!name || !message) return res.status(400).json({ error: 'Nama dan pesan wajib diisi.' });
  if (!EMAIL_PATTERN.test(email)) return res.status(400).json({ error: 'Format email tidak valid.' });

  db.prepare('INSERT INTO messages (name, email, message) VALUES (?, ?, ?)').run(name, email, message);
  res.status(201).json({ message: 'Pesan berhasil dikirim.' });
});

module.exports = router;

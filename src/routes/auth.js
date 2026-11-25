const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const toSessionUser = ({ id, name, email, role }) => ({ id, name, email, role });

function startSession(req, res, user, status = 200) {
  req.session.regenerate((error) => {
    if (error) return res.status(500).json({ error: 'Gagal membuat sesi.' });

    req.session.user = toSessionUser(user);
    res.status(status).json(req.session.user);
  });
}

// POST /api/auth/register (akun baru selalu berperan "user")
router.post('/register', (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!name) return res.status(400).json({ error: 'Nama wajib diisi.' });
  if (!EMAIL_PATTERN.test(email)) return res.status(400).json({ error: 'Format email tidak valid.' });
  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ error: `Password minimal ${MIN_PASSWORD_LENGTH} karakter.` });
  }

  const taken = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (taken) return res.status(409).json({ error: 'Email sudah terdaftar.' });

  const result = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name, email, bcrypt.hashSync(password, 10));

  startSession(req, res, { id: result.lastInsertRowid, name, email, role: 'user' }, 201);
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  const valid = user && bcrypt.compareSync(password, user.password_hash);

  if (!valid) return res.status(401).json({ error: 'Email atau password salah.' });

  startSession(req, res, user);
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.status(204).end());
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Belum login.' });
  res.json(req.session.user);
});

module.exports = router;

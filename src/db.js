const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const { dbPath, adminEmail, adminPassword } = require('./config');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT    NOT NULL,
    price_start INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    message    TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

function seedServices() {
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM services').get();
  if (total > 0) return;

  const insert = db.prepare(
    'INSERT INTO services (name, description, price_start) VALUES (?, ?, ?)'
  );
  [
    ['Desain Logo & Identitas Brand', 'Logo, palet warna, tipografi, dan panduan brand.', 3500000],
    ['UI/UX Design', 'Riset pengguna, wireframe, dan prototipe aplikasi atau website.', 6000000],
    ['Desain Kemasan', 'Kemasan produk yang menarik dan siap cetak.', 2500000],
    ['Social Media Kit', 'Template feed, story, dan banner yang konsisten.', 1500000],
  ].forEach((row) => insert.run(...row));
}

function seedAdmin() {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (existing) return;

  db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(
    'Administrator',
    adminEmail,
    bcrypt.hashSync(adminPassword, 10),
    'admin'
  );
}

seedServices();
seedAdmin();

module.exports = db;

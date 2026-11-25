const express = require('express');
const db = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
const requireAdmin = requireRole('admin');

function parseService(body) {
  const name = String(body.name || '').trim();
  const description = String(body.description || '').trim();
  const price = Number(body.price_start);

  if (!name || !description) return { error: 'Nama dan deskripsi wajib diisi.' };
  if (!Number.isInteger(price) || price < 0) {
    return { error: 'Harga harus berupa angka bulat positif.' };
  }

  return { data: { name, description, price_start: price } };
}

// GET /api/services (publik)
router.get('/', (req, res) => {
  const services = db.prepare('SELECT * FROM services ORDER BY id DESC').all();
  res.json(services);
});

// POST /api/services (admin)
router.post('/', requireAdmin, (req, res) => {
  const { data, error } = parseService(req.body);
  if (error) return res.status(400).json({ error });

  const result = db
    .prepare(
      'INSERT INTO services (name, description, price_start) VALUES (@name, @description, @price_start)'
    )
    .run(data);

  res.status(201).json({ id: result.lastInsertRowid, ...data });
});

// PUT /api/services/:id (admin)
router.put('/:id', requireAdmin, (req, res) => {
  const { data, error } = parseService(req.body);
  if (error) return res.status(400).json({ error });

  const result = db
    .prepare(
      'UPDATE services SET name=@name, description=@description, price_start=@price_start WHERE id=@id'
    )
    .run({ ...data, id: req.params.id });

  if (result.changes === 0) return res.status(404).json({ error: 'Layanan tidak ditemukan.' });
  res.json({ id: Number(req.params.id), ...data });
});

// DELETE /api/services/:id (admin)
router.delete('/:id', requireAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);

  if (result.changes === 0) return res.status(404).json({ error: 'Layanan tidak ditemukan.' });
  res.status(204).end();
});

module.exports = router;

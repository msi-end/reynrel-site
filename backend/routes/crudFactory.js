import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../db/lowdb.js';
import { requireAdmin } from '../middleware/auth.js';

export function createCrudRouter(collectionKey) {
  const router = Router();

  router.get('/', async (req, res) => {
    await db.read();
    res.json(db.data[collectionKey]);
  });

  router.get('/:id', async (req, res) => {
    await db.read();
    const item = db.data[collectionKey].find((i) => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  });

  router.post('/', requireAdmin, async (req, res) => {
    await db.read();
    const now = new Date().toISOString();
    const item = { id: nanoid(), ...req.body, createdAt: now, updatedAt: now };
    db.data[collectionKey].push(item);
    await db.write();
    res.status(201).json(item);
  });

  router.put('/:id', requireAdmin, async (req, res) => {
    await db.read();
    const idx = db.data[collectionKey].findIndex((i) => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const existing = db.data[collectionKey][idx];
    const updated = {
      ...existing,
      ...req.body,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    };
    db.data[collectionKey][idx] = updated;
    await db.write();
    res.json(updated);
  });

  router.delete('/:id', requireAdmin, async (req, res) => {
    await db.read();
    const idx = db.data[collectionKey].findIndex((i) => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    db.data[collectionKey].splice(idx, 1);
    await db.write();
    res.status(204).end();
  });

  return router;
}

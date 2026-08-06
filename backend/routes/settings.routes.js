import { Router } from 'express';
import { db } from '../db/lowdb.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  await db.read();
  res.json(db.data.settings);
});

router.put('/', requireAdmin, async (req, res) => {
  await db.read();
  db.data.settings = {
    ...db.data.settings,
    ...req.body,
    socialLinks: { ...db.data.settings.socialLinks, ...(req.body?.socialLinks || {}) }
  };
  await db.write();
  res.json(db.data.settings);
});

export default router;

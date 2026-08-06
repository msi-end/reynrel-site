import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';
import { db } from '../db/lowdb.js';
import { requireAdmin } from '../middleware/auth.js';
import { createCrudRouter } from './crudFactory.js';

const router = Router();
router.use('/', createCrudRouter('androidApps'));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', 'uploads', 'screenshots');

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${nanoid()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  }
});

router.post('/:id/screenshots', requireAdmin, upload.single('screenshot'), async (req, res) => {
  await db.read();
  const app = db.data.androidApps.find((a) => a.id === req.params.id);
  if (!app) return res.status(404).json({ error: 'App not found' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const url = `/uploads/screenshots/${req.file.filename}`;
  app.screenshots = [...(app.screenshots || []), url];
  app.updatedAt = new Date().toISOString();
  await db.write();
  res.status(201).json(app);
});

router.delete('/:id/screenshots/:index', requireAdmin, async (req, res) => {
  await db.read();
  const app = db.data.androidApps.find((a) => a.id === req.params.id);
  if (!app) return res.status(404).json({ error: 'App not found' });

  const index = Number(req.params.index);
  if (Number.isNaN(index) || index < 0 || index >= (app.screenshots || []).length) {
    return res.status(400).json({ error: 'Invalid screenshot index' });
  }
  app.screenshots.splice(index, 1);
  app.updatedAt = new Date().toISOString();
  await db.write();
  res.json(app);
});

export default router;

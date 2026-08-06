import { Router } from 'express';
import { db } from '../db/lowdb.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password are required' });

  await db.read();
  const admin = db.data.admins.find((a) => a.username === username);
  if (!admin || !comparePassword(password, admin.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken({ role: 'admin', id: admin.id, username: admin.username });
  res.json({ token, admin: { id: admin.id, username: admin.username } });
});

router.get('/me', requireAdmin, async (req, res) => {
  await db.read();
  const admin = db.data.admins.find((a) => a.id === req.admin.id);
  if (!admin) return res.status(404).json({ error: 'Admin not found' });
  res.json({ id: admin.id, username: admin.username });
});

router.put('/change-password', requireAdmin, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'newPassword must be at least 6 characters' });
  }

  await db.read();
  const admin = db.data.admins.find((a) => a.id === req.admin.id);
  if (!admin || !comparePassword(currentPassword, admin.passwordHash)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  admin.passwordHash = hashPassword(newPassword);
  await db.write();
  res.json({ success: true });
});

export default router;

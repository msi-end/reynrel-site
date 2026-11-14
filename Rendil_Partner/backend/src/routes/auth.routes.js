import { Router } from 'express';
import { db } from '../db/index.js';
import { signToken, requireAdmin, requirePartner } from '../middleware/auth.js';
import { checkPassword, hashPassword, strongEnough } from '../utils/password.js';
import { rateLimit } from '../utils/rateLimit.js';
import { h, bad, nowIso } from '../utils/http.js';
import { str, mobile } from '../utils/validators.js';
import { audit } from '../services/audit.js';

const router = Router();
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 15, message: 'Too many login attempts. Try again in 15 minutes.' });

// ---- Admin ----
router.post('/admin/login', loginLimit, h(async (req, res) => {
  const email = str(req.body?.email, 150).toLowerCase();
  const admin = await db.get('SELECT * FROM admins WHERE email = ?', [email]);
  if (!admin || !admin.active || !checkPassword(req.body?.password, admin.password_hash)) return res.status(401).json({ error: 'Invalid email or password' });
  await db.run('UPDATE admins SET last_login_at = ? WHERE id = ?', [nowIso(), admin.id]);
  res.json({ token: signToken({ role: 'admin', id: admin.id, tv: admin.token_version }), admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
}));

router.get('/admin/me', requireAdmin(), (req, res) => res.json({ id: req.admin.id, name: req.admin.name, email: req.admin.email, role: req.admin.role }));

router.put('/admin/password', requireAdmin(), h(async (req, res) => {
  const row = await db.get('SELECT password_hash FROM admins WHERE id = ?', [req.admin.id]);
  if (!checkPassword(req.body?.currentPassword, row.password_hash)) throw bad('Current password is incorrect');
  if (!strongEnough(req.body?.newPassword)) throw bad('New password must be at least 8 characters with letters and numbers');
  await db.run('UPDATE admins SET password_hash = ?, token_version = token_version + 1 WHERE id = ?', [hashPassword(req.body.newPassword), req.admin.id]);
  await audit(req.actor, 'admin.password_change', { type: 'admin', id: req.admin.id });
  res.json({ ok: true });
}));

// ---- Partner ----
router.post('/partner/login', loginLimit, h(async (req, res) => {
  const id = str(req.body?.identifier, 150).toLowerCase();
  const p = await db.get('SELECT id, code, status, password_hash, token_version FROM partners WHERE email = ? OR mobile = ? OR LOWER(code) = ?', [id, mobile(id), id]);
  if (!p || !checkPassword(req.body?.password, p.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });
  await db.run('UPDATE partners SET last_login_at = ? WHERE id = ?', [nowIso(), p.id]);
  res.json({ token: signToken({ role: 'partner', id: p.id, tv: p.token_version }, '7d'), status: p.status });
}));

router.put('/partner/password', requirePartner({ allowInactive: true }), h(async (req, res) => {
  if (!checkPassword(req.body?.currentPassword, req.partner.password_hash)) throw bad('Current password is incorrect');
  if (!strongEnough(req.body?.newPassword)) throw bad('New password must be at least 8 characters with letters and numbers');
  await db.run('UPDATE partners SET password_hash = ?, must_change_password = 0, token_version = token_version + 1, updated_at = ? WHERE id = ?', [hashPassword(req.body.newPassword), nowIso(), req.partner.id]);
  const p = await db.get('SELECT token_version FROM partners WHERE id = ?', [req.partner.id]);
  res.json({ ok: true, token: signToken({ role: 'partner', id: req.partner.id, tv: p.token_version }, '7d') });
}));

export default router;

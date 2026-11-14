import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../db/lowdb.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Basic abuse protection for the public form (single process, in memory).
const hits = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;
function tooMany(ip) {
  const t = Date.now();
  const e = hits.get(ip);
  if (!e || e.reset < t) {
    hits.set(ip, { n: 1, reset: t + WINDOW_MS });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < t) hits.delete(k);
    return false;
  }
  return ++e.n > MAX_PER_WINDOW;
}

const clean = (v, max) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

router.post('/', async (req, res) => {
  const b = req.body || {};
  // Honeypot: real visitors never see this field.
  if (b.website) return res.status(201).json({ ok: true });
  if (tooMany(req.ip)) return res.status(429).json({ error: 'Too many requests. Please try again in a few minutes.' });

  const name = clean(b.name, 100);
  const digits = String(b.phone || '').replace(/\D/g, '');
  const phone = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits.length === 11 && digits.startsWith('0') ? digits.slice(1) : digits;
  const email = clean(b.email, 150).toLowerCase();

  if (!name || !phone) return res.status(400).json({ error: 'Name and phone number are required' });
  if (phone.length < 10 || phone.length > 13) return res.status(400).json({ error: 'Please enter a valid phone number', field: 'phone' });
  if (email && !EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address', field: 'email' });

  await db.read();
  db.data.leads ||= [];
  const source = clean(b.source, 80) || 'unknown';

  // Double submit (or popup + page form) within 10 minutes: update the existing lead instead of adding another.
  const recent = db.data.leads.find((l) => l.phone === phone && l.source === source && Date.now() - new Date(l.createdAt).getTime() < WINDOW_MS);
  const fields = {
    name,
    email,
    phone,
    company: clean(b.company, 150),
    service: clean(b.service, 150),
    message: clean(b.message, 1000),
    businessType: clean(b.businessType, 80),
    city: clean(b.city, 80),
    page: clean(b.page, 200),
    utm: b.utm && typeof b.utm === 'object'
      ? Object.fromEntries(['source', 'medium', 'campaign'].map((k) => [k, clean(b.utm[k], 80)]).filter(([, v]) => v))
      : undefined,
    source
  };
  if (recent) {
    Object.assign(recent, Object.fromEntries(Object.entries(fields).filter(([, v]) => v)), { updatedAt: new Date().toISOString() });
    await db.write();
    return res.status(201).json({ ok: true, id: recent.id });
  }

  const lead = { id: nanoid(), ...fields, status: 'new', createdAt: new Date().toISOString() };
  db.data.leads.push(lead);
  await db.write();
  res.status(201).json({ ok: true, id: lead.id });
});

router.get('/', requireAdmin, async (req, res) => {
  await db.read();
  db.data.leads ||= [];
  res.json(db.data.leads);
});

router.put('/:id/status', requireAdmin, async (req, res) => {
  await db.read();
  db.data.leads ||= [];
  const lead = db.data.leads.find((l) => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const { status } = req.body || {};
  if (!['new', 'contacted', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  lead.status = status;
  lead.updatedAt = new Date().toISOString();
  await db.write();
  res.json(lead);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  await db.read();
  db.data.leads ||= [];
  const idx = db.data.leads.findIndex((l) => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.data.leads.splice(idx, 1);
  await db.write();
  res.status(204).end();
});

export default router;

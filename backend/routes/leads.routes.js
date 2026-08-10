import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../db/lowdb.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/', async (req, res) => {
  const { name, email, phone, company, service, message, source } = req.body || {};

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone number are required' });
  }

  await db.read();
  db.data.leads ||= [];
  const lead = {
    id: nanoid(),
    name,
    email: email || '',
    phone,
    company: company || '',
    service: service || '',
    message: message || '',
    source: source || 'unknown',
    status: 'new',
    createdAt: new Date().toISOString()
  };
  db.data.leads.push(lead);
  await db.write();

  res.status(201).json(lead);
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

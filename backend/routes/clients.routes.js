import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../db/lowdb.js';
import { requireAdmin } from '../middleware/auth.js';
import { hashPassword } from '../utils/password.js';

const router = Router();
router.use(requireAdmin);

function sanitizeClient(client) {
  const { passwordHash, ...rest } = client;
  return rest;
}

router.get('/', async (req, res) => {
  await db.read();
  const clients = db.data.clients.map((client) => ({
    ...sanitizeClient(client),
    subscriptions: db.data.subscriptions.filter((s) => s.clientId === client.id)
  }));
  res.json(clients);
});

router.get('/:id', async (req, res) => {
  await db.read();
  const client = db.data.clients.find((c) => c.id === req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  const subscriptions = db.data.subscriptions.filter((s) => s.clientId === client.id);
  res.json({ ...sanitizeClient(client), subscriptions });
});

router.post('/', async (req, res) => {
  const { name, email, mobile, password } = req.body || {};
  if (!name || !email || !mobile || !password) {
    return res.status(400).json({ error: 'name, email, mobile and password are required' });
  }
  await db.read();
  const exists = db.data.clients.some((c) => c.email === email || c.mobile === mobile);
  if (exists) return res.status(409).json({ error: 'A client with this email or mobile already exists' });

  const client = {
    id: nanoid(),
    name,
    email,
    mobile,
    passwordHash: hashPassword(password),
    customFields: [],
    createdAt: new Date().toISOString()
  };
  db.data.clients.push(client);
  await db.write();
  res.status(201).json(sanitizeClient(client));
});

router.put('/:id', async (req, res) => {
  await db.read();
  const client = db.data.clients.find((c) => c.id === req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  const { name, email, mobile, password } = req.body || {};
  if (name !== undefined) client.name = name;
  if (email !== undefined) client.email = email;
  if (mobile !== undefined) client.mobile = mobile;
  if (password) client.passwordHash = hashPassword(password);

  await db.write();
  res.json(sanitizeClient(client));
});

router.delete('/:id', async (req, res) => {
  await db.read();
  const idx = db.data.clients.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Client not found' });

  db.data.clients.splice(idx, 1);
  db.data.subscriptions = db.data.subscriptions.filter((s) => s.clientId !== req.params.id);
  db.data.renewalRequests = db.data.renewalRequests.filter((r) => r.clientId !== req.params.id);

  await db.write();
  res.status(204).end();
});

// --- Subscriptions sub-resource ---

router.post('/:id/subscriptions', async (req, res) => {
  await db.read();
  const client = db.data.clients.find((c) => c.id === req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  const { itemType, itemId, itemName, planAmount, planStartDate, planEndDate } = req.body || {};
  if (!itemType || !itemName || !planStartDate || !planEndDate) {
    return res.status(400).json({ error: 'itemType, itemName, planStartDate and planEndDate are required' });
  }

  const subscription = {
    id: nanoid(),
    clientId: client.id,
    itemType,
    itemId: itemId || null,
    itemName,
    planAmount: planAmount || 0,
    planStartDate,
    planEndDate,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  db.data.subscriptions.push(subscription);
  await db.write();
  res.status(201).json(subscription);
});

router.put('/:id/subscriptions/:subId', async (req, res) => {
  await db.read();
  const subscription = db.data.subscriptions.find(
    (s) => s.id === req.params.subId && s.clientId === req.params.id
  );
  if (!subscription) return res.status(404).json({ error: 'Subscription not found' });

  Object.assign(subscription, req.body, { id: subscription.id, clientId: subscription.clientId });
  await db.write();
  res.json(subscription);
});

router.delete('/:id/subscriptions/:subId', async (req, res) => {
  await db.read();
  const idx = db.data.subscriptions.findIndex(
    (s) => s.id === req.params.subId && s.clientId === req.params.id
  );
  if (idx === -1) return res.status(404).json({ error: 'Subscription not found' });

  db.data.subscriptions.splice(idx, 1);
  await db.write();
  res.status(204).end();
});

// --- Custom fields sub-resource ---

router.post('/:id/custom-fields', async (req, res) => {
  await db.read();
  const client = db.data.clients.find((c) => c.id === req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  const { label, value } = req.body || {};
  if (!label) return res.status(400).json({ error: 'label is required' });

  const field = { id: nanoid(), label, value: value || '' };
  client.customFields = client.customFields || [];
  client.customFields.push(field);
  await db.write();
  res.status(201).json(field);
});

router.put('/:id/custom-fields/:fieldId', async (req, res) => {
  await db.read();
  const client = db.data.clients.find((c) => c.id === req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  const field = (client.customFields || []).find((f) => f.id === req.params.fieldId);
  if (!field) return res.status(404).json({ error: 'Custom field not found' });

  const { label, value } = req.body || {};
  if (label !== undefined) field.label = label;
  if (value !== undefined) field.value = value;

  await db.write();
  res.json(field);
});

router.delete('/:id/custom-fields/:fieldId', async (req, res) => {
  await db.read();
  const client = db.data.clients.find((c) => c.id === req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  client.customFields = (client.customFields || []).filter((f) => f.id !== req.params.fieldId);
  await db.write();
  res.status(204).end();
});

export default router;

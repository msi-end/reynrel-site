import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../db/lowdb.js';
import { requireClient } from '../middleware/auth.js';

const router = Router();
router.use(requireClient);

router.get('/me', async (req, res) => {
  await db.read();
  const client = db.data.clients.find((c) => c.id === req.client.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  const subscriptions = db.data.subscriptions.filter((s) => s.clientId === client.id);
  const { passwordHash, ...rest } = client;
  res.json({ ...rest, subscriptions });
});

router.post('/renewals', async (req, res) => {
  const { subscriptionId, message } = req.body || {};
  if (!subscriptionId) return res.status(400).json({ error: 'subscriptionId is required' });

  await db.read();
  const subscription = db.data.subscriptions.find(
    (s) => s.id === subscriptionId && s.clientId === req.client.id
  );
  if (!subscription) return res.status(404).json({ error: 'Subscription not found' });

  const request = {
    id: nanoid(),
    clientId: req.client.id,
    subscriptionId,
    message: message || '',
    status: 'pending',
    requestedAt: new Date().toISOString(),
    resolvedAt: null
  };
  db.data.renewalRequests.push(request);
  await db.write();
  res.status(201).json(request);
});

router.get('/renewals', async (req, res) => {
  await db.read();
  const requests = db.data.renewalRequests.filter((r) => r.clientId === req.client.id);
  res.json(requests);
});

export default router;

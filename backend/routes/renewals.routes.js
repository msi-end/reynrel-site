import { Router } from 'express';
import { db } from '../db/lowdb.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAdmin);

function addYears(dateStr, years) {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

router.get('/', async (req, res) => {
  await db.read();
  res.json(db.data.renewalRequests);
});

router.put('/:id/approve', async (req, res) => {
  await db.read();
  const request = db.data.renewalRequests.find((r) => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Renewal request not found' });

  const subscription = db.data.subscriptions.find((s) => s.id === request.subscriptionId);
  if (!subscription) return res.status(404).json({ error: 'Related subscription not found' });

  const { newPlanEndDate } = req.body || {};
  subscription.planEndDate = newPlanEndDate || addYears(subscription.planEndDate, 1);
  subscription.status = 'active';

  request.status = 'approved';
  request.resolvedAt = new Date().toISOString();

  await db.write();
  res.json({ request, subscription });
});

router.put('/:id/reject', async (req, res) => {
  await db.read();
  const request = db.data.renewalRequests.find((r) => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Renewal request not found' });

  request.status = 'rejected';
  request.resolvedAt = new Date().toISOString();
  await db.write();
  res.json(request);
});

export default router;

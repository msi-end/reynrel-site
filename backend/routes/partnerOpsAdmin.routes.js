import { Router } from 'express';
import { db } from '../db/lowdb.js';
import { requireAdmin } from '../middleware/auth.js';
import { withLock } from '../utils/lock.js';
import { decrypt } from '../utils/crypto.js';
import { clean, toMoney } from '../utils/validators.js';
import { partnerBalance, program, productName, activeTerms, commissionRateFor, addLedgerEntry, audit } from '../services/partners.js';

// Admin operations across all partners: customer reviews, installations,
// subscriptions/renewals, withdrawals & payouts, program settings and terms.
const router = Router();
router.use(requireAdmin);

const actor = (req) => `admin:${req.admin.username}`;
const locked = (fn) => async (req, res) => {
  try {
    const out = await withLock(async () => {
      await db.read();
      return fn(req);
    });
    res.status(out.status || 200).json(out.body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '');
const addYear = (iso) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() + 1);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

function partnerLite(id) {
  const p = db.data.partners.find((x) => x.id === id);
  return p ? { id: p.id, partnerCode: p.partnerCode, name: p.personal.fullName, businessName: p.business.name, status: p.status } : null;
}

function customerOut(c) {
  return {
    ...c,
    productName: productName(c.productId),
    partner: partnerLite(c.partnerId),
    commissionEarned: toMoney(db.data.commissionLedger.filter((l) => l.customerId === c.id).reduce((s, l) => s + l.amount, 0))
  };
}

// ---------- Customers ----------
router.get('/customers', async (req, res) => {
  await db.read();
  let list = db.data.partnerCustomers;
  if (req.query.status) list = list.filter((c) => c.status === req.query.status);
  if (req.query.installation) list = list.filter((c) => c.installation?.status === req.query.installation);
  if (req.query.partnerId) list = list.filter((c) => c.partnerId === req.query.partnerId);
  const q = clean(req.query.q, 80).toLowerCase();
  if (q) list = list.filter((c) => [c.businessName, c.contactName, c.mobile, c.gstin, c.city].some((v) => (v || '').toLowerCase().includes(q)));
  res.json(list.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(customerOut));
});

router.put('/customers/:id/review', locked(async (req) => {
  const c = db.data.partnerCustomers.find((x) => x.id === req.params.id);
  if (!c) return { status: 404, body: { error: 'Customer not found' } };
  if (c.status !== 'submitted') return { status: 400, body: { error: `Customer is already ${c.status}` } };
  const action = req.body?.action;
  const note = clean(req.body?.note, 500);
  const now = new Date().toISOString();
  const partner = db.data.partners.find((p) => p.id === c.partnerId);

  if (action === 'reject') {
    if (!note) return { status: 400, body: { error: 'Give a reason for rejection' } };
    c.status = 'rejected';
    c.reviewNote = note;
    c.reviewedAt = now;
    c.reviewedBy = actor(req);
    c.updatedAt = now;
    await db.write();
    return { body: customerOut(c) };
  }
  if (action !== 'approve') return { status: 400, body: { error: 'action must be approve or reject' } };
  if (!partner || partner.status !== 'approved') return { status: 400, body: { error: 'Partner is not active; commission cannot be credited' } };

  // Final sale value (excluding GST) may differ from what the partner entered.
  const saleAmount = toMoney(req.body?.saleAmount ?? c.planAmount);
  if (!(saleAmount >= 0)) return { status: 400, body: { error: 'Invalid sale amount' } };
  const startDate = isDate(req.body?.startDate) ? req.body.startDate : now.slice(0, 10);
  const endDate = isDate(req.body?.endDate) ? req.body.endDate : addYear(startDate);
  const percent = req.body?.commissionPercent !== undefined && req.body?.commissionPercent !== ''
    ? Number(req.body.commissionPercent)
    : commissionRateFor(partner, c.productId, 'new');
  if (!(percent >= 0 && percent <= 100)) return { status: 400, body: { error: 'Invalid commission %' } };

  c.status = 'approved';
  c.reviewNote = note;
  c.approvedAt = now;
  c.reviewedBy = actor(req);
  c.saleAmount = saleAmount;
  c.subscription = {
    plan: clean(req.body?.plan, 80) || c.plan,
    startDate,
    endDate,
    status: 'active',
    licenseKey: clean(req.body?.licenseKey, 200),
    renewals: []
  };
  c.updatedAt = now;
  const entry = saleAmount > 0
    ? addLedgerEntry({
        partnerId: c.partnerId, customerId: c.id, productId: c.productId, type: 'new',
        baseAmount: saleAmount, percent,
        description: `New sale · ${c.businessName} · ${productName(c.productId)}`,
        createdBy: actor(req)
      })
    : null;
  audit(actor(req), 'customer.approve', c.id, { saleAmount, percent, commission: entry?.amount || 0 });
  await db.write();
  return { body: { customer: customerOut(c), commission: entry } };
}));

router.put('/customers/:id/installation', locked(async (req) => {
  const c = db.data.partnerCustomers.find((x) => x.id === req.params.id);
  if (!c) return { status: 404, body: { error: 'Customer not found' } };
  const status = req.body?.status;
  if (!['requested', 'scheduled', 'in_progress', 'completed', 'cancelled'].includes(status)) return { status: 400, body: { error: 'Invalid installation status' } };
  const now = new Date().toISOString();
  c.installation.status = status;
  if (req.body?.scheduledFor !== undefined) c.installation.scheduledFor = clean(req.body.scheduledFor, 25);
  if (req.body?.engineer !== undefined) c.installation.engineer = clean(req.body.engineer, 100);
  if (req.body?.adminNotes !== undefined) c.installation.adminNotes = clean(req.body.adminNotes, 500);
  if (status === 'completed') c.installation.completedAt = now;
  c.installation.history.push({ status, at: now, by: actor(req), note: clean(req.body?.adminNotes, 200) });
  c.updatedAt = now;
  await db.write();
  return { body: customerOut(c) };
}));

router.put('/customers/:id/subscription', locked(async (req) => {
  const c = db.data.partnerCustomers.find((x) => x.id === req.params.id);
  if (!c?.subscription) return { status: 404, body: { error: 'Active subscription not found' } };
  const b = req.body || {};
  if (b.endDate && isDate(b.endDate)) c.subscription.endDate = b.endDate;
  if (b.status && ['active', 'expired', 'cancelled'].includes(b.status)) c.subscription.status = b.status;
  if (b.licenseKey !== undefined) c.subscription.licenseKey = clean(b.licenseKey, 200);
  c.updatedAt = new Date().toISOString();
  await db.write();
  return { body: customerOut(c) };
}));

router.post('/customers/:id/renewal', locked(async (req) => {
  const c = db.data.partnerCustomers.find((x) => x.id === req.params.id);
  if (!c?.subscription) return { status: 404, body: { error: 'Customer has no subscription' } };
  const partner = db.data.partners.find((p) => p.id === c.partnerId);
  const amount = toMoney(req.body?.amount);
  if (!(amount > 0)) return { status: 400, body: { error: 'Renewal amount required' } };
  const newEnd = isDate(req.body?.endDate) ? req.body.endDate : addYear(new Date(Math.max(Date.parse(c.subscription.endDate) + 86400000, Date.now())).toISOString().slice(0, 10));
  const percent = commissionRateFor(partner, c.productId, 'renewal');
  c.subscription.renewals.push({ at: new Date().toISOString(), amount, previousEnd: c.subscription.endDate, newEnd });
  c.subscription.endDate = newEnd;
  c.subscription.status = 'active';
  const entry = partner?.status === 'approved' && percent > 0
    ? addLedgerEntry({ partnerId: c.partnerId, customerId: c.id, productId: c.productId, type: 'renewal', baseAmount: amount, percent, description: `Renewal · ${c.businessName} · until ${newEnd}`, createdBy: actor(req) })
    : null;
  audit(actor(req), 'customer.renewal', c.id, { amount, commission: entry?.amount || 0 });
  await db.write();
  return { status: 201, body: { customer: customerOut(c), commission: entry } };
}));

// Refund / cancellation: reverse all commission on this customer.
router.post('/customers/:id/reverse', locked(async (req) => {
  const c = db.data.partnerCustomers.find((x) => x.id === req.params.id);
  if (!c) return { status: 404, body: { error: 'Customer not found' } };
  const reason = clean(req.body?.reason, 300);
  if (!reason) return { status: 400, body: { error: 'Reason required' } };
  const net = toMoney(db.data.commissionLedger.filter((l) => l.customerId === c.id).reduce((s, l) => s + l.amount, 0));
  if (net <= 0) return { status: 400, body: { error: 'No commission to reverse' } };
  const entry = addLedgerEntry({ partnerId: c.partnerId, customerId: c.id, productId: c.productId, type: 'reversal', amount: -net, description: `Reversal · ${c.businessName} · ${reason}`, createdBy: actor(req) });
  if (c.subscription) c.subscription.status = 'cancelled';
  audit(actor(req), 'customer.reverse', c.id, { amount: net, reason });
  await db.write();
  return { status: 201, body: { customer: customerOut(c), commission: entry, balance: partnerBalance(c.partnerId) } };
}));

// ---------- Withdrawals & payouts ----------
function withdrawalOut(w) {
  return { ...w, partner: partnerLite(w.partnerId), partnerBalance: partnerBalance(w.partnerId) };
}

router.get('/withdrawals', async (req, res) => {
  await db.read();
  let list = db.data.withdrawals;
  if (req.query.status) list = list.filter((w) => w.status === req.query.status);
  res.json(list.slice().sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)).map(withdrawalOut));
});

// Bank-transfer sheet (decrypted account numbers) for approved, unpaid withdrawals. Audit-logged.
router.get('/withdrawals/export.csv', async (req, res) => {
  const rows = await withLock(async () => {
    await db.read();
    const list = db.data.withdrawals.filter((w) => w.status === 'approved');
    audit(actor(req), 'withdrawals.export', null, { count: list.length });
    await db.write();
    return list.map((w) => {
      const p = db.data.partners.find((x) => x.id === w.partnerId);
      return [w.reference, p.partnerCode, w.bankSnapshot.accountHolder, decrypt(p.bank.accountEnc), w.bankSnapshot.ifsc, w.bankSnapshot.bankName, w.amount, w.tdsAmount, w.netAmount, p.contact.email, p.contact.mobile];
    });
  });
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [['Reference', 'Partner Code', 'Beneficiary', 'Account Number', 'IFSC', 'Bank', 'Gross', 'TDS', 'Net Payable', 'Email', 'Mobile'], ...rows].map((r) => r.map(esc).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="partner-payouts-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.setHeader('Cache-Control', 'no-store');
  res.send(csv);
});

router.put('/withdrawals/:id', locked(async (req) => {
  const w = db.data.withdrawals.find((x) => x.id === req.params.id);
  if (!w) return { status: 404, body: { error: 'Withdrawal not found' } };
  const action = req.body?.action;
  const note = clean(req.body?.note, 300);
  const now = new Date().toISOString();
  const transitions = { approve: ['requested'], reject: ['requested', 'approved'], paid: ['approved', 'requested'] };
  if (!transitions[action]) return { status: 400, body: { error: 'action must be approve, reject or paid' } };
  if (!transitions[action].includes(w.status)) return { status: 400, body: { error: `Cannot ${action} a ${w.status} withdrawal` } };

  if (action === 'approve') w.status = 'approved';
  if (action === 'reject') {
    if (!note) return { status: 400, body: { error: 'Give a reason for rejection' } };
    w.status = 'rejected';
  }
  if (action === 'paid') {
    const utr = clean(req.body?.utr, 40);
    if (!utr) return { status: 400, body: { error: 'Bank reference / UTR is required' } };
    w.status = 'paid';
    w.payment = {
      utr,
      mode: ['NEFT', 'RTGS', 'IMPS', 'UPI', 'Cheque'].includes(req.body?.mode) ? req.body.mode : 'NEFT',
      paidOn: /^\d{4}-\d{2}-\d{2}$/.test(req.body?.paidOn || '') ? req.body.paidOn : now.slice(0, 10),
      recordedBy: actor(req),
      recordedAt: now
    };
  }
  w.reviewNote = note || w.reviewNote || '';
  w.reviewedAt = now;
  w.history.push({ status: w.status, at: now, by: actor(req), note });
  audit(actor(req), `withdrawal.${action}`, w.id, { amount: w.amount });
  await db.write();
  return { body: withdrawalOut(w) };
}));

// ---------- Program settings & terms ----------
router.get('/program', async (req, res) => {
  await db.read();
  res.json({ settings: program(), terms: db.data.partnerTerms.slice().sort((a, b) => b.version - a.version) });
});

router.put('/program', locked(async (req) => {
  const b = req.body || {};
  const p = program();
  const num = (v, min, max) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= min && n <= max ? n : null;
  };
  const updates = {
    minWithdrawal: num(b.minWithdrawal, 0, 10000000),
    tdsPercent: num(b.tdsPercent, 0, 50),
    defaultCommissionPercent: num(b.defaultCommissionPercent, 0, 100),
    defaultRenewalPercent: num(b.defaultRenewalPercent, 0, 100),
    payoutCycleDays: num(b.payoutCycleDays, 1, 90)
  };
  for (const [k, v] of Object.entries(updates)) {
    if (b[k] === undefined) continue;
    if (v === null) return { status: 400, body: { error: `Invalid value for ${k}` } };
    p[k] = v;
  }
  if (Array.isArray(b.tiers)) {
    p.tiers = b.tiers.slice(0, 6).map((t) => ({
      name: clean(t.name, 40),
      minCustomersPerQuarter: Math.max(0, parseInt(t.minCustomersPerQuarter, 10) || 0),
      commissionPercent: num(t.commissionPercent, 0, 100) ?? 0,
      renewalPercent: num(t.renewalPercent, 0, 100) ?? 0
    }));
  }
  audit(actor(req), 'program.update', null, { fields: Object.keys(b) });
  await db.write();
  return { body: p };
}));

router.post('/terms', locked(async (req) => {
  const content = typeof req.body?.content === 'string' ? req.body.content.trim().slice(0, 50000) : '';
  if (content.length < 100) return { status: 400, body: { error: 'Terms content is too short' } };
  const version = (activeTerms()?.version || 0) + 1;
  const t = { version, content, effectiveFrom: new Date().toISOString(), createdAt: new Date().toISOString(), createdBy: actor(req) };
  db.data.partnerTerms.push(t);
  audit(actor(req), 'terms.publish', null, { version });
  await db.write();
  return { status: 201, body: t };
}));

router.get('/audit-log', async (req, res) => {
  await db.read();
  res.json(db.data.auditLog.slice(-300).reverse());
});

export default router;

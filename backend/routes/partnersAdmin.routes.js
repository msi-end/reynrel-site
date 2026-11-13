import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { db } from '../db/lowdb.js';
import { requireAdmin } from '../middleware/auth.js';
import { withLock } from '../utils/lock.js';
import { decrypt } from '../utils/crypto.js';
import { PARTNER_DOCS_DIR } from '../middleware/upload.js';
import { clean, toMoney, PARTNER_TYPES } from '../utils/validators.js';
import {
  partnerBalance, program, publicPartner, productName, activeTerms,
  commissionRateFor, addLedgerEntry, audit
} from '../services/partners.js';

const router = Router();
router.use(requireAdmin);

const actor = (req) => `admin:${req.admin.username}`;
const pct = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? Math.round(n * 100) / 100 : null;
};
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
const notFound = (what) => ({ status: 404, body: { error: `${what} not found` } });

function partnerSummary(p) {
  const customers = db.data.partnerCustomers.filter((c) => c.partnerId === p.id);
  return {
    id: p.id,
    partnerCode: p.partnerCode,
    status: p.status,
    tier: p.tier,
    partnerType: p.partnerType,
    partnerTypeLabel: PARTNER_TYPES[p.partnerType] || p.partnerType,
    fullName: p.personal.fullName,
    businessName: p.business.name,
    email: p.contact.email,
    mobile: p.contact.mobile,
    city: p.address.city,
    state: p.address.state,
    expectedMonthlyCustomers: p.expectedMonthlyCustomers,
    createdAt: p.createdAt,
    approvedAt: p.approvedAt || null,
    hasPendingBankChange: !!p.pendingBankChange,
    bankVerified: !!p.bank?.verified,
    customers: customers.length,
    approvedCustomers: customers.filter((c) => c.status === 'approved').length,
    pendingCustomers: customers.filter((c) => c.status === 'submitted').length,
    balance: partnerBalance(p.id)
  };
}

// ---------- Overview ----------
router.get('/overview', async (req, res) => {
  await db.read();
  const partners = db.data.partners;
  const ledger = db.data.commissionLedger;
  const ws = db.data.withdrawals;
  const month = new Date().toISOString().slice(0, 7);
  res.json({
    partners: {
      total: partners.length,
      pending: partners.filter((p) => p.status === 'pending').length,
      approved: partners.filter((p) => p.status === 'approved').length,
      suspended: partners.filter((p) => p.status === 'suspended').length,
      bankChanges: partners.filter((p) => p.pendingBankChange).length
    },
    customers: {
      total: db.data.partnerCustomers.length,
      pending: db.data.partnerCustomers.filter((c) => c.status === 'submitted').length,
      approved: db.data.partnerCustomers.filter((c) => c.status === 'approved').length,
      installationsOpen: db.data.partnerCustomers.filter((c) => ['requested', 'scheduled', 'in_progress'].includes(c.installation?.status)).length
    },
    commission: {
      totalAccrued: toMoney(ledger.reduce((s, l) => s + l.amount, 0)),
      thisMonth: toMoney(ledger.filter((l) => l.createdAt.startsWith(month)).reduce((s, l) => s + l.amount, 0)),
      salesValueThisMonth: toMoney(ledger.filter((l) => l.createdAt.startsWith(month) && ['new', 'renewal'].includes(l.type)).reduce((s, l) => s + l.baseAmount, 0))
    },
    withdrawals: {
      requested: ws.filter((w) => w.status === 'requested').length,
      approvedUnpaid: ws.filter((w) => w.status === 'approved').length,
      requestedAmount: toMoney(ws.filter((w) => ['requested', 'approved'].includes(w.status)).reduce((s, w) => s + w.amount, 0)),
      paidTotal: toMoney(ws.filter((w) => w.status === 'paid').reduce((s, w) => s + w.netAmount, 0)),
      tdsTotal: toMoney(ws.filter((w) => w.status === 'paid').reduce((s, w) => s + w.tdsAmount, 0))
    },
    topPartners: partners
      .filter((p) => p.status === 'approved')
      .map(partnerSummary)
      .sort((a, b) => b.balance.totalEarned - a.balance.totalEarned)
      .slice(0, 5)
  });
});

// ---------- Partners ----------
router.get('/', async (req, res) => {
  await db.read();
  let list = db.data.partners;
  if (req.query.status) list = list.filter((p) => p.status === req.query.status);
  const q = clean(req.query.q, 80).toLowerCase();
  if (q) {
    list = list.filter((p) =>
      [p.personal.fullName, p.business.name, p.contact.email, p.contact.mobile, p.partnerCode, p.address.city].some((v) => (v || '').toLowerCase().includes(q))
    );
  }
  res.json(list.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(partnerSummary));
});

router.get('/:id', async (req, res) => {
  await db.read();
  const p = db.data.partners.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Partner not found' });
  res.json({
    partner: { ...publicPartner(p), partnerTypeLabel: PARTNER_TYPES[p.partnerType] },
    balance: partnerBalance(p.id),
    customers: db.data.partnerCustomers.filter((c) => c.partnerId === p.id).map((c) => ({ ...c, productName: productName(c.productId) })),
    ledger: db.data.commissionLedger.filter((l) => l.partnerId === p.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((l) => ({ ...l, productName: l.productId ? productName(l.productId) : '' })),
    withdrawals: db.data.withdrawals.filter((w) => w.partnerId === p.id).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
    products: db.data.products.map((pr) => ({ id: pr.id, name: pr.name, pricingAnnual: pr.pricingAnnual })),
    latestTermsVersion: activeTerms().version
  });
});

// Decrypt PAN / bank numbers on explicit request only; every access is audit-logged.
router.get('/:id/sensitive', locked(async (req) => {
  const p = db.data.partners.find((x) => x.id === req.params.id);
  if (!p) return notFound('Partner');
  audit(actor(req), 'partner.sensitive.view', p.id);
  await db.write();
  return {
    body: {
      pan: decrypt(p.pan?.enc),
      accountNumber: decrypt(p.bank?.accountEnc),
      pendingAccountNumber: p.pendingBankChange ? decrypt(p.pendingBankChange.accountEnc) : null
    }
  };
}));

router.get('/:id/documents/:docId', async (req, res) => {
  await db.read();
  const p = db.data.partners.find((x) => x.id === req.params.id);
  const doc = p?.documents?.find((d) => d.id === req.params.docId);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  const file = path.join(PARTNER_DOCS_DIR, path.basename(doc.storedName));
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'File missing on server' });
  await withLock(async () => {
    await db.read();
    audit(actor(req), 'partner.document.view', p.id, { docId: doc.id, type: doc.type });
    await db.write();
  });
  res.setHeader('Content-Type', doc.mime);
  res.setHeader('Content-Disposition', `inline; filename="${doc.type}${path.extname(doc.storedName)}"`);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  fs.createReadStream(file).pipe(res);
});

router.put('/:id/status', locked(async (req) => {
  const p = db.data.partners.find((x) => x.id === req.params.id);
  if (!p) return notFound('Partner');
  const status = req.body?.status;
  const reason = clean(req.body?.reason, 500);
  if (!['approved', 'rejected', 'suspended', 'pending'].includes(status)) return { status: 400, body: { error: 'Invalid status' } };
  if (status === 'rejected' && !reason) return { status: 400, body: { error: 'Give a reason for rejection' } };
  const now = new Date().toISOString();
  if (status === 'approved') {
    p.approvedAt ||= now;
    p.approvedBy ||= actor(req);
    if (req.body?.verifyBank !== false) p.bank.verified = true;
    // On first approval grant access to all products unless admin assigned access already.
    if (!p.productAccess?.length && Array.isArray(req.body?.productIds)) {
      p.productAccess = req.body.productIds
        .filter((id) => db.data.products.some((pr) => pr.id === id))
        .map((productId) => ({ productId, enabled: true, commissionPercent: null, renewalPercent: null }));
    }
  }
  if (status === 'suspended' || status === 'rejected') p.tokenVersion = (p.tokenVersion || 0) + 1;
  p.status = status;
  p.statusReason = reason;
  p.statusHistory.push({ status, at: now, by: actor(req), reason });
  p.updatedAt = now;
  audit(actor(req), `partner.status.${status}`, p.id, { reason });
  await db.write();
  return { body: partnerSummary(p) };
}));

router.put('/:id', locked(async (req) => {
  const p = db.data.partners.find((x) => x.id === req.params.id);
  if (!p) return notFound('Partner');
  const b = req.body || {};
  if (b.tier !== undefined) p.tier = clean(b.tier, 40);
  if (b.adminNotes !== undefined) p.adminNotes = clean(b.adminNotes, 3000);
  if (b.partnerType && PARTNER_TYPES[b.partnerType]) p.partnerType = b.partnerType;
  if (b.commission) {
    const d = pct(b.commission.defaultPercent);
    const r = pct(b.commission.renewalPercent);
    if (d === null || r === null) return { status: 400, body: { error: 'Commission percentages must be between 0 and 100' } };
    p.commission = { defaultPercent: d, renewalPercent: r };
  }
  if (b.business) p.business = { ...p.business, ...Object.fromEntries(Object.entries(b.business).map(([k, v]) => [k, clean(v, 200)])) };
  if (b.contact) p.contact = { ...p.contact, ...Object.fromEntries(Object.entries(b.contact).map(([k, v]) => [k, clean(v, 150)])) };
  if (b.address) p.address = { ...p.address, ...Object.fromEntries(Object.entries(b.address).map(([k, v]) => [k, clean(v, 200)])) };
  if (b.bankVerified !== undefined) p.bank.verified = !!b.bankVerified;
  p.updatedAt = new Date().toISOString();
  audit(actor(req), 'partner.update', p.id, { fields: Object.keys(b) });
  await db.write();
  return { body: publicPartner(p) };
}));

// Assign software + per-product commission overrides.
router.put('/:id/access', locked(async (req) => {
  const p = db.data.partners.find((x) => x.id === req.params.id);
  if (!p) return notFound('Partner');
  const items = Array.isArray(req.body?.productAccess) ? req.body.productAccess : null;
  if (!items) return { status: 400, body: { error: 'productAccess array required' } };
  const next = [];
  for (const a of items) {
    if (!db.data.products.some((pr) => pr.id === a.productId)) continue;
    const c = a.commissionPercent === '' || a.commissionPercent === null || a.commissionPercent === undefined ? null : pct(a.commissionPercent);
    const r = a.renewalPercent === '' || a.renewalPercent === null || a.renewalPercent === undefined ? null : pct(a.renewalPercent);
    if ((a.commissionPercent && c === null) || (a.renewalPercent && r === null)) return { status: 400, body: { error: 'Commission must be between 0 and 100' } };
    next.push({
      productId: a.productId,
      enabled: a.enabled !== false,
      commissionPercent: c,
      renewalPercent: r,
      plans: Array.isArray(a.plans) ? a.plans.filter((pl) => pl?.name).slice(0, 10).map((pl) => ({ name: clean(pl.name, 80), price: toMoney(pl.price) })) : [],
      demoAccess: a.demoAccess ? { url: clean(a.demoAccess.url, 300), username: clean(a.demoAccess.username, 100), password: clean(a.demoAccess.password, 100) } : null,
      resources: Array.isArray(a.resources) ? a.resources.filter((r2) => r2?.url).slice(0, 10).map((r2) => ({ label: clean(r2.label, 100), url: clean(r2.url, 300) })) : []
    });
  }
  p.productAccess = next;
  p.updatedAt = new Date().toISOString();
  audit(actor(req), 'partner.access.update', p.id, { products: next.map((n) => n.productId) });
  await db.write();
  return { body: publicPartner(p) };
}));

router.put('/:id/bank-change', locked(async (req) => {
  const p = db.data.partners.find((x) => x.id === req.params.id);
  if (!p?.pendingBankChange) return notFound('Pending bank change');
  const action = req.body?.action;
  if (action === 'approve') {
    const { requestedAt, documentId, ...bank } = p.pendingBankChange;
    p.bankHistory ||= [];
    p.bankHistory.push({ ...p.bank, replacedAt: new Date().toISOString() });
    p.bank = { ...bank, verified: true };
  } else if (action !== 'reject') {
    return { status: 400, body: { error: 'action must be approve or reject' } };
  }
  p.pendingBankChange = null;
  audit(actor(req), `partner.bank.${action}`, p.id);
  await db.write();
  return { body: publicPartner(p) };
}));

router.post('/:id/adjustments', locked(async (req) => {
  const p = db.data.partners.find((x) => x.id === req.params.id);
  if (!p) return notFound('Partner');
  const amount = toMoney(req.body?.amount);
  const description = clean(req.body?.description, 300);
  if (!amount || !description) return { status: 400, body: { error: 'amount (non-zero) and description are required' } };
  if (amount < 0 && partnerBalance(p.id).available + amount < 0) {
    return { status: 400, body: { error: 'Debit adjustment exceeds available balance' } };
  }
  const entry = addLedgerEntry({ partnerId: p.id, type: 'adjustment', amount, description, createdBy: actor(req) });
  audit(actor(req), 'partner.ledger.adjustment', p.id, { amount });
  await db.write();
  return { status: 201, body: entry };
}));

export default router;

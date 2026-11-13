import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import { db } from '../db/lowdb.js';
import { requirePartner } from '../middleware/auth.js';
import { withLock } from '../utils/lock.js';
import { encrypt } from '../utils/crypto.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { partnerDocsUpload, filesToDocs, PARTNER_DOCS_DIR } from '../middleware/upload.js';
import {
  GSTIN_RE, MOBILE_RE, EMAIL_RE, PINCODE_RE, IFSC_RE, ACCOUNT_RE,
  clean, upper, normMobile, toMoney
} from '../utils/validators.js';
import { partnerBalance, program, publicPartner, productName, activeTerms } from '../services/partners.js';

const router = Router();

const INSTALL_STATUSES = ['not_requested', 'requested', 'scheduled', 'in_progress', 'completed', 'cancelled'];

// Status endpoint works for any partner state so pending applicants can see where they stand.
router.get('/me', requirePartner({ allowUnapproved: true }), (req, res) => {
  const p = req.partner;
  const terms = activeTerms();
  const accepted = (p.termsAcceptance || []).some((t) => t.version === terms.version);
  res.json({ ...publicPartner(p), termsUpToDate: accepted, latestTermsVersion: terms.version });
});

router.get('/terms', requirePartner({ allowUnapproved: true }), (req, res) => {
  const t = activeTerms();
  res.json({ version: t.version, content: t.content, effectiveFrom: t.effectiveFrom, accepted: req.partner.termsAcceptance || [] });
});

router.post('/terms/accept', requirePartner({ allowUnapproved: true }), async (req, res) => {
  const out = await withLock(async () => {
    await db.read();
    const p = db.data.partners.find((x) => x.id === req.partner.id);
    const t = activeTerms();
    if (Number(req.body?.version) !== t.version) return { status: 409, body: { error: 'Terms version mismatch, reload and try again' } };
    if (!p.termsAcceptance.some((a) => a.version === t.version)) {
      p.termsAcceptance.push({ version: t.version, acceptedAt: new Date().toISOString(), ip: req.ip, userAgent: clean(req.headers['user-agent'], 200) });
      await db.write();
    }
    return { status: 200, body: { ok: true } };
  });
  res.status(out.status).json(out.body);
});

router.use(requirePartner());

function customerView(c) {
  return { ...c, productName: productName(c.productId) };
}

router.get('/dashboard', (req, res) => {
  const pid = req.partner.id;
  const customers = db.data.partnerCustomers.filter((c) => c.partnerId === pid);
  const ledger = db.data.commissionLedger.filter((l) => l.partnerId === pid);
  const balance = partnerBalance(pid);

  // Last 6 months earnings + approved customers
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({
      month: key,
      label: d.toLocaleString('en-IN', { month: 'short' }),
      earnings: toMoney(ledger.filter((l) => l.createdAt.startsWith(key)).reduce((s, l) => s + l.amount, 0)),
      customers: customers.filter((c) => c.status === 'approved' && (c.approvedAt || '').startsWith(key)).length
    });
  }
  const thisMonth = months[months.length - 1];
  const total = customers.length;
  const approved = customers.filter((c) => c.status === 'approved').length;
  const decided = customers.filter((c) => ['approved', 'rejected'].includes(c.status)).length;

  res.json({
    balance,
    counts: {
      totalCustomers: total,
      approvedCustomers: approved,
      pendingApprovals: customers.filter((c) => c.status === 'submitted').length,
      rejectedCustomers: customers.filter((c) => c.status === 'rejected').length,
      pendingInstallations: customers.filter((c) => ['requested', 'scheduled', 'in_progress'].includes(c.installation?.status)).length,
      completedInstallations: customers.filter((c) => c.installation?.status === 'completed').length
    },
    performance: {
      approvalRate: decided ? Math.round((approved / decided) * 100) : null,
      thisMonthEarnings: thisMonth.earnings,
      thisMonthCustomers: thisMonth.customers,
      tier: req.partner.tier
    },
    monthly: months,
    recentCustomers: customers.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map(customerView),
    recentCommissions: ledger.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map((l) => ({ ...l, productName: productName(l.productId) }))
  });
});

// ---------- Software access ----------
router.get('/software', (req, res) => {
  const access = (req.partner.productAccess || []).filter((a) => a.enabled !== false);
  res.json(
    access
      .map((a) => {
        const pr = db.data.products.find((x) => x.id === a.productId);
        if (!pr) return null;
        return {
          productId: pr.id,
          name: pr.name,
          category: pr.category,
          icon: pr.icon,
          description: pr.description,
          pricingAnnual: pr.pricingAnnual,
          introPage: pr.introPage || '',
          commissionPercent: a.commissionPercent ?? req.partner.commission.defaultPercent,
          renewalPercent: a.renewalPercent ?? req.partner.commission.renewalPercent,
          plans: a.plans?.length ? a.plans : pr.pricingAnnual ? [{ name: 'Standard (Annual)', price: pr.pricingAnnual }] : [],
          demoAccess: a.demoAccess || null,
          resources: a.resources || []
        };
      })
      .filter(Boolean)
  );
});

// ---------- Customers ----------
function readCustomer(body, partner) {
  const d = {
    businessName: clean(body.businessName, 150),
    contactName: clean(body.contactName, 120),
    mobile: normMobile(body.mobile),
    email: clean(body.email, 150).toLowerCase(),
    gstin: upper(body.gstin, 15),
    businessType: clean(body.businessType, 80),
    addressLine: clean(body.addressLine, 250),
    city: clean(body.city, 80),
    state: clean(body.state, 80),
    pincode: clean(body.pincode, 6),
    productId: clean(body.productId, 40),
    plan: clean(body.plan, 80),
    planAmount: toMoney(body.planAmount),
    counters: Math.max(1, Math.min(50, parseInt(body.counters, 10) || 1)),
    notes: clean(body.notes, 1000),
    consent: body.consent === true
  };
  const errors = {};
  if (!d.businessName) errors.businessName = 'Required';
  if (!d.contactName) errors.contactName = 'Required';
  if (!MOBILE_RE.test(d.mobile)) errors.mobile = 'Enter a valid 10-digit mobile number';
  if (d.email && !EMAIL_RE.test(d.email)) errors.email = 'Invalid email';
  if (d.gstin && !GSTIN_RE.test(d.gstin)) errors.gstin = 'Invalid GSTIN';
  if (d.pincode && !PINCODE_RE.test(d.pincode)) errors.pincode = 'Invalid PIN code';
  if (!d.city) errors.city = 'Required';
  if (!d.state) errors.state = 'Required';
  const access = (partner.productAccess || []).find((a) => a.productId === d.productId && a.enabled !== false);
  if (!access) errors.productId = 'Select a product assigned to you';
  if (!(d.planAmount > 0)) errors.planAmount = 'Enter the plan value (excluding GST)';
  if (!d.consent) errors.consent = 'Confirm you have the customer’s consent';
  return { d, errors };
}

router.get('/customers', (req, res) => {
  const list = db.data.partnerCustomers
    .filter((c) => c.partnerId === req.partner.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(customerView);
  res.json(list);
});

router.post('/customers', async (req, res) => {
  const { d, errors } = readCustomer(req.body || {}, req.partner);
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please fix the highlighted fields', fields: errors });

  const out = await withLock(async () => {
    await db.read();
    const dup = db.data.partnerCustomers.find(
      (c) => c.productId === d.productId && c.status !== 'rejected' && (c.mobile === d.mobile || (d.gstin && c.gstin === d.gstin))
    );
    if (dup) {
      return { status: 409, body: { error: dup.partnerId === req.partner.id ? 'You have already registered this customer for this product.' : 'This customer is already registered for this product by another partner.' } };
    }
    const now = new Date().toISOString();
    const wantInstall = req.body?.requestInstallation === true;
    const customer = {
      id: nanoid(),
      partnerId: req.partner.id,
      ...d,
      status: 'submitted',
      reviewNote: '',
      installation: {
        status: wantInstall ? 'requested' : 'not_requested',
        mode: ['remote', 'onsite'].includes(req.body?.installMode) ? req.body.installMode : 'remote',
        preferredDate: clean(req.body?.preferredDate, 10),
        notes: clean(req.body?.installNotes, 500),
        requestedAt: wantInstall ? now : null,
        history: wantInstall ? [{ status: 'requested', at: now, by: 'partner' }] : []
      },
      subscription: null,
      createdAt: now,
      updatedAt: now
    };
    db.data.partnerCustomers.push(customer);
    await db.write();
    return { status: 201, body: customerView(customer) };
  });
  res.status(out.status).json(out.body);
});

router.put('/customers/:id', async (req, res) => {
  const out = await withLock(async () => {
    await db.read();
    const c = db.data.partnerCustomers.find((x) => x.id === req.params.id && x.partnerId === req.partner.id);
    if (!c) return { status: 404, body: { error: 'Customer not found' } };
    if (c.status !== 'submitted') return { status: 400, body: { error: 'Only customers awaiting approval can be edited. Contact Reynrel for changes.' } };
    const { d, errors } = readCustomer({ ...req.body, consent: true }, req.partner);
    if (Object.keys(errors).length) return { status: 400, body: { error: 'Please fix the highlighted fields', fields: errors } };
    const { consent, ...rest } = d;
    Object.assign(c, rest, { updatedAt: new Date().toISOString() });
    await db.write();
    return { status: 200, body: customerView(c) };
  });
  res.status(out.status).json(out.body);
});

router.post('/customers/:id/installation', async (req, res) => {
  const out = await withLock(async () => {
    await db.read();
    const c = db.data.partnerCustomers.find((x) => x.id === req.params.id && x.partnerId === req.partner.id);
    if (!c) return { status: 404, body: { error: 'Customer not found' } };
    if (c.status === 'rejected') return { status: 400, body: { error: 'Customer registration was rejected' } };
    const action = req.body?.action === 'cancel' ? 'cancel' : 'request';
    const now = new Date().toISOString();
    const inst = c.installation;
    if (action === 'request') {
      if (['requested', 'scheduled', 'in_progress'].includes(inst.status)) return { status: 400, body: { error: 'An installation request is already open' } };
      inst.status = 'requested';
      inst.mode = ['remote', 'onsite'].includes(req.body?.mode) ? req.body.mode : 'remote';
      inst.preferredDate = clean(req.body?.preferredDate, 10);
      inst.notes = clean(req.body?.notes, 500);
      inst.requestedAt = now;
      inst.history.push({ status: 'requested', at: now, by: 'partner' });
    } else {
      if (inst.status !== 'requested') return { status: 400, body: { error: 'Only un-scheduled requests can be cancelled' } };
      inst.status = 'cancelled';
      inst.history.push({ status: 'cancelled', at: now, by: 'partner' });
    }
    c.updatedAt = now;
    await db.write();
    return { status: 200, body: customerView(c) };
  });
  res.status(out.status).json(out.body);
});

// ---------- Commission ----------
router.get('/commissions', (req, res) => {
  const pid = req.partner.id;
  const customersById = Object.fromEntries(db.data.partnerCustomers.filter((c) => c.partnerId === pid).map((c) => [c.id, c]));
  const ledger = db.data.commissionLedger
    .filter((l) => l.partnerId === pid)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((l) => ({ ...l, productName: l.productId ? productName(l.productId) : '', customerName: customersById[l.customerId]?.businessName || '' }));
  const rates = (req.partner.productAccess || [])
    .filter((a) => a.enabled !== false)
    .map((a) => ({
      productId: a.productId,
      productName: productName(a.productId),
      commissionPercent: a.commissionPercent ?? req.partner.commission.defaultPercent,
      renewalPercent: a.renewalPercent ?? req.partner.commission.renewalPercent
    }));
  res.json({ balance: partnerBalance(pid), rates, defaults: req.partner.commission, tdsPercent: program().tdsPercent, ledger });
});

// ---------- Withdrawals ----------
router.get('/withdrawals', (req, res) => {
  const list = db.data.withdrawals.filter((w) => w.partnerId === req.partner.id).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  res.json({ balance: partnerBalance(req.partner.id), tdsPercent: program().tdsPercent, withdrawals: list });
});

router.post('/withdrawals', async (req, res) => {
  const out = await withLock(async () => {
    await db.read();
    const p = db.data.partners.find((x) => x.id === req.partner.id);
    const prog = program();
    const bal = partnerBalance(p.id);
    const amount = toMoney(req.body?.amount);
    if (!p.bank?.verified) return { status: 400, body: { error: 'Your bank account has not been verified yet by Reynrel.' } };
    if (p.pendingBankChange) return { status: 400, body: { error: 'A bank account change is awaiting verification. Withdrawals resume once it is approved.' } };
    if (db.data.withdrawals.some((w) => w.partnerId === p.id && ['requested', 'approved'].includes(w.status))) {
      return { status: 400, body: { error: 'You already have a withdrawal in process.' } };
    }
    if (bal.available < prog.minWithdrawal) {
      return { status: 400, body: { error: `Withdrawals unlock when your available commission reaches ₹${prog.minWithdrawal.toLocaleString('en-IN')}.` } };
    }
    if (!(amount >= prog.minWithdrawal)) return { status: 400, body: { error: `Minimum withdrawal is ₹${prog.minWithdrawal.toLocaleString('en-IN')}.` } };
    if (amount > bal.available) return { status: 400, body: { error: 'Amount exceeds your available commission.' } };

    const tdsAmount = toMoney((amount * prog.tdsPercent) / 100);
    const w = {
      id: nanoid(),
      reference: `WD-${Date.now().toString(36).toUpperCase()}`,
      partnerId: p.id,
      amount,
      tdsPercent: prog.tdsPercent,
      tdsAmount,
      netAmount: toMoney(amount - tdsAmount),
      status: 'requested',
      note: clean(req.body?.note, 300),
      bankSnapshot: { accountHolder: p.bank.accountHolder, accountLast4: p.bank.accountLast4, ifsc: p.bank.ifsc, bankName: p.bank.bankName },
      requestedAt: new Date().toISOString(),
      history: [{ status: 'requested', at: new Date().toISOString(), by: 'partner' }],
      payment: null
    };
    db.data.withdrawals.push(w);
    await db.write();
    return { status: 201, body: w };
  });
  res.status(out.status).json(out.body);
});

// ---------- Profile ----------
router.put('/profile', async (req, res) => {
  const b = req.body || {};
  const errors = {};
  const email = clean(b.email, 150).toLowerCase();
  const mobile = normMobile(b.mobile);
  const whatsapp = normMobile(b.whatsapp);
  const gstin = upper(b.gstin, 15);
  if (!clean(b.fullName)) errors.fullName = 'Required';
  if (!EMAIL_RE.test(email)) errors.email = 'Invalid email';
  if (!MOBILE_RE.test(mobile)) errors.mobile = 'Invalid mobile';
  if (whatsapp && !MOBILE_RE.test(whatsapp)) errors.whatsapp = 'Invalid number';
  if (gstin && !GSTIN_RE.test(gstin)) errors.gstin = 'Invalid GSTIN';
  if (b.pincode && !PINCODE_RE.test(clean(b.pincode))) errors.pincode = 'Invalid PIN code';
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please fix the highlighted fields', fields: errors });

  const out = await withLock(async () => {
    await db.read();
    const p = db.data.partners.find((x) => x.id === req.partner.id);
    if (db.data.partners.some((x) => x.id !== p.id && (x.contact.email === email || x.contact.mobile === mobile))) {
      return { status: 409, body: { error: 'Email or mobile is already used by another partner account' } };
    }
    p.personal.fullName = clean(b.fullName, 120);
    p.contact = { email, mobile, whatsapp: whatsapp || mobile };
    p.address = {
      line1: clean(b.addressLine1, 200), line2: clean(b.addressLine2, 200), city: clean(b.city, 80),
      district: clean(b.district, 80), state: clean(b.state, 80), pincode: clean(b.pincode, 6)
    };
    p.business = { ...p.business, name: clean(b.businessName, 150), gstin, website: clean(b.website, 200) };
    p.professional = {
      ...p.professional,
      qualification: clean(b.qualification, 120),
      experienceYears: clean(b.experienceYears, 10),
      teamSize: clean(b.teamSize, 20),
      areasServed: clean(b.areasServed, 300)
    };
    p.updatedAt = new Date().toISOString();
    await db.write();
    return { status: 200, body: publicPartner(p) };
  });
  res.status(out.status).json(out.body);
});

// Bank changes are never applied directly: they wait for admin verification
// (protects payouts if a partner login is compromised).
router.post('/profile/bank', partnerDocsUpload.fields([{ name: 'cancelledCheque', maxCount: 1 }]), async (req, res) => {
  const files = req.files || {};
  const drop = () => Promise.all(Object.values(files).flat().map((f) => fs.unlink(path.join(PARTNER_DOCS_DIR, f.filename)).catch(() => {})));
  const b = req.body || {};
  const accountNumber = clean(b.accountNumber, 20).replace(/\s/g, '');
  const ifsc = upper(b.ifsc, 11);
  const errors = {};
  if (!clean(b.accountHolder)) errors.accountHolder = 'Required';
  if (!ACCOUNT_RE.test(accountNumber)) errors.accountNumber = 'Account number must be 9–18 digits';
  if (accountNumber !== clean(b.accountNumberConfirm, 20).replace(/\s/g, '')) errors.accountNumberConfirm = 'Account numbers do not match';
  if (!IFSC_RE.test(ifsc)) errors.ifsc = 'Invalid IFSC';
  if (!clean(b.bankName)) errors.bankName = 'Required';
  if (!files.cancelledCheque) errors.cancelledCheque = 'Upload a cancelled cheque or passbook for the new account';
  if (!b.password || !comparePassword(b.password, req.partner.passwordHash)) errors.password = 'Password is incorrect';
  if (Object.keys(errors).length) {
    await drop();
    return res.status(400).json({ error: 'Please fix the highlighted fields', fields: errors });
  }
  const out = await withLock(async () => {
    await db.read();
    const p = db.data.partners.find((x) => x.id === req.partner.id);
    if (db.data.withdrawals.some((w) => w.partnerId === p.id && ['requested', 'approved'].includes(w.status))) {
      return { status: 400, body: { error: 'You cannot change bank details while a withdrawal is in process.' } };
    }
    const docs = filesToDocs(files);
    p.documents.push(...docs);
    p.pendingBankChange = {
      accountHolder: clean(b.accountHolder, 120),
      accountEnc: encrypt(accountNumber),
      accountLast4: accountNumber.slice(-4),
      ifsc,
      bankName: clean(b.bankName, 120),
      branch: clean(b.branch, 120),
      accountType: ['savings', 'current'].includes(b.accountType) ? b.accountType : 'savings',
      documentId: docs[0]?.id,
      requestedAt: new Date().toISOString()
    };
    await db.write();
    return { status: 200, body: publicPartner(p) };
  });
  if (out.status !== 200) await drop();
  res.status(out.status).json(out.body);
});

router.put('/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !comparePassword(currentPassword, req.partner.passwordHash)) return res.status(400).json({ error: 'Current password is incorrect' });
  if (!newPassword || newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return res.status(400).json({ error: 'New password must be at least 8 characters with letters and numbers' });
  }
  await withLock(async () => {
    await db.read();
    const p = db.data.partners.find((x) => x.id === req.partner.id);
    p.passwordHash = hashPassword(newPassword);
    p.tokenVersion = (p.tokenVersion || 0) + 1;
    await db.write();
  });
  res.json({ ok: true, message: 'Password changed. Please log in again.' });
});

export { INSTALL_STATUSES };
export default router;

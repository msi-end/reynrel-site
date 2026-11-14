import { Router } from 'express';
import { nanoid, customAlphabet } from 'nanoid';
import { db } from '../../db/index.js';
import { requirePartner, requirePermission } from '../../middleware/auth.js';
import { documentUpload, filesOf, discard } from '../../middleware/upload.js';
import { h, bad, notFound, nowIso, paginate, parseJSON } from '../../utils/http.js';
import { RE, str, up, mobile, money, round2, FieldErrors } from '../../utils/validators.js';
import { checkPassword } from '../../utils/password.js';
import { encrypt, blindIndex } from '../../utils/crypto.js';
import { partnerView, documentSummary, documentTypes, insertDocuments, recordTermsAcceptance } from '../../services/partners.js';
import { latestTerms, getProgram } from '../../services/settings.js';
import { partnerCatalogue, quote } from '../../services/pricing.js';
import { balance } from '../../services/ledger.js';
import { audit } from '../../services/audit.js';

const router = Router();
const ref = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);
const OPEN_INSTALL = ['requested', 'scheduled', 'in_progress'];

// ---------- Available in every account state (pending applicants can check status and fix documents) ----------
const anyState = requirePartner({ allowInactive: true });

router.get('/me', anyState, h(async (req, res) => {
  const p = req.partner;
  const [terms, accepted, docs] = await Promise.all([
    latestTerms(),
    db.all('SELECT version FROM terms_acceptances WHERE partner_id = ?', [p.id]),
    documentSummary(p.id, !!p.gstin)
  ]);
  res.json({ ...partnerView(p), documents: docs, termsVersion: terms.version, termsAccepted: accepted.some((a) => a.version === terms.version) });
}));

router.get('/terms', anyState, h(async (req, res) => res.json(await latestTerms())));

router.post('/terms/accept', anyState, h(async (req, res) => {
  const terms = await latestTerms();
  if (Number(req.body?.version) !== terms.version) throw bad('Terms have changed, reload and try again');
  await recordTermsAcceptance(db, req.partner.id, terms.version, req.ip);
  res.json({ ok: true });
}));

router.get('/documents', anyState, h(async (req, res) => {
  const [types, docs] = await Promise.all([
    documentTypes(),
    db.all('SELECT id, doc_type, original_name, mime, size, status, remarks, uploaded_at, verified_at FROM partner_documents WHERE partner_id = ? ORDER BY uploaded_at DESC', [req.partner.id])
  ]);
  res.json({ types, documents: docs, hasGstin: !!req.partner.gstin });
}));

router.post('/documents', anyState, documentUpload.any(), h(async (req, res) => {
  const files = filesOf(req);
  try {
    if (!files.length) throw bad('Choose a file to upload');
    const rows = await db.tx((t) => insertDocuments(t, req.partner.id, files, req.actor));
    if (!rows.length) throw bad('Unknown document type');
    res.status(201).json(rows.map(({ stored_name, ...r }) => r));
  } catch (err) {
    await discard(files);
    throw err;
  }
}));

// ---------- Approved partners only ----------
router.use(requirePartner());

router.get('/dashboard', h(async (req, res) => {
  const pid = req.partner.id;
  const since = new Date();
  since.setMonth(since.getMonth() - 5, 1);
  const sinceIso = since.toISOString().slice(0, 7);
  const [bal, counts, inst, monthlyRows, recentOrders, recentCommissions] = await Promise.all([
    balance(pid),
    db.get(
      `SELECT COUNT(DISTINCT customer_id) AS customers,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
        SUM(CASE WHEN status = 'approved' THEN sale_amount ELSE 0 END) AS sales
       FROM orders WHERE partner_id = ?`, [pid]),
    db.get(`SELECT SUM(CASE WHEN status IN ('requested','scheduled','in_progress') THEN 1 ELSE 0 END) AS open_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS done FROM installations WHERE partner_id = ?`, [pid]),
    db.all('SELECT created_at, amount FROM commissions WHERE partner_id = ? AND created_at >= ?', [pid, sinceIso]),
    db.all(`SELECT o.id, o.reference, o.status, o.sale_amount, o.created_at, c.business_name, p.name AS product_name
            FROM orders o JOIN customers c ON c.id = o.customer_id JOIN products p ON p.id = o.product_id
            WHERE o.partner_id = ? ORDER BY o.created_at DESC LIMIT 5`, [pid]),
    db.all('SELECT id, type, description, amount, base_amount, pct, created_at FROM commissions WHERE partner_id = ? ORDER BY created_at DESC LIMIT 5', [pid])
  ]);
  const months = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date();
    d.setMonth(d.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    months.push({ month: key, label: d.toLocaleString('en-IN', { month: 'short' }), earnings: round2(monthlyRows.filter((r) => r.created_at.startsWith(key)).reduce((s, r) => s + Number(r.amount), 0)) });
  }
  const decided = Number(counts.approved || 0) + Number(counts.rejected || 0);
  res.json({
    balance: bal,
    counts: {
      customers: Number(counts.customers || 0), approvedOrders: Number(counts.approved || 0), pendingOrders: Number(counts.pending || 0),
      openInstallations: Number(inst.open_count || 0), completedInstallations: Number(inst.done || 0), approvedSales: round2(counts.sales || 0)
    },
    approvalRate: decided ? Math.round((Number(counts.approved) / decided) * 100) : null,
    monthly: months,
    recentOrders,
    recentCommissions
  });
}));

router.get('/products', h(async (req, res) => {
  const cat = await partnerCatalogue(req.partner);
  if (!req.partner.permissions.viewPricing) cat.forEach((p) => p.plans.forEach((pl) => { pl.listPrice = null; }));
  if (!req.partner.permissions.viewDemoAccess) cat.forEach((p) => { p.demo = null; });
  res.json(cat);
}));

router.post('/quote', h(async (req, res) => {
  const q = await quote(req.partner, { productId: req.body?.productId, planId: req.body?.planId, serviceIds: arr(req.body?.serviceIds) });
  if (q.error) throw bad(q.error);
  res.json({ lines: q.lines, listAmount: q.listAmount, saleAmount: q.saleAmount, commission: q.commission });
}));

// ---------- Customers & orders ----------
const arr = (v) => (Array.isArray(v) ? v.map((x) => str(x, 40)).filter(Boolean).slice(0, 20) : []);

function readCustomer(b) {
  const c = {
    business_name: str(b.businessName, 150), contact_name: str(b.contactName, 120), mobile: mobile(b.mobile), email: str(b.email, 150).toLowerCase(),
    gstin: up(b.gstin, 15), business_type: str(b.businessType, 80), address: str(b.address, 250), city: str(b.city, 80), state: str(b.state, 80),
    pincode: str(b.pincode, 6), notes: str(b.notes, 1000)
  };
  const e = new FieldErrors();
  e.check(c.business_name, 'businessName', 'Required').check(c.contact_name, 'contactName', 'Required')
    .check(RE.mobile.test(c.mobile), 'mobile', 'Enter a valid 10-digit mobile number')
    .check(!c.email || RE.email.test(c.email), 'email', 'Invalid email')
    .check(!c.gstin || RE.gstin.test(c.gstin), 'gstin', 'Invalid GSTIN')
    .check(!c.pincode || RE.pincode.test(c.pincode), 'pincode', 'Invalid PIN code')
    .check(c.city, 'city', 'Required').check(c.state, 'state', 'Required');
  return { c, e };
}

async function createOrder(t, partner, customer, o, actor) {
  const access = await t.get('SELECT enabled FROM partner_products WHERE partner_id = ? AND product_id = ?', [partner.id, o.productId]);
  if (!access?.enabled) throw bad('This product is not assigned to your account', { fields: { productId: 'Select a product assigned to you' } });
  const q = await quote(partner, { productId: o.productId, planId: o.planId, serviceIds: arr(o.serviceIds) }, t);
  if (q.error) throw bad(q.error);
  if (!q.lines.length) throw bad('Choose a plan or at least one service', { fields: { planId: 'Choose a plan' } });
  const dup = await t.get(
    `SELECT o.partner_id FROM orders o JOIN customers c ON c.id = o.customer_id
     WHERE o.product_id = ? AND o.status IN ('submitted','approved') AND (c.mobile = ? OR (? <> '' AND c.gstin = ?))`,
    [o.productId, customer.mobile, customer.gstin || '', customer.gstin || '']
  );
  if (dup) throw bad(dup.partner_id === partner.id ? 'This customer already has this product registered by you.' : 'This customer is already registered for this product by another partner.');
  const id = nanoid();
  const ts = nowIso();
  await t.run(
    `INSERT INTO orders (id, reference, customer_id, partner_id, product_id, plan_id, plan_name, services, counters, list_amount, sale_amount, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?)`,
    [id, `ORD-${ref()}`, customer.id, partner.id, o.productId, q.plan?.id || null, q.plan?.name || null,
      JSON.stringify(q.lines), Math.max(1, Math.min(100, parseInt(o.counters, 10) || 1)), q.listAmount, q.saleAmount, ts, ts]
  );
  if (o.installation?.request) {
    if (!partner.permissions.requestInstallations) throw bad('Installation requests are not enabled for your account');
    await createInstallation(t, { orderId: id, customerId: customer.id, partnerId: partner.id, ...o.installation }, actor);
  }
  return id;
}

async function createInstallation(t, { orderId, customerId, partnerId, mode, preferredDate, notes }, actor) {
  const id = nanoid();
  const ts = nowIso();
  await t.run(
    `INSERT INTO installations (id, order_id, customer_id, partner_id, status, mode, preferred_date, partner_notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'requested', ?, ?, ?, ?, ?)`,
    [id, orderId, customerId, partnerId, mode === 'onsite' ? 'onsite' : 'remote', RE.date.test(preferredDate || '') ? preferredDate : null, str(notes, 500), ts, ts]
  );
  await t.run('INSERT INTO installation_events (id, installation_id, status, note, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)', [nanoid(), id, 'requested', str(notes, 200), actor, ts]);
  return id;
}

async function customerDetail(partnerId, customerId) {
  const c = await db.get('SELECT * FROM customers WHERE id = ? AND partner_id = ?', [customerId, partnerId]);
  if (!c) throw notFound('Customer');
  const orders = await db.all(
    `SELECT o.*, p.name AS product_name FROM orders o JOIN products p ON p.id = o.product_id WHERE o.customer_id = ? ORDER BY o.created_at DESC`, [c.id]);
  const inst = orders.length
    ? await db.all(`SELECT * FROM installations WHERE order_id IN (${orders.map(() => '?').join(',')}) ORDER BY created_at DESC`, orders.map((o) => o.id))
    : [];
  const events = inst.length
    ? await db.all(`SELECT * FROM installation_events WHERE installation_id IN (${inst.map(() => '?').join(',')}) ORDER BY created_at`, inst.map((i) => i.id))
    : [];
  return {
    ...c,
    orders: orders.map((o) => ({
      ...o, services: parseJSON(o.services, []),
      installations: inst.filter((i) => i.order_id === o.id).map((i) => ({ ...i, events: events.filter((e) => e.installation_id === i.id) }))
    }))
  };
}

router.get('/customers', h(async (req, res) => {
  const { limit, offset } = paginate(req);
  const q = `%${str(req.query.q, 80)}%`;
  const status = str(req.query.status, 20);
  const where = ['c.partner_id = ?', '(c.business_name LIKE ? OR c.contact_name LIKE ? OR c.mobile LIKE ? OR c.city LIKE ?)'];
  const params = [req.partner.id, q, q, q, q];
  if (status) {
    where.push('EXISTS (SELECT 1 FROM orders x WHERE x.customer_id = c.id AND x.status = ?)');
    params.push(status);
  }
  const [rows, total] = await Promise.all([
    db.all(
      `SELECT c.id, c.business_name, c.contact_name, c.mobile, c.city, c.state, c.created_at,
        (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS orders,
        (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status = 'approved') AS approved,
        (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status = 'submitted') AS pending,
        (SELECT COUNT(*) FROM installations i WHERE i.customer_id = c.id AND i.status IN ('requested','scheduled','in_progress')) AS open_installs
       FROM customers c WHERE ${where.join(' AND ')} ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${offset}`, params),
    db.get(`SELECT COUNT(*) AS n FROM customers c WHERE ${where.join(' AND ')}`, params)
  ]);
  res.json({ rows, total: Number(total.n) });
}));

router.get('/customers/:id', h(async (req, res) => res.json(await customerDetail(req.partner.id, req.params.id))));

router.post('/customers', requirePermission('addCustomers'), h(async (req, res) => {
  const { c, e } = readCustomer(req.body || {});
  const order = req.body?.order || {};
  e.check(order.productId, 'productId', 'Choose a product');
  e.check(req.body?.consent === true, 'consent', 'Confirm the customer agreed to share these details');
  e.throwIfAny();
  const id = await db.tx(async (t) => {
    const cid = nanoid();
    const ts = nowIso();
    await t.run(
      `INSERT INTO customers (id, partner_id, business_name, contact_name, mobile, email, gstin, business_type, address, city, state, pincode, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cid, req.partner.id, c.business_name, c.contact_name, c.mobile, c.email, c.gstin, c.business_type, c.address, c.city, c.state, c.pincode, c.notes, ts, ts]
    );
    await createOrder(t, req.partner, { id: cid, ...c }, order, req.actor);
    return cid;
  });
  res.status(201).json(await customerDetail(req.partner.id, id));
}));

router.put('/customers/:id', requirePermission('addCustomers'), h(async (req, res) => {
  const existing = await db.get('SELECT id FROM customers WHERE id = ? AND partner_id = ?', [req.params.id, req.partner.id]);
  if (!existing) throw notFound('Customer');
  const { c, e } = readCustomer(req.body || {});
  e.throwIfAny();
  await db.run(
    `UPDATE customers SET business_name = ?, contact_name = ?, mobile = ?, email = ?, gstin = ?, business_type = ?, address = ?, city = ?, state = ?, pincode = ?, notes = ?, updated_at = ?
     WHERE id = ? AND partner_id = ?`,
    [c.business_name, c.contact_name, c.mobile, c.email, c.gstin, c.business_type, c.address, c.city, c.state, c.pincode, c.notes, nowIso(), req.params.id, req.partner.id]
  );
  res.json(await customerDetail(req.partner.id, req.params.id));
}));

router.post('/customers/:id/orders', requirePermission('addCustomers'), h(async (req, res) => {
  const c = await db.get('SELECT * FROM customers WHERE id = ? AND partner_id = ?', [req.params.id, req.partner.id]);
  if (!c) throw notFound('Customer');
  await db.tx((t) => createOrder(t, req.partner, c, req.body || {}, req.actor));
  res.status(201).json(await customerDetail(req.partner.id, c.id));
}));

router.post('/orders/:id/installation', requirePermission('requestInstallations'), h(async (req, res) => {
  const o = await db.get('SELECT * FROM orders WHERE id = ? AND partner_id = ?', [req.params.id, req.partner.id]);
  if (!o) throw notFound('Order');
  if (['rejected', 'cancelled'].includes(o.status)) throw bad(`This order is ${o.status}`);
  await db.tx(async (t) => {
    const open = await t.get(`SELECT id FROM installations WHERE order_id = ? AND status IN ('requested','scheduled','in_progress')`, [o.id]);
    if (open) throw bad('An installation request is already open for this order');
    await createInstallation(t, { orderId: o.id, customerId: o.customer_id, partnerId: o.partner_id, mode: req.body?.mode, preferredDate: req.body?.preferredDate, notes: req.body?.notes }, req.actor);
  });
  res.status(201).json(await customerDetail(req.partner.id, o.customer_id));
}));

router.post('/installations/:id/cancel', h(async (req, res) => {
  const i = await db.get('SELECT * FROM installations WHERE id = ? AND partner_id = ?', [req.params.id, req.partner.id]);
  if (!i) throw notFound('Installation');
  if (i.status !== 'requested') throw bad('Only requests that are not yet scheduled can be cancelled');
  await db.tx(async (t) => {
    await t.run("UPDATE installations SET status = 'cancelled', updated_at = ? WHERE id = ?", [nowIso(), i.id]);
    await t.run('INSERT INTO installation_events (id, installation_id, status, note, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)', [nanoid(), i.id, 'cancelled', '', req.actor, nowIso()]);
  });
  res.json(await customerDetail(req.partner.id, i.customer_id));
}));

router.get('/installations', h(async (req, res) => {
  res.json(await db.all(
    `SELECT i.*, c.business_name, o.reference, p.name AS product_name FROM installations i
     JOIN customers c ON c.id = i.customer_id JOIN orders o ON o.id = i.order_id JOIN products p ON p.id = o.product_id
     WHERE i.partner_id = ? ORDER BY i.updated_at DESC LIMIT 200`, [req.partner.id]));
}));

// ---------- Commission ----------
router.get('/commissions', h(async (req, res) => {
  const { limit, offset } = paginate(req, 200);
  const type = str(req.query.type, 20);
  const params = type ? [req.partner.id, type] : [req.partner.id];
  const filter = type ? ' AND cm.type = ?' : '';
  const [rows, total, bal] = await Promise.all([
    db.all(
      `SELECT cm.*, c.business_name AS customer_name, p.name AS product_name, o.reference AS order_reference
       FROM commissions cm LEFT JOIN customers c ON c.id = cm.customer_id LEFT JOIN products p ON p.id = cm.product_id LEFT JOIN orders o ON o.id = cm.order_id
       WHERE cm.partner_id = ?${filter} ORDER BY cm.created_at DESC LIMIT ${limit} OFFSET ${offset}`, params),
    db.get(`SELECT COUNT(*) AS n FROM commissions cm WHERE cm.partner_id = ?${filter}`, params),
    balance(req.partner.id)
  ]);
  res.json({ balance: bal, rows, total: Number(total.n) });
}));

// ---------- Withdrawals ----------
router.get('/withdrawals', h(async (req, res) => {
  const [rows, bal, pendingBank] = await Promise.all([
    db.all('SELECT * FROM withdrawals WHERE partner_id = ? ORDER BY requested_at DESC', [req.partner.id]),
    balance(req.partner.id),
    db.get("SELECT id FROM partner_bank_requests WHERE partner_id = ? AND status = 'pending'", [req.partner.id])
  ]);
  res.json({ balance: bal, rows, payoutReady: !!(req.partner.pan_enc && req.partner.bank_account_enc), bankVerified: !!req.partner.bank_verified, bankChangePending: !!pendingBank });
}));

router.post('/withdrawals', requirePermission('requestWithdrawals'), h(async (req, res) => {
  const amount = money(req.body?.amount);
  const program = await getProgram();
  const row = await db.tx(async (t) => {
    const p = await t.get(`SELECT * FROM partners WHERE id = ?${db.forUpdate}`, [req.partner.id]); // serialises concurrent requests
    if (!p.pan_enc || !p.bank_account_enc) throw bad('Add your PAN and bank account in Profile → Payout details first.');
    if (await t.get("SELECT id FROM partner_bank_requests WHERE partner_id = ? AND status = 'pending'", [p.id])) throw bad('A bank account change is awaiting verification.');
    if (await t.get("SELECT id FROM withdrawals WHERE partner_id = ? AND status IN ('requested','approved')", [p.id])) throw bad('You already have a withdrawal in process.');
    const bal = await balance(p.id, t);
    const min = Number(program.minWithdrawal);
    if (bal.available < min) throw bad(`Withdrawals unlock when your available commission reaches ₹${min.toLocaleString('en-IN')}.`);
    if (!(amount >= min)) throw bad(`Minimum withdrawal is ₹${min.toLocaleString('en-IN')}.`);
    if (amount > bal.available) throw bad('Amount exceeds your available commission.');
    const tdsPct = Number(program.tdsPercent);
    const tds = round2((amount * tdsPct) / 100);
    const w = {
      id: nanoid(), reference: `WD-${ref()}`, partner_id: p.id, amount, tds_pct: tdsPct, tds_amount: tds, net_amount: round2(amount - tds), status: 'requested',
      partner_note: str(req.body?.note, 300), bank_holder: p.bank_holder, bank_last4: p.bank_last4, bank_ifsc: p.bank_ifsc, bank_name: p.bank_name, requested_at: nowIso()
    };
    await t.run(
      `INSERT INTO withdrawals (id, reference, partner_id, amount, tds_pct, tds_amount, net_amount, status, partner_note, bank_holder, bank_last4, bank_ifsc, bank_name, requested_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, Object.values(w));
    return w;
  });
  res.status(201).json(row);
}));

// ---------- Profile ----------
router.put('/profile', h(async (req, res) => {
  const b = req.body || {};
  const d = {
    full_name: str(b.fullName, 120), email: str(b.email, 150).toLowerCase(), mobile: mobile(b.mobile), whatsapp: mobile(b.whatsapp),
    business_name: str(b.businessName, 150), gstin: up(b.gstin, 15), website: str(b.website, 200),
    address_line1: str(b.addressLine1, 200), address_line2: str(b.addressLine2, 200), city: str(b.city, 80), district: str(b.district, 80), state: str(b.state, 80), pincode: str(b.pincode, 6)
  };
  const e = new FieldErrors();
  e.check(d.full_name, 'fullName', 'Required').check(RE.email.test(d.email), 'email', 'Invalid email').check(RE.mobile.test(d.mobile), 'mobile', 'Invalid mobile')
    .check(!d.whatsapp || RE.mobile.test(d.whatsapp), 'whatsapp', 'Invalid number').check(!d.gstin || RE.gstin.test(d.gstin), 'gstin', 'Invalid GSTIN')
    .check(!d.pincode || RE.pincode.test(d.pincode), 'pincode', 'Invalid PIN code').throwIfAny();
  const clash = await db.get('SELECT id FROM partners WHERE id <> ? AND (email = ? OR mobile = ?)', [req.partner.id, d.email, d.mobile]);
  if (clash) throw bad('Email or mobile is already used by another partner');
  const profile = { ...parseJSON(req.partner.profile, {}), qualification: str(b.qualification, 120), experienceYears: str(b.experienceYears, 10), teamSize: str(b.teamSize, 20), areasServed: str(b.areasServed, 300) };
  await db.run(
    `UPDATE partners SET full_name = ?, email = ?, mobile = ?, whatsapp = ?, business_name = ?, gstin = ?, website = ?, address_line1 = ?, address_line2 = ?, city = ?, district = ?, state = ?, pincode = ?, profile = ?, updated_at = ? WHERE id = ?`,
    [...Object.values(d), JSON.stringify(profile), nowIso(), req.partner.id]
  );
  res.json(partnerView(await db.get('SELECT * FROM partners WHERE id = ?', [req.partner.id])));
}));

// Bank changes wait for admin verification so a stolen login can't redirect payouts.
router.post('/bank-change', documentUpload.fields([{ name: 'bank_proof', maxCount: 1 }]), h(async (req, res) => {
  const files = filesOf(req);
  try {
    const b = req.body || {};
    const acct = str(b.accountNumber, 20).replace(/\s/g, '');
    const ifsc = up(b.ifsc, 11);
    const e = new FieldErrors();
    e.check(str(b.accountHolder), 'accountHolder', 'Required').check(RE.account.test(acct), 'accountNumber', '9–18 digits')
      .check(acct === str(b.accountNumberConfirm, 20).replace(/\s/g, ''), 'accountNumberConfirm', 'Does not match')
      .check(RE.ifsc.test(ifsc), 'ifsc', 'Invalid IFSC').check(str(b.bankName), 'bankName', 'Required')
      .check(files.length, 'bank_proof', 'Upload a cancelled cheque or passbook')
      .check(checkPassword(b.password, req.partner.password_hash), 'password', 'Password is incorrect').throwIfAny();
    await db.tx(async (t) => {
      if (await t.get("SELECT id FROM withdrawals WHERE partner_id = ? AND status IN ('requested','approved')", [req.partner.id])) throw bad('You cannot change bank details while a withdrawal is in process.');
      await t.run("UPDATE partner_bank_requests SET status = 'superseded' WHERE partner_id = ? AND status = 'pending'", [req.partner.id]);
      const [doc] = await insertDocuments(t, req.partner.id, files, req.actor);
      await t.run(
        `INSERT INTO partner_bank_requests (id, partner_id, holder, account_enc, last4, ifsc, bank_name, branch, account_type, document_id, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [nanoid(), req.partner.id, str(b.accountHolder, 120), encrypt(acct), acct.slice(-4), ifsc, str(b.bankName, 120), str(b.branch, 120), b.accountType === 'current' ? 'current' : 'savings', doc?.id, nowIso()]
      );
      await audit(req.actor, 'partner.bank_change_requested', { type: 'partner', id: req.partner.id }, null, t);
    });
    res.status(201).json({ ok: true });
  } catch (err) {
    await discard(files);
    throw err;
  }
}));

// PAN and bank account for payouts, entered by the partner after approval.
// Password-confirmed; a change resets verification and is blocked while a payout is in process.
router.put('/payout', h(async (req, res) => {
  const b = req.body || {};
  const p = req.partner;
  const pan = up(b.pan, 10);
  const acct = str(b.accountNumber, 20).replace(/\s/g, '');
  const ifsc = up(b.ifsc, 11);
  const e = new FieldErrors();
  e.check(RE.pan.test(pan), 'pan', 'Enter a valid PAN (ABCDE1234F)')
    .check(str(b.accountHolder), 'accountHolder', 'Required')
    .check(RE.account.test(acct), 'accountNumber', 'Account number must be 9–18 digits')
    .check(acct === str(b.accountNumberConfirm, 20).replace(/\s/g, ''), 'accountNumberConfirm', 'Account numbers do not match')
    .check(RE.ifsc.test(ifsc), 'ifsc', 'Enter a valid IFSC (SBIN0001234)')
    .check(str(b.bankName), 'bankName', 'Required')
    .check(checkPassword(b.password, p.password_hash), 'password', 'Password is incorrect').throwIfAny();
  await db.tx(async (t) => {
    if (await t.get("SELECT id FROM withdrawals WHERE partner_id = ? AND status IN ('requested','approved')", [p.id])) throw bad('You cannot change payout details while a withdrawal is in process.');
    if (await t.get('SELECT id FROM partners WHERE pan_hash = ? AND id <> ?', [blindIndex(pan), p.id])) throw bad('This PAN is registered to another partner account.');
    await t.run(
      `UPDATE partners SET pan_enc = ?, pan_hash = ?, pan_last4 = ?, pan_name = ?, bank_holder = ?, bank_account_enc = ?, bank_last4 = ?, bank_ifsc = ?, bank_name = ?, bank_branch = ?,
        bank_account_type = ?, bank_verified = 0, updated_at = ? WHERE id = ?`,
      [encrypt(pan), blindIndex(pan), pan.slice(-4), str(b.accountHolder, 120), str(b.accountHolder, 120), encrypt(acct), acct.slice(-4), ifsc, str(b.bankName, 120), str(b.branch, 120),
        b.accountType === 'current' ? 'current' : 'savings', nowIso(), p.id]
    );
    await audit(req.actor, 'partner.payout_details', { type: 'partner', id: p.id }, { first: !p.bank_account_enc }, t);
  });
  res.json(partnerView(await db.get('SELECT * FROM partners WHERE id = ?', [p.id])));
}));

router.get('/bank-change', h(async (req, res) => {
  res.json(await db.get("SELECT holder, last4, ifsc, bank_name, created_at FROM partner_bank_requests WHERE partner_id = ? AND status = 'pending'", [req.partner.id]));
}));

export default router;

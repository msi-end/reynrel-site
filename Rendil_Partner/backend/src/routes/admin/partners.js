import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import { db } from '../../db/index.js';
import { config } from '../../config.js';
import { requireAdmin } from '../../middleware/auth.js';
import { documentUpload, filesOf, discard } from '../../middleware/upload.js';
import { h, bad, notFound, nowIso, paginate, parseJSON } from '../../utils/http.js';
import { str, money, round2, pctOrNull, moneyOrNull, RE } from '../../utils/validators.js';
import { encrypt, decrypt, blindIndex } from '../../utils/crypto.js';
import { hashPassword, tempPassword } from '../../utils/password.js';
import { partnerView, newPartnerCode, readPartnerInput, documentSummary, documentTypes, insertDocuments } from '../../services/partners.js';
import { balance, addCommission } from '../../services/ledger.js';
import { commissionRates } from '../../services/pricing.js';
import { audit } from '../../services/audit.js';
import { DEFAULT_PERMISSIONS } from '../../db/defaults.js';

const router = Router();
router.use(requireAdmin());

const getPartner = async (id, q = db) => {
  const p = await q.get('SELECT * FROM partners WHERE id = ?', [id]);
  if (!p) throw notFound('Partner');
  return p;
};

// ---------- List ----------
router.get('/', h(async (req, res) => {
  const { limit, offset } = paginate(req, 100);
  const where = ['1 = 1'];
  const params = [];
  if (req.query.status) { where.push('p.status = ?'); params.push(str(req.query.status, 20)); }
  if (req.query.q) {
    const q = `%${str(req.query.q, 80)}%`;
    where.push('(p.full_name LIKE ? OR p.business_name LIKE ? OR p.email LIKE ? OR p.mobile LIKE ? OR p.code LIKE ? OR p.city LIKE ?)');
    params.push(q, q, q, q, q, q);
  }
  const w = where.join(' AND ');
  const [rows, total] = await Promise.all([
    db.all(
      `SELECT p.id, p.code, p.status, p.source, p.partner_type, p.tier, p.full_name, p.business_name, p.email, p.mobile, p.city, p.state,
        p.expected_monthly_customers, p.bank_verified, p.created_at, p.approved_at,
        (SELECT COALESCE(SUM(amount),0) FROM commissions c WHERE c.partner_id = p.id) AS earned,
        (SELECT COUNT(*) FROM orders o WHERE o.partner_id = p.id AND o.status = 'approved') AS approved_orders,
        (SELECT COUNT(*) FROM orders o WHERE o.partner_id = p.id AND o.status = 'submitted') AS pending_orders,
        (SELECT COUNT(*) FROM partner_documents d WHERE d.partner_id = p.id AND d.status = 'pending') AS docs_pending,
        (SELECT COUNT(*) FROM partner_bank_requests b WHERE b.partner_id = p.id AND b.status = 'pending') AS bank_change
       FROM partners p WHERE ${w} ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`, params),
    db.get(`SELECT COUNT(*) AS n FROM partners p WHERE ${w}`, params)
  ]);
  res.json({ rows: rows.map((r) => ({ ...r, earned: round2(r.earned) })), total: Number(total.n) });
}));

// ---------- Manual add ----------
router.post('/', requireAdmin('manager'), documentUpload.any(), h(async (req, res) => {
  const files = filesOf(req);
  try {
    let raw = req.body;
    if (typeof req.body?.data === 'string') raw = JSON.parse(req.body.data);
    const { d, errors } = await readPartnerInput(raw, { requireBank: false });
    errors.throwIfAny();
    const status = ['pending', 'approved'].includes(raw.status) ? raw.status : 'approved';
    const password = raw.password && String(raw.password).length >= 8 ? String(raw.password) : tempPassword();
    const out = await db.tx(async (t) => {
      const panHash = d.pan ? blindIndex(d.pan) : null;
      const dup = await t.get('SELECT id FROM partners WHERE email = ? OR mobile = ? OR (? IS NOT NULL AND pan_hash = ?)', [d.email, d.mobile, panHash, panHash]);
      if (dup) throw bad('A partner with this email, mobile or PAN already exists');
      const id = nanoid();
      const code = await newPartnerCode(t);
      const ts = nowIso();
      await t.run(
        `INSERT INTO partners (id, code, status, source, partner_type, tier, full_name, email, mobile, whatsapp, business_name, entity_type, gstin, website,
          address_line1, address_line2, city, district, state, pincode, profile, expected_monthly_customers,
          pan_enc, pan_hash, pan_last4, pan_name, bank_holder, bank_account_enc, bank_last4, bank_ifsc, bank_name, bank_branch, bank_account_type, bank_verified,
          default_commission_pct, default_renewal_pct, permissions, password_hash, must_change_password, admin_notes, approved_at, approved_by, created_at, updated_at)
         VALUES (?, ?, ?, 'admin', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)`,
        [id, code, status, d.partner_type, str(raw.tier, 40) || null, d.full_name, d.email, d.mobile, d.whatsapp || d.mobile, d.business_name, d.entity_type, d.gstin, d.website,
          d.address_line1, d.address_line2, d.city, d.district, d.state, d.pincode, JSON.stringify(d.profile), d.expected_monthly_customers,
          d.pan ? encrypt(d.pan) : null, panHash, d.pan ? d.pan.slice(-4) : null, d.pan_name, d.bank_holder || null,
          d.account ? encrypt(d.account) : null, d.account ? d.account.slice(-4) : null, d.bank_ifsc || null, d.bank_name || null, d.bank_branch || null, d.bank_account_type,
          raw.bankVerified && d.account ? 1 : 0, d.default_commission_pct ?? null, d.default_renewal_pct ?? null,
          JSON.stringify({ ...DEFAULT_PERMISSIONS, ...(raw.permissions || {}) }), hashPassword(password), str(raw.adminNotes, 3000),
          status === 'approved' ? ts : null, status === 'approved' ? req.actor : null, ts, ts]
      );
      for (const productId of Array.isArray(raw.productIds) ? raw.productIds : []) {
        if (await t.get('SELECT id FROM products WHERE id = ?', [productId])) {
          await t.run('INSERT INTO partner_products (partner_id, product_id, enabled, updated_at) VALUES (?, ?, 1, ?)', [id, productId, ts]);
        }
      }
      await insertDocuments(t, id, files, req.actor);
      await audit(req.actor, 'partner.create', { type: 'partner', id }, { code, status }, t);
      return { id, code };
    });
    res.status(201).json({ ...out, temporaryPassword: password });
  } catch (err) {
    await discard(files);
    throw err;
  }
}));

// ---------- Detail ----------
router.get('/:id', h(async (req, res) => {
  const p = await getPartner(req.params.id);
  const [bal, docs, docSummary, products, prices, bankReq, terms, statusLog, perf] = await Promise.all([
    balance(p.id),
    db.all('SELECT id, doc_type, original_name, mime, size, status, remarks, uploaded_by, verified_by, verified_at, uploaded_at FROM partner_documents WHERE partner_id = ? ORDER BY uploaded_at DESC', [p.id]),
    documentSummary(p.id, !!p.gstin),
    productAccess(p),
    db.all('SELECT * FROM partner_prices WHERE partner_id = ? ORDER BY created_at DESC', [p.id]),
    db.get("SELECT id, holder, last4, ifsc, bank_name, branch, account_type, document_id, created_at FROM partner_bank_requests WHERE partner_id = ? AND status = 'pending'", [p.id]),
    db.all('SELECT version, accepted_at, ip FROM terms_acceptances WHERE partner_id = ? ORDER BY version DESC', [p.id]),
    db.all("SELECT action, actor, meta, created_at FROM audit_log WHERE target_id = ? AND action LIKE 'partner.%' ORDER BY created_at DESC LIMIT 30", [p.id]),
    performance(p.id)
  ]);
  res.json({
    partner: { ...partnerView(p), adminNotes: p.admin_notes },
    balance: bal, documents: docs, documentSummary: docSummary, documentTypes: await documentTypes(),
    products, prices, bankRequest: bankReq, termsAccepted: terms, activity: statusLog.map((a) => ({ ...a, meta: parseJSON(a.meta, null) })), performance: perf
  });
}));

async function productAccess(p) {
  const products = await db.all('SELECT id, name, status, default_commission_pct, renewal_commission_pct FROM products ORDER BY sort_order, name');
  const access = await db.all('SELECT * FROM partner_products WHERE partner_id = ?', [p.id]);
  const out = [];
  for (const pr of products) {
    const a = access.find((x) => x.product_id === pr.id);
    const rates = await commissionRates(p, pr.id);
    const plans = await db.all('SELECT id, name, price, min_partner_price, billing_cycle FROM product_plans WHERE product_id = ? ORDER BY sort_order, price', [pr.id]);
    const services = await db.all('SELECT id, name, price, commission_pct FROM product_services WHERE product_id = ? ORDER BY sort_order, name', [pr.id]);
    out.push({
      productId: pr.id, name: pr.name, status: pr.status, assigned: !!a, enabled: !!a?.enabled,
      commissionPct: a?.commission_pct ?? null, renewalPct: a?.renewal_pct ?? null,
      productDefaults: { commissionPct: Number(pr.default_commission_pct), renewalPct: Number(pr.renewal_commission_pct) },
      effective: { commissionPct: rates.newSale.pct, commissionSource: rates.newSale.source, renewalPct: rates.renewal.pct, renewalSource: rates.renewal.source },
      demo: { url: a?.demo_url || '', username: a?.demo_username || '', password: a?.demo_password || '' },
      plans, services
    });
  }
  return out;
}

async function performance(partnerId) {
  const rows = await db.all("SELECT created_at, amount, type FROM commissions WHERE partner_id = ? ORDER BY created_at", [partnerId]);
  const orders = await db.all('SELECT created_at, status, sale_amount, reviewed_at FROM orders WHERE partner_id = ?', [partnerId]);
  const months = [];
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date();
    d.setMonth(d.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    months.push({
      month: key, label: d.toLocaleString('en-IN', { month: 'short', year: '2-digit' }),
      earnings: round2(rows.filter((r) => r.created_at.startsWith(key)).reduce((s, r) => s + Number(r.amount), 0)),
      orders: orders.filter((o) => o.status === 'approved' && (o.reviewed_at || '').startsWith(key)).length,
      sales: round2(orders.filter((o) => o.status === 'approved' && (o.reviewed_at || '').startsWith(key)).reduce((s, o) => s + Number(o.sale_amount), 0))
    });
  }
  const approved = orders.filter((o) => o.status === 'approved');
  const decided = orders.filter((o) => ['approved', 'rejected'].includes(o.status)).length;
  return {
    months,
    totals: {
      orders: orders.length, approved: approved.length, pending: orders.filter((o) => o.status === 'submitted').length,
      sales: round2(approved.reduce((s, o) => s + Number(o.sale_amount), 0)),
      approvalRate: decided ? Math.round((approved.length / decided) * 100) : null
    }
  };
}

// ---------- Profile / status / permissions / commission ----------
router.put('/:id', requireAdmin('manager'), h(async (req, res) => {
  const p = await getPartner(req.params.id);
  const { d, errors } = await readPartnerInput({ ...flatten(p), ...req.body, pan: undefined, accountNumber: undefined, ifsc: undefined }, { requireBank: false });
  errors.throwIfAny();
  const clash = await db.get('SELECT id FROM partners WHERE id <> ? AND (email = ? OR mobile = ?)', [p.id, d.email, d.mobile]);
  if (clash) throw bad('Email or mobile already used by another partner');
  const b = req.body || {};
  await db.run(
    `UPDATE partners SET partner_type = ?, tier = ?, full_name = ?, email = ?, mobile = ?, whatsapp = ?, business_name = ?, entity_type = ?, gstin = ?, website = ?,
      address_line1 = ?, address_line2 = ?, city = ?, district = ?, state = ?, pincode = ?, profile = ?, expected_monthly_customers = ?, admin_notes = ?, updated_at = ? WHERE id = ?`,
    [d.partner_type, b.tier !== undefined ? str(b.tier, 40) : p.tier, d.full_name, d.email, d.mobile, d.whatsapp, d.business_name, d.entity_type, d.gstin, d.website,
      d.address_line1, d.address_line2, d.city, d.district, d.state, d.pincode, JSON.stringify(d.profile), d.expected_monthly_customers,
      b.adminNotes !== undefined ? str(b.adminNotes, 3000) : p.admin_notes, nowIso(), p.id]
  );
  await audit(req.actor, 'partner.update', { type: 'partner', id: p.id });
  res.json(partnerView(await getPartner(p.id)));
}));

// Partner row -> the camelCase shape readPartnerInput expects, so partial updates keep other fields.
function flatten(p) {
  const prof = parseJSON(p.profile, {});
  return {
    fullName: p.full_name, email: p.email, mobile: p.mobile, whatsapp: p.whatsapp, gstin: p.gstin, website: p.website, partnerType: p.partner_type, businessName: p.business_name, entityType: p.entity_type, dateOfBirth: p.date_of_birth,
    addressLine1: p.address_line1, addressLine2: p.address_line2, city: p.city, district: p.district, state: p.state, pincode: p.pincode,
    expectedMonthlyCustomers: p.expected_monthly_customers, ...prof
  };
}

router.put('/:id/status', requireAdmin('manager'), h(async (req, res) => {
  const p = await getPartner(req.params.id);
  const status = req.body?.status;
  const reason = str(req.body?.reason, 500);
  if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) throw bad('Invalid status');
  if (['rejected', 'suspended'].includes(status) && !reason) throw bad('Give a reason (shown to the partner)');
  await db.tx(async (t) => {
    const ts = nowIso();
    await t.run(
      `UPDATE partners SET status = ?, status_reason = ?, approved_at = COALESCE(approved_at, ?), approved_by = COALESCE(approved_by, ?),
        bank_verified = CASE WHEN ? = 1 THEN 1 ELSE bank_verified END,
        token_version = token_version + ?, updated_at = ? WHERE id = ?`,
      [status, reason || null, status === 'approved' ? ts : null, status === 'approved' ? req.actor : null,
        status === 'approved' && req.body?.verifyBank !== false && p.bank_account_enc ? 1 : 0,
        ['rejected', 'suspended'].includes(status) ? 1 : 0, ts, p.id]
    );
    if (status === 'approved' && Array.isArray(req.body?.productIds)) {
      for (const pid of req.body.productIds) {
        if (!(await t.get('SELECT 1 AS x FROM partner_products WHERE partner_id = ? AND product_id = ?', [p.id, pid])) && (await t.get('SELECT id FROM products WHERE id = ?', [pid]))) {
          await t.run('INSERT INTO partner_products (partner_id, product_id, enabled, updated_at) VALUES (?, ?, 1, ?)', [p.id, pid, ts]);
        }
      }
    }
    await audit(req.actor, `partner.status.${status}`, { type: 'partner', id: p.id }, { reason }, t);
  });
  res.json(partnerView(await getPartner(p.id)));
}));

router.put('/:id/permissions', requireAdmin('manager'), h(async (req, res) => {
  const p = await getPartner(req.params.id);
  const next = { ...DEFAULT_PERMISSIONS, ...parseJSON(p.permissions, {}) };
  for (const k of Object.keys(DEFAULT_PERMISSIONS)) if (req.body?.[k] !== undefined) next[k] = !!req.body[k];
  await db.run('UPDATE partners SET permissions = ?, updated_at = ? WHERE id = ?', [JSON.stringify(next), nowIso(), p.id]);
  await audit(req.actor, 'partner.permissions', { type: 'partner', id: p.id }, next);
  res.json(next);
}));

router.put('/:id/commission', requireAdmin('manager'), h(async (req, res) => {
  const p = await getPartner(req.params.id);
  const c = pctOrNull(req.body?.defaultCommissionPct, 'Commission');
  const r = pctOrNull(req.body?.defaultRenewalPct, 'Renewal commission');
  await db.run('UPDATE partners SET default_commission_pct = ?, default_renewal_pct = ?, updated_at = ? WHERE id = ?', [c, r, nowIso(), p.id]);
  await audit(req.actor, 'partner.commission_defaults', { type: 'partner', id: p.id }, { c, r });
  res.json({ defaultCommissionPct: c, defaultRenewalPct: r });
}));

// Product access + per-product commission overrides + demo login
router.put('/:id/products', requireAdmin('manager'), h(async (req, res) => {
  const p = await getPartner(req.params.id);
  const items = Array.isArray(req.body?.items) ? req.body.items : null;
  if (!items) throw bad('items array required');
  await db.tx(async (t) => {
    const ts = nowIso();
    for (const it of items) {
      if (!(await t.get('SELECT id FROM products WHERE id = ?', [it.productId]))) continue;
      const c = pctOrNull(it.commissionPct, 'Commission');
      const r = pctOrNull(it.renewalPct, 'Renewal commission');
      const exists = await t.get('SELECT 1 AS x FROM partner_products WHERE partner_id = ? AND product_id = ?', [p.id, it.productId]);
      if (!it.assigned) {
        if (exists) await t.run('DELETE FROM partner_products WHERE partner_id = ? AND product_id = ?', [p.id, it.productId]);
        continue;
      }
      const vals = [it.enabled === false ? 0 : 1, c, r, str(it.demo?.url, 300) || null, str(it.demo?.username, 100) || null, str(it.demo?.password, 100) || null, ts];
      if (exists) await t.run('UPDATE partner_products SET enabled = ?, commission_pct = ?, renewal_pct = ?, demo_url = ?, demo_username = ?, demo_password = ?, updated_at = ? WHERE partner_id = ? AND product_id = ?', [...vals, p.id, it.productId]);
      else await t.run('INSERT INTO partner_products (enabled, commission_pct, renewal_pct, demo_url, demo_username, demo_password, updated_at, partner_id, product_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [...vals, p.id, it.productId]);
    }
    await audit(req.actor, 'partner.products', { type: 'partner', id: p.id }, { items: items.filter((i) => i.assigned).map((i) => ({ product: i.productId, c: i.commissionPct, r: i.renewalPct })) }, t);
  });
  res.json(await productAccess(await getPartner(p.id)));
}));

// ---------- Negotiated prices ----------
router.post('/:id/prices', requireAdmin('manager'), h(async (req, res) => {
  const p = await getPartner(req.params.id);
  const b = req.body || {};
  const price = moneyOrNull(b.price, 'Price');
  if (price === null) throw bad('Enter the negotiated price');
  const plan = b.planId ? await db.get('SELECT * FROM product_plans WHERE id = ?', [b.planId]) : null;
  const service = b.serviceId ? await db.get('SELECT * FROM product_services WHERE id = ?', [b.serviceId]) : null;
  const target = plan || service;
  if (!target || (plan && service)) throw bad('Choose one plan or one service');
  if (plan?.min_partner_price !== null && plan?.min_partner_price !== undefined && price < Number(plan.min_partner_price)) {
    throw bad(`Price is below the plan's minimum partner price (₹${Number(plan.min_partner_price).toLocaleString('en-IN')})`);
  }
  const validUntil = RE.date.test(b.validUntil || '') ? b.validUntil : null;
  await db.tx(async (t) => {
    await t.run(`DELETE FROM partner_prices WHERE partner_id = ? AND ${plan ? 'plan_id' : 'service_id'} = ?`, [p.id, target.id]);
    await t.run(
      'INSERT INTO partner_prices (id, partner_id, product_id, plan_id, service_id, price, valid_until, note, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nanoid(), p.id, target.product_id, plan?.id || null, service?.id || null, price, validUntil, str(b.note, 300), req.actor, nowIso()]
    );
    await audit(req.actor, 'partner.price_set', { type: 'partner', id: p.id }, { target: target.name, price, listPrice: Number(target.price), validUntil }, t);
  });
  res.status(201).json(await db.all('SELECT * FROM partner_prices WHERE partner_id = ? ORDER BY created_at DESC', [p.id]));
}));

router.delete('/:id/prices/:priceId', requireAdmin('manager'), h(async (req, res) => {
  const r = await db.run('DELETE FROM partner_prices WHERE id = ? AND partner_id = ?', [req.params.priceId, req.params.id]);
  if (!r.changes) throw notFound('Price');
  await audit(req.actor, 'partner.price_removed', { type: 'partner', id: req.params.id });
  res.status(204).end();
}));

// ---------- Documents ----------
router.get('/:id/documents/:docId/file', h(async (req, res) => {
  const d = await db.get('SELECT * FROM partner_documents WHERE id = ? AND partner_id = ?', [req.params.docId, req.params.id]);
  if (!d) throw notFound('Document');
  const file = path.join(config.paths.documents, path.basename(d.stored_name));
  if (!fs.existsSync(file)) throw notFound('File');
  await audit(req.actor, 'partner.document_view', { type: 'partner', id: req.params.id }, { doc: d.doc_type });
  res.set({ 'Content-Type': d.mime, 'Content-Disposition': `inline; filename="${d.doc_type}${path.extname(d.stored_name)}"`, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  fs.createReadStream(file).pipe(res);
}));

router.put('/:id/documents/:docId', requireAdmin('manager'), h(async (req, res) => {
  const status = req.body?.status;
  if (!['pending', 'verified', 'rejected'].includes(status)) throw bad('Invalid status');
  const remarks = str(req.body?.remarks, 500);
  if (status === 'rejected' && !remarks) throw bad('Say why the document was rejected (shown to the partner)');
  const r = await db.run('UPDATE partner_documents SET status = ?, remarks = ?, verified_by = ?, verified_at = ? WHERE id = ? AND partner_id = ?', [status, remarks || null, req.actor, nowIso(), req.params.docId, req.params.id]);
  if (!r.changes) throw notFound('Document');
  await audit(req.actor, `partner.document_${status}`, { type: 'partner', id: req.params.id }, { docId: req.params.docId });
  res.json({ ok: true });
}));

router.post('/:id/documents', requireAdmin('manager'), documentUpload.any(), h(async (req, res) => {
  const files = filesOf(req);
  try {
    await getPartner(req.params.id);
    const rows = await db.tx((t) => insertDocuments(t, req.params.id, files, req.actor));
    if (!rows.length) throw bad('Choose a file and document type');
    res.status(201).json({ ok: true });
  } catch (err) {
    await discard(files);
    throw err;
  }
}));

// ---------- Sensitive data (audit-logged) ----------
router.get('/:id/sensitive', requireAdmin('manager'), h(async (req, res) => {
  const p = await getPartner(req.params.id);
  const bank = await db.get("SELECT account_enc FROM partner_bank_requests WHERE partner_id = ? AND status = 'pending'", [p.id]);
  await audit(req.actor, 'partner.sensitive_view', { type: 'partner', id: p.id });
  res.set('Cache-Control', 'no-store');
  res.json({ pan: decrypt(p.pan_enc), accountNumber: decrypt(p.bank_account_enc), pendingAccountNumber: bank ? decrypt(bank.account_enc) : null });
}));

// Set PAN/bank directly (e.g. for manually added partners).
router.put('/:id/kyc', requireAdmin('manager'), h(async (req, res) => {
  const p = await getPartner(req.params.id);
  const b = req.body || {};
  const sets = [];
  const vals = [];
  if (b.pan) {
    const pan = String(b.pan).toUpperCase().trim();
    if (!RE.pan.test(pan)) throw bad('Invalid PAN');
    const dup = await db.get('SELECT id FROM partners WHERE pan_hash = ? AND id <> ?', [blindIndex(pan), p.id]);
    if (dup) throw bad('This PAN belongs to another partner');
    sets.push('pan_enc = ?', 'pan_hash = ?', 'pan_last4 = ?', 'pan_name = ?');
    vals.push(encrypt(pan), blindIndex(pan), pan.slice(-4), str(b.nameOnPan, 120) || p.pan_name);
  }
  if (b.accountNumber) {
    const acct = String(b.accountNumber).replace(/\s/g, '');
    const ifsc = String(b.ifsc || '').toUpperCase().trim();
    if (!RE.account.test(acct) || !RE.ifsc.test(ifsc)) throw bad('Invalid account number or IFSC');
    sets.push('bank_holder = ?', 'bank_account_enc = ?', 'bank_last4 = ?', 'bank_ifsc = ?', 'bank_name = ?', 'bank_branch = ?', 'bank_account_type = ?', 'bank_verified = ?');
    vals.push(str(b.accountHolder, 120) || p.full_name, encrypt(acct), acct.slice(-4), ifsc, str(b.bankName, 120), str(b.branch, 120), b.accountType === 'current' ? 'current' : 'savings', b.bankVerified ? 1 : 0);
  }
  if (b.bankVerified !== undefined && !b.accountNumber) {
    if (b.bankVerified && !p.bank_account_enc) throw bad('Add bank details first');
    sets.push('bank_verified = ?');
    vals.push(b.bankVerified ? 1 : 0);
  }
  if (!sets.length) throw bad('Nothing to update');
  await db.run(`UPDATE partners SET ${sets.join(', ')}, updated_at = ? WHERE id = ?`, [...vals, nowIso(), p.id]);
  await audit(req.actor, 'partner.kyc_update', { type: 'partner', id: p.id }, { pan: !!b.pan, bank: !!b.accountNumber, verified: b.bankVerified });
  res.json(partnerView(await getPartner(p.id)));
}));

router.put('/:id/bank-request', requireAdmin('manager'), h(async (req, res) => {
  const p = await getPartner(req.params.id);
  const action = req.body?.action;
  if (!['approve', 'reject'].includes(action)) throw bad('action must be approve or reject');
  await db.tx(async (t) => {
    const r = await t.get("SELECT * FROM partner_bank_requests WHERE partner_id = ? AND status = 'pending'", [p.id]);
    if (!r) throw notFound('Pending bank change');
    if (action === 'approve') {
      await t.run(
        'UPDATE partners SET bank_holder = ?, bank_account_enc = ?, bank_last4 = ?, bank_ifsc = ?, bank_name = ?, bank_branch = ?, bank_account_type = ?, bank_verified = 1, updated_at = ? WHERE id = ?',
        [r.holder, r.account_enc, r.last4, r.ifsc, r.bank_name, r.branch, r.account_type, nowIso(), p.id]
      );
      if (r.document_id) await t.run("UPDATE partner_documents SET status = 'verified', verified_by = ?, verified_at = ? WHERE id = ?", [req.actor, nowIso(), r.document_id]);
    }
    await t.run('UPDATE partner_bank_requests SET status = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?', [action === 'approve' ? 'approved' : 'rejected', req.actor, nowIso(), r.id]);
    await audit(req.actor, `partner.bank_change_${action}`, { type: 'partner', id: p.id }, null, t);
  });
  res.json({ ok: true });
}));

// ---------- Money ----------
router.post('/:id/adjustments', requireAdmin('manager'), h(async (req, res) => {
  const p = await getPartner(req.params.id);
  const amount = money(req.body?.amount);
  const description = str(req.body?.description, 300);
  if (!amount || !description) throw bad('Amount (non-zero) and description are required');
  const row = await db.tx(async (t) => {
    if (amount < 0) {
      const bal = await balance(p.id, t);
      if (bal.available + amount < 0) throw bad('Debit is larger than the available balance');
    }
    const r = await addCommission(t, { partnerId: p.id, type: 'adjustment', amount, description, createdBy: req.actor });
    await audit(req.actor, 'partner.adjustment', { type: 'partner', id: p.id }, { amount, description }, t);
    return r;
  });
  res.status(201).json(row);
}));

router.get('/:id/commissions', h(async (req, res) => {
  res.json(await db.all(
    `SELECT cm.*, c.business_name AS customer_name, pr.name AS product_name FROM commissions cm
     LEFT JOIN customers c ON c.id = cm.customer_id LEFT JOIN products pr ON pr.id = cm.product_id
     WHERE cm.partner_id = ? ORDER BY cm.created_at DESC LIMIT 500`, [req.params.id]));
}));

router.post('/:id/reset-password', requireAdmin('manager'), h(async (req, res) => {
  const p = await getPartner(req.params.id);
  const pw = tempPassword();
  await db.run('UPDATE partners SET password_hash = ?, must_change_password = 1, token_version = token_version + 1, updated_at = ? WHERE id = ?', [hashPassword(pw), nowIso(), p.id]);
  await audit(req.actor, 'partner.password_reset', { type: 'partner', id: p.id });
  res.json({ temporaryPassword: pw });
}));

export default router;

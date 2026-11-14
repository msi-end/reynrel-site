// Customers, orders (customer registrations per product), installations and renewals.
import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../../db/index.js';
import { requireAdmin } from '../../middleware/auth.js';
import { h, bad, notFound, nowIso, today, addYear, paginate, parseJSON } from '../../utils/http.js';
import { str, money, round2, pctOrNull, RE } from '../../utils/validators.js';
import { addCommission } from '../../services/ledger.js';
import { commissionRates } from '../../services/pricing.js';
import { audit } from '../../services/audit.js';

const router = Router();
router.use(requireAdmin());

const ORDER_SELECT = `SELECT o.*, c.business_name, c.contact_name, c.mobile AS customer_mobile, c.email AS customer_email, c.gstin AS customer_gstin,
    c.city, c.state, c.notes AS customer_notes, p.name AS product_name, pa.code AS partner_code, pa.full_name AS partner_name, pa.status AS partner_status,
    (SELECT COALESCE(SUM(amount),0) FROM commissions cm WHERE cm.order_id = o.id) AS commission_total,
    (SELECT i.status FROM installations i WHERE i.order_id = o.id ORDER BY i.created_at DESC LIMIT 1) AS installation_status
  FROM orders o JOIN customers c ON c.id = o.customer_id JOIN products p ON p.id = o.product_id JOIN partners pa ON pa.id = o.partner_id`;

const shape = (o) => ({ ...o, services: parseJSON(o.services, []), commission_total: round2(o.commission_total) });

router.get('/orders', h(async (req, res) => {
  const { limit, offset } = paginate(req, 100);
  const where = ['1 = 1'];
  const params = [];
  for (const [k, col] of [['status', 'o.status'], ['partnerId', 'o.partner_id'], ['productId', 'o.product_id'], ['subscription', 'o.subscription_status']]) {
    if (req.query[k]) { where.push(`${col} = ?`); params.push(str(req.query[k], 30)); }
  }
  if (req.query.expiring) { where.push("o.subscription_status = 'active' AND o.end_date <= ?"); const d = new Date(); d.setDate(d.getDate() + 30); params.push(d.toISOString().slice(0, 10)); }
  if (req.query.q) {
    const q = `%${str(req.query.q, 80)}%`;
    where.push('(c.business_name LIKE ? OR c.contact_name LIKE ? OR c.mobile LIKE ? OR o.reference LIKE ? OR pa.full_name LIKE ?)');
    params.push(q, q, q, q, q);
  }
  const w = where.join(' AND ');
  const [rows, total] = await Promise.all([
    db.all(`${ORDER_SELECT} WHERE ${w} ORDER BY o.created_at DESC LIMIT ${limit} OFFSET ${offset}`, params),
    db.get(`SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id JOIN partners pa ON pa.id = o.partner_id WHERE ${w}`, params)
  ]);
  res.json({ rows: rows.map(shape), total: Number(total.n) });
}));

router.get('/orders/:id', h(async (req, res) => {
  const o = await db.get(`${ORDER_SELECT} WHERE o.id = ?`, [req.params.id]);
  if (!o) throw notFound('Order');
  const [inst, commissions] = await Promise.all([
    db.all('SELECT * FROM installations WHERE order_id = ? ORDER BY created_at DESC', [o.id]),
    db.all('SELECT * FROM commissions WHERE order_id = ? ORDER BY created_at', [o.id])
  ]);
  const events = inst.length ? await db.all(`SELECT * FROM installation_events WHERE installation_id IN (${inst.map(() => '?').join(',')}) ORDER BY created_at`, inst.map((i) => i.id)) : [];
  res.json({ ...shape(o), installations: inst.map((i) => ({ ...i, events: events.filter((e) => e.installation_id === i.id) })), commissions });
}));

// Approve after payment: commission is calculated per line and credited immediately.
router.put('/orders/:id/review', requireAdmin('manager'), h(async (req, res) => {
  const action = req.body?.action;
  const note = str(req.body?.note, 500);
  if (!['approve', 'reject'].includes(action)) throw bad('action must be approve or reject');
  const result = await db.tx(async (t) => {
    const o = await t.get(`SELECT * FROM orders WHERE id = ?${db.forUpdate}`, [req.params.id]);
    if (!o) throw notFound('Order');
    if (o.status !== 'submitted') throw bad(`Order is already ${o.status}`);
    const ts = nowIso();
    if (action === 'reject') {
      if (!note) throw bad('Give a reason (shown to the partner)');
      await t.run("UPDATE orders SET status = 'rejected', review_note = ?, reviewed_by = ?, reviewed_at = ?, updated_at = ? WHERE id = ?", [note, req.actor, ts, ts, o.id]);
      await audit(req.actor, 'order.reject', { type: 'order', id: o.id }, { note }, t);
      return { commission: 0 };
    }
    const partner = await t.get('SELECT * FROM partners WHERE id = ?', [o.partner_id]);
    if (partner.status !== 'approved') throw bad('The partner account is not active');
    const lines = parseJSON(o.services, []);
    // Optional overrides: final amount received (scales line amounts) and a single commission %.
    const finalAmount = req.body?.saleAmount !== undefined && req.body?.saleAmount !== '' ? money(req.body.saleAmount) : Number(o.sale_amount);
    if (!(finalAmount >= 0)) throw bad('Invalid sale amount');
    const overridePct = pctOrNull(req.body?.commissionPct, 'Commission');
    const scale = Number(o.sale_amount) > 0 ? finalAmount / Number(o.sale_amount) : 0;
    let total = 0;
    for (const l of lines) {
      const base = round2(Number(l.amount) * scale);
      const pct = overridePct ?? Number(l.commissionPct);
      if (base <= 0 || pct <= 0) continue;
      const entry = await addCommission(t, {
        partnerId: o.partner_id, orderId: o.id, customerId: o.customer_id, productId: o.product_id, type: l.kind === 'service' ? 'service' : 'new',
        baseAmount: base, pct, description: `${l.kind === 'service' ? 'Service' : 'New sale'} · ${l.name} · ${o.reference}`, createdBy: req.actor
      });
      total += entry.amount;
    }
    const start = RE.date.test(req.body?.startDate || '') ? req.body.startDate : today();
    const end = RE.date.test(req.body?.endDate || '') ? req.body.endDate : addYear(start);
    await t.run(
      `UPDATE orders SET status = 'approved', sale_amount = ?, review_note = ?, reviewed_by = ?, reviewed_at = ?, license_key = ?, start_date = ?, end_date = ?,
        subscription_status = 'active', updated_at = ? WHERE id = ?`,
      [finalAmount, note || null, req.actor, ts, str(req.body?.licenseKey, 200) || null, start, end, ts, o.id]
    );
    await audit(req.actor, 'order.approve', { type: 'order', id: o.id }, { saleAmount: finalAmount, commission: round2(total) }, t);
    return { commission: round2(total) };
  });
  res.json(result);
}));

router.put('/orders/:id/subscription', requireAdmin('manager'), h(async (req, res) => {
  const b = req.body || {};
  const o = await db.get("SELECT * FROM orders WHERE id = ? AND status = 'approved'", [req.params.id]);
  if (!o) throw notFound('Approved order');
  await db.run('UPDATE orders SET end_date = ?, subscription_status = ?, license_key = ?, updated_at = ? WHERE id = ?', [
    RE.date.test(b.endDate || '') ? b.endDate : o.end_date,
    ['active', 'expired', 'cancelled'].includes(b.subscriptionStatus) ? b.subscriptionStatus : o.subscription_status,
    b.licenseKey !== undefined ? str(b.licenseKey, 200) : o.license_key, nowIso(), o.id
  ]);
  res.json({ ok: true });
}));

router.post('/orders/:id/renewal', requireAdmin('manager'), h(async (req, res) => {
  const amount = money(req.body?.amount);
  if (!(amount > 0)) throw bad('Renewal amount is required');
  const out = await db.tx(async (t) => {
    const o = await t.get(`SELECT * FROM orders WHERE id = ? AND status = 'approved'${db.forUpdate}`, [req.params.id]);
    if (!o) throw notFound('Approved order');
    const partner = await t.get('SELECT * FROM partners WHERE id = ?', [o.partner_id]);
    const from = o.end_date && o.end_date >= today() ? nextDay(o.end_date) : today();
    const end = RE.date.test(req.body?.endDate || '') ? req.body.endDate : addYear(from);
    const rates = await commissionRates(partner, o.product_id, t);
    const pct = pctOrNull(req.body?.commissionPct, 'Commission') ?? rates.renewal.pct;
    let entry = null;
    if (partner.status === 'approved' && pct > 0) {
      entry = await addCommission(t, { partnerId: o.partner_id, orderId: o.id, customerId: o.customer_id, productId: o.product_id, type: 'renewal', baseAmount: amount, pct, description: `Renewal · ${o.reference} · until ${end}`, createdBy: req.actor });
    }
    await t.run("UPDATE orders SET end_date = ?, subscription_status = 'active', updated_at = ? WHERE id = ?", [end, nowIso(), o.id]);
    await audit(req.actor, 'order.renewal', { type: 'order', id: o.id }, { amount, end, commission: entry?.amount || 0 }, t);
    return { endDate: end, commission: entry?.amount || 0 };
  });
  res.status(201).json(out);
}));

const nextDay = (d) => {
  const x = new Date(`${d}T00:00:00Z`);
  x.setUTCDate(x.getUTCDate() + 1);
  return x.toISOString().slice(0, 10);
};

// Refund / cancellation: reverse everything credited on the order.
router.post('/orders/:id/reverse', requireAdmin('manager'), h(async (req, res) => {
  const reason = str(req.body?.reason, 300);
  if (!reason) throw bad('Reason is required');
  const out = await db.tx(async (t) => {
    const o = await t.get(`SELECT * FROM orders WHERE id = ?${db.forUpdate}`, [req.params.id]);
    if (!o) throw notFound('Order');
    const net = round2((await t.get('SELECT COALESCE(SUM(amount),0) AS s FROM commissions WHERE order_id = ?', [o.id])).s);
    if (net > 0) {
      await addCommission(t, { partnerId: o.partner_id, orderId: o.id, customerId: o.customer_id, productId: o.product_id, type: 'reversal', amount: -net, description: `Reversal · ${o.reference} · ${reason}`, createdBy: req.actor });
    }
    await t.run("UPDATE orders SET status = CASE WHEN status = 'approved' THEN 'cancelled' ELSE status END, subscription_status = 'cancelled', updated_at = ? WHERE id = ?", [nowIso(), o.id]);
    await audit(req.actor, 'order.reverse', { type: 'order', id: o.id }, { reason, amount: net }, t);
    return { reversed: net };
  });
  res.json(out);
}));

// ---------- Installations ----------
router.get('/installations', h(async (req, res) => {
  const where = ['1 = 1'];
  const params = [];
  if (req.query.status) {
    if (req.query.status === 'open') where.push("i.status IN ('requested','scheduled','in_progress')");
    else { where.push('i.status = ?'); params.push(str(req.query.status, 20)); }
  }
  res.json(await db.all(
    `SELECT i.*, c.business_name, c.contact_name, c.mobile, c.city, o.reference, p.name AS product_name, pa.code AS partner_code, pa.full_name AS partner_name
     FROM installations i JOIN customers c ON c.id = i.customer_id JOIN orders o ON o.id = i.order_id JOIN products p ON p.id = o.product_id JOIN partners pa ON pa.id = i.partner_id
     WHERE ${where.join(' AND ')} ORDER BY CASE i.status WHEN 'requested' THEN 0 WHEN 'scheduled' THEN 1 WHEN 'in_progress' THEN 2 ELSE 3 END, i.updated_at DESC LIMIT 300`, params));
}));

router.put('/installations/:id', requireAdmin('manager'), h(async (req, res) => {
  const b = req.body || {};
  if (!['requested', 'scheduled', 'in_progress', 'completed', 'cancelled'].includes(b.status)) throw bad('Invalid status');
  await db.tx(async (t) => {
    const i = await t.get('SELECT * FROM installations WHERE id = ?', [req.params.id]);
    if (!i) throw notFound('Installation');
    const ts = nowIso();
    await t.run('UPDATE installations SET status = ?, scheduled_for = ?, engineer = ?, admin_notes = ?, completed_at = ?, updated_at = ? WHERE id = ?', [
      b.status, b.scheduledFor !== undefined ? str(b.scheduledFor, 20) : i.scheduled_for, b.engineer !== undefined ? str(b.engineer, 100) : i.engineer,
      b.adminNotes !== undefined ? str(b.adminNotes, 500) : i.admin_notes, b.status === 'completed' ? ts : i.completed_at, ts, i.id
    ]);
    if (b.status !== i.status || b.adminNotes) await t.run('INSERT INTO installation_events (id, installation_id, status, note, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)', [nanoid(), i.id, b.status, str(b.adminNotes, 200), req.actor, ts]);
  });
  res.json({ ok: true });
}));

export default router;

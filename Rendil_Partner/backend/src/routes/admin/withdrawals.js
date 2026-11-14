import { Router } from 'express';
import { db } from '../../db/index.js';
import { requireAdmin } from '../../middleware/auth.js';
import { h, bad, notFound, nowIso } from '../../utils/http.js';
import { str, RE } from '../../utils/validators.js';
import { decrypt } from '../../utils/crypto.js';
import { audit } from '../../services/audit.js';

const router = Router();
router.use(requireAdmin());

router.get('/', h(async (req, res) => {
  const params = [];
  let where = '1 = 1';
  if (req.query.status) { where = 'w.status = ?'; params.push(str(req.query.status, 20)); }
  res.json(await db.all(
    `SELECT w.*, p.code AS partner_code, p.full_name AS partner_name, p.email AS partner_email, p.mobile AS partner_mobile
     FROM withdrawals w JOIN partners p ON p.id = w.partner_id WHERE ${where} ORDER BY w.requested_at DESC LIMIT 500`, params));
}));

// Approved, unpaid payouts with full account numbers for a bank bulk-transfer upload. Audit-logged.
router.get('/export.csv', requireAdmin('manager'), h(async (req, res) => {
  const rows = await db.all(
    `SELECT w.reference, p.code, w.bank_holder, p.bank_account_enc, w.bank_ifsc, w.bank_name, w.amount, w.tds_amount, w.net_amount, p.email, p.mobile
     FROM withdrawals w JOIN partners p ON p.id = w.partner_id WHERE w.status = 'approved' ORDER BY w.requested_at`);
  await audit(req.actor, 'withdrawals.export', {}, { count: rows.length });
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [
    ['Reference', 'Partner', 'Beneficiary', 'Account number', 'IFSC', 'Bank', 'Gross', 'TDS', 'Net payable', 'Email', 'Mobile'],
    ...rows.map((r) => [r.reference, r.code, r.bank_holder, decrypt(r.bank_account_enc), r.bank_ifsc, r.bank_name, r.amount, r.tds_amount, r.net_amount, r.email, r.mobile])
  ].map((r) => r.map(esc).join(',')).join('\n');
  res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="partner-payouts-${nowIso().slice(0, 10)}.csv"`, 'Cache-Control': 'no-store' });
  res.send(csv);
}));

router.put('/:id', requireAdmin('manager'), h(async (req, res) => {
  const action = req.body?.action;
  const note = str(req.body?.note, 300);
  const allowed = { approve: ['requested'], reject: ['requested', 'approved'], paid: ['requested', 'approved'] };
  if (!allowed[action]) throw bad('action must be approve, reject or paid');
  await db.tx(async (t) => {
    const w = await t.get(`SELECT * FROM withdrawals WHERE id = ?${db.forUpdate}`, [req.params.id]);
    if (!w) throw notFound('Withdrawal');
    if (!allowed[action].includes(w.status)) throw bad(`Cannot ${action} a ${w.status} withdrawal`);
    const ts = nowIso();
    if (action === 'reject') {
      if (!note) throw bad('Give a reason (shown to the partner)');
      await t.run("UPDATE withdrawals SET status = 'rejected', review_note = ?, reviewed_at = ?, reviewed_by = ? WHERE id = ?", [note, ts, req.actor, w.id]);
    } else if (action === 'approve') {
      await t.run("UPDATE withdrawals SET status = 'approved', review_note = ?, reviewed_at = ?, reviewed_by = ? WHERE id = ?", [note || null, ts, req.actor, w.id]);
    } else {
      const utr = str(req.body?.utr, 40);
      if (!utr) throw bad('Bank reference / UTR is required');
      await t.run("UPDATE withdrawals SET status = 'paid', utr = ?, pay_mode = ?, paid_on = ?, review_note = ?, reviewed_at = ?, reviewed_by = ? WHERE id = ?", [
        utr, ['NEFT', 'RTGS', 'IMPS', 'UPI', 'Cheque'].includes(req.body?.mode) ? req.body.mode : 'NEFT',
        RE.date.test(req.body?.paidOn || '') ? req.body.paidOn : ts.slice(0, 10), note || w.review_note, ts, req.actor, w.id
      ]);
    }
    await audit(req.actor, `withdrawal.${action}`, { type: 'withdrawal', id: w.id }, { amount: Number(w.amount), partner: w.partner_id }, t);
  });
  res.json({ ok: true });
}));

export default router;

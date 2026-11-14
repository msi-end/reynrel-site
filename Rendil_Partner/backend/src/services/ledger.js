import { nanoid } from 'nanoid';
import { db } from '../db/index.js';
import { getProgram } from './settings.js';
import { round2 } from '../utils/validators.js';
import { nowIso } from '../utils/http.js';

export async function balance(partnerId, q = db) {
  const program = await getProgram();
  const e = await q.get('SELECT COALESCE(SUM(amount), 0) AS earned FROM commissions WHERE partner_id = ?', [partnerId]);
  const w = await q.get(
    `SELECT
       COALESCE(SUM(CASE WHEN status IN ('requested','approved') THEN amount ELSE 0 END), 0) AS in_process,
       COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS paid_gross,
       COALESCE(SUM(CASE WHEN status = 'paid' THEN net_amount ELSE 0 END), 0) AS paid_net,
       COALESCE(SUM(CASE WHEN status = 'paid' THEN tds_amount ELSE 0 END), 0) AS tds
     FROM withdrawals WHERE partner_id = ?`,
    [partnerId]
  );
  const earned = round2(e.earned);
  const locked = round2(Number(w.in_process) + Number(w.paid_gross));
  return {
    totalEarned: earned,
    available: round2(Math.max(0, earned - locked)),
    inProcess: round2(w.in_process),
    paidGross: round2(w.paid_gross),
    paidNet: round2(w.paid_net),
    tdsDeducted: round2(w.tds),
    minWithdrawal: Number(program.minWithdrawal),
    tdsPercent: Number(program.tdsPercent)
  };
}

export async function addCommission(q, { partnerId, orderId = null, customerId = null, productId = null, type, baseAmount = 0, pct = 0, amount, description, createdBy }) {
  const row = {
    id: nanoid(), partner_id: partnerId, order_id: orderId, customer_id: customerId, product_id: productId, type,
    base_amount: round2(baseAmount), pct: Number(pct) || 0,
    amount: round2(amount ?? (Number(baseAmount) * Number(pct)) / 100),
    description: (description || '').slice(0, 300), created_by: createdBy || 'system', created_at: nowIso()
  };
  await q.run(
    'INSERT INTO commissions (id, partner_id, order_id, customer_id, product_id, type, base_amount, pct, amount, description, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    Object.values(row)
  );
  return row;
}

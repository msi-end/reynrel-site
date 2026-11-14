// Dashboard, settings, terms, admin users, audit log.
import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../../db/index.js';
import { requireAdmin } from '../../middleware/auth.js';
import { h, bad, notFound, nowIso, parseJSON } from '../../utils/http.js';
import { str, round2, RE } from '../../utils/validators.js';
import { hashPassword, tempPassword } from '../../utils/password.js';
import { getSetting, setSetting, getProgram } from '../../services/settings.js';
import { audit } from '../../services/audit.js';

const router = Router();
router.use(requireAdmin());

router.get('/overview', h(async (req, res) => {
  const month = nowIso().slice(0, 7);
  const [partners, orders, inst, money, wd, docs, banks, top, recent] = await Promise.all([
    db.get(`SELECT COUNT(*) AS total, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) AS active,
      SUM(CASE WHEN status='suspended' THEN 1 ELSE 0 END) AS suspended FROM partners`),
    db.get(`SELECT SUM(CASE WHEN status='submitted' THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN status='approved' AND reviewed_at >= ? THEN sale_amount ELSE 0 END) AS sales_month FROM orders`, [month]),
    db.get("SELECT SUM(CASE WHEN status IN ('requested','scheduled','in_progress') THEN 1 ELSE 0 END) AS open_count FROM installations"),
    db.get('SELECT COALESCE(SUM(amount),0) AS total, COALESCE(SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END),0) AS month FROM commissions', [month]),
    db.get(`SELECT SUM(CASE WHEN status='requested' THEN 1 ELSE 0 END) AS requested, SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) AS approved,
      COALESCE(SUM(CASE WHEN status IN ('requested','approved') THEN amount ELSE 0 END),0) AS due, COALESCE(SUM(CASE WHEN status='paid' THEN net_amount ELSE 0 END),0) AS paid FROM withdrawals`),
    db.get("SELECT COUNT(*) AS n FROM partner_documents WHERE status = 'pending'"),
    db.get("SELECT COUNT(*) AS n FROM partner_bank_requests WHERE status = 'pending'"),
    db.all(`SELECT p.id, p.code, p.full_name, p.business_name, p.city, COALESCE(SUM(c.amount),0) AS earned,
        (SELECT COUNT(*) FROM orders o WHERE o.partner_id = p.id AND o.status = 'approved') AS orders
      FROM partners p LEFT JOIN commissions c ON c.partner_id = p.id WHERE p.status = 'approved'
      GROUP BY p.id, p.code, p.full_name, p.business_name, p.city ORDER BY earned DESC LIMIT 5`),
    db.all("SELECT actor, action, target_type, created_at FROM audit_log ORDER BY created_at DESC LIMIT 8")
  ]);
  const n = (v) => Number(v || 0);
  res.json({
    partners: { total: n(partners.total), pending: n(partners.pending), active: n(partners.active), suspended: n(partners.suspended) },
    orders: { pending: n(orders.pending), approved: n(orders.approved), salesThisMonth: round2(orders.sales_month) },
    installationsOpen: n(inst.open_count),
    commission: { total: round2(money.total), thisMonth: round2(money.month) },
    withdrawals: { requested: n(wd.requested), approved: n(wd.approved), due: round2(wd.due), paid: round2(wd.paid) },
    documentsPending: n(docs.n), bankChangesPending: n(banks.n),
    topPartners: top.map((t) => ({ ...t, earned: round2(t.earned) })),
    recentActivity: recent
  });
}));

router.get('/customers', h(async (req, res) => {
  const q = `%${str(req.query.q, 80)}%`;
  res.json(await db.all(
    `SELECT c.*, pa.code AS partner_code, pa.full_name AS partner_name,
      (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS orders,
      (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.subscription_status = 'active') AS active_subscriptions
     FROM customers c JOIN partners pa ON pa.id = c.partner_id
     WHERE c.business_name LIKE ? OR c.contact_name LIKE ? OR c.mobile LIKE ? OR c.city LIKE ? ORDER BY c.created_at DESC LIMIT 300`, [q, q, q, q]));
}));

// ---------- Settings ----------
router.get('/settings', h(async (req, res) => {
  const [program, partnerTypes, documentTypes] = await Promise.all([getProgram(), getSetting('partner_types'), getSetting('document_types')]);
  res.json({ program, partnerTypes, documentTypes });
}));

router.put('/settings', requireAdmin('owner'), h(async (req, res) => {
  const b = req.body || {};
  if (b.program) {
    const cur = await getProgram();
    const num = (v, min, max, field) => {
      const x = Number(v);
      if (!Number.isFinite(x) || x < min || x > max) throw bad(`${field} must be between ${min} and ${max}`);
      return x;
    };
    const p = b.program;
    await setSetting('program', {
      ...cur,
      companyName: str(p.companyName ?? cur.companyName, 120), supportPhone: str(p.supportPhone ?? cur.supportPhone, 40), supportEmail: str(p.supportEmail ?? cur.supportEmail, 150),
      mainSiteUrl: str(p.mainSiteUrl ?? cur.mainSiteUrl, 200), registrationOpen: p.registrationOpen === undefined ? cur.registrationOpen : !!p.registrationOpen,
      minWithdrawal: num(p.minWithdrawal ?? cur.minWithdrawal, 0, 10000000, 'Minimum withdrawal'), tdsPercent: num(p.tdsPercent ?? cur.tdsPercent, 0, 50, 'TDS %'),
      defaultCommissionPct: num(p.defaultCommissionPct ?? cur.defaultCommissionPct, 0, 100, 'Default commission'), defaultRenewalPct: num(p.defaultRenewalPct ?? cur.defaultRenewalPct, 0, 100, 'Default renewal')
    });
  }
  const keyed = (list, field) => {
    if (!Array.isArray(list)) return null;
    const out = list.map((x) => ({ ...x, key: String(x.key || x.label || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '').slice(0, 40), label: str(x.label, 200) })).filter((x) => x.key && x.label);
    if (new Set(out.map((x) => x.key)).size !== out.length) throw bad(`${field}: keys must be unique`);
    return out;
  };
  const types = keyed(b.partnerTypes, 'Partner types');
  if (types) await setSetting('partner_types', types.map(({ key, label }) => ({ key, label })));
  const docs = keyed(b.documentTypes, 'Document types');
  if (docs) await setSetting('document_types', docs.map(({ key, label, required, requiredIfGstin }) => ({ key, label, required: !!required, requiredIfGstin: !!requiredIfGstin })));
  await audit(req.actor, 'settings.update', {}, { keys: Object.keys(b) });
  res.json({ program: await getProgram(), partnerTypes: await getSetting('partner_types'), documentTypes: await getSetting('document_types') });
}));

// ---------- Terms ----------
router.get('/terms', h(async (req, res) => res.json(await db.all('SELECT * FROM terms ORDER BY version DESC'))));

router.post('/terms', requireAdmin('owner'), h(async (req, res) => {
  const content = typeof req.body?.content === 'string' ? req.body.content.trim().slice(0, 60000) : '';
  if (content.length < 100) throw bad('Terms are too short');
  const out = await db.tx(async (t) => {
    const cur = await t.get('SELECT COALESCE(MAX(version), 0) AS v FROM terms');
    const version = Number(cur.v) + 1;
    await t.run('INSERT INTO terms (version, content, created_by, created_at) VALUES (?, ?, ?, ?)', [version, content, req.actor, nowIso()]);
    await audit(req.actor, 'terms.publish', {}, { version }, t);
    return { version };
  });
  res.status(201).json(out);
}));

// ---------- Admin users (owner only) ----------
router.get('/admins', requireAdmin('owner'), h(async (req, res) => res.json(await db.all('SELECT id, name, email, role, active, last_login_at, created_at FROM admins ORDER BY created_at'))));

router.post('/admins', requireAdmin('owner'), h(async (req, res) => {
  const email = str(req.body?.email, 150).toLowerCase();
  const name = str(req.body?.name, 120);
  const role = ['owner', 'manager', 'viewer'].includes(req.body?.role) ? req.body.role : 'manager';
  if (!name || !RE.email.test(email)) throw bad('Name and a valid email are required');
  if (await db.get('SELECT id FROM admins WHERE email = ?', [email])) throw bad('An admin with this email exists');
  const pw = tempPassword();
  await db.run('INSERT INTO admins (id, name, email, password_hash, role, active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)', [nanoid(), name, email, hashPassword(pw), role, nowIso()]);
  await audit(req.actor, 'admin.create', {}, { email, role });
  res.status(201).json({ temporaryPassword: pw });
}));

router.put('/admins/:id', requireAdmin('owner'), h(async (req, res) => {
  const a = await db.get('SELECT * FROM admins WHERE id = ?', [req.params.id]);
  if (!a) throw notFound('Admin');
  if (a.id === req.admin.id && (req.body?.active === false || (req.body?.role && req.body.role !== 'owner'))) throw bad('You cannot demote or disable yourself');
  const role = ['owner', 'manager', 'viewer'].includes(req.body?.role) ? req.body.role : a.role;
  const active = req.body?.active === undefined ? a.active : req.body.active ? 1 : 0;
  await db.run('UPDATE admins SET role = ?, active = ?, token_version = token_version + ? WHERE id = ?', [role, active, active ? 0 : 1, a.id]);
  await audit(req.actor, 'admin.update', {}, { email: a.email, role, active });
  res.json({ ok: true });
}));

router.get('/audit', h(async (req, res) => {
  const rows = await db.all('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 300');
  res.json(rows.map((r) => ({ ...r, meta: parseJSON(r.meta, null) })));
}));

export default router;

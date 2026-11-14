import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import { db } from '../../db/index.js';
import { config } from '../../config.js';
import { requireAdmin } from '../../middleware/auth.js';
import { productImageUpload, filesOf, discard } from '../../middleware/upload.js';
import { h, bad, notFound, nowIso, parseJSON, HttpError } from '../../utils/http.js';
import { str, slugify, pctOrNull, moneyOrNull, RE, FieldErrors } from '../../utils/validators.js';
import { audit } from '../../services/audit.js';
import { getProgram } from '../../services/settings.js';

const router = Router();
router.use(requireAdmin());

const STATUSES = ['active', 'draft', 'archived'];
const CYCLES = ['yearly', 'monthly', 'quarterly', 'one_time'];

async function getProduct(id) {
  const p = await db.get('SELECT * FROM products WHERE id = ?', [id]);
  if (!p) throw notFound('Product');
  return p;
}

async function fullProduct(id) {
  const p = await getProduct(id);
  const [plans, services, features, media, access, usage] = await Promise.all([
    db.all('SELECT * FROM product_plans WHERE product_id = ? ORDER BY sort_order, price', [id]),
    db.all('SELECT * FROM product_services WHERE product_id = ? ORDER BY sort_order, name', [id]),
    db.all('SELECT * FROM product_features WHERE product_id = ? ORDER BY sort_order', [id]),
    db.all('SELECT * FROM product_media WHERE product_id = ? ORDER BY sort_order', [id]),
    db.all(
      `SELECT pp.partner_id, pp.enabled, pp.commission_pct, pp.renewal_pct, pa.code, pa.full_name, pa.business_name, pa.status
       FROM partner_products pp JOIN partners pa ON pa.id = pp.partner_id WHERE pp.product_id = ? ORDER BY pa.full_name`, [id]),
    db.get("SELECT COUNT(*) AS orders, SUM(CASE WHEN status = 'approved' THEN sale_amount ELSE 0 END) AS sales FROM orders WHERE product_id = ?", [id])
  ]);
  const prices = await db.all(
    `SELECT pr.*, pa.code, pa.full_name FROM partner_prices pr JOIN partners pa ON pa.id = pr.partner_id WHERE pr.product_id = ? ORDER BY pa.full_name`, [id]);
  return {
    ...p,
    plans: plans.map((x) => ({ ...x, inclusions: parseJSON(x.inclusions, []) })),
    services, features, media, partners: access, negotiatedPrices: prices,
    usage: { orders: Number(usage.orders || 0), sales: Number(usage.sales || 0) }
  };
}

function readProduct(b) {
  const d = {
    name: str(b.name, 120), slug: slugify(b.slug || b.name), category: str(b.category, 80), tagline: str(b.tagline, 255),
    description: str(b.description, 10000), icon: str(b.icon, 40) || 'Package', website_url: str(b.websiteUrl, 255),
    status: STATUSES.includes(b.status) ? b.status : 'draft', sort_order: parseInt(b.sortOrder, 10) || 0,
    default_commission_pct: pctOrNull(b.defaultCommissionPct, 'Default commission') ?? 0,
    renewal_commission_pct: pctOrNull(b.renewalCommissionPct, 'Renewal commission') ?? 0
  };
  new FieldErrors().check(d.name, 'name', 'Required').check(RE.slug.test(d.slug), 'slug', 'Use lowercase letters, numbers and hyphens').throwIfAny();
  return d;
}

router.get('/', h(async (req, res) => {
  res.json(await db.all(
    `SELECT p.*,
      (SELECT COUNT(*) FROM product_plans x WHERE x.product_id = p.id AND x.active = 1) AS plan_count,
      (SELECT MIN(price) FROM product_plans x WHERE x.product_id = p.id AND x.active = 1) AS from_price,
      (SELECT COUNT(*) FROM product_services x WHERE x.product_id = p.id) AS service_count,
      (SELECT COUNT(*) FROM product_features x WHERE x.product_id = p.id) AS feature_count,
      (SELECT COUNT(*) FROM partner_products x WHERE x.product_id = p.id AND x.enabled = 1) AS partner_count,
      (SELECT COUNT(*) FROM orders x WHERE x.product_id = p.id AND x.status = 'approved') AS approved_orders
     FROM products p ORDER BY p.sort_order, p.name`));
}));

router.get('/:id', h(async (req, res) => res.json(await fullProduct(req.params.id))));

router.post('/', requireAdmin('manager'), h(async (req, res) => {
  const program = await getProgram();
  const d = readProduct({ defaultCommissionPct: program.defaultCommissionPct, renewalCommissionPct: program.defaultRenewalPct, ...req.body });
  if (await db.get('SELECT id FROM products WHERE slug = ?', [d.slug])) throw bad('Another product already uses this slug', { fields: { slug: 'Already used' } });
  const id = nanoid();
  const ts = nowIso();
  await db.run(
    `INSERT INTO products (id, slug, name, category, tagline, description, icon, website_url, status, sort_order, default_commission_pct, renewal_commission_pct, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, d.slug, d.name, d.category, d.tagline, d.description, d.icon, d.website_url, d.status, d.sort_order, d.default_commission_pct, d.renewal_commission_pct, ts, ts]
  );
  await audit(req.actor, 'product.create', { type: 'product', id }, { name: d.name });
  res.status(201).json(await fullProduct(id));
}));

router.put('/:id', requireAdmin('manager'), h(async (req, res) => {
  const p = await getProduct(req.params.id);
  const d = readProduct({ ...camel(p), ...req.body });
  if (await db.get('SELECT id FROM products WHERE slug = ? AND id <> ?', [d.slug, p.id])) throw bad('Another product already uses this slug', { fields: { slug: 'Already used' } });
  await db.run(
    `UPDATE products SET slug = ?, name = ?, category = ?, tagline = ?, description = ?, icon = ?, website_url = ?, status = ?, sort_order = ?,
      default_commission_pct = ?, renewal_commission_pct = ?, updated_at = ? WHERE id = ?`,
    [d.slug, d.name, d.category, d.tagline, d.description, d.icon, d.website_url, d.status, d.sort_order, d.default_commission_pct, d.renewal_commission_pct, nowIso(), p.id]
  );
  await audit(req.actor, 'product.update', { type: 'product', id: p.id }, { status: d.status, commission: d.default_commission_pct, renewal: d.renewal_commission_pct });
  res.json(await fullProduct(p.id));
}));

const camel = (p) => ({
  name: p.name, slug: p.slug, category: p.category, tagline: p.tagline, description: p.description, icon: p.icon, websiteUrl: p.website_url,
  status: p.status, sortOrder: p.sort_order, defaultCommissionPct: p.default_commission_pct, renewalCommissionPct: p.renewal_commission_pct
});

router.delete('/:id', requireAdmin('manager'), h(async (req, res) => {
  const p = await getProduct(req.params.id);
  const used = await db.get('SELECT COUNT(*) AS n FROM orders WHERE product_id = ?', [p.id]);
  if (Number(used.n) > 0) throw new HttpError(409, `This product has ${used.n} customer order(s). Archive it instead so history is kept.`);
  const media = await db.all('SELECT url FROM product_media WHERE product_id = ?', [p.id]);
  await db.run('DELETE FROM products WHERE id = ?', [p.id]);
  await Promise.all(media.filter((m) => m.url.startsWith('/uploads/products/')).map((m) => fs.unlink(path.join(config.paths.productUploads, path.basename(m.url))).catch(() => {})));
  await audit(req.actor, 'product.delete', { type: 'product', id: p.id }, { name: p.name });
  res.status(204).end();
}));

// ---------- Plans ----------
function readPlan(b) {
  const d = {
    name: str(b.name, 120), billing_cycle: CYCLES.includes(b.billingCycle) ? b.billingCycle : 'yearly',
    price: moneyOrNull(b.price, 'Price'), renewal_price: moneyOrNull(b.renewalPrice, 'Renewal price'), min_partner_price: moneyOrNull(b.minPartnerPrice, 'Minimum partner price'),
    description: str(b.description, 500), inclusions: JSON.stringify((Array.isArray(b.inclusions) ? b.inclusions : String(b.inclusions || '').split('\n')).map((x) => str(x, 200)).filter(Boolean).slice(0, 30)),
    active: b.active === false ? 0 : 1, sort_order: parseInt(b.sortOrder, 10) || 0
  };
  new FieldErrors().check(d.name, 'name', 'Required').check(d.price !== null, 'price', 'Required').throwIfAny();
  if (d.min_partner_price !== null && d.min_partner_price > d.price) throw bad('Minimum partner price cannot be above the list price');
  return d;
}

router.post('/:id/plans', requireAdmin('manager'), h(async (req, res) => {
  const p = await getProduct(req.params.id);
  const d = readPlan(req.body || {});
  await db.run('INSERT INTO product_plans (id, product_id, name, billing_cycle, price, renewal_price, min_partner_price, description, inclusions, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [nanoid(), p.id, d.name, d.billing_cycle, d.price, d.renewal_price, d.min_partner_price, d.description, d.inclusions, d.active, d.sort_order]);
  await audit(req.actor, 'product.plan_add', { type: 'product', id: p.id }, { name: d.name, price: d.price });
  res.status(201).json(await fullProduct(p.id));
}));

router.put('/:id/plans/:planId', requireAdmin('manager'), h(async (req, res) => {
  const d = readPlan(req.body || {});
  const r = await db.run('UPDATE product_plans SET name = ?, billing_cycle = ?, price = ?, renewal_price = ?, min_partner_price = ?, description = ?, inclusions = ?, active = ?, sort_order = ? WHERE id = ? AND product_id = ?',
    [d.name, d.billing_cycle, d.price, d.renewal_price, d.min_partner_price, d.description, d.inclusions, d.active, d.sort_order, req.params.planId, req.params.id]);
  if (!r.changes) throw notFound('Plan');
  await audit(req.actor, 'product.plan_update', { type: 'product', id: req.params.id }, { name: d.name, price: d.price });
  res.json(await fullProduct(req.params.id));
}));

router.delete('/:id/plans/:planId', requireAdmin('manager'), h(async (req, res) => {
  const used = await db.get('SELECT COUNT(*) AS n FROM orders WHERE plan_id = ?', [req.params.planId]);
  if (Number(used.n) > 0) {
    await db.run('UPDATE product_plans SET active = 0 WHERE id = ? AND product_id = ?', [req.params.planId, req.params.id]);
  } else {
    await db.run('DELETE FROM partner_prices WHERE plan_id = ?', [req.params.planId]);
    await db.run('DELETE FROM product_plans WHERE id = ? AND product_id = ?', [req.params.planId, req.params.id]);
  }
  await audit(req.actor, 'product.plan_remove', { type: 'product', id: req.params.id });
  res.json(await fullProduct(req.params.id));
}));

// ---------- Services ----------
function readService(b) {
  const d = {
    name: str(b.name, 120), description: str(b.description, 500), price: moneyOrNull(b.price, 'Price') ?? 0,
    commission_pct: pctOrNull(b.commissionPct, 'Commission'), active: b.active === false ? 0 : 1, sort_order: parseInt(b.sortOrder, 10) || 0
  };
  new FieldErrors().check(d.name, 'name', 'Required').throwIfAny();
  return d;
}

router.post('/:id/services', requireAdmin('manager'), h(async (req, res) => {
  const p = await getProduct(req.params.id);
  const d = readService(req.body || {});
  await db.run('INSERT INTO product_services (id, product_id, name, description, price, commission_pct, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [nanoid(), p.id, d.name, d.description, d.price, d.commission_pct, d.active, d.sort_order]);
  await audit(req.actor, 'product.service_add', { type: 'product', id: p.id }, { name: d.name, price: d.price });
  res.status(201).json(await fullProduct(p.id));
}));

router.put('/:id/services/:serviceId', requireAdmin('manager'), h(async (req, res) => {
  const d = readService(req.body || {});
  const r = await db.run('UPDATE product_services SET name = ?, description = ?, price = ?, commission_pct = ?, active = ?, sort_order = ? WHERE id = ? AND product_id = ?',
    [d.name, d.description, d.price, d.commission_pct, d.active, d.sort_order, req.params.serviceId, req.params.id]);
  if (!r.changes) throw notFound('Service');
  res.json(await fullProduct(req.params.id));
}));

router.delete('/:id/services/:serviceId', requireAdmin('manager'), h(async (req, res) => {
  await db.run('DELETE FROM partner_prices WHERE service_id = ?', [req.params.serviceId]);
  await db.run('DELETE FROM product_services WHERE id = ? AND product_id = ?', [req.params.serviceId, req.params.id]);
  res.json(await fullProduct(req.params.id));
}));

// ---------- Features (replace the whole list; order = array order) ----------
router.put('/:id/features', requireAdmin('manager'), h(async (req, res) => {
  const p = await getProduct(req.params.id);
  const items = (Array.isArray(req.body?.items) ? req.body.items : []).map((f) => ({ group: str(f.group, 80), title: str(f.title, 150), description: str(f.description, 500) })).filter((f) => f.title).slice(0, 200);
  await db.tx(async (t) => {
    await t.run('DELETE FROM product_features WHERE product_id = ?', [p.id]);
    for (const [i, f] of items.entries()) {
      await t.run('INSERT INTO product_features (id, product_id, group_name, title, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)', [nanoid(), p.id, f.group, f.title, f.description, i]);
    }
  });
  res.json(await fullProduct(p.id));
}));

// ---------- Screenshots ----------
router.post('/:id/media', requireAdmin('manager'), productImageUpload.array('images', 10), h(async (req, res) => {
  const files = filesOf(req);
  try {
    const p = await getProduct(req.params.id);
    const device = req.body?.device === 'mobile' ? 'mobile' : 'desktop';
    const caption = str(req.body?.caption, 200);
    const url = str(req.body?.url, 300);
    const max = await db.get('SELECT COALESCE(MAX(sort_order), -1) AS m FROM product_media WHERE product_id = ?', [p.id]);
    let order = Number(max.m) + 1;
    if (!files.length && !/^https?:\/\//.test(url)) throw bad('Upload an image or give an image URL');
    for (const f of files) await db.run('INSERT INTO product_media (id, product_id, url, caption, device, sort_order) VALUES (?, ?, ?, ?, ?, ?)', [nanoid(), p.id, `/uploads/products/${f.filename}`, caption, device, order++]);
    if (!files.length) await db.run('INSERT INTO product_media (id, product_id, url, caption, device, sort_order) VALUES (?, ?, ?, ?, ?, ?)', [nanoid(), p.id, url, caption, device, order]);
    res.status(201).json(await fullProduct(p.id));
  } catch (err) {
    await discard(files, config.paths.productUploads);
    throw err;
  }
}));

router.put('/:id/media/:mediaId', requireAdmin('manager'), h(async (req, res) => {
  await db.run('UPDATE product_media SET caption = ?, device = ?, sort_order = ? WHERE id = ? AND product_id = ?',
    [str(req.body?.caption, 200), req.body?.device === 'mobile' ? 'mobile' : 'desktop', parseInt(req.body?.sortOrder, 10) || 0, req.params.mediaId, req.params.id]);
  res.json(await fullProduct(req.params.id));
}));

router.delete('/:id/media/:mediaId', requireAdmin('manager'), h(async (req, res) => {
  const m = await db.get('SELECT url FROM product_media WHERE id = ? AND product_id = ?', [req.params.mediaId, req.params.id]);
  if (!m) throw notFound('Image');
  await db.run('DELETE FROM product_media WHERE id = ?', [req.params.mediaId]);
  if (m.url.startsWith('/uploads/products/')) await fs.unlink(path.join(config.paths.productUploads, path.basename(m.url))).catch(() => {});
  res.json(await fullProduct(req.params.id));
}));

export default router;

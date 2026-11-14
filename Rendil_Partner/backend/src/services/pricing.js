// Pricing & commission engine.
//
// Price a partner's customer pays for a plan/service:
//   active negotiated price for this partner (partner_prices) -> catalogue price
//
// Commission % (most specific wins):
//   service.commission_pct (services only)
//   -> partner × product override (partner_products.commission_pct / renewal_pct)
//   -> partner-wide override (partners.default_commission_pct / default_renewal_pct)
//   -> product default (products.default_commission_pct / renewal_commission_pct)
//   -> program default (Settings)
import { db } from '../db/index.js';
import { getProgram } from './settings.js';
import { round2 } from '../utils/validators.js';
import { today } from '../utils/http.js';

const isNum = (v) => v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v));

export async function negotiatedPrices(partnerId, productId, q = db) {
  const rows = await q.all(
    'SELECT * FROM partner_prices WHERE partner_id = ? AND product_id = ? AND (valid_until IS NULL OR valid_until >= ?)',
    [partnerId, productId, today()]
  );
  return {
    plan: Object.fromEntries(rows.filter((r) => r.plan_id).map((r) => [r.plan_id, r])),
    service: Object.fromEntries(rows.filter((r) => r.service_id).map((r) => [r.service_id, r]))
  };
}

export async function commissionRates(partner, productId, q = db) {
  const program = await getProgram();
  const product = await q.get('SELECT default_commission_pct, renewal_commission_pct FROM products WHERE id = ?', [productId]);
  const pp = await q.get('SELECT commission_pct, renewal_pct FROM partner_products WHERE partner_id = ? AND product_id = ?', [partner.id, productId]);
  const pick = (...vals) => {
    for (const [v, source] of vals) if (isNum(v)) return { pct: Number(v), source };
    return { pct: 0, source: 'none' };
  };
  return {
    newSale: pick([pp?.commission_pct, 'partner_product'], [partner.default_commission_pct, 'partner'], [product?.default_commission_pct, 'product'], [program.defaultCommissionPct, 'program']),
    renewal: pick([pp?.renewal_pct, 'partner_product'], [partner.default_renewal_pct, 'partner'], [product?.renewal_commission_pct, 'product'], [program.defaultRenewalPct, 'program'])
  };
}

// Builds the priced order lines for a partner: what the customer pays and what the partner earns.
export async function quote(partner, { productId, planId, serviceIds = [], counters = 1 }, q = db) {
  const product = await q.get("SELECT * FROM products WHERE id = ? AND status = 'active'", [productId]);
  if (!product) return { error: 'Product is not available' };
  const plan = planId ? await q.get('SELECT * FROM product_plans WHERE id = ? AND product_id = ? AND active = 1', [planId, productId]) : null;
  if (planId && !plan) return { error: 'Plan is not available' };
  const services = serviceIds.length
    ? await q.all(`SELECT * FROM product_services WHERE product_id = ? AND active = 1 AND id IN (${serviceIds.map(() => '?').join(',')})`, [productId, ...serviceIds])
    : [];
  const nego = await negotiatedPrices(partner.id, productId, q);
  const rates = await commissionRates(partner, productId, q);
  const qty = Math.max(1, Math.min(100, parseInt(counters, 10) || 1));

  const lines = [];
  if (plan) {
    const special = nego.plan[plan.id];
    const unit = special ? Number(special.price) : Number(plan.price);
    lines.push({
      kind: 'plan', id: plan.id, name: plan.name, qty: 1, listPrice: Number(plan.price), unitPrice: unit, amount: round2(unit),
      negotiated: !!special, commissionPct: rates.newSale.pct
    });
  }
  for (const s of services) {
    const special = nego.service[s.id];
    const unit = special ? Number(special.price) : Number(s.price);
    lines.push({
      kind: 'service', id: s.id, name: s.name, qty: 1, listPrice: Number(s.price), unitPrice: unit, amount: round2(unit),
      negotiated: !!special, commissionPct: isNum(s.commission_pct) ? Number(s.commission_pct) : rates.newSale.pct
    });
  }
  const listAmount = round2(lines.reduce((t, l) => t + l.listPrice * l.qty, 0));
  const saleAmount = round2(lines.reduce((t, l) => t + l.amount, 0));
  const commission = round2(lines.reduce((t, l) => t + (l.amount * l.commissionPct) / 100, 0));
  return { product, plan, services, lines, listAmount, saleAmount, commission, counters: qty, rates };
}

// Catalogue view for one partner: only enabled, active products, with effective prices and rates.
export async function partnerCatalogue(partner, q = db) {
  const rows = await q.all(
    `SELECT p.*, pp.commission_pct AS pp_commission, pp.renewal_pct AS pp_renewal, pp.demo_url, pp.demo_username, pp.demo_password
     FROM partner_products pp JOIN products p ON p.id = pp.product_id
     WHERE pp.partner_id = ? AND pp.enabled = 1 AND p.status = 'active' ORDER BY p.sort_order, p.name`,
    [partner.id]
  );
  const out = [];
  for (const p of rows) {
    const [plans, services, features, media, nego, rates] = await Promise.all([
      q.all('SELECT * FROM product_plans WHERE product_id = ? AND active = 1 ORDER BY sort_order, price', [p.id]),
      q.all('SELECT * FROM product_services WHERE product_id = ? AND active = 1 ORDER BY sort_order, name', [p.id]),
      q.all('SELECT group_name, title, description FROM product_features WHERE product_id = ? ORDER BY sort_order', [p.id]),
      q.all('SELECT url, caption, device FROM product_media WHERE product_id = ? ORDER BY sort_order', [p.id]),
      negotiatedPrices(partner.id, p.id, q),
      commissionRates(partner, p.id, q)
    ]);
    out.push({
      id: p.id, slug: p.slug, name: p.name, category: p.category, tagline: p.tagline, description: p.description, icon: p.icon,
      websiteUrl: p.website_url,
      commissionPct: rates.newSale.pct, renewalPct: rates.renewal.pct,
      plans: plans.map((pl) => {
        const sp = nego.plan[pl.id];
        const price = sp ? Number(sp.price) : Number(pl.price);
        return {
          id: pl.id, name: pl.name, billingCycle: pl.billing_cycle, description: pl.description,
          inclusions: safeList(pl.inclusions), listPrice: Number(pl.price), price, negotiated: !!sp, validUntil: sp?.valid_until || null,
          renewalPrice: pl.renewal_price === null ? null : Number(pl.renewal_price),
          earn: round2((price * rates.newSale.pct) / 100)
        };
      }),
      services: services.map((s) => {
        const sp = nego.service[s.id];
        const price = sp ? Number(sp.price) : Number(s.price);
        const pct = isNum(s.commission_pct) ? Number(s.commission_pct) : rates.newSale.pct;
        return { id: s.id, name: s.name, description: s.description, listPrice: Number(s.price), price, negotiated: !!sp, commissionPct: pct, earn: round2((price * pct) / 100) };
      }),
      features,
      media,
      demo: p.demo_url ? { url: p.demo_url, username: p.demo_username, password: p.demo_password } : null
    });
  }
  return out;
}

function safeList(v) {
  try {
    const x = JSON.parse(v || '[]');
    return Array.isArray(x) ? x : [];
  } catch {
    return [];
  }
}

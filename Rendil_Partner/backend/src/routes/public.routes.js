import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../db/index.js';
import { h, bad, nowIso } from '../utils/http.js';
import { str } from '../utils/validators.js';
import { rateLimit } from '../utils/rateLimit.js';
import { hashPassword } from '../utils/password.js';
import { getProgram, getSetting, latestTerms } from '../services/settings.js';
import { newPartnerCode, readPartnerInput, recordTermsAcceptance } from '../services/partners.js';
import { audit } from '../services/audit.js';

const router = Router();
const registerLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: 'Too many applications from this network. Try again in an hour.' });

router.get('/config', h(async (req, res) => {
  const [program, partnerTypes, documentTypes, terms, products] = await Promise.all([
    getProgram(), getSetting('partner_types'), getSetting('document_types'), latestTerms(),
    db.all("SELECT id, name, category, tagline FROM products WHERE status = 'active' ORDER BY sort_order, name")
  ]);
  res.set('Cache-Control', 'public, max-age=60');
  res.json({
    companyName: program.companyName, supportPhone: program.supportPhone, supportEmail: program.supportEmail, mainSiteUrl: program.mainSiteUrl,
    registrationOpen: program.registrationOpen, minWithdrawal: program.minWithdrawal,
    partnerTypes, documentTypes, products,
    terms: terms ? { version: terms.version, content: terms.content } : null
  });
}));

// Public product list for the homepage: features, list prices and the default commission rate.
router.get('/products', h(async (req, res) => {
  const program = await getProgram();
  const products = await db.all(
    "SELECT id, slug, name, category, tagline, description, website_url, default_commission_pct, renewal_commission_pct FROM products WHERE status = 'active' ORDER BY sort_order, name"
  );
  const ids = products.map((p) => p.id);
  const inList = ids.map(() => '?').join(',') || "''";
  const [plans, features, media] = ids.length
    ? await Promise.all([
      db.all(`SELECT product_id, name, billing_cycle, price, renewal_price, description FROM product_plans WHERE active = 1 AND product_id IN (${inList}) ORDER BY sort_order, price`, ids),
      db.all(`SELECT product_id, group_name, title, description FROM product_features WHERE product_id IN (${inList}) ORDER BY sort_order`, ids),
      db.all(`SELECT product_id, url, caption FROM product_media WHERE product_id IN (${inList}) ORDER BY sort_order`, ids)
    ])
    : [[], [], []];
  const pick = (rows, id) => rows.filter((r) => r.product_id === id).map(({ product_id, ...r }) => r);
  res.set('Cache-Control', 'public, max-age=60');
  res.json({
    minWithdrawal: program.minWithdrawal,
    products: products.map((p) => ({
      id: p.id, slug: p.slug, name: p.name, category: p.category, tagline: p.tagline, description: p.description, websiteUrl: p.website_url,
      commissionPct: Number(p.default_commission_pct), renewalPct: Number(p.renewal_commission_pct),
      plans: pick(plans, p.id).map((x) => ({ ...x, price: Number(x.price), renewal_price: x.renewal_price === null ? null : Number(x.renewal_price) })),
      features: pick(features, p.id), media: pick(media, p.id)
    }))
  });
}));

// Short application: contact details and a password. PAN and bank are collected after approval.
router.post('/register', registerLimit, h(async (req, res) => {
  const program = await getProgram();
  if (!program.registrationOpen) throw bad('Partner applications are currently closed.');
  const raw = req.body || {};
  if (raw.website_url) return res.status(201).json({ status: 'pending' }); // honeypot: bots fill hidden fields
  const { d, errors } = await readPartnerInput(raw, { requireBank: false, requirePassword: true });
  errors.check(raw.acceptTerms === true, 'acceptTerms', 'Please accept the partner terms');
  errors.throwIfAny();
  const terms = await latestTerms();
  const out = await db.tx(async (t) => {
    const dup = await t.get('SELECT id FROM partners WHERE email = ? OR mobile = ?', [d.email, d.mobile]);
    if (dup) throw bad('An application with this email or mobile already exists. Log in to check its status.');
    const id = nanoid();
    const code = await newPartnerCode(t);
    const ts = nowIso();
    await t.run(
      `INSERT INTO partners (id, code, status, source, partner_type, full_name, email, mobile, whatsapp, business_name, city, state, profile, password_hash, created_at, updated_at)
       VALUES (?, ?, 'pending', 'self', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, code, d.partner_type, d.full_name, d.email, d.mobile, d.mobile, d.business_name, d.city, d.state,
        JSON.stringify({ interestedProducts: d.profile.interestedProducts, howDidYouHear: d.profile.howDidYouHear, message: str(raw.message, 500) }),
        hashPassword(d.password), ts, ts]
    );
    if (terms) await recordTermsAcceptance(t, id, terms.version, req.ip);
    await audit('applicant', 'partner.register', { type: 'partner', id }, { code }, t);
    return { code };
  });
  res.status(201).json({ code: out.code, status: 'pending' });
}));

export default router;

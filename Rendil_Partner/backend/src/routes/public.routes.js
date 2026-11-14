import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../db/index.js';
import { h, bad, nowIso } from '../utils/http.js';
import { rateLimit } from '../utils/rateLimit.js';
import { encrypt, blindIndex } from '../utils/crypto.js';
import { hashPassword } from '../utils/password.js';
import { documentUpload, filesOf, discard } from '../middleware/upload.js';
import { getProgram, getSetting, latestTerms } from '../services/settings.js';
import { newPartnerCode, readPartnerInput, requiredDocTypes, insertDocuments, recordTermsAcceptance } from '../services/partners.js';
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

router.post('/register', registerLimit, documentUpload.any(), h(async (req, res) => {
  const files = filesOf(req);
  try {
    const program = await getProgram();
    if (!program.registrationOpen) throw bad('Partner registration is currently closed.');
    let raw;
    try {
      raw = JSON.parse(req.body?.data || '{}');
    } catch {
      throw bad('Invalid form data');
    }
    const { d, errors } = await readPartnerInput(raw, { requireBank: true, requirePassword: true });
    const terms = await latestTerms();
    errors.check(raw.acceptTerms === true, 'acceptTerms', 'You must accept the partner terms');
    errors.check(raw.consent === true, 'consent', 'Consent is required to process your application');
    const uploaded = new Set(files.map((f) => f.fieldname));
    for (const k of await requiredDocTypes(!!d.gstin)) errors.check(uploaded.has(k), k, 'Required');
    errors.throwIfAny();
    if (Number(raw.termsVersion) !== terms.version) throw bad('The partner terms were updated. Please review and accept the latest version.');

    const panHash = blindIndex(d.pan);
    const out = await db.tx(async (t) => {
      const dup = await t.get('SELECT id FROM partners WHERE email = ? OR mobile = ? OR pan_hash = ?', [d.email, d.mobile, panHash]);
      if (dup) throw bad('An account with this email, mobile or PAN already exists. Log in to check its status.');
      const id = nanoid();
      const code = await newPartnerCode(t);
      const ts = nowIso();
      await t.run(
        `INSERT INTO partners (id, code, status, source, partner_type, full_name, email, mobile, whatsapp, date_of_birth, business_name, entity_type, gstin, website,
          address_line1, address_line2, city, district, state, pincode, profile, expected_monthly_customers,
          pan_enc, pan_hash, pan_last4, pan_name, bank_holder, bank_account_enc, bank_last4, bank_ifsc, bank_name, bank_branch, bank_account_type,
          password_hash, created_at, updated_at)
         VALUES (?, ?, 'pending', 'self', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, code, d.partner_type, d.full_name, d.email, d.mobile, d.whatsapp || d.mobile, d.date_of_birth, d.business_name, d.entity_type, d.gstin, d.website,
          d.address_line1, d.address_line2, d.city, d.district, d.state, d.pincode, JSON.stringify(d.profile), d.expected_monthly_customers,
          encrypt(d.pan), panHash, d.pan.slice(-4), d.pan_name, d.bank_holder, encrypt(d.account), d.account.slice(-4), d.bank_ifsc, d.bank_name, d.bank_branch, d.bank_account_type,
          hashPassword(d.password), ts, ts]
      );
      await insertDocuments(t, id, files, 'applicant');
      await recordTermsAcceptance(t, id, terms.version, req.ip);
      await audit('applicant', 'partner.register', { type: 'partner', id }, { code }, t);
      return { id, code };
    });
    res.status(201).json({ code: out.code, status: 'pending' });
  } catch (err) {
    await discard(files);
    throw err;
  }
}));

export default router;

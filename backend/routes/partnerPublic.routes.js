import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import { db } from '../db/lowdb.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { encrypt, blindIndex } from '../utils/crypto.js';
import { withLock } from '../utils/lock.js';
import { rateLimit } from '../utils/rateLimit.js';
import { partnerDocsUpload, DOC_FIELDS, filesToDocs, PARTNER_DOCS_DIR } from '../middleware/upload.js';
import {
  PAN_RE, IFSC_RE, GSTIN_RE, MOBILE_RE, EMAIL_RE, PINCODE_RE, ACCOUNT_RE,
  clean, upper, normMobile, PARTNER_TYPES, EXPECTED_CUSTOMER_RANGES
} from '../utils/validators.js';
import { newPartnerCode, activeTerms, program, publicPartner } from '../services/partners.js';

const router = Router();
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: 'Too many applications from this network. Try again in an hour.' });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 15, message: 'Too many login attempts. Try again in 15 minutes.' });

router.get('/program', async (req, res) => {
  await db.read();
  const p = program();
  const terms = activeTerms();
  res.json({
    minWithdrawal: p.minWithdrawal,
    tdsPercent: p.tdsPercent,
    defaultCommissionPercent: p.defaultCommissionPercent,
    defaultRenewalPercent: p.defaultRenewalPercent,
    payoutCycleDays: p.payoutCycleDays,
    tiers: p.tiers,
    partnerTypes: PARTNER_TYPES,
    expectedCustomerRanges: EXPECTED_CUSTOMER_RANGES,
    products: db.data.products.map((pr) => ({ id: pr.id, name: pr.name, category: pr.category, pricingAnnual: pr.pricingAnnual })),
    terms: terms ? { version: terms.version, content: terms.content, effectiveFrom: terms.effectiveFrom } : null
  });
});

function validateApplication(d) {
  const errors = {};
  const need = (k, v, msg) => { if (!v) errors[k] = msg || 'Required'; };

  need('fullName', d.fullName);
  need('email', d.email);
  if (d.email && !EMAIL_RE.test(d.email)) errors.email = 'Invalid email';
  if (!MOBILE_RE.test(d.mobile)) errors.mobile = 'Enter a valid 10-digit Indian mobile number';
  if (d.whatsapp && !MOBILE_RE.test(d.whatsapp)) errors.whatsapp = 'Invalid WhatsApp number';
  if (!PARTNER_TYPES[d.partnerType]) errors.partnerType = 'Select a partner type';
  need('addressLine1', d.addressLine1);
  need('city', d.city);
  need('state', d.state);
  if (!PINCODE_RE.test(d.pincode)) errors.pincode = 'Invalid PIN code';
  need('entityType', d.entityType);
  if (d.gstin && !GSTIN_RE.test(d.gstin)) errors.gstin = 'Invalid GSTIN';
  if (!PAN_RE.test(d.pan)) errors.pan = 'Invalid PAN (format: ABCDE1234F)';
  need('nameOnPan', d.nameOnPan);
  need('accountHolder', d.accountHolder);
  if (!ACCOUNT_RE.test(d.accountNumber)) errors.accountNumber = 'Account number must be 9–18 digits';
  if (d.accountNumber !== d.accountNumberConfirm) errors.accountNumberConfirm = 'Account numbers do not match';
  if (!IFSC_RE.test(d.ifsc)) errors.ifsc = 'Invalid IFSC (format: SBIN0001234)';
  need('bankName', d.bankName);
  if (!EXPECTED_CUSTOMER_RANGES.includes(d.expectedMonthlyCustomers)) errors.expectedMonthlyCustomers = 'Select a range';
  if (!d.password || d.password.length < 8 || !/[A-Za-z]/.test(d.password) || !/[0-9]/.test(d.password)) {
    errors.password = 'Password must be at least 8 characters with letters and numbers';
  }
  if (d.acceptTerms !== true) errors.acceptTerms = 'You must accept the partner terms';
  if (d.consentDataProcessing !== true) errors.consentDataProcessing = 'Consent is required to process your application';
  return errors;
}

async function removeUploaded(files) {
  await Promise.all(Object.values(files || {}).flat().map((f) => fs.unlink(path.join(PARTNER_DOCS_DIR, f.filename)).catch(() => {})));
}

router.post('/register', registerLimiter, partnerDocsUpload.fields(DOC_FIELDS), async (req, res) => {
  let raw;
  try {
    raw = JSON.parse(req.body?.data || '{}');
  } catch {
    await removeUploaded(req.files);
    return res.status(400).json({ error: 'Invalid form data' });
  }

  const d = {
    fullName: clean(raw.fullName, 120),
    email: clean(raw.email, 150).toLowerCase(),
    mobile: normMobile(raw.mobile),
    whatsapp: normMobile(raw.whatsapp),
    dateOfBirth: clean(raw.dateOfBirth, 10),
    partnerType: clean(raw.partnerType, 40),
    addressLine1: clean(raw.addressLine1, 200),
    addressLine2: clean(raw.addressLine2, 200),
    city: clean(raw.city, 80),
    district: clean(raw.district, 80),
    state: clean(raw.state, 80),
    pincode: clean(raw.pincode, 6),
    businessName: clean(raw.businessName, 150),
    entityType: clean(raw.entityType, 60),
    gstin: upper(raw.gstin, 15),
    website: clean(raw.website, 200),
    yearsInBusiness: clean(raw.yearsInBusiness, 10),
    qualification: clean(raw.qualification, 120),
    membershipNumber: clean(raw.membershipNumber, 60),
    experienceYears: clean(raw.experienceYears, 10),
    existingClientBase: clean(raw.existingClientBase, 20),
    teamSize: clean(raw.teamSize, 20),
    industriesServed: Array.isArray(raw.industriesServed) ? raw.industriesServed.slice(0, 15).map((x) => clean(x, 60)) : [],
    areasServed: clean(raw.areasServed, 300),
    softwareExperience: clean(raw.softwareExperience, 300),
    interestedProducts: Array.isArray(raw.interestedProducts) ? raw.interestedProducts.slice(0, 20).map((x) => clean(x, 40)) : [],
    expectedMonthlyCustomers: clean(raw.expectedMonthlyCustomers, 10),
    howDidYouHear: clean(raw.howDidYouHear, 120),
    pan: upper(raw.pan, 10),
    nameOnPan: clean(raw.nameOnPan, 120),
    accountHolder: clean(raw.accountHolder, 120),
    accountNumber: clean(raw.accountNumber, 20).replace(/\s/g, ''),
    accountNumberConfirm: clean(raw.accountNumberConfirm, 20).replace(/\s/g, ''),
    ifsc: upper(raw.ifsc, 11),
    bankName: clean(raw.bankName, 120),
    branch: clean(raw.branch, 120),
    accountType: ['savings', 'current'].includes(raw.accountType) ? raw.accountType : 'savings',
    password: typeof raw.password === 'string' ? raw.password : '',
    acceptTerms: raw.acceptTerms === true,
    consentDataProcessing: raw.consentDataProcessing === true,
    termsVersion: Number(raw.termsVersion) || 0
  };

  const errors = validateApplication(d);
  const files = req.files || {};
  if (!files.panCard) errors.panCard = 'PAN card copy is required';
  if (!files.cancelledCheque) errors.cancelledCheque = 'Cancelled cheque or bank passbook is required';
  if (!files.addressProof) errors.addressProof = 'Address proof is required';
  if (d.gstin && !files.gstCertificate) errors.gstCertificate = 'Upload GST certificate for the GSTIN provided';

  if (Object.keys(errors).length) {
    await removeUploaded(files);
    return res.status(400).json({ error: 'Please fix the highlighted fields', fields: errors });
  }

  try {
    const result = await withLock(async () => {
      await db.read();
      const terms = activeTerms();
      if (d.termsVersion !== terms.version) {
        return { status: 409, body: { error: 'The partner terms have been updated. Please review and accept the latest version.' } };
      }
      const panHash = blindIndex(d.pan);
      const dup = db.data.partners.find((p) => p.contact.email === d.email || p.contact.mobile === d.mobile || p.pan?.hash === panHash);
      if (dup && dup.status !== 'rejected') {
        return { status: 409, body: { error: 'An application with this email, mobile or PAN already exists. Log in to check its status.' } };
      }

      const now = new Date().toISOString();
      const prog = program();
      const partner = {
        id: nanoid(),
        partnerCode: newPartnerCode(),
        status: 'pending',
        partnerType: d.partnerType,
        tier: 'Associate',
        personal: { fullName: d.fullName, dateOfBirth: d.dateOfBirth },
        contact: { email: d.email, mobile: d.mobile, whatsapp: d.whatsapp || d.mobile },
        address: { line1: d.addressLine1, line2: d.addressLine2, city: d.city, district: d.district, state: d.state, pincode: d.pincode },
        business: { name: d.businessName, entityType: d.entityType, gstin: d.gstin, website: d.website, yearsInBusiness: d.yearsInBusiness },
        professional: {
          qualification: d.qualification,
          membershipNumber: d.membershipNumber,
          experienceYears: d.experienceYears,
          existingClientBase: d.existingClientBase,
          teamSize: d.teamSize,
          industriesServed: d.industriesServed,
          areasServed: d.areasServed,
          softwareExperience: d.softwareExperience,
          interestedProducts: d.interestedProducts,
          howDidYouHear: d.howDidYouHear
        },
        expectedMonthlyCustomers: d.expectedMonthlyCustomers,
        pan: { enc: encrypt(d.pan), hash: panHash, last4: d.pan.slice(-4), nameOnPan: d.nameOnPan },
        bank: {
          accountHolder: d.accountHolder,
          accountEnc: encrypt(d.accountNumber),
          accountLast4: d.accountNumber.slice(-4),
          ifsc: d.ifsc,
          bankName: d.bankName,
          branch: d.branch,
          accountType: d.accountType,
          verified: false
        },
        documents: filesToDocs(files),
        commission: { defaultPercent: prog.defaultCommissionPercent, renewalPercent: prog.defaultRenewalPercent },
        productAccess: [],
        termsAcceptance: [{ version: terms.version, acceptedAt: now, ip: req.ip, userAgent: clean(req.headers['user-agent'], 200) }],
        consentDataProcessingAt: now,
        passwordHash: hashPassword(d.password),
        tokenVersion: 0,
        adminNotes: '',
        statusHistory: [{ status: 'pending', at: now, by: 'applicant' }],
        createdAt: now,
        updatedAt: now
      };
      db.data.partners.push(partner);
      await db.write();
      return { status: 201, body: { id: partner.id, partnerCode: partner.partnerCode, status: partner.status } };
    });
    if (result.status !== 201) await removeUploaded(files);
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error(err);
    await removeUploaded(files);
    res.status(500).json({ error: 'Could not save your application. Please try again.' });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  const identifier = clean(req.body?.identifier, 150).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!identifier || !password) return res.status(400).json({ error: 'Email/mobile and password are required' });

  await db.read();
  const mobile = normMobile(identifier);
  const partner = db.data.partners.find((p) => p.contact.email === identifier || p.contact.mobile === mobile || p.partnerCode.toLowerCase() === identifier);
  if (!partner || !comparePassword(password, partner.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signToken({ role: 'partner', id: partner.id, tv: partner.tokenVersion || 0 });
  res.json({ token, partner: publicPartner(partner) });
});

export default router;

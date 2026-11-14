import { RE, str, up, mobile as normMobile, FieldErrors, pctOrNull } from '../utils/validators.js';
import { nanoid, customAlphabet } from 'nanoid';
import { db } from '../db/index.js';
import { getSetting } from './settings.js';
import { parseJSON, nowIso } from '../utils/http.js';
import { DEFAULT_PERMISSIONS } from '../db/defaults.js';

const codeGen = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

export async function newPartnerCode(q = db) {
  for (;;) {
    const code = `RP-${codeGen()}`;
    if (!(await q.get('SELECT id FROM partners WHERE code = ?', [code]))) return code;
  }
}

export const mask4 = (last4) => (last4 ? `••••••${last4}` : '');

// Never exposes ciphertext, hashes or password.
export function partnerView(p) {
  if (!p) return null;
  return {
    id: p.id, code: p.code, status: p.status, statusReason: p.status_reason, source: p.source,
    partnerType: p.partner_type, tier: p.tier,
    fullName: p.full_name, email: p.email, mobile: p.mobile, whatsapp: p.whatsapp, dateOfBirth: p.date_of_birth,
    businessName: p.business_name, entityType: p.entity_type, gstin: p.gstin, website: p.website,
    address: { line1: p.address_line1, line2: p.address_line2, city: p.city, district: p.district, state: p.state, pincode: p.pincode },
    profile: parseJSON(p.profile, {}),
    expectedMonthlyCustomers: p.expected_monthly_customers,
    pan: { masked: mask4(p.pan_last4), name: p.pan_name },
    bank: { holder: p.bank_holder, accountMasked: mask4(p.bank_last4), ifsc: p.bank_ifsc, bankName: p.bank_name, branch: p.bank_branch, accountType: p.bank_account_type, verified: !!p.bank_verified },
    defaultCommissionPct: p.default_commission_pct === null ? null : Number(p.default_commission_pct),
    defaultRenewalPct: p.default_renewal_pct === null ? null : Number(p.default_renewal_pct),
    permissions: { ...DEFAULT_PERMISSIONS, ...parseJSON(p.permissions, {}) },
    mustChangePassword: !!p.must_change_password,
    approvedAt: p.approved_at, lastLoginAt: p.last_login_at, createdAt: p.created_at, updatedAt: p.updated_at
  };
}

export async function documentTypes() {
  return getSetting('document_types');
}

// Required document types for a partner (GST certificate only when a GSTIN is given).
export async function requiredDocTypes(hasGstin) {
  return (await documentTypes()).filter((d) => d.required || (d.requiredIfGstin && hasGstin)).map((d) => d.key);
}

export async function documentSummary(partnerId, hasGstin, q = db) {
  const docs = await q.all('SELECT doc_type, status FROM partner_documents WHERE partner_id = ? ORDER BY uploaded_at DESC', [partnerId]);
  const latest = {};
  for (const d of docs) if (!latest[d.doc_type]) latest[d.doc_type] = d.status;
  const required = await requiredDocTypes(hasGstin);
  return {
    required: required.length,
    uploaded: required.filter((k) => latest[k]).length,
    verified: required.filter((k) => latest[k] === 'verified').length,
    rejected: Object.values(latest).filter((s) => s === 'rejected').length,
    pending: Object.values(latest).filter((s) => s === 'pending').length
  };
}

export async function insertDocuments(q, partnerId, files, uploadedBy) {
  const types = new Set((await documentTypes()).map((d) => d.key));
  const rows = [];
  for (const f of files) {
    if (!types.has(f.fieldname)) continue;
    const row = { id: nanoid(), partner_id: partnerId, doc_type: f.fieldname, stored_name: f.filename, original_name: f.originalname.slice(0, 160), mime: f.mimetype, size: f.size, status: 'pending', uploaded_by: uploadedBy, uploaded_at: nowIso() };
    await q.run(
      'INSERT INTO partner_documents (id, partner_id, doc_type, stored_name, original_name, mime, size, status, uploaded_by, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      Object.values(row)
    );
    rows.push(row);
  }
  return rows;
}

export async function recordTermsAcceptance(q, partnerId, version, ip) {
  if (!(await q.get('SELECT version FROM terms_acceptances WHERE partner_id = ? AND version = ?', [partnerId, version]))) {
    await q.run('INSERT INTO terms_acceptances (partner_id, version, ip, accepted_at) VALUES (?, ?, ?, ?)', [partnerId, version, ip || null, nowIso()]);
  }
}

// Shared by public registration and admin "add partner". Returns normalised fields and errors.

export async function readPartnerInput(raw, { requireBank = true, requirePassword = false } = {}) {
  const types = (await getSetting('partner_types')).map((t) => t.key);
  const d = {
    full_name: str(raw.fullName, 120), email: str(raw.email, 150).toLowerCase(), mobile: normMobile(raw.mobile), whatsapp: normMobile(raw.whatsapp),
    date_of_birth: str(raw.dateOfBirth, 10), partner_type: str(raw.partnerType, 40),
    business_name: str(raw.businessName, 150), entity_type: str(raw.entityType, 60), gstin: up(raw.gstin, 15), website: str(raw.website, 200),
    address_line1: str(raw.addressLine1, 200), address_line2: str(raw.addressLine2, 200), city: str(raw.city, 80), district: str(raw.district, 80),
    state: str(raw.state, 80), pincode: str(raw.pincode, 6),
    expected_monthly_customers: str(raw.expectedMonthlyCustomers, 10),
    profile: {
      qualification: str(raw.qualification, 120), membershipNumber: str(raw.membershipNumber, 60), experienceYears: str(raw.experienceYears, 10),
      existingClientBase: str(raw.existingClientBase, 20), teamSize: str(raw.teamSize, 20), areasServed: str(raw.areasServed, 300),
      industriesServed: Array.isArray(raw.industriesServed) ? raw.industriesServed.slice(0, 15).map((x) => str(x, 60)) : [],
      softwareExperience: str(raw.softwareExperience, 300), interestedProducts: Array.isArray(raw.interestedProducts) ? raw.interestedProducts.slice(0, 20).map((x) => str(x, 40)) : [],
      howDidYouHear: str(raw.howDidYouHear, 120)
    },
    pan: up(raw.pan, 10), pan_name: str(raw.nameOnPan, 120),
    bank_holder: str(raw.accountHolder, 120), account: str(raw.accountNumber, 20).replace(/\s/g, ''), accountConfirm: str(raw.accountNumberConfirm ?? raw.accountNumber, 20).replace(/\s/g, ''),
    bank_ifsc: up(raw.ifsc, 11), bank_name: str(raw.bankName, 120), bank_branch: str(raw.branch, 120),
    bank_account_type: ['savings', 'current'].includes(raw.accountType) ? raw.accountType : 'savings',
    password: typeof raw.password === 'string' ? raw.password : ''
  };
  const e = new FieldErrors();
  e.check(d.full_name, 'fullName', 'Required');
  e.check(RE.email.test(d.email), 'email', 'Enter a valid email');
  e.check(RE.mobile.test(d.mobile), 'mobile', 'Enter a valid 10-digit mobile number');
  e.check(!d.whatsapp || RE.mobile.test(d.whatsapp), 'whatsapp', 'Invalid number');
  e.check(types.includes(d.partner_type), 'partnerType', 'Select a partner type');
  e.check(d.city, 'city', 'Required');
  e.check(d.state, 'state', 'Required');
  e.check(!d.pincode || RE.pincode.test(d.pincode), 'pincode', 'Invalid PIN code');
  e.check(!d.gstin || RE.gstin.test(d.gstin), 'gstin', 'Invalid GSTIN');
  e.check(!d.pan || RE.pan.test(d.pan), 'pan', 'Invalid PAN (ABCDE1234F)');
  if (requireBank) {
    e.check(d.address_line1, 'addressLine1', 'Required');
    e.check(RE.pincode.test(d.pincode), 'pincode', 'Invalid PIN code');
    e.check(d.entity_type, 'entityType', 'Required');
    e.check(RE.pan.test(d.pan), 'pan', 'Invalid PAN (ABCDE1234F)');
    e.check(d.pan_name, 'nameOnPan', 'Required');
    e.check(d.bank_holder, 'accountHolder', 'Required');
    e.check(RE.account.test(d.account), 'accountNumber', 'Account number must be 9–18 digits');
    e.check(d.account === d.accountConfirm, 'accountNumberConfirm', 'Account numbers do not match');
    e.check(RE.ifsc.test(d.bank_ifsc), 'ifsc', 'Invalid IFSC (SBIN0001234)');
    e.check(d.bank_name, 'bankName', 'Required');
    e.check(d.expected_monthly_customers, 'expectedMonthlyCustomers', 'Select a range');
  } else {
    if (d.account || d.bank_ifsc) {
      e.check(RE.account.test(d.account), 'accountNumber', 'Account number must be 9–18 digits');
      e.check(RE.ifsc.test(d.bank_ifsc), 'ifsc', 'Invalid IFSC');
    }
  }
  if (requirePassword) e.check(d.password.length >= 8 && /[A-Za-z]/.test(d.password) && /[0-9]/.test(d.password), 'password', 'At least 8 characters with letters and numbers');
  if (raw.defaultCommissionPct !== undefined) d.default_commission_pct = pctOrNull(raw.defaultCommissionPct, 'Commission');
  if (raw.defaultRenewalPct !== undefined) d.default_renewal_pct = pctOrNull(raw.defaultRenewalPct, 'Renewal commission');
  return { d, errors: e };
}

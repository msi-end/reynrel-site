export const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const MOBILE_RE = /^[6-9][0-9]{9}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PINCODE_RE = /^[1-9][0-9]{5}$/;
export const ACCOUNT_RE = /^[0-9]{9,18}$/;

export const clean = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : v === undefined || v === null ? '' : String(v).trim().slice(0, max));
export const upper = (v, max = 30) => clean(v, max).toUpperCase().replace(/\s+/g, '');
export const normMobile = (v) => clean(v, 20).replace(/[^0-9]/g, '').replace(/^(91|0)(?=[6-9][0-9]{9}$)/, '');
export const toMoney = (n) => Math.round(Number(n || 0) * 100) / 100;

export const PARTNER_TYPES = {
  gst_consultant: 'GST Consultant / Tax Practitioner',
  chartered_accountant: 'Chartered Accountant (CA)',
  accountant: 'Accountant / Bookkeeper',
  it_consultant: 'IT Consultant / System Integrator',
  technology_partner: 'Technology Partner',
  hardware_dealer: 'POS / Computer Hardware Dealer',
  reseller: 'Software Reseller',
  other: 'Other Professional'
};

export const EXPECTED_CUSTOMER_RANGES = ['1-2', '3-5', '6-10', '11-25', '25+'];

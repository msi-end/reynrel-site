export const RE = {
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  gstin: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
  mobile: /^[6-9][0-9]{9}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  pincode: /^[1-9][0-9]{5}$/,
  account: /^[0-9]{9,18}$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
};

export const str = (v, max = 200) => (v === undefined || v === null ? '' : String(v).trim().slice(0, max));
export const up = (v, max = 30) => str(v, max).toUpperCase().replace(/\s+/g, '');
export const mobile = (v) => str(v, 20).replace(/[^0-9]/g, '').replace(/^(91|0)(?=[6-9][0-9]{9}$)/, '');
export const money = (v) => Math.round(Number(v || 0) * 100) / 100;
export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
export const slugify = (v) => str(v, 120).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Percentage or null (blank = inherit). Throws on out-of-range.
export function pctOrNull(v, field = 'Percentage') {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 100) {
    const e = new Error(`${field} must be between 0 and 100`);
    e.status = 400;
    throw e;
  }
  return Math.round(n * 100) / 100;
}

export function moneyOrNull(v, field = 'Amount') {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) {
    const e = new Error(`${field} must be a positive number`);
    e.status = 400;
    throw e;
  }
  return money(n);
}

// Collect field errors and throw one 400 with all of them.
export class FieldErrors {
  constructor() { this.fields = {}; }
  add(k, msg) { if (!this.fields[k]) this.fields[k] = msg; return this; }
  check(cond, k, msg) { if (!cond) this.add(k, msg); return this; }
  throwIfAny(message = 'Please fix the highlighted fields') {
    if (Object.keys(this.fields).length) {
      const e = new Error(message);
      e.status = 400;
      e.fields = this.fields;
      throw e;
    }
  }
}

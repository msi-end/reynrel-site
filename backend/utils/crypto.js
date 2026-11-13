import crypto from 'crypto';

// Field-level encryption for sensitive partner data (PAN, bank account numbers).
// AES-256-GCM with a random 12-byte IV per value. Stored as "v1:<iv>:<tag>:<ciphertext>" (base64).
// Set PARTNER_DATA_KEY to 64 hex chars (32 bytes). Generate one with:
//   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
// IMPORTANT: back this key up. Losing it makes stored PAN / bank numbers unreadable.

let cachedKey = null;
let cachedHmacKey = null;

function getKey() {
  if (cachedKey) return cachedKey;
  const hex = process.env.PARTNER_DATA_KEY;
  if (hex && /^[0-9a-fA-F]{64}$/.test(hex)) {
    cachedKey = Buffer.from(hex, 'hex');
  } else {
    if (!process.env.JWT_SECRET) {
      throw new Error('PARTNER_DATA_KEY (or at least JWT_SECRET) must be set to store partner data');
    }
    // eslint-disable-next-line no-console
    console.warn('[security] PARTNER_DATA_KEY is not set; deriving the encryption key from JWT_SECRET. Set a dedicated key in production.');
    cachedKey = crypto.scryptSync(process.env.JWT_SECRET, 'reynrel-partner-data-v1', 32);
  }
  cachedHmacKey = crypto.createHash('sha256').update(Buffer.concat([cachedKey, Buffer.from('hmac')])).digest();
  return cachedKey;
}

export function encrypt(plain) {
  if (plain === undefined || plain === null || plain === '') return '';
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
}

export function decrypt(payload) {
  if (!payload) return '';
  const [v, ivB64, tagB64, dataB64] = String(payload).split(':');
  if (v !== 'v1') throw new Error('Unknown encryption format');
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]).toString('utf8');
}

// Deterministic keyed hash, used only for duplicate detection (e.g. same PAN registering twice).
export function blindIndex(value) {
  getKey();
  return crypto.createHmac('sha256', cachedHmacKey).update(String(value).trim().toUpperCase()).digest('hex');
}

export function mask(value, visible = 4) {
  if (!value) return '';
  const s = String(value);
  if (s.length <= visible) return s;
  return `${'•'.repeat(Math.max(4, s.length - visible))}${s.slice(-visible)}`;
}

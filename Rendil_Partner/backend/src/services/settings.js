import { db } from '../db/index.js';
import { parseJSON } from '../utils/http.js';
import { DEFAULT_PROGRAM, DEFAULT_PARTNER_TYPES, DEFAULT_DOCUMENT_TYPES } from '../db/defaults.js';

const FALLBACK = { program: DEFAULT_PROGRAM, partner_types: DEFAULT_PARTNER_TYPES, document_types: DEFAULT_DOCUMENT_TYPES };
const cache = new Map();

export async function getSetting(k) {
  if (cache.has(k)) return cache.get(k);
  const row = await db.get('SELECT v FROM settings WHERE k = ?', [k]);
  const base = FALLBACK[k];
  let v = parseJSON(row?.v, base);
  if (base && !Array.isArray(base) && typeof base === 'object') v = { ...base, ...v };
  cache.set(k, v);
  return v;
}

export async function setSetting(k, v, q = db) {
  const exists = await q.get('SELECT k FROM settings WHERE k = ?', [k]);
  if (exists) await q.run('UPDATE settings SET v = ? WHERE k = ?', [JSON.stringify(v), k]);
  else await q.run('INSERT INTO settings (k, v) VALUES (?, ?)', [k, JSON.stringify(v)]);
  cache.delete(k);
}

export const getProgram = () => getSetting('program');

export async function latestTerms() {
  return db.get('SELECT version, content, created_at FROM terms ORDER BY version DESC LIMIT 1');
}

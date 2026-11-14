import { nanoid } from 'nanoid';
import { db } from '../db/index.js';
import { nowIso } from '../utils/http.js';

export async function audit(actor, action, target = {}, meta = null, q = db) {
  await q.run('INSERT INTO audit_log (id, actor, action, target_type, target_id, meta, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    nanoid(), actor, action, target.type || null, target.id || null, meta ? JSON.stringify(meta) : null, nowIso()
  ]);
}

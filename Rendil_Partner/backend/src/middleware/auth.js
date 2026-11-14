import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { db } from '../db/index.js';
import { parseJSON } from '../utils/http.js';
import { DEFAULT_PERMISSIONS } from '../db/defaults.js';

const ROLE_RANK = { viewer: 1, manager: 2, owner: 3 };

export const signToken = (payload, expiresIn = '12h') => jwt.sign(payload, config.jwtSecret, { expiresIn });

function bearer(req) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

function verify(req, role) {
  const token = bearer(req);
  if (!token) return { error: [401, 'Please log in'] };
  try {
    const p = jwt.verify(token, config.jwtSecret);
    if (p.role !== role) return { error: [403, 'Wrong account type'] };
    return { payload: p };
  } catch {
    return { error: [401, 'Session expired, please log in again'] };
  }
}

// requireAdmin('manager') -> manager or owner. GET requests need only viewer.
export function requireAdmin(minRole = 'viewer') {
  return async (req, res, next) => {
    try {
      const { payload, error } = verify(req, 'admin');
      if (error) return res.status(error[0]).json({ error: error[1] });
      const admin = await db.get('SELECT id, name, email, role, active, token_version FROM admins WHERE id = ?', [payload.id]);
      if (!admin || !admin.active || admin.token_version !== payload.tv) return res.status(401).json({ error: 'Session expired, please log in again' });
      const needed = req.method === 'GET' ? minRole : ROLE_RANK[minRole] > ROLE_RANK.manager ? minRole : 'manager';
      if ((ROLE_RANK[admin.role] || 0) < ROLE_RANK[needed]) return res.status(403).json({ error: 'Your admin role does not allow this action' });
      req.admin = admin;
      req.actor = `admin:${admin.email}`;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requirePartner({ allowInactive = false } = {}) {
  return async (req, res, next) => {
    try {
      const { payload, error } = verify(req, 'partner');
      if (error) return res.status(error[0]).json({ error: error[1] });
      const partner = await db.get('SELECT * FROM partners WHERE id = ?', [payload.id]);
      if (!partner || partner.token_version !== payload.tv) return res.status(401).json({ error: 'Session expired, please log in again' });
      if (!allowInactive && partner.status !== 'approved') return res.status(403).json({ error: `Your partner account is ${partner.status}`, status: partner.status });
      partner.permissions = { ...DEFAULT_PERMISSIONS, ...parseJSON(partner.permissions, {}) };
      req.partner = partner;
      req.actor = `partner:${partner.code}`;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requirePermission(key) {
  return (req, res, next) => (req.partner?.permissions?.[key] ? next() : res.status(403).json({ error: 'This action is not enabled for your account. Contact Reynrel.' }));
}

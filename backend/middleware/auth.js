import { verifyToken } from '../utils/jwt.js';
import { db } from '../db/lowdb.js';

function extractToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

export function requireAdmin(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = verifyToken(token);
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireClient(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = verifyToken(token);
    if (payload.role !== 'client') return res.status(403).json({ error: 'Client access required' });
    req.client = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Partner auth. `allowUnapproved` lets pending/rejected partners read their own status.
export function requirePartner({ allowUnapproved = false } = {}) {
  return async (req, res, next) => {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: 'Missing token' });
    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    if (payload.role !== 'partner') return res.status(403).json({ error: 'Partner access required' });
    await db.read();
    const partner = db.data.partners.find((p) => p.id === payload.id);
    if (!partner) return res.status(401).json({ error: 'Account not found' });
    if ((partner.tokenVersion || 0) !== (payload.tv || 0)) return res.status(401).json({ error: 'Session expired, please log in again' });
    if (!allowUnapproved && partner.status !== 'approved') {
      return res.status(403).json({ error: `Your partner account is ${partner.status}.`, status: partner.status });
    }
    req.partner = partner;
    next();
  };
}

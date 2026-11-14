import { verifyToken } from '../utils/jwt.js';

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

import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../db/lowdb.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';

const router = Router();

router.post('/signup', async (req, res) => {
  const { name, email, mobile, password } = req.body || {};
  if (!name || !email || !mobile || !password) {
    return res.status(400).json({ error: 'name, email, mobile and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'password must be at least 6 characters' });
  }

  await db.read();
  const exists = db.data.clients.some((c) => c.email === email || c.mobile === mobile);
  if (exists) return res.status(409).json({ error: 'An account with this email or mobile already exists' });

  const client = {
    id: nanoid(),
    name,
    email,
    mobile,
    passwordHash: hashPassword(password),
    customFields: [],
    createdAt: new Date().toISOString()
  };
  db.data.clients.push(client);
  await db.write();

  const token = signToken({ role: 'client', id: client.id, name: client.name });
  res.status(201).json({
    token,
    client: { id: client.id, name: client.name, email: client.email, mobile: client.mobile }
  });
});

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body || {};
  if (!identifier || !password) {
    return res.status(400).json({ error: 'identifier and password are required' });
  }

  await db.read();
  const client = db.data.clients.find((c) => c.email === identifier || c.mobile === identifier);
  if (!client || !comparePassword(password, client.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken({ role: 'client', id: client.id, name: client.name });
  res.json({
    token,
    client: { id: client.id, name: client.name, email: client.email, mobile: client.mobile }
  });
});

export default router;

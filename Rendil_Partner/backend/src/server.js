import express from 'express';
import cors from 'cors';
import compression from 'compression';
import fs from 'fs';
import path from 'path';
import { config, ROOT } from './config.js';
import { migrate } from './db/migrate.js';
import authRoutes from './routes/auth.routes.js';
import publicRoutes from './routes/public.routes.js';
import partnerRoutes from './routes/partner/index.js';
import adminPartners from './routes/admin/partners.js';
import adminProducts from './routes/admin/products.js';
import adminOrders from './routes/admin/orders.js';
import adminWithdrawals from './routes/admin/withdrawals.js';
import adminSystem from './routes/admin/system.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', /^\d+$/.test(config.trustProxy) ? Number(config.trustProxy) : config.trustProxy);
app.use(compression());
if (config.corsOrigin) app.use(cors({ origin: config.corsOrigin.split(',').map((s) => s.trim()) }));
app.use(express.json({ limit: '300kb' }));
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin', 'X-Frame-Options': 'DENY' });
  next();
});

app.get('/api/health', (req, res) => res.json({ ok: true, db: config.db.client }));
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/admin/partners', adminPartners);
app.use('/api/admin/products', adminProducts);
app.use('/api/admin/withdrawals', adminWithdrawals);
app.use('/api/admin', adminOrders);
app.use('/api/admin', adminSystem);
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Public product screenshots
app.use('/uploads', express.static(path.join(ROOT, 'public', 'uploads'), { maxAge: '30d', index: false }));

// Built React app (single deployment). Hashed assets cached long; index.html never cached.
if (fs.existsSync(config.paths.frontendDist)) {
  app.use(express.static(config.paths.frontendDist, { index: false, maxAge: '1y', immutable: true }));
  app.get('*', (req, res) => res.set('Cache-Control', 'no-cache').sendFile(path.join(config.paths.frontendDist, 'index.html')));
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err?.name === 'MulterError') return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message });
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
  if (err?.code === 'ER_DUP_ENTRY' || /UNIQUE constraint failed/.test(err?.message || '')) return res.status(409).json({ error: 'This record already exists' });
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Something went wrong' : err.message, ...(err.fields ? { fields: err.fields } : {}) });
});

migrate()
  .then(() => app.listen(config.port, () => console.log(`Rendil Partner API on :${config.port} (${config.db.client})`)))
  .catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
  });

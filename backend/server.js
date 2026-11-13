import 'dotenv/config';
import express from 'express';
import Layer from 'express/lib/router/layer.js';

// Express 4 does not forward rejected promises from async handlers to the
// error middleware; patch Layer so they reach it instead of hanging the request.
const origHandle = Layer.prototype.handle_request;
Layer.prototype.handle_request = function patched(req, res, next) {
  if (this.handle.length > 3) return origHandle.call(this, req, res, next);
  try {
    const ret = this.handle(req, res, next);
    if (ret && typeof ret.catch === 'function') ret.catch(next);
  } catch (err) {
    next(err);
  }
};
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db/lowdb.js';

import adminAuthRoutes from './routes/adminAuth.routes.js';
import productsRoutes from './routes/products.routes.js';
import servicesRoutes from './routes/services.routes.js';
import androidAppsRoutes from './routes/androidApps.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import clientsRoutes from './routes/clients.routes.js';
import renewalsRoutes from './routes/renewals.routes.js';
import clientAuthRoutes from './routes/clientAuth.routes.js';
import clientRoutes from './routes/client.routes.js';
import leadsRoutes from './routes/leads.routes.js';
import partnerPublicRoutes from './routes/partnerPublic.routes.js';
import partnerRoutes from './routes/partner.routes.js';
import partnersAdminRoutes from './routes/partnersAdmin.routes.js';
import partnerOpsAdminRoutes from './routes/partnerOpsAdmin.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection (server stays up):', err);
});

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(compression());
app.use(cors({ origin: corsOrigin === '*' ? true : corsOrigin.split(',') }));
app.set('trust proxy', process.env.TRUST_PROXY || 'loopback');
app.use(express.json({ limit: '200kb' }));
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    maxAge: '1y',
    immutable: true,
  })
);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin/clients', clientsRoutes);
app.use('/api/admin/renewals', renewalsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/android-apps', androidAppsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/client', clientAuthRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/partners', partnerPublicRoutes);
app.use('/api/partner', partnerRoutes);
// Mount the cross-partner ops router before the "/:id" partner router.
app.use('/api/admin/partner-ops', partnerOpsAdminRoutes);
app.use('/api/admin/partners', partnersAdminRoutes);

const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err?.name === 'MulterError' || /only PDF, JPG/.test(err?.message || '')) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Each document must be 5 MB or smaller' : err.message;
    return res.status(400).json({ error: msg });
  }
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Reynrel backend listening on http://localhost:${PORT}`);
  });
});

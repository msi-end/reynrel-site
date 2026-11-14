import 'dotenv/config';
import express from 'express';
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection (server stays up):', err);
});

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(compression());
app.use(cors({ origin: corsOrigin === '*' ? true : corsOrigin.split(',') }));
app.use(express.json());
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

const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Reynrel backend listening on http://localhost:${PORT}`);
  });
});

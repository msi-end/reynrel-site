import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { initDb, db, productSlug } from './db/lowdb.js';

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
// Real client IPs behind nginx on the same machine (used by the lead form rate limit).
app.set('trust proxy', process.env.TRUST_PROXY || 'loopback');

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
const SITE_URL = (process.env.SITE_URL || 'https://reynrel.in').replace(/\/$/, '');

// ---- SEO: product pages live at /products/<slug> (no trailing slash) ----
// Old standalone intro URLs -> new canonical product URLs (301, permanent).
const LEGACY_PRODUCT_PAGES = {
  'inventory-manager': 'inventory-management'
};
const productPageFile = (slug) => path.join(frontendDist, 'products', slug, 'index.html');
const isSlug = (s) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);

app.get(/^\/product-intro\/([^/]+)\/?(?:index\.html)?$/, (req, res, next) => {
  const slug = LEGACY_PRODUCT_PAGES[req.params[0]] || req.params[0];
  if (!isSlug(slug)) return next();
  res.redirect(301, `/products/${slug}`);
});

// Screenshots for a migrated page may still sit in the old folder on the server.
for (const [oldSlug, newSlug] of Object.entries(LEGACY_PRODUCT_PAGES)) {
  app.use(`/products/${newSlug}/images`, express.static(path.join(frontendDist, 'products', newSlug, 'images')));
  app.use(`/products/${newSlug}/images`, express.static(path.join(frontendDist, 'product-intro', oldSlug, 'images')));
}

// Custom HTML product page if one exists, otherwise fall through to the React app.
app.get(/^\/products\/([a-z0-9-]+)(\/|\/index\.html)?$/, (req, res, next) => {
  const slug = req.params[0];
  if (!isSlug(slug) || !fs.existsSync(productPageFile(slug))) {
    if (req.params[1]) return res.redirect(301, `/products/${slug}`);
    return next();
  }
  if (req.params[1]) return res.redirect(301, `/products/${slug}`);
  res.sendFile(productPageFile(slug));
});

// Sitemap generated from the live product list so new products are indexed automatically.
const STATIC_SITEMAP = [
  ['/', '1.0'], ['/services', '0.9'], ['/products', '0.9'], ['/android-apps', '0.7'], ['/roi-calculator', '0.6'],
  ['/why-choose-us', '0.7'], ['/client-success', '0.7'], ['/about', '0.6'], ['/contact-us', '0.8'],
  ['/privacy-policy', '0.3'], ['/terms-of-service', '0.3'], ['/cookie-policy', '0.3']
];
app.get('/sitemap.xml', async (req, res, next) => {
  try {
    await db.read();
    const slugs = new Set((db.data.products || []).map((p) => productSlug(p)).filter(isSlug));
    // Every standalone product page on disk is indexed too, even before it is linked to a product.
    const pagesDir = path.join(frontendDist, 'products');
    if (fs.existsSync(pagesDir)) {
      for (const d of fs.readdirSync(pagesDir)) if (isSlug(d) && fs.existsSync(productPageFile(d))) slugs.add(d);
    }
    const urls = [
      ...STATIC_SITEMAP.map(([loc, priority]) => ({ loc, priority })),
      ...[...slugs].map((s) => ({ loc: `/products/${s}`, priority: '0.9' }))
    ];
    res.type('application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
        .map((u) => `  <url><loc>${SITE_URL}${u.loc}</loc><priority>${u.priority}</priority></url>`)
        .join('\n')}\n</urlset>\n`
    );
  } catch (err) {
    next(err);
  }
});

app.use(express.static(frontendDist, { redirect: false }));
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

import { nanoid } from 'nanoid';
import { pathToFileURL } from 'url';
import { connect } from './index.js';
import { renderDDL } from './schema.js';
import { config } from '../config.js';
import { hashPassword } from '../utils/password.js';
import { DEFAULT_PROGRAM, DEFAULT_PARTNER_TYPES, DEFAULT_DOCUMENT_TYPES, DEFAULT_TERMS, SEED_PRODUCTS } from './defaults.js';

const now = () => new Date().toISOString();

// Future schema changes: append { version, up: async (db) => {...} }. Each runs once, in order.
const MIGRATIONS = [
  { version: 1, up: async (db) => db.exec(renderDDL(db.dialect)) },
  // v2: simple onboarding. Documents become optional; PAN and bank are collected after approval.
  {
    version: 2,
    up: async (db) => {
      const row = await db.get("SELECT v FROM settings WHERE k = 'document_types'");
      if (!row) return;
      const types = JSON.parse(row.v).map((t) => ({ ...t, required: false, requiredIfGstin: false }));
      await db.run("UPDATE settings SET v = ? WHERE k = 'document_types'", [JSON.stringify(types)]);
    }
  }
];

async function seed(db) {
  const setIfMissing = async (k, v) => {
    if (!(await db.get('SELECT k FROM settings WHERE k = ?', [k]))) await db.run('INSERT INTO settings (k, v) VALUES (?, ?)', [k, JSON.stringify(v)]);
  };
  await setIfMissing('program', DEFAULT_PROGRAM);
  await setIfMissing('partner_types', DEFAULT_PARTNER_TYPES);
  await setIfMissing('document_types', DEFAULT_DOCUMENT_TYPES);

  if (!(await db.get('SELECT version FROM terms LIMIT 1'))) {
    await db.run('INSERT INTO terms (version, content, created_by, created_at) VALUES (1, ?, ?, ?)', [DEFAULT_TERMS, 'system', now()]);
  }

  if (!(await db.get('SELECT id FROM admins LIMIT 1'))) {
    await db.run('INSERT INTO admins (id, name, email, password_hash, role, active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)', [
      nanoid(), config.admin.name, config.admin.email, hashPassword(config.admin.password), 'owner', now()
    ]);
    console.log(`[setup] Created owner admin ${config.admin.email}. Change the password after first login.`);
  }

  if (!(await db.get('SELECT id FROM products LIMIT 1'))) {
    let order = 0;
    for (const p of SEED_PRODUCTS) {
      const id = nanoid();
      await db.run(
        `INSERT INTO products (id, slug, name, category, tagline, description, icon, website_url, status, default_commission_pct, renewal_commission_pct, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, p.slug, p.name, p.category, p.tagline, p.description, p.icon, p.website_url, p.status, p.default_commission_pct, p.renewal_commission_pct, order++, now(), now()]
      );
      for (const [i, pl] of p.plans.entries()) {
        await db.run(
          'INSERT INTO product_plans (id, product_id, name, billing_cycle, price, renewal_price, description, inclusions, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)',
          [nanoid(), id, pl.name, pl.billing_cycle, pl.price, pl.renewal_price, pl.description, JSON.stringify(pl.inclusions), i]
        );
      }
      for (const [i, s] of p.services.entries()) {
        await db.run('INSERT INTO product_services (id, product_id, name, description, price, active, sort_order) VALUES (?, ?, ?, ?, ?, 1, ?)', [nanoid(), id, s.name, s.description, s.price, i]);
      }
      for (const [i, [group, title, desc]] of p.features.entries()) {
        await db.run('INSERT INTO product_features (id, product_id, group_name, title, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)', [nanoid(), id, group, title, desc, i]);
      }
    }
  }
}

export async function migrate() {
  const db = await connect();
  await db.exec('CREATE TABLE IF NOT EXISTS settings (k VARCHAR(64) NOT NULL, v TEXT, PRIMARY KEY (k))');
  const row = await db.get("SELECT v FROM settings WHERE k = 'schema_version'");
  let current = row ? Number(JSON.parse(row.v)) : 0;
  for (const m of MIGRATIONS) {
    if (m.version <= current) continue;
    await m.up(db);
    current = m.version;
    if (!(await db.get("SELECT k FROM settings WHERE k = 'schema_version'"))) await db.run("INSERT INTO settings (k, v) VALUES ('schema_version', ?)", [JSON.stringify(current)]);
    else await db.run("UPDATE settings SET v = ? WHERE k = 'schema_version'", [JSON.stringify(current)]);
    console.log(`[migrate] schema v${current} (${db.dialect})`);
  }
  await seed(db);
  return db;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  migrate().then((db) => db.close()).then(() => console.log('[migrate] done'), (e) => { console.error(e); process.exit(1); });
}

import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const env = process.env;
const isProd = env.NODE_ENV === 'production';

function required(name, devFallback) {
  if (env[name]) return env[name];
  if (!isProd && devFallback) return devFallback;
  throw new Error(`Missing required environment variable ${name} (see .env.example)`);
}

export const config = {
  isProd,
  port: Number(env.PORT || 5100),
  corsOrigin: env.CORS_ORIGIN || '',
  trustProxy: env.TRUST_PROXY || 'loopback',
  db: {
    client: (env.DB_CLIENT || 'sqlite').toLowerCase(),
    mysql: {
      host: env.MYSQL_HOST || '127.0.0.1',
      port: Number(env.MYSQL_PORT || 3306),
      user: env.MYSQL_USER || 'root',
      password: env.MYSQL_PASSWORD || '',
      database: env.MYSQL_DATABASE || 'rendil_partner'
    },
    sqliteFile: path.resolve(ROOT, env.SQLITE_FILE || 'storage/data/rendil_partner.db')
  },
  jwtSecret: required('JWT_SECRET', 'dev-only-insecure-secret'),
  dataKeyHex: required('DATA_ENCRYPTION_KEY', '0'.repeat(64)),
  admin: {
    email: (env.ADMIN_EMAIL || 'admin@reynrel.in').toLowerCase(),
    password: env.ADMIN_PASSWORD || 'admin12345',
    name: env.ADMIN_NAME || 'Rendil Admin'
  },
  paths: {
    documents: path.join(ROOT, 'storage', 'documents'),
    productUploads: path.join(ROOT, 'public', 'uploads', 'products'),
    frontendDist: path.resolve(ROOT, '..', 'frontend', 'dist')
  }
};

if (!/^[0-9a-fA-F]{64}$/.test(config.dataKeyHex)) {
  throw new Error('DATA_ENCRYPTION_KEY must be 64 hex characters');
}

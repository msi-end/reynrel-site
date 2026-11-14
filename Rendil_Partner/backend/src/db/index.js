// Database adapter with one async API over MySQL (mysql2 pool) or SQLite (node:sqlite, single file).
//   db.all(sql, params)  -> rows
//   db.get(sql, params)  -> first row or null
//   db.run(sql, params)  -> { changes }
//   db.tx(async (t) => …) -> runs in a transaction; `t` has the same methods
//   db.forUpdate          -> " FOR UPDATE" on MySQL, "" on SQLite (row locks inside tx)
// Write portable SQL: "?" placeholders, no dialect-specific functions.
import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const norm = (params = []) => params.map((v) => (v === undefined ? null : typeof v === 'boolean' ? (v ? 1 : 0) : v));

function createMutex() {
  let tail = Promise.resolve();
  return (fn) => {
    const run = tail.then(fn, fn);
    tail = run.then(() => undefined, () => undefined);
    return run;
  };
}

async function createMysql() {
  const mysql = (await import('mysql2/promise')).default;
  const pool = mysql.createPool({
    ...config.db.mysql,
    connectionLimit: 10,
    decimalNumbers: true,
    dateStrings: true,
    charset: 'utf8mb4',
    namedPlaceholders: false
  });
  const wrap = (conn) => ({
    all: async (sql, params) => (await conn.query(sql, norm(params)))[0],
    get: async (sql, params) => (await conn.query(sql, norm(params)))[0][0] || null,
    run: async (sql, params) => ({ changes: (await conn.query(sql, norm(params)))[0].affectedRows })
  });
  const base = wrap(pool);
  return {
    dialect: 'mysql',
    forUpdate: ' FOR UPDATE',
    ...base,
    exec: async (sql) => {
      for (const stmt of sql.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean)) await pool.query(stmt);
    },
    async tx(fn) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const out = await fn(wrap(conn));
        await conn.commit();
        return out;
      } catch (err) {
        await conn.rollback().catch(() => {});
        throw err;
      } finally {
        conn.release();
      }
    },
    close: () => pool.end()
  };
}

async function createSqlite() {
  const { DatabaseSync } = await import('node:sqlite');
  fs.mkdirSync(path.dirname(config.db.sqliteFile), { recursive: true });
  const raw = new DatabaseSync(config.db.sqliteFile);
  raw.exec('PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  const cache = new Map();
  const stmt = (sql) => {
    let s = cache.get(sql);
    if (!s) {
      s = raw.prepare(sql);
      cache.set(sql, s);
    }
    return s;
  };
  const direct = {
    all: async (sql, params) => stmt(sql).all(...norm(params)).map((r) => ({ ...r })),
    get: async (sql, params) => {
      const r = stmt(sql).get(...norm(params));
      return r ? { ...r } : null;
    },
    run: async (sql, params) => ({ changes: Number(stmt(sql).run(...norm(params)).changes) })
  };
  // One connection: every call waits while a transaction is open so nothing leaks into it.
  const lock = createMutex();
  return {
    dialect: 'sqlite',
    forUpdate: '',
    all: (sql, p) => lock(() => direct.all(sql, p)),
    get: (sql, p) => lock(() => direct.get(sql, p)),
    run: (sql, p) => lock(() => direct.run(sql, p)),
    exec: (sql) => lock(async () => raw.exec(sql)),
    tx: (fn) =>
      lock(async () => {
        raw.exec('BEGIN IMMEDIATE');
        try {
          const out = await fn(direct);
          raw.exec('COMMIT');
          return out;
        } catch (err) {
          raw.exec('ROLLBACK');
          throw err;
        }
      }),
    close: async () => raw.close()
  };
}

export let db = null;

export async function connect() {
  if (db) return db;
  if (config.db.client === 'mysql') db = await createMysql();
  else if (config.db.client === 'sqlite') db = await createSqlite();
  else throw new Error(`Unknown DB_CLIENT "${config.db.client}" (use mysql or sqlite)`);
  return db;
}

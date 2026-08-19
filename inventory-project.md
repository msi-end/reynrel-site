# POS & Inventory Management System

An **offline-first desktop POS & Inventory Management System** for Indian retail
(kirana, FMCG, pharmacy, general stores). Sold as a single-client desktop install
with an annual license, but the backend is deployment-agnostic — the same API can
run against a local MySQL or a remote/cloud MySQL server.

## Tech stack

| Layer     | Tech                                                        |
|-----------|------------------------------------------------------------|
| Frontend  | React (Vite), TailwindCSS, React Query, Lucide Icons       |
| Desktop   | Electron (spawns the Node backend, silent thermal printing)|
| Backend   | Node.js, Express (REST), `mysql2` connection pool          |
| Database  | MySQL 8 (InnoDB, utf8mb4)                                   |
| Printing  | ESC/POS + HTML-to-printer (2-inch & 3-inch thermal)        |

## Monorepo layout

```
inventory-manager/
├─ package.json            # npm workspaces (backend, frontend, electron)
├─ backend/                # Express API + MySQL (schema, migrations, license)
├─ frontend/               # React POS UI (Vite)
└─ electron/               # Desktop shell: boots backend, printing, auto-start
```

Each workspace has its own README. Start with [`backend/README.md`](backend/README.md).

## Core modules

- **License & Activation** — hardware fingerprint (`node-machine-id`), AES-256
  encrypted keys binding machine + expiry, grace-period + renewal screen,
  anti-tamper clock-rollback detection.
- **POS / Fast Billing** — keyboard-driven (F1 search, F2 pay, F10 print, ESC
  clear), barcode auto-add, Cash/UPI(QR)/Card/Udhar, hold-cart, GST invoicing.
- **Inventory & Batch/Expiry** — product CRUD (SKU, barcode, HSN, MRP, tax),
  batch + expiry tracking, damaged/expired/returned adjustments with reasons.
- **Vendors & Purchases** — purchase entry auto-updates stock, vendor ledger.
- **Customers / Udhar (Khatabook)** — credit limit, balance, repayments,
  WhatsApp reminder links.
- **Reports & Analytics** — daily sales & net-profit dashboard, GSTR-1/3B
  exports, low-stock & expiry alerts.
- **Backup** — one-click `mysqldump` `.sql` export + restore.

## Quick start (dev — two ports)

```bash
npm install                    # installs all workspaces
cp backend/.env.example backend/.env   # set DB creds + secrets
npm run migrate                # create DB + schema
npm run seed                   # admin/admin123 + GST slabs
npm run dev                    # backend (:4600) + Vite (:5173) with API proxy
```

## Run on a single port (build + serve)

Build the React app to static files and let Express serve **both the UI and the
API on one port** (default `4600`):

```bash
npm install
cp backend/.env.example backend/.env   # set DB creds + secrets
npm run migrate && npm run seed
npm run serve                  # = build the frontend, then start the backend
# open http://localhost:4600
```

`npm run serve` runs `npm run build` (frontend → `frontend/dist`, absolute `/`
asset base) then `npm start` (backend serves `frontend/dist` + `/api` on
`$PORT`). To change the port: `PORT=8080 npm start`. Rebuild the UI (`npm run
build`) after frontend changes; the backend picks up the new `dist` on restart.
Electron packaging uses a **relative** asset base instead — see
[`electron/README.md`](electron/README.md).

## Data model

The complete DDL lives in [`backend/src/db/schema.sql`](backend/src/db/schema.sql):
system/license/auth, catalog + batches, inventory ledger, vendors + purchases,
customers + udhar ledger, and GST sales/billing with split-tender payments and
held carts — all InnoDB with foreign keys and reporting indexes.

## Build status

**All three layers are implemented.**

- **Backend** ✅ — schema, infrastructure (config, pool, migrations, error
  handling), the full license subsystem, auth, and every business module:
  Products, Sales/POS with the GST engine, Inventory (batches/expiry/
  adjustments), Vendors, Purchases, Customers/Udhar, Reports (dashboard,
  GSTR-1/3B, alerts with CSV export), Backup, and Settings.
- **Frontend** ✅ — app shell, license activation/renewal gate, login, the
  keyboard-driven POS, and management screens for Products, Inventory,
  Customers/Udhar, Purchases/Vendors, and Reports. Verified production build.
- **Electron** ✅ — desktop shell that auto-starts the backend, waits for
  health, loads the UI, and provides silent thermal printing; packaged via
  electron-builder for Windows/macOS/Linux.

See each workspace README for module status and run/build steps.

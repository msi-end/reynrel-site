# Rendil Partner Platform

A separate application for Reynrel's partner programme. It has its own backend, database and React frontend,
and is independent of the main website in the repository root. Nothing in the main site imports from here.

```
Rendil_Partner/
├─ backend/    Node.js + Express API (MySQL, or a single-file SQLite DB as fallback)
└─ frontend/   React (Vite) — Admin Panel at /admin, Partner Portal at /
```

## What it does

**Admin Panel (`/admin`)**
- Dashboard of things needing review, sales, commission, payouts, top partners and recent activity.
- Partners: review applications or add partners manually (a temporary password is generated). From here you can:
  - approve, reject, suspend or reactivate them;
  - edit their profile;
  - reset their password.
- KYC & documents: view uploads, mark each as verified or rejected (with the reason shown to the partner), upload on their behalf, reveal PAN and account number (every view is logged), and approve bank-account changes.
- Products & commission per partner: assign products, switch selling on/off, set per-product commission and renewal overrides, set partner-wide defaults, and give demo logins.
- Negotiated pricing per partner: a special price for any plan or service, with an optional expiry. The price can't go below the plan's minimum partner price.
- Permissions per partner: add customers, request installations, request withdrawals, see list prices, see demo logins.
- Product catalogue, all fully dynamic: products, plans (list, renewal and minimum partner price, inclusions), add-on services (with their own commission %), grouped features, screenshots (upload or URL), and draft/active/archived status.
- Customer orders: approve after payment and commission is credited automatically, line by line. You can also reject orders, record renewals (renewal commission is credited), process refunds/reversals, and edit subscriptions and licence keys.
- Installations: schedule, assign an engineer, and add notes and status updates visible to the partner.
- Payouts: approve, reject, or mark paid with a UTR; there is also a bank bulk-transfer CSV of approved payouts.
- Settings: programme defaults, minimum withdrawal (₹5,000), TDS %, partner types, required document types, versioned terms, admin users (owner/manager/viewer roles) and the audit log.

**Partner Portal (`/`)**
- Multi-step registration with PAN, bank and document uploads. Pending partners see their status and can fix rejected documents.
- Dashboard, Software & pricing (their own prices, special prices, what they earn, features, screenshots, demo logins), Customers (add a customer with order and installation request, add more products, edit), Installations, Commission ledger (CSV export), Withdrawals (₹5,000 minimum, TDS preview), Documents, Profile (bank change goes to admin verification) and password.

### Commission rules
The most specific rate wins:

> service's own rate → partner × product override → partner-wide override → product default → programme default

Commission is calculated on the amount actually charged (negotiated price, or the amount the admin confirms at approval), excluding GST. Rate changes apply to orders approved afterwards; past ledger entries are never recalculated.

## Running locally

Requires Node 22.5+.

```bash
cd Rendil_Partner/backend && cp .env.example .env   # edit values
npm install
npm run dev            # API on :5100 (creates tables + first admin on first start)
```

```bash
cd Rendil_Partner/frontend
npm install
npm run dev            # http://localhost:5180 (proxies /api to :5100)
```

For a quick start without MySQL, set `DB_CLIENT=sqlite` in `.env`. Data then lives in `backend/storage/data/rendil_partner.db`.

## Production

1. Create the MySQL database and user:
   ```sql
   CREATE DATABASE rendil_partner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'rendil_partner'@'localhost' IDENTIFIED BY '<strong password>';
   GRANT ALL ON rendil_partner.* TO 'rendil_partner'@'localhost';
   ```
2. Fill in `backend/.env`. **`JWT_SECRET` and `DATA_ENCRYPTION_KEY` are required when `NODE_ENV=production`.**
   Back up `DATA_ENCRYPTION_KEY`: without it, stored PAN and bank numbers cannot be decrypted.
3. Build the frontend: `cd frontend && npm ci && npm run build`. The backend serves `frontend/dist` itself.
4. Start the backend: `cd backend && npm ci --omit=dev && npm start` (use pm2/systemd). Tables are created on first start.
5. Serve it on its own subdomain, e.g. `partners.reynrel.in`, with nginx proxying to `127.0.0.1:5100`. Set `TRUST_PROXY=1`.
   Use `client_max_body_size 40m;` for document uploads.
6. Back up the MySQL database, `backend/storage/documents/` (private KYC files, never web-served) and `backend/public/uploads/`.
7. Log in at `/admin` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`, then change the password under Settings → My account.

## Notes
- The starter catalogue has **Inventory Management Software** (from the existing product page) and a **Billing OS** draft.
  Fill in Billing OS (plans, services, features, screenshots) in Admin → Products and set it Active.
- The default TDS of 2% (Section 194H) and the default terms are placeholders. Confirm them with your CA and lawyer.
- Adding a database change: append a step to `MIGRATIONS` in `backend/src/db/migrate.js`. It runs once on next start.

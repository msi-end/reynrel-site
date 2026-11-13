# Billing OS page & Reynrel Partner Program

## What's included

| Area | Where |
|---|---|
| Billing OS product page (static HTML) | `frontend/public/product-intro/billing-os/` — old `inventory-manager/` URL redirects here |
| Partner Program landing | `/partners` (`frontend/src/pages/partners/index.jsx`) |
| Partner registration (5-step, with document upload) | `/partners/register` |
| Partner login | `/partners/login` (email, mobile or partner ID) |
| Partner Dashboard | `/partner` — Dashboard, Customers, Software Access, Commission, Withdrawals, Profile |
| Admin | `/admin/partners`, `/admin/partners/:id`, `/admin/partner-customers`, `/admin/partner-withdrawals`, `/admin/partner-program` |
| Backend | `backend/routes/partner*.js`, `backend/services/partners.js`, `backend/utils/{crypto,lock,rateLimit,validators}.js` |

## Deploy checklist

1. **Set `PARTNER_DATA_KEY`** in `backend/.env` (64 hex chars) **before the first partner registers**:
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   Back this key up separately from `db.json`. Without it, stored PAN / account numbers cannot be decrypted.
   If unset, a key is derived from `JWT_SECRET` (works, but changing `JWT_SECRET` would then break decryption).
2. Set `TRUST_PROXY=1` if Node runs behind nginx, so login/registration rate limits see real client IPs.
3. Back up `backend/private/partner-docs/` together with `backend/db.json`. That folder is **not** web-served.
4. Upload mobile screenshots to `frontend/public/product-intro/billing-os/images/` (see the README there).
   Until then the page shows drawn placeholders for the phone views. Desktop screenshots are read from
   the existing `product-intro/inventory-manager/images/` folder on the server.
5. In Admin → Products, set the product's intro page to **Billing OS (custom page)** (optional — the old URL redirects anyway).
6. Have a lawyer and your CA review the default partner terms (Admin → Partner Program) and the TDS rate.

## Business rules (as implemented)

- Partner applies → admin reviews docs → **Approve** (marks bank verified, grants product access) / Reject / Suspend.
- Partner registers a customer (only for products assigned to them) and can request installation in the same step.
  Duplicate customers (same mobile/GSTIN + product) are blocked across partners.
- Admin **approves the customer after payment** → commission = sale value (excl. GST) × partner's rate for that product,
  credited instantly to the ledger. Admin can override the sale value or rate at approval.
- Renewals recorded by admin credit the renewal rate. Refund/cancel → full reversal entry.
- Withdrawals: only when available balance ≥ ₹5,000 (configurable), one open request at a time, verified bank only.
  TDS (default 2%, Sec. 194H — confirm current rate) is deducted. Flow: requested → approved → paid (UTR recorded).
  Admin can download a bank-transfer CSV of approved payouts.
- Bank-account changes by partners require password + cancelled cheque and admin verification before use.

## Security

- PAN & account numbers: AES-256-GCM field encryption; masked everywhere except an explicit admin "Reveal", which is audit-logged.
- Duplicate PAN detection uses a keyed HMAC, not the plain PAN.
- Documents: random filenames, PDF/JPG/PNG/WEBP only, 5 MB cap, private folder, admin-only streaming endpoint (audit-logged).
- Partner sessions are invalidated on password change, suspension or rejection.
- Rate limits on registration and login; all balance-changing writes are serialised to prevent double withdrawals.

## Commission model — research basis

- ~1.5 crore active GST taxpayers (GSTN, mid-2025) — each must issue GST-compliant invoices.
- Public Indian billing-software partner programs advertise roughly 20–55% on first sales (e.g. BillClap up to 40%,
  BUSY up to 55% incl. incentives) plus renewal commission; most are free to join with no targets.
- Defaults chosen: Associate 20% / 10% renewal, Silver 25% / 12%, Gold 30% / 15%. All are editable per partner and per product.
- The public page shows an estimator that only multiplies the visitor's own inputs, with a clear no-guarantee notice.

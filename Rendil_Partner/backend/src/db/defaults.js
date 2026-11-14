// Default settings. All of these are editable in Admin > Settings; nothing here is hardcoded at runtime.
export const DEFAULT_PROGRAM = {
  companyName: 'Reynrel Infotech',
  supportPhone: '+91 98647 73099',
  supportEmail: 'info.reynrel@gmail.com',
  mainSiteUrl: 'https://reynrel.in',
  registrationOpen: true,
  minWithdrawal: 5000,
  tdsPercent: 2,
  defaultCommissionPct: 20,
  defaultRenewalPct: 10
};

export const DEFAULT_PARTNER_TYPES = [
  { key: 'gst_consultant', label: 'GST Consultant / Tax Practitioner' },
  { key: 'chartered_accountant', label: 'Chartered Accountant' },
  { key: 'accountant', label: 'Accountant / Bookkeeper' },
  { key: 'it_consultant', label: 'IT Consultant / System Integrator' },
  { key: 'technology_partner', label: 'Technology Partner' },
  { key: 'hardware_dealer', label: 'POS / Computer Hardware Dealer' },
  { key: 'reseller', label: 'Software Reseller' },
  { key: 'other', label: 'Other Professional' }
];

export const DEFAULT_DOCUMENT_TYPES = [
  { key: 'pan_card', label: 'PAN card', required: true },
  { key: 'bank_proof', label: 'Cancelled cheque / bank passbook', required: true },
  { key: 'address_proof', label: 'Address proof (Aadhaar with first 8 digits masked, utility bill, rent agreement)', required: true },
  { key: 'gst_certificate', label: 'GST registration certificate', required: false, requiredIfGstin: true },
  { key: 'qualification', label: 'Professional / qualification certificate', required: false },
  { key: 'photo', label: 'Passport-size photo', required: false },
  { key: 'agreement', label: 'Signed partner agreement', required: false }
];

export const DEFAULT_PERMISSIONS = {
  addCustomers: true,
  requestInstallations: true,
  requestWithdrawals: true,
  viewPricing: true,
  viewDemoAccess: true
};

export const DEFAULT_TERMS = `RENDIL PARTNER PROGRAM — TERMS & CONDITIONS

1. Relationship. You join as an independent, non-exclusive partner of Reynrel Infotech ("Reynrel"). Nothing here creates employment, agency, franchise or joint venture. You may not bind Reynrel to any contract.

2. Verification. Reynrel verifies your details, PAN, bank account and documents before approval, and may approve, reject, suspend or terminate any partner account, including for incorrect information.

3. Customers. A sale is credited to you only if you register the customer in the Partner Portal before purchase and Reynrel approves it. Customers already in Reynrel's records, self-purchases and customers obtained through misleading claims are not eligible.

4. Pricing. You will quote the prices shown in your Partner Portal, including any special prices agreed with you. You will not offer unauthorised discounts.

5. Commission. Commission is calculated on the amount actually received by Reynrel, excluding GST, at the rates shown in your Partner Portal for each product and service. Rates may change prospectively; changes are shown in the portal.

6. Refunds. If a sale is refunded, cancelled or charged back, the related commission is reversed.

7. Withdrawals. You may request a withdrawal once your available commission reaches the minimum shown in the portal. Payouts are made only to your verified bank account. TDS and other deductions required by Indian law are applied and certificates issued as required.

8. Taxes. You are responsible for your own income tax and, where applicable, GST registration and invoicing.

9. No guarantees. Reynrel does not guarantee any number of customers, sales or income.

10. Conduct and data. Describe products accurately, use Reynrel trademarks only as permitted, keep customer and pricing information confidential, and share customer details only with their consent.

11. Termination. Either party may end the partnership with 30 days' email notice. Approved commission earned up to termination is payable unless termination is for fraud or breach.

12. Changes. Reynrel may update these terms; each version you accept is recorded.

13. Governing law. Laws of India; courts at Guwahati, Assam.`;

// Starter catalogue. Edit, extend or delete in Admin > Products.
export const SEED_PRODUCTS = [
  {
    slug: 'inventory-management',
    name: 'Inventory Management Software',
    category: 'Retail & Inventory',
    icon: 'Package',
    status: 'active',
    tagline: 'Offline-first POS & inventory for kirana, FMCG and pharmacy stores',
    description:
      'Desktop POS and inventory system for Indian retail. Fast GST billing, batch and expiry tracking, purchases, vendor ledger and customer udhar (khatabook). Works offline with a local or cloud MySQL database.',
    website_url: 'https://reynrel.in/products/inventory-management',
    default_commission_pct: 20,
    renewal_commission_pct: 10,
    plans: [
      { name: 'Standard', billing_cycle: 'yearly', price: 4999, renewal_price: 4999, description: '1 store license, all modules', inclusions: ['1 store license', 'All modules', 'Thermal printing (2"/3")', 'GSTR-1/3B exports', 'Email support', 'Free updates for 1 year'] },
      { name: 'Business', billing_cycle: 'yearly', price: 12999, renewal_price: 12999, description: 'Multiple billing counters', inclusions: ['Everything in Standard', 'Multiple billing counters', 'Priority phone support', 'Data migration assistance', 'Staff training session', 'Dedicated account manager'] }
    ],
    services: [{ name: 'Remote installation & setup', description: 'Installed remotely by Reynrel support', price: 0 }],
    features: [
      ['Billing', 'POS / Fast Billing', 'Keyboard-driven billing (F1 search, F2 pay, F10 print), barcode auto-add, hold cart, Cash / UPI / Card / Udhar'],
      ['Billing', 'GST invoicing', 'GST invoices with HSN and tax slabs; thermal and A4 printing'],
      ['Inventory', 'Inventory & batch/expiry', 'SKU, barcode, HSN, MRP; batch and expiry tracking; damaged/expired/returned adjustments'],
      ['Inventory', 'Vendors & purchases', 'Purchase entry updates stock and vendor ledger'],
      ['Accounts', 'Customers / Udhar (Khatabook)', 'Credit limits, balances, repayments and WhatsApp reminder links'],
      ['Reports', 'Reports & analytics', 'Daily sales and net profit, GSTR-1/3B exports, low-stock and expiry alerts'],
      ['System', 'Backup & restore', 'One-click database backup and restore'],
      ['System', 'License & activation', 'Machine-bound encrypted license with renewal screen']
    ]
  },
  {
    slug: 'billing-os',
    name: 'Billing OS',
    category: 'Billing & GST',
    icon: 'Receipt',
    status: 'draft',
    tagline: 'Add the Billing OS tagline',
    description: 'Draft — add the Billing OS description, plans, services, features and screenshots in Admin > Products. Drafts are hidden from partners.',
    website_url: 'https://reynrel.in/products/billing-os',
    default_commission_pct: 20,
    renewal_commission_pct: 10,
    plans: [],
    services: [],
    features: []
  }
];

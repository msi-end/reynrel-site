// Portable schema definition, rendered to MySQL or SQLite DDL.
// Money: DECIMAL(12,2). Percentages: DECIMAL(5,2). Timestamps: ISO-8601 strings (sortable).
const ID = 'VARCHAR(24)';
const TS = 'VARCHAR(30)';
const MONEY = 'DECIMAL(12,2)';
const PCT = 'DECIMAL(5,2)';

export const TABLES = [
  {
    name: 'settings',
    columns: [['k', 'VARCHAR(64) NOT NULL'], ['v', 'TEXT']],
    primary: ['k']
  },
  {
    name: 'admins',
    columns: [
      ['id', `${ID} NOT NULL`], ['name', 'VARCHAR(120) NOT NULL'], ['email', 'VARCHAR(150) NOT NULL'],
      ['password_hash', 'VARCHAR(100) NOT NULL'], ['role', "VARCHAR(20) NOT NULL DEFAULT 'manager'"],
      ['active', 'TINYINT NOT NULL DEFAULT 1'], ['token_version', 'INT NOT NULL DEFAULT 0'],
      ['last_login_at', TS], ['created_at', `${TS} NOT NULL`]
    ],
    primary: ['id'],
    unique: [['email']]
  },
  {
    name: 'products',
    columns: [
      ['id', `${ID} NOT NULL`], ['slug', 'VARCHAR(80) NOT NULL'], ['name', 'VARCHAR(120) NOT NULL'],
      ['category', 'VARCHAR(80)'], ['tagline', 'VARCHAR(255)'], ['description', 'TEXT'], ['icon', 'VARCHAR(40)'],
      ['website_url', 'VARCHAR(255)'], ['status', "VARCHAR(20) NOT NULL DEFAULT 'draft'"],
      ['default_commission_pct', `${PCT} NOT NULL DEFAULT 0`], ['renewal_commission_pct', `${PCT} NOT NULL DEFAULT 0`],
      ['sort_order', 'INT NOT NULL DEFAULT 0'], ['created_at', `${TS} NOT NULL`], ['updated_at', `${TS} NOT NULL`]
    ],
    primary: ['id'],
    unique: [['slug']]
  },
  {
    name: 'product_plans',
    columns: [
      ['id', `${ID} NOT NULL`], ['product_id', `${ID} NOT NULL`], ['name', 'VARCHAR(120) NOT NULL'],
      ['billing_cycle', "VARCHAR(20) NOT NULL DEFAULT 'yearly'"], ['price', `${MONEY} NOT NULL DEFAULT 0`],
      ['renewal_price', MONEY], ['min_partner_price', MONEY], ['description', 'VARCHAR(500)'], ['inclusions', 'TEXT'],
      ['active', 'TINYINT NOT NULL DEFAULT 1'], ['sort_order', 'INT NOT NULL DEFAULT 0']
    ],
    primary: ['id'],
    indexes: [['product_id']],
    foreign: [['product_id', 'products', 'id', 'CASCADE']]
  },
  {
    name: 'product_services',
    columns: [
      ['id', `${ID} NOT NULL`], ['product_id', `${ID} NOT NULL`], ['name', 'VARCHAR(120) NOT NULL'],
      ['description', 'VARCHAR(500)'], ['price', `${MONEY} NOT NULL DEFAULT 0`], ['commission_pct', PCT],
      ['active', 'TINYINT NOT NULL DEFAULT 1'], ['sort_order', 'INT NOT NULL DEFAULT 0']
    ],
    primary: ['id'],
    indexes: [['product_id']],
    foreign: [['product_id', 'products', 'id', 'CASCADE']]
  },
  {
    name: 'product_features',
    columns: [
      ['id', `${ID} NOT NULL`], ['product_id', `${ID} NOT NULL`], ['group_name', 'VARCHAR(80)'],
      ['title', 'VARCHAR(150) NOT NULL'], ['description', 'VARCHAR(500)'], ['sort_order', 'INT NOT NULL DEFAULT 0']
    ],
    primary: ['id'],
    indexes: [['product_id']],
    foreign: [['product_id', 'products', 'id', 'CASCADE']]
  },
  {
    name: 'product_media',
    columns: [
      ['id', `${ID} NOT NULL`], ['product_id', `${ID} NOT NULL`], ['url', 'VARCHAR(300) NOT NULL'],
      ['caption', 'VARCHAR(200)'], ['device', "VARCHAR(10) NOT NULL DEFAULT 'desktop'"], ['sort_order', 'INT NOT NULL DEFAULT 0']
    ],
    primary: ['id'],
    indexes: [['product_id']],
    foreign: [['product_id', 'products', 'id', 'CASCADE']]
  },
  {
    name: 'partners',
    columns: [
      ['id', `${ID} NOT NULL`], ['code', 'VARCHAR(16) NOT NULL'], ['status', "VARCHAR(20) NOT NULL DEFAULT 'pending'"],
      ['status_reason', 'VARCHAR(500)'], ['source', "VARCHAR(10) NOT NULL DEFAULT 'self'"],
      ['partner_type', 'VARCHAR(40) NOT NULL'], ['tier', 'VARCHAR(40)'],
      ['full_name', 'VARCHAR(120) NOT NULL'], ['email', 'VARCHAR(150) NOT NULL'], ['mobile', 'VARCHAR(10) NOT NULL'],
      ['whatsapp', 'VARCHAR(10)'], ['date_of_birth', 'VARCHAR(10)'],
      ['business_name', 'VARCHAR(150)'], ['entity_type', 'VARCHAR(60)'], ['gstin', 'VARCHAR(15)'], ['website', 'VARCHAR(200)'],
      ['address_line1', 'VARCHAR(200)'], ['address_line2', 'VARCHAR(200)'], ['city', 'VARCHAR(80)'], ['district', 'VARCHAR(80)'],
      ['state', 'VARCHAR(80)'], ['pincode', 'VARCHAR(6)'],
      ['profile', 'TEXT'], ['expected_monthly_customers', 'VARCHAR(10)'],
      ['pan_enc', 'VARCHAR(200)'], ['pan_hash', 'VARCHAR(64)'], ['pan_last4', 'VARCHAR(4)'], ['pan_name', 'VARCHAR(120)'],
      ['bank_holder', 'VARCHAR(120)'], ['bank_account_enc', 'VARCHAR(200)'], ['bank_last4', 'VARCHAR(4)'],
      ['bank_ifsc', 'VARCHAR(11)'], ['bank_name', 'VARCHAR(120)'], ['bank_branch', 'VARCHAR(120)'],
      ['bank_account_type', 'VARCHAR(10)'], ['bank_verified', 'TINYINT NOT NULL DEFAULT 0'],
      ['default_commission_pct', PCT], ['default_renewal_pct', PCT], ['permissions', 'TEXT'],
      ['password_hash', 'VARCHAR(100) NOT NULL'], ['must_change_password', 'TINYINT NOT NULL DEFAULT 0'],
      ['token_version', 'INT NOT NULL DEFAULT 0'], ['admin_notes', 'TEXT'],
      ['approved_at', TS], ['approved_by', 'VARCHAR(150)'], ['last_login_at', TS],
      ['created_at', `${TS} NOT NULL`], ['updated_at', `${TS} NOT NULL`]
    ],
    primary: ['id'],
    unique: [['code'], ['email'], ['mobile']],
    indexes: [['status'], ['pan_hash']]
  },
  {
    name: 'partner_products',
    columns: [
      ['partner_id', `${ID} NOT NULL`], ['product_id', `${ID} NOT NULL`], ['enabled', 'TINYINT NOT NULL DEFAULT 1'],
      ['commission_pct', PCT], ['renewal_pct', PCT], ['demo_url', 'VARCHAR(300)'], ['demo_username', 'VARCHAR(100)'],
      ['demo_password', 'VARCHAR(100)'], ['updated_at', `${TS} NOT NULL`]
    ],
    primary: ['partner_id', 'product_id'],
    indexes: [['product_id']],
    foreign: [['partner_id', 'partners', 'id', 'CASCADE'], ['product_id', 'products', 'id', 'CASCADE']]
  },
  {
    name: 'partner_prices',
    columns: [
      ['id', `${ID} NOT NULL`], ['partner_id', `${ID} NOT NULL`], ['product_id', `${ID} NOT NULL`],
      ['plan_id', ID], ['service_id', ID], ['price', `${MONEY} NOT NULL`], ['valid_until', 'VARCHAR(10)'],
      ['note', 'VARCHAR(300)'], ['created_by', 'VARCHAR(150)'], ['created_at', `${TS} NOT NULL`]
    ],
    primary: ['id'],
    indexes: [['partner_id', 'product_id']],
    foreign: [['partner_id', 'partners', 'id', 'CASCADE'], ['product_id', 'products', 'id', 'CASCADE']]
  },
  {
    name: 'partner_documents',
    columns: [
      ['id', `${ID} NOT NULL`], ['partner_id', `${ID} NOT NULL`], ['doc_type', 'VARCHAR(40) NOT NULL'],
      ['stored_name', 'VARCHAR(80) NOT NULL'], ['original_name', 'VARCHAR(160)'], ['mime', 'VARCHAR(60)'], ['size', 'INT'],
      ['status', "VARCHAR(20) NOT NULL DEFAULT 'pending'"], ['remarks', 'VARCHAR(500)'],
      ['uploaded_by', 'VARCHAR(150)'], ['verified_by', 'VARCHAR(150)'], ['verified_at', TS], ['uploaded_at', `${TS} NOT NULL`]
    ],
    primary: ['id'],
    indexes: [['partner_id'], ['status']],
    foreign: [['partner_id', 'partners', 'id', 'CASCADE']]
  },
  {
    name: 'partner_bank_requests',
    columns: [
      ['id', `${ID} NOT NULL`], ['partner_id', `${ID} NOT NULL`], ['holder', 'VARCHAR(120) NOT NULL'],
      ['account_enc', 'VARCHAR(200) NOT NULL'], ['last4', 'VARCHAR(4) NOT NULL'], ['ifsc', 'VARCHAR(11) NOT NULL'],
      ['bank_name', 'VARCHAR(120)'], ['branch', 'VARCHAR(120)'], ['account_type', 'VARCHAR(10)'], ['document_id', ID],
      ['status', "VARCHAR(20) NOT NULL DEFAULT 'pending'"], ['reviewed_by', 'VARCHAR(150)'], ['reviewed_at', TS],
      ['created_at', `${TS} NOT NULL`]
    ],
    primary: ['id'],
    indexes: [['partner_id'], ['status']],
    foreign: [['partner_id', 'partners', 'id', 'CASCADE']]
  },
  {
    name: 'customers',
    columns: [
      ['id', `${ID} NOT NULL`], ['partner_id', `${ID} NOT NULL`], ['business_name', 'VARCHAR(150) NOT NULL'],
      ['contact_name', 'VARCHAR(120) NOT NULL'], ['mobile', 'VARCHAR(10) NOT NULL'], ['email', 'VARCHAR(150)'],
      ['gstin', 'VARCHAR(15)'], ['business_type', 'VARCHAR(80)'], ['address', 'VARCHAR(250)'], ['city', 'VARCHAR(80)'],
      ['state', 'VARCHAR(80)'], ['pincode', 'VARCHAR(6)'], ['notes', 'VARCHAR(1000)'],
      ['created_at', `${TS} NOT NULL`], ['updated_at', `${TS} NOT NULL`]
    ],
    primary: ['id'],
    indexes: [['partner_id'], ['mobile'], ['gstin']],
    foreign: [['partner_id', 'partners', 'id', 'RESTRICT']]
  },
  {
    name: 'orders',
    columns: [
      ['id', `${ID} NOT NULL`], ['reference', 'VARCHAR(20) NOT NULL'], ['customer_id', `${ID} NOT NULL`],
      ['partner_id', `${ID} NOT NULL`], ['product_id', `${ID} NOT NULL`], ['plan_id', ID], ['plan_name', 'VARCHAR(120)'],
      ['services', 'TEXT'], ['counters', 'INT NOT NULL DEFAULT 1'],
      ['list_amount', `${MONEY} NOT NULL DEFAULT 0`], ['sale_amount', `${MONEY} NOT NULL DEFAULT 0`],
      ['status', "VARCHAR(20) NOT NULL DEFAULT 'submitted'"], ['review_note', 'VARCHAR(500)'],
      ['reviewed_by', 'VARCHAR(150)'], ['reviewed_at', TS], ['license_key', 'VARCHAR(200)'],
      ['start_date', 'VARCHAR(10)'], ['end_date', 'VARCHAR(10)'], ['subscription_status', 'VARCHAR(20)'],
      ['created_at', `${TS} NOT NULL`], ['updated_at', `${TS} NOT NULL`]
    ],
    primary: ['id'],
    unique: [['reference']],
    indexes: [['partner_id'], ['customer_id'], ['product_id'], ['status']],
    foreign: [['customer_id', 'customers', 'id', 'RESTRICT'], ['product_id', 'products', 'id', 'RESTRICT']]
  },
  {
    name: 'installations',
    columns: [
      ['id', `${ID} NOT NULL`], ['order_id', `${ID} NOT NULL`], ['customer_id', `${ID} NOT NULL`], ['partner_id', `${ID} NOT NULL`],
      ['status', "VARCHAR(20) NOT NULL DEFAULT 'requested'"], ['mode', "VARCHAR(10) NOT NULL DEFAULT 'remote'"],
      ['preferred_date', 'VARCHAR(10)'], ['scheduled_for', 'VARCHAR(20)'], ['engineer', 'VARCHAR(100)'],
      ['partner_notes', 'VARCHAR(500)'], ['admin_notes', 'VARCHAR(500)'], ['completed_at', TS],
      ['created_at', `${TS} NOT NULL`], ['updated_at', `${TS} NOT NULL`]
    ],
    primary: ['id'],
    indexes: [['order_id'], ['partner_id'], ['status']],
    foreign: [['order_id', 'orders', 'id', 'CASCADE']]
  },
  {
    name: 'installation_events',
    columns: [
      ['id', `${ID} NOT NULL`], ['installation_id', `${ID} NOT NULL`], ['status', 'VARCHAR(20) NOT NULL'],
      ['note', 'VARCHAR(500)'], ['actor', 'VARCHAR(150)'], ['created_at', `${TS} NOT NULL`]
    ],
    primary: ['id'],
    indexes: [['installation_id']],
    foreign: [['installation_id', 'installations', 'id', 'CASCADE']]
  },
  {
    name: 'commissions',
    columns: [
      ['id', `${ID} NOT NULL`], ['partner_id', `${ID} NOT NULL`], ['order_id', ID], ['customer_id', ID], ['product_id', ID],
      ['type', 'VARCHAR(20) NOT NULL'], ['base_amount', `${MONEY} NOT NULL DEFAULT 0`], ['pct', `${PCT} NOT NULL DEFAULT 0`],
      ['amount', `${MONEY} NOT NULL`], ['description', 'VARCHAR(300)'], ['created_by', 'VARCHAR(150)'], ['created_at', `${TS} NOT NULL`]
    ],
    primary: ['id'],
    indexes: [['partner_id', 'created_at'], ['order_id']],
    foreign: [['partner_id', 'partners', 'id', 'RESTRICT']]
  },
  {
    name: 'withdrawals',
    columns: [
      ['id', `${ID} NOT NULL`], ['reference', 'VARCHAR(20) NOT NULL'], ['partner_id', `${ID} NOT NULL`],
      ['amount', `${MONEY} NOT NULL`], ['tds_pct', `${PCT} NOT NULL DEFAULT 0`], ['tds_amount', `${MONEY} NOT NULL DEFAULT 0`],
      ['net_amount', `${MONEY} NOT NULL`], ['status', "VARCHAR(20) NOT NULL DEFAULT 'requested'"],
      ['partner_note', 'VARCHAR(300)'], ['review_note', 'VARCHAR(300)'],
      ['bank_holder', 'VARCHAR(120)'], ['bank_last4', 'VARCHAR(4)'], ['bank_ifsc', 'VARCHAR(11)'], ['bank_name', 'VARCHAR(120)'],
      ['utr', 'VARCHAR(40)'], ['pay_mode', 'VARCHAR(10)'], ['paid_on', 'VARCHAR(10)'],
      ['requested_at', `${TS} NOT NULL`], ['reviewed_at', TS], ['reviewed_by', 'VARCHAR(150)']
    ],
    primary: ['id'],
    unique: [['reference']],
    indexes: [['partner_id'], ['status']],
    foreign: [['partner_id', 'partners', 'id', 'RESTRICT']]
  },
  {
    name: 'terms',
    columns: [['version', 'INT NOT NULL'], ['content', 'TEXT NOT NULL'], ['created_by', 'VARCHAR(150)'], ['created_at', `${TS} NOT NULL`]],
    primary: ['version']
  },
  {
    name: 'terms_acceptances',
    columns: [['partner_id', `${ID} NOT NULL`], ['version', 'INT NOT NULL'], ['ip', 'VARCHAR(64)'], ['accepted_at', `${TS} NOT NULL`]],
    primary: ['partner_id', 'version'],
    foreign: [['partner_id', 'partners', 'id', 'CASCADE']]
  },
  {
    name: 'audit_log',
    columns: [
      ['id', `${ID} NOT NULL`], ['actor', 'VARCHAR(150) NOT NULL'], ['action', 'VARCHAR(60) NOT NULL'],
      ['target_type', 'VARCHAR(30)'], ['target_id', ID], ['meta', 'TEXT'], ['created_at', `${TS} NOT NULL`]
    ],
    primary: ['id'],
    indexes: [['created_at'], ['target_id']]
  }
];

export function renderDDL(dialect) {
  const out = [];
  for (const t of TABLES) {
    const lines = t.columns.map(([n, type]) => `  ${n} ${type}`);
    lines.push(`  PRIMARY KEY (${t.primary.join(', ')})`);
    for (const u of t.unique || []) lines.push(`  ${dialect === 'mysql' ? `UNIQUE KEY uq_${t.name}_${u.join('_')}` : 'UNIQUE'} (${u.join(', ')})`);
    if (dialect === 'mysql') for (const i of t.indexes || []) lines.push(`  KEY ix_${t.name}_${i.join('_')} (${i.join(', ')})`);
    for (const [col, ref, refCol, onDel] of t.foreign || []) {
      lines.push(`  ${dialect === 'mysql' ? `CONSTRAINT fk_${t.name}_${col} ` : ''}FOREIGN KEY (${col}) REFERENCES ${ref}(${refCol}) ON DELETE ${onDel}`);
    }
    const tail = dialect === 'mysql' ? ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci' : '';
    out.push(`CREATE TABLE IF NOT EXISTS ${t.name} (\n${lines.join(',\n')}\n)${tail};`);
    if (dialect === 'sqlite') for (const i of t.indexes || []) out.push(`CREATE INDEX IF NOT EXISTS ix_${t.name}_${i.join('_')} ON ${t.name} (${i.join(', ')});`);
  }
  return out.join('\n');
}

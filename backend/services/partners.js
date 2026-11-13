import { nanoid, customAlphabet } from 'nanoid';
import { db } from '../db/lowdb.js';
import { toMoney } from '../utils/validators.js';

const codeGen = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

export const LOCKING_WITHDRAWAL_STATUSES = ['requested', 'approved', 'paid'];

export function newPartnerCode() {
  let code;
  do code = `RP-${codeGen()}`;
  while (db.data.partners.some((p) => p.partnerCode === code));
  return code;
}

export function program() {
  return db.data.partnerProgram;
}

export function activeTerms() {
  const terms = db.data.partnerTerms || [];
  return terms.slice().sort((a, b) => b.version - a.version)[0];
}

export function partnerBalance(partnerId) {
  const ledger = db.data.commissionLedger.filter((l) => l.partnerId === partnerId && l.status !== 'void');
  const earned = toMoney(ledger.reduce((sum, l) => sum + l.amount, 0));
  const ws = db.data.withdrawals.filter((w) => w.partnerId === partnerId);
  const locked = toMoney(ws.filter((w) => LOCKING_WITHDRAWAL_STATUSES.includes(w.status)).reduce((s, w) => s + w.amount, 0));
  const inProcess = toMoney(ws.filter((w) => ['requested', 'approved'].includes(w.status)).reduce((s, w) => s + w.amount, 0));
  const paidGross = toMoney(ws.filter((w) => w.status === 'paid').reduce((s, w) => s + w.amount, 0));
  const paidNet = toMoney(ws.filter((w) => w.status === 'paid').reduce((s, w) => s + w.netAmount, 0));
  const tdsDeducted = toMoney(ws.filter((w) => w.status === 'paid').reduce((s, w) => s + w.tdsAmount, 0));
  return {
    totalEarned: earned,
    available: toMoney(Math.max(0, earned - locked)),
    inProcess,
    paidGross,
    paidNet,
    tdsDeducted,
    minWithdrawal: program().minWithdrawal
  };
}

export function commissionRateFor(partner, productId, kind = 'new') {
  const access = (partner.productAccess || []).find((a) => a.productId === productId);
  if (kind === 'renewal') {
    return Number(access?.renewalPercent ?? partner.commission?.renewalPercent ?? program().defaultRenewalPercent);
  }
  return Number(access?.commissionPercent ?? partner.commission?.defaultPercent ?? program().defaultCommissionPercent);
}

export function addLedgerEntry({ partnerId, customerId = null, productId = null, type, baseAmount = 0, percent = 0, amount, description, createdBy }) {
  const entry = {
    id: nanoid(),
    partnerId,
    customerId,
    productId,
    type,
    baseAmount: toMoney(baseAmount),
    percent: Number(percent) || 0,
    amount: toMoney(amount ?? (baseAmount * percent) / 100),
    status: 'available',
    description: description || '',
    createdBy: createdBy || 'system',
    createdAt: new Date().toISOString()
  };
  db.data.commissionLedger.push(entry);
  return entry;
}

export function audit(actor, action, targetId, meta = {}) {
  db.data.auditLog.push({ id: nanoid(), actor, action, targetId, meta, at: new Date().toISOString() });
  if (db.data.auditLog.length > 5000) db.data.auditLog.splice(0, db.data.auditLog.length - 5000);
}

// What a partner (or the admin list view) is allowed to see: never ciphertext, hashes or password.
export function publicPartner(p) {
  if (!p) return null;
  const { passwordHash, pan, bank, pendingBankChange, documents, ...rest } = p;
  return {
    ...rest,
    pan: { masked: pan?.last4 ? `••••••${pan.last4}` : '', nameOnPan: pan?.nameOnPan || '' },
    bank: bank
      ? {
          accountHolder: bank.accountHolder,
          accountMasked: bank.accountLast4 ? `••••••${bank.accountLast4}` : '',
          ifsc: bank.ifsc,
          bankName: bank.bankName,
          branch: bank.branch,
          accountType: bank.accountType,
          verified: !!bank.verified
        }
      : null,
    pendingBankChange: pendingBankChange
      ? {
          accountHolder: pendingBankChange.accountHolder,
          accountMasked: `••••••${pendingBankChange.accountLast4}`,
          ifsc: pendingBankChange.ifsc,
          bankName: pendingBankChange.bankName,
          requestedAt: pendingBankChange.requestedAt
        }
      : null,
    documents: (documents || []).map(({ id, type, originalName, mime, size, uploadedAt }) => ({ id, type, originalName, mime, size, uploadedAt }))
  };
}

export function productName(productId) {
  return db.data.products.find((p) => p.id === productId)?.name || 'Unknown product';
}

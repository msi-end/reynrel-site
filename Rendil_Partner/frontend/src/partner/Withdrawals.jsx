import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, Landmark } from 'lucide-react';
import { PartnerAuth } from '../auth';
import { partnerApi } from '../lib/api';
import { inr, date } from '../lib/format';
import { Card, PageHeader, Stat, Table, Td, Badge, Empty, Loading, Button, Field, Input, Alert, Dl, useAction } from '../components/ui';

export default function Withdrawals() {
  const { user: me } = PartnerAuth.useAuth();
  const { data } = useQuery({ queryKey: ['partner', 'withdrawals'], queryFn: () => partnerApi.get('/partner/withdrawals') });
  const qc = useQueryClient();
  const [run, busy] = useAction();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  useEffect(() => { if (data && amount === '') setAmount(String(Math.floor(data.balance.available))); }, [data, amount]);
  if (!data) return <Loading rows={6} />;
  const b = data.balance;
  const amt = Number(amount) || 0;
  const tds = Math.round(amt * b.tdsPercent) / 100;
  const open = data.rows.find((w) => ['requested', 'approved'].includes(w.status));
  const blockers = [
    !me.permissions.requestWithdrawals && 'Withdrawals are not enabled for your account.',
    b.available < b.minWithdrawal && `Withdrawals unlock at ${inr(b.minWithdrawal)} available (you have ${inr(b.available)}).`,
    !data.payoutReady && 'Add your PAN and bank account in Profile → Payout details.',
    data.bankChangePending && 'Your new bank account is awaiting verification.',
    open && `Withdrawal ${open.reference} is already in process.`
  ].filter(Boolean);
  const submit = (e) => {
    e.preventDefault();
    run(() => partnerApi.post('/partner/withdrawals', { amount: amt, note }), { success: (r) => `Withdrawal ${r.reference} requested` }).then((r) => { if (r) { setNote(''); setAmount(''); qc.invalidateQueries({ queryKey: ['partner'] }); } });
  };
  return (
    <>
      <PageHeader title="Withdrawals" subtitle={`Transfer available commission to your bank account. Minimum ${inr(b.minWithdrawal)}.`} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Stat label="Available" value={b.available} money tone="green" />
        <Stat label="In process" value={b.inProcess} money tone="amber" />
        <Stat label="Paid (net)" value={b.paidNet} money />
        <Stat label="TDS deducted" value={b.tdsDeducted} money tone="slate" />
      </div>
      <div className="grid lg:grid-cols-5 gap-6 mt-6">
        <Card title="Request a withdrawal" className="lg:col-span-3">
          {blockers.length ? (
            <div className="space-y-2">
              {blockers.map((x) => <Alert key={x} tone="amber">{x}</Alert>)}
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-500">Progress</span><span className="tabular">{inr(b.available)} / {inr(b.minWithdrawal)}</span></div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (b.available / Math.max(1, b.minWithdrawal)) * 100)}%` }} /></div>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <Field label="Amount (₹)" hint={`Between ${inr(b.minWithdrawal)} and ${inr(b.available)}`}><Input type="number" min={b.minWithdrawal} max={b.available} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
              <Field label="Note (optional)"><Input value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} /></Field>
              <dl className="rounded-lg bg-slate-50 p-4 text-sm grid grid-cols-2 gap-y-1.5">
                <dt className="text-slate-500">Gross</dt><dd className="text-right tabular">{inr(amt)}</dd>
                <dt className="text-slate-500">TDS @ {b.tdsPercent}%</dt><dd className="text-right tabular">−{inr(tds)}</dd>
                <dt className="font-medium">You receive</dt><dd className="text-right tabular font-semibold">{inr(amt - tds)}</dd>
              </dl>
              <Button type="submit" icon={Send} loading={busy} disabled={amt < b.minWithdrawal || amt > b.available}>Request withdrawal</Button>
            </form>
          )}
        </Card>
        <Card title="Payout account" className="lg:col-span-2">
          <Dl items={[['Name', me.bank.holder], ['Account', <span className="font-mono">{me.bank.accountMasked || '—'}</span>], ['IFSC', <span className="font-mono">{me.bank.ifsc}</span>], ['Bank', me.bank.bankName], ['Status', <Badge status={me.bank.verified ? 'verified' : 'pending'}>{me.bank.verified ? 'Verified' : 'Checked at first payout'}</Badge>]]} />
          <Link to="/portal/profile" className="inline-block mt-4 text-sm text-brand-600">{data.payoutReady ? 'Change payout details' : 'Add payout details'}</Link>
        </Card>
      </div>
      <Card title="History" className="mt-6" padded={false}>
        <Table head={['Reference', 'Requested', 'Gross', 'TDS', 'Net', 'Status', 'Payment']} empty={data.rows.length === 0 && <Empty icon={Landmark} title="No withdrawals yet" />}>
          {data.rows.map((w) => (
            <tr key={w.id}>
              <Td className="font-mono text-xs">{w.reference}</Td><Td className="whitespace-nowrap">{date(w.requested_at)}</Td>
              <Td className="tabular">{inr(w.amount)}</Td><Td className="tabular">{inr(w.tds_amount)}</Td><Td className="tabular font-medium">{inr(w.net_amount)}</Td>
              <Td><Badge status={w.status} />{w.status === 'rejected' && w.review_note && <div className="text-xs text-slate-500 mt-1">{w.review_note}</div>}</Td>
              <Td className="text-xs">{w.utr ? <>{w.pay_mode} · {date(w.paid_on)}<div className="font-mono">UTR {w.utr}</div></> : '—'}</Td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

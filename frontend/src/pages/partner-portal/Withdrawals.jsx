import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { partnerApi } from '../../lib/apiClient';
import { usePartnerAuth } from '../../context/PartnerAuthContext';
import { Card, StatCard, StatusBadge, Table, Td, Empty, Btn, Field, inputCls, Alert, inr, fmtDate, errMsg } from '../../components/partner/ui';

const PartnerWithdrawals = () => {
  const { partner } = usePartnerAuth();
  const [data, setData] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => partnerApi.get('/partner/withdrawals').then((r) => { setData(r.data); setAmount(String(Math.floor(r.data.balance.available))); });
  useEffect(() => { load(); }, []);

  if (!data) return <div className="text-slate-500">Loading…</div>;
  const { balance, tdsPercent, withdrawals } = data;
  const open = withdrawals.find((w) => ['requested', 'approved'].includes(w.status));
  const eligible = balance.available >= balance.minWithdrawal;
  const amt = Number(amount) || 0;
  const tds = Math.round(amt * tdsPercent) / 100;
  const blockers = [
    !eligible && `Available commission must reach ${inr(balance.minWithdrawal)} (you have ${inr(balance.available)}).`,
    !partner.bank?.verified && 'Your bank account is awaiting verification.',
    partner.pendingBankChange && 'A bank account change is awaiting verification.',
    open && `Withdrawal ${open.reference} is already in process.`
  ].filter(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const r = await partnerApi.post('/partner/withdrawals', { amount: amt, note });
      setMsg({ tone: 'green', text: `Withdrawal ${r.data.reference} requested. You'll be notified once it is processed.` });
      setNote('');
      load();
    } catch (err) {
      setMsg({ tone: 'red', text: errMsg(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Withdrawals</h1>
        <p className="text-sm text-slate-500">Transfer your available commission to your verified bank account. Minimum {inr(balance.minWithdrawal)}.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon="Wallet" tone="green" label="Available" value={inr(balance.available)} />
        <StatCard icon="Hourglass" tone="amber" label="In process" value={inr(balance.inProcess)} />
        <StatCard icon="Landmark" label="Paid (net)" value={inr(balance.paidNet)} />
        <StatCard icon="FileText" tone="slate" label="TDS deducted" value={inr(balance.tdsDeducted)} />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card title="Request a withdrawal" className="lg:col-span-3">
          {msg && <div className="mb-4"><Alert tone={msg.tone}>{msg.text}</Alert></div>}
          {blockers.length > 0 ? (
            <div className="space-y-2">
              {blockers.map((b) => <Alert key={b} tone="amber">{b}</Alert>)}
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-500">Progress to threshold</span><span className="tabular-nums">{inr(balance.available)} / {inr(balance.minWithdrawal)}</span></div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (balance.available / balance.minWithdrawal) * 100)}%` }} /></div>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <Field label="Amount (₹)" hint={`Between ${inr(balance.minWithdrawal)} and ${inr(balance.available)}`}>
                <input type="number" className={inputCls()} min={balance.minWithdrawal} max={balance.available} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </Field>
              <Field label="Note (optional)"><input className={inputCls()} value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} /></Field>
              <dl className="rounded-lg bg-slate-50 p-4 text-sm grid grid-cols-2 gap-y-1.5">
                <dt className="text-slate-500">Gross amount</dt><dd className="text-right tabular-nums">{inr(amt, { decimals: 2 })}</dd>
                <dt className="text-slate-500">TDS @ {tdsPercent}%</dt><dd className="text-right tabular-nums">−{inr(tds, { decimals: 2 })}</dd>
                <dt className="font-medium text-slate-900">You receive</dt><dd className="text-right tabular-nums font-semibold">{inr(amt - tds, { decimals: 2 })}</dd>
              </dl>
              <Btn type="submit" loading={busy} disabled={amt < balance.minWithdrawal || amt > balance.available} icon="Send">Request withdrawal</Btn>
            </form>
          )}
        </Card>
        <Card title="Payout account" className="lg:col-span-2">
          <dl className="text-sm grid grid-cols-3 gap-y-2">
            <dt className="text-slate-500">Name</dt><dd className="col-span-2">{partner.bank?.accountHolder}</dd>
            <dt className="text-slate-500">Account</dt><dd className="col-span-2 font-mono">{partner.bank?.accountMasked}</dd>
            <dt className="text-slate-500">IFSC</dt><dd className="col-span-2 font-mono">{partner.bank?.ifsc}</dd>
            <dt className="text-slate-500">Bank</dt><dd className="col-span-2">{partner.bank?.bankName}</dd>
            <dt className="text-slate-500">Status</dt><dd className="col-span-2"><StatusBadge status={partner.bank?.verified ? 'approved' : 'pending'} label={partner.bank?.verified ? 'Verified' : 'Pending verification'} /></dd>
          </dl>
          <Link to="/partner/profile#bank" className="mt-4 inline-block text-sm text-blue-600">Change bank account</Link>
        </Card>
      </div>

      <Card title="Withdrawal history">
        <Table head={['Reference', 'Requested', 'Gross', 'TDS', 'Net', 'Status', 'Payment']} empty={withdrawals.length === 0 && <Empty icon="Landmark" title="No withdrawals yet" />}>
          {withdrawals.map((w) => (
            <tr key={w.id}>
              <Td className="font-mono text-xs">{w.reference}</Td>
              <Td className="whitespace-nowrap">{fmtDate(w.requestedAt)}</Td>
              <Td className="tabular-nums">{inr(w.amount, { decimals: 2 })}</Td>
              <Td className="tabular-nums">{inr(w.tdsAmount, { decimals: 2 })}</Td>
              <Td className="tabular-nums font-medium">{inr(w.netAmount, { decimals: 2 })}</Td>
              <Td><StatusBadge status={w.status} />{w.status === 'rejected' && w.reviewNote && <div className="text-xs text-slate-500 mt-1">{w.reviewNote}</div>}</Td>
              <Td className="text-xs text-slate-600">{w.payment ? <>{w.payment.mode} · {fmtDate(w.payment.paidOn)}<div className="font-mono">UTR {w.payment.utr}</div></> : '—'}</Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};

export default PartnerWithdrawals;

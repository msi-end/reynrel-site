import React, { useEffect, useMemo, useState } from 'react';
import { partnerApi } from '../../lib/apiClient';
import { Card, StatCard, StatusBadge, Table, Td, Empty, inr, fmtDate } from '../../components/partner/ui';

const PartnerCommission = () => {
  const [data, setData] = useState(null);
  const [type, setType] = useState('all');
  useEffect(() => {
    partnerApi.get('/partner/commissions').then((r) => setData(r.data));
  }, []);
  const rows = useMemo(() => (data?.ledger || []).filter((l) => type === 'all' || l.type === type), [data, type]);

  const exportCsv = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [['Date', 'Type', 'Description', 'Customer', 'Product', 'Base amount', 'Rate %', 'Commission'], ...rows.map((l) => [l.createdAt.slice(0, 10), l.type, l.description, l.customerName, l.productName, l.baseAmount, l.percent, l.amount])].map((r) => r.map(esc).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'reynrel-commission.csv';
    a.click();
  };

  if (!data) return <div className="text-slate-500">Loading…</div>;
  const { balance } = data;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Commission</h1>
        <p className="text-sm text-slate-500">Commission is credited automatically when Reynrel approves a customer you registered.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon="TrendingUp" label="Total earned" value={inr(balance.totalEarned)} />
        <StatCard icon="Wallet" tone="green" label="Available" value={inr(balance.available)} />
        <StatCard icon="Hourglass" tone="amber" label="In withdrawal" value={inr(balance.inProcess)} />
        <StatCard icon="Landmark" tone="slate" label="Paid to bank" value={inr(balance.paidNet)} hint={`TDS ${inr(balance.tdsDeducted)}`} />
      </div>

      <Card title="Your commission rates">
        {data.rates.length === 0 ? <p className="text-sm text-slate-500">Default rates: {data.defaults.defaultPercent}% on new sales, {data.defaults.renewalPercent}% on renewals.</p> : (
          <Table head={['Product', 'New sale', 'Renewal']}>
            {data.rates.map((r) => (
              <tr key={r.productId}><Td>{r.productName}</Td><Td className="tabular-nums font-medium">{r.commissionPercent}%</Td><Td className="tabular-nums">{r.renewalPercent}%</Td></tr>
            ))}
          </Table>
        )}
        <p className="mt-4 text-xs text-slate-500">Commission is calculated on the license value received by Reynrel, excluding GST. TDS of {data.tdsPercent}% is deducted at payout.</p>
      </Card>

      <Card title="Transaction history" action={<button onClick={exportCsv} className="text-sm text-blue-600 font-medium">Export CSV</button>}>
        <div className="flex gap-1 mb-4 overflow-x-auto">
          {[['all', 'All'], ['new', 'New sales'], ['renewal', 'Renewals'], ['adjustment', 'Adjustments'], ['reversal', 'Reversals']].map(([k, l]) => (
            <button key={k} onClick={() => setType(k)} className={`px-3 h-8 rounded-lg text-sm whitespace-nowrap ${type === k ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{l}</button>
          ))}
        </div>
        <Table head={['Date', 'Type', 'Details', 'Sale value', 'Rate', 'Commission']} empty={rows.length === 0 && <Empty icon="Receipt" title="No transactions yet" />}>
          {rows.map((l) => (
            <tr key={l.id}>
              <Td className="whitespace-nowrap">{fmtDate(l.createdAt)}</Td>
              <Td><StatusBadge status={l.type} /></Td>
              <Td><div className="text-slate-900">{l.customerName || l.description}</div><div className="text-xs text-slate-500">{l.productName || l.description}</div></Td>
              <Td className="tabular-nums">{l.baseAmount ? inr(l.baseAmount) : '—'}</Td>
              <Td className="tabular-nums">{l.percent ? `${l.percent}%` : '—'}</Td>
              <Td className={`tabular-nums font-medium whitespace-nowrap ${l.amount < 0 ? 'text-red-600' : 'text-emerald-700'}`}>{l.amount < 0 ? '−' : '+'}{inr(Math.abs(l.amount), { decimals: 2 })}</Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};

export default PartnerCommission;

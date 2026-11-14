import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Receipt } from 'lucide-react';
import { partnerApi, qs } from '../lib/api';
import { inr, date, pct } from '../lib/format';
import { Card, PageHeader, Stat, Pills, Table, Td, Badge, Empty, Loading, Button, Money } from '../components/ui';
import { useCatalogue } from './useCatalogue';

export default function Commission() {
  const [type, setType] = useState('');
  const { data } = useQuery({ queryKey: ['partner', 'commissions', type], queryFn: () => partnerApi.get(`/partner/commissions${qs({ type, limit: 200 })}`) });
  const { data: cat } = useCatalogue();
  const exportCsv = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [['Date', 'Type', 'Description', 'Customer', 'Product', 'Order', 'Base', 'Rate %', 'Amount'], ...data.rows.map((r) => [r.created_at.slice(0, 10), r.type, r.description, r.customer_name, r.product_name, r.order_reference, r.base_amount, r.pct, r.amount])].map((r) => r.map(esc).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'commission.csv';
    a.click();
  };
  return (
    <>
      <PageHeader title="Earnings" subtitle="Credited automatically when Reynrel approves and onboards your customers" />
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Stat label="Total earned" value={data.balance.totalEarned} money />
          <Stat label="Available" value={data.balance.available} money tone="green" />
          <Stat label="In withdrawal" value={data.balance.inProcess} money tone="amber" />
          <Stat label="Paid to bank" value={data.balance.paidNet} money tone="slate" hint={`TDS ${inr(data.balance.tdsDeducted)}`} />
        </div>
      )}
      {cat?.length > 0 && (
        <Card title="Your rates" className="mb-6" padded={false}>
          <Table head={['Product', 'New sale', 'Renewal', 'Services']} dense>
            {cat.map((p) => <tr key={p.id}><Td className="font-medium">{p.name}</Td><Td>{pct(p.commissionPct)}</Td><Td>{pct(p.renewalPct)}</Td><Td className="text-xs text-slate-600">{p.services.filter((s) => s.price > 0).map((s) => `${s.name} ${pct(s.commissionPct)}`).join(', ') || '—'}</Td></tr>)}
          </Table>
        </Card>
      )}
      <Card padded={false} title="Transactions" action={data?.rows.length > 0 && <Button size="sm" variant="outline" icon={Download} onClick={exportCsv}>Export CSV</Button>}>
        <div className="p-4 border-b border-slate-100"><Pills value={type} onChange={setType} options={[['', 'All'], ['new', 'New sales'], ['service', 'Services'], ['renewal', 'Renewals'], ['adjustment', 'Adjustments'], ['reversal', 'Reversals']]} /></div>
        {!data ? <div className="p-4"><Loading /></div> : (
          <Table head={['Date', 'Type', 'Details', 'Base', 'Rate', 'Amount']} empty={data.rows.length === 0 && <Empty icon={Receipt} title="No transactions yet" />}>
            {data.rows.map((r) => (
              <tr key={r.id}>
                <Td className="whitespace-nowrap">{date(r.created_at)}</Td><Td><Badge status={r.type} /></Td>
                <Td><div>{r.customer_name || r.description}</div><div className="text-xs text-slate-500">{r.customer_name ? r.description : ''}</div></Td>
                <Td className="tabular">{Number(r.base_amount) ? inr(r.base_amount) : '—'}</Td><Td>{Number(r.pct) ? pct(r.pct) : '—'}</Td>
                <Td className="font-medium whitespace-nowrap"><Money value={r.amount} className={Number(r.amount) >= 0 ? 'text-emerald-700' : ''} /></Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </>
  );
}

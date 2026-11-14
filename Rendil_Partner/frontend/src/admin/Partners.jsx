import React, { useDeferredValue, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { UserPlus, Search } from 'lucide-react';
import { adminApi, qs } from '../lib/api';
import { inr, date } from '../lib/format';
import { Card, PageHeader, Pills, Table, Td, Badge, Empty, Loading, Input, Button } from '../components/ui';
import { useSettings, typeLabel } from './useConfig';

export default function Partners() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [q, setQ] = useState('');
  const dq = useDeferredValue(q);
  const [page, setPage] = useState(1);
  const settings = useSettings();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'partners', { status, dq, page }], queryFn: () => adminApi.get(`/admin/partners${qs({ status, q: dq, page, limit: 25 })}`) });
  const pages = data ? Math.max(1, Math.ceil(data.total / 25)) : 1;

  return (
    <>
      <PageHeader title="Partners" subtitle="Applications, active partners and their performance"
        actions={<Link to="/admin/partners/new"><Button icon={UserPlus}>Add partner</Button></Link>} />
      <Card padded={false}>
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between p-4 border-b border-slate-100">
          <Pills value={status} onChange={(s) => { setPage(1); setParams(s ? { status: s } : {}); }}
            options={[['', 'All'], ['pending', 'Applications'], ['approved', 'Active'], ['suspended', 'Suspended'], ['rejected', 'Rejected']]} />
          <div className="relative md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Name, code, email, mobile, city" value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} />
          </div>
        </div>
        {isLoading ? <div className="p-4"><Loading /></div> : (
          <Table head={['Partner', 'Type', 'Location', 'Orders', 'Earned', 'Checks', 'Status']} empty={data.rows.length === 0 && <Empty title="No partners found" />}>
            {data.rows.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <Td>
                  <Link to={`/admin/partners/${p.id}`} className="font-medium text-slate-900 hover:text-brand-600">{p.full_name}</Link>
                  <div className="text-xs text-slate-500">{p.business_name || '—'} · <span className="font-mono">{p.code}</span></div>
                  <div className="text-xs text-slate-400">{p.source === 'admin' ? 'Added by admin' : 'Applied'} {date(p.created_at)}</div>
                </Td>
                <Td className="text-xs text-slate-600">{typeLabel(settings.data, p.partner_type)}</Td>
                <Td className="text-xs text-slate-600">{p.city}, {p.state}</Td>
                <Td className="tabular">{p.approved_orders}{p.pending_orders > 0 && <span className="text-xs text-amber-700"> +{p.pending_orders} pending</span>}</Td>
                <Td className="tabular">{inr(p.earned)}</Td>
                <Td>
                  <div className="flex flex-col gap-1 items-start">
                    {p.docs_pending > 0 && <Badge tone="amber">{p.docs_pending} doc{p.docs_pending > 1 ? 's' : ''} to verify</Badge>}
                    {p.bank_change > 0 && <Badge tone="amber">Bank change</Badge>}
                    {!p.bank_verified && p.status === 'approved' && <Badge tone="red">Bank not verified</Badge>}
                  </div>
                </Td>
                <Td><Badge status={p.status} /></Td>
              </tr>
            ))}
          </Table>
        )}
        {pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 text-sm">
            <span className="text-slate-500">Page {page} of {pages} · {data.total} partners</span>
            <div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button></div>
          </div>
        )}
      </Card>
    </>
  );
}

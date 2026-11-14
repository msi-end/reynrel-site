import React, { useDeferredValue, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, UserPlus } from 'lucide-react';
import { PartnerAuth } from '../auth';
import { partnerApi, qs } from '../lib/api';
import { date } from '../lib/format';
import { Card, PageHeader, Pills, Table, Td, Badge, Empty, Loading, Input, Button } from '../components/ui';

export default function Customers() {
  const { user: me } = PartnerAuth.useAuth();
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const dq = useDeferredValue(q);
  const [page, setPage] = useState(1);
  const { data } = useQuery({ queryKey: ['partner', 'customers', { status, dq, page }], queryFn: () => partnerApi.get(`/partner/customers${qs({ status, q: dq, page, limit: 25 })}`) });
  const pages = data ? Math.max(1, Math.ceil(data.total / 25)) : 1;
  return (
    <>
      <PageHeader title="Customers" subtitle="Everyone you have registered, their orders and installations"
        actions={me.permissions.addCustomers && <Link to="/customers/new"><Button icon={UserPlus}>Add customer</Button></Link>} />
      <Card padded={false}>
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between p-4 border-b border-slate-100">
          <Pills value={status} onChange={(s) => { setStatus(s); setPage(1); }} options={[['', 'All'], ['submitted', 'Pending approval'], ['approved', 'Approved'], ['rejected', 'Rejected']]} />
          <div className="relative md:w-64"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><Input className="pl-9" placeholder="Search customers" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
        </div>
        {!data ? <div className="p-4"><Loading /></div> : (
          <Table head={['Customer', 'Location', 'Orders', 'Status', 'Added']} empty={data.rows.length === 0 && <Empty icon={UserPlus} title="No customers found" />}>
            {data.rows.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <Td><Link to={`/customers/${c.id}`} className="font-medium text-slate-900 hover:text-brand-600">{c.business_name}</Link><div className="text-xs text-slate-500">{c.contact_name} · {c.mobile}</div></Td>
                <Td className="text-slate-600">{c.city}, {c.state}</Td>
                <Td className="tabular">{c.orders}</Td>
                <Td><div className="flex flex-wrap gap-1">{c.approved > 0 && <Badge status="approved">{c.approved} approved</Badge>}{c.pending > 0 && <Badge status="submitted">{c.pending} pending</Badge>}{c.open_installs > 0 && <Badge status="scheduled">Installation open</Badge>}</div></Td>
                <Td className="text-slate-500 whitespace-nowrap">{date(c.created_at)}</Td>
              </tr>
            ))}
          </Table>
        )}
        {pages > 1 && <div className="flex justify-between items-center p-4 border-t border-slate-100 text-sm"><span className="text-slate-500">Page {page} of {pages}</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button></div></div>}
      </Card>
    </>
  );
}

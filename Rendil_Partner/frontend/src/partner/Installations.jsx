import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Wrench } from 'lucide-react';
import { partnerApi } from '../lib/api';
import { date, dateTime } from '../lib/format';
import { Card, PageHeader, Table, Td, Badge, Empty, Loading } from '../components/ui';

export default function Installations() {
  const { data } = useQuery({ queryKey: ['partner', 'installations'], queryFn: () => partnerApi.get('/partner/installations') });
  return (
    <>
      <PageHeader title="Installations" subtitle="Status of installation requests for your customers" />
      <Card padded={false}>
        {!data ? <div className="p-4"><Loading /></div> : (
          <Table head={['Customer', 'Product', 'Requested', 'Schedule', 'Status']} empty={data.length === 0 && <Empty icon={Wrench} title="No installation requests yet" />}>
            {data.map((i) => (
              <tr key={i.id}>
                <Td><Link to={`/portal/customers/${i.customer_id}`} className="font-medium hover:text-brand-600">{i.business_name}</Link><div className="text-xs font-mono text-slate-500">{i.reference}</div></Td>
                <Td>{i.product_name}</Td>
                <Td className="text-xs">{date(i.created_at)}<div className="text-slate-500">{i.mode}{i.preferred_date ? ` · pref. ${date(i.preferred_date)}` : ''}</div></Td>
                <Td className="text-xs">{i.scheduled_for ? dateTime(i.scheduled_for) : '—'}{i.engineer && <div className="text-slate-500">{i.engineer}</div>}{i.admin_notes && <div className="text-slate-600 max-w-xs">{i.admin_notes}</div>}</Td>
                <Td><Badge status={i.status} /></Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </>
  );
}

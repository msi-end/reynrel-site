import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, ClipboardCheck, Landmark, IndianRupee, FileCheck2, Wrench, ArrowRight } from 'lucide-react';
import { adminApi } from '../lib/api';
import { inr, dateTime, labelize } from '../lib/format';
import { Card, PageHeader, Stat, Loading, Table, Td, Empty } from '../components/ui';

export default function Dashboard() {
  const { data: o } = useQuery({ queryKey: ['admin', 'overview'], queryFn: () => adminApi.get('/admin/overview') });
  if (!o) return <Loading rows={6} />;
  const todo = [
    [o.partners.pending, 'partner applications to review', '/admin/partners?status=pending', Users],
    [o.documentsPending, 'documents waiting for verification', '/admin/partners', FileCheck2],
    [o.bankChangesPending, 'bank-account changes to verify', '/admin/partners', Landmark],
    [o.orders.pending, 'customer orders to approve', '/admin/orders', ClipboardCheck],
    [o.installationsOpen, 'installations open', '/admin/installations', Wrench],
    [o.withdrawals.requested + o.withdrawals.approved, 'payouts to process', '/admin/withdrawals', IndianRupee]
  ].filter(([n]) => n > 0);
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Partner programme at a glance" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Stat label="Active partners" value={o.partners.active} hint={`${o.partners.pending} pending · ${o.partners.suspended} suspended`} icon={Users} />
        <Stat label="Partner sales this month" value={o.orders.salesThisMonth} money hint={`${o.orders.approved} approved orders in total`} icon={ClipboardCheck} tone="violet" />
        <Stat label="Commission this month" value={o.commission.thisMonth} money hint={`${inr(o.commission.total)} all time`} icon={IndianRupee} tone="green" />
        <Stat label="Payouts due" value={o.withdrawals.due} money hint={`${inr(o.withdrawals.paid)} paid so far`} icon={Landmark} tone="amber" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <Card title="Needs your attention">
          {todo.length === 0 ? <Empty title="All caught up">Nothing is waiting for review.</Empty> : (
            <ul className="divide-y divide-slate-100 -my-2">
              {todo.map(([n, label, to, Icon]) => (
                <li key={label}>
                  <Link to={to} className="flex items-center gap-3 py-3 group">
                    <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center"><Icon size={16} /></span>
                    <span className="flex-1 text-sm text-slate-700"><b className="tabular text-slate-900">{n}</b> {label}</span>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-600" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Top partners by earnings" padded={false}>
          <Table head={['Partner', 'Orders', 'Earned']} dense empty={o.topPartners.length === 0 && <Empty title="No active partners yet" />}>
            {o.topPartners.map((p) => (
              <tr key={p.id}>
                <Td><Link to={`/admin/partners/${p.id}`} className="font-medium text-slate-900 hover:text-brand-600">{p.full_name}</Link><div className="text-xs text-slate-500">{p.business_name || p.city} · {p.code}</div></Td>
                <Td className="tabular">{p.orders}</Td>
                <Td className="tabular font-medium">{inr(p.earned)}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
      <Card title="Recent activity" className="mt-6" padded={false}>
        <Table head={['When', 'Who', 'What']} dense>
          {o.recentActivity.map((a, i) => (
            <tr key={i}><Td className="whitespace-nowrap text-slate-500">{dateTime(a.created_at)}</Td><Td className="text-slate-600">{a.actor}</Td><Td>{labelize(a.action.replace(/\./g, ' · '))}</Td></tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

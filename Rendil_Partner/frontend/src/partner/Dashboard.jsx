import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Wallet, TrendingUp, Users, Clock, UserPlus } from 'lucide-react';
import { PartnerAuth } from '../auth';
import { partnerApi } from '../lib/api';
import { inr, date } from '../lib/format';
import { Card, PageHeader, Stat, Badge, Empty, Loading, Button, Money } from '../components/ui';
import BarChart from '../components/BarChart';

export default function Dashboard() {
  const { user: me } = PartnerAuth.useAuth();
  const { data: d } = useQuery({ queryKey: ['partner', 'dashboard'], queryFn: () => partnerApi.get('/partner/dashboard') });
  const canAdd = me.permissions.addCustomers;
  return (
    <>
      <PageHeader title={`Welcome, ${me.fullName.split(' ')[0]}`} subtitle={<>Partner ID <span className="font-mono">{me.code}</span>{me.tier ? ` · ${me.tier}` : ''}</>}
        actions={canAdd && <Link to="/customers/new"><Button icon={UserPlus}>Add customer</Button></Link>} />
      {!d ? <Loading rows={6} /> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Stat label="Available to withdraw" value={d.balance.available} money icon={Wallet} tone="green" hint={d.balance.inProcess ? `${inr(d.balance.inProcess)} in process` : 'Ready for payout'} />
            <Stat label="Total earnings" value={d.balance.totalEarned} money icon={TrendingUp} hint={`${inr(d.monthly[5].earnings)} this month`} />
            <Stat label="Customers" value={d.counts.customers} icon={Users} tone="violet" hint={`${d.counts.approvedOrders} approved orders`} />
            <Stat label="Pending approval" value={d.counts.pendingOrders} icon={Clock} tone="amber" hint={`${d.counts.openInstallations} installations open`} />
          </div>
          <div className="grid lg:grid-cols-3 gap-6 mt-6">
            <Card title="Commission — last 6 months" className="lg:col-span-2"><BarChart data={d.monthly} valueKey="earnings" /></Card>
            <Card title="Withdrawal">
              <div className="text-sm text-slate-500">Available</div>
              <div className="text-2xl font-semibold tabular">{inr(d.balance.available)} <span className="text-sm font-normal text-slate-500">/ {inr(d.balance.minWithdrawal)} minimum</span></div>
              <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-emerald-500 transition-[width]" style={{ width: `${Math.min(100, (d.balance.available / Math.max(1, d.balance.minWithdrawal)) * 100)}%` }} /></div>
              <p className="mt-3 text-sm text-slate-600">{d.balance.available >= d.balance.minWithdrawal ? 'You can request a withdrawal now.' : `${inr(d.balance.minWithdrawal - d.balance.available)} more to unlock withdrawals.`}</p>
              <Link to="/withdrawals" className="mt-3 inline-block text-sm font-medium text-brand-600">Go to withdrawals →</Link>
              <dl className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-y-1.5 text-sm">
                <dt className="text-slate-500">Paid out</dt><dd className="text-right tabular">{inr(d.balance.paidNet)}</dd>
                <dt className="text-slate-500">Approved sales</dt><dd className="text-right tabular">{inr(d.counts.approvedSales)}</dd>
                <dt className="text-slate-500">Approval rate</dt><dd className="text-right tabular">{d.approvalRate === null ? '—' : `${d.approvalRate}%`}</dd>
                <dt className="text-slate-500">Installs done</dt><dd className="text-right tabular">{d.counts.completedInstallations}</dd>
              </dl>
            </Card>
          </div>
          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            <Card title="Recent orders" action={<Link to="/customers" className="text-sm text-brand-600">All customers</Link>}>
              {d.recentOrders.length === 0 ? <Empty icon={UserPlus} title="No customers yet" action={canAdd && <Link to="/customers/new"><Button size="sm">Add your first customer</Button></Link>} /> : (
                <ul className="divide-y divide-slate-100 -my-2">
                  {d.recentOrders.map((o) => (
                    <li key={o.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0"><div className="font-medium truncate">{o.business_name}</div><div className="text-xs text-slate-500">{o.product_name} · {date(o.created_at)}</div></div>
                      <Badge status={o.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card title="Recent commission" action={<Link to="/commission" className="text-sm text-brand-600">All</Link>}>
              {d.recentCommissions.length === 0 ? <Empty title="No commission yet">Commission appears when Reynrel approves your customers' orders.</Empty> : (
                <ul className="divide-y divide-slate-100 -my-2">
                  {d.recentCommissions.map((c) => (
                    <li key={c.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0"><div className="text-sm truncate">{c.description}</div><div className="text-xs text-slate-500">{date(c.created_at)}{Number(c.pct) ? ` · ${Number(c.pct)}% of ${inr(c.base_amount)}` : ''}</div></div>
                      <Money value={c.amount} className={Number(c.amount) >= 0 ? 'text-emerald-700 font-medium' : 'font-medium'} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  );
}

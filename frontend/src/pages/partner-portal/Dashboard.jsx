import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { partnerApi } from '../../lib/apiClient';
import { usePartnerAuth } from '../../context/PartnerAuthContext';
import { StatCard, Card, StatusBadge, inr, fmtDate, Empty, Alert } from '../../components/partner/ui';

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm px-3 py-2 text-xs">
      <div className="font-medium text-slate-900">{label}</div>
      <div className="text-slate-600">Commission: <span className="tabular-nums text-slate-900">{inr(d.earnings)}</span></div>
      <div className="text-slate-600">Approved customers: <span className="tabular-nums text-slate-900">{d.customers}</span></div>
    </div>
  );
};

const PartnerDashboard = () => {
  const { partner } = usePartnerAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    partnerApi.get('/partner/dashboard').then((r) => setData(r.data)).catch(() => setError('Could not load dashboard'));
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!data) return <div className="text-slate-500">Loading…</div>;
  const { balance, counts, performance, monthly } = data;
  const progress = Math.min(100, Math.round((balance.available / balance.minWithdrawal) * 100));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {partner.personal.fullName.split(' ')[0]}</h1>
          <p className="text-sm text-slate-500">Partner ID <span className="font-mono">{partner.partnerCode}</span> · {partner.tier} partner</p>
        </div>
        <Link to="/partner/customers?new=1" className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">+ Add customer</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon="Wallet" tone="green" label="Available to withdraw" value={inr(balance.available)} hint={balance.inProcess ? `${inr(balance.inProcess)} in process` : 'Ready for payout'} />
        <StatCard icon="TrendingUp" tone="blue" label="Total earnings" value={inr(balance.totalEarned)} hint={`${inr(performance.thisMonthEarnings)} this month`} />
        <StatCard icon="Users" tone="violet" label="Approved customers" value={counts.approvedCustomers} hint={`${counts.totalCustomers} registered in total`} />
        <StatCard icon="Clock" tone="amber" label="Pending approvals" value={counts.pendingApprovals} hint={`${counts.pendingInstallations} installations open`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card title="Commission — last 6 months" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="35%">
                <CartesianGrid vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} width={56} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`)} />
                <Tooltip content={<ChartTip />} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="earnings" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Withdrawal threshold">
          <div className="text-sm text-slate-600">Available</div>
          <div className="text-2xl font-semibold tabular-nums text-slate-900">{inr(balance.available)} <span className="text-sm font-normal text-slate-500">/ {inr(balance.minWithdrawal)}</span></div>
          <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }} /></div>
          <p className="mt-3 text-sm text-slate-600">
            {balance.available >= balance.minWithdrawal ? 'You can request a withdrawal now.' : `${inr(balance.minWithdrawal - balance.available)} more to unlock withdrawals.`}
          </p>
          <Link to="/partner/withdrawals" className="mt-4 inline-flex text-sm font-medium text-blue-600">Go to withdrawals →</Link>
          <dl className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-slate-500">Paid out</dt><dd className="text-right tabular-nums">{inr(balance.paidNet)}</dd>
            <dt className="text-slate-500">TDS deducted</dt><dd className="text-right tabular-nums">{inr(balance.tdsDeducted)}</dd>
            <dt className="text-slate-500">Approval rate</dt><dd className="text-right tabular-nums">{performance.approvalRate === null ? '—' : `${performance.approvalRate}%`}</dd>
            <dt className="text-slate-500">Installs completed</dt><dd className="text-right tabular-nums">{counts.completedInstallations}</dd>
          </dl>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Recent customers" action={<Link to="/partner/customers" className="text-sm text-blue-600">View all</Link>}>
          {data.recentCustomers.length === 0 ? (
            <Empty icon="UserPlus" title="No customers yet">Add your first customer to start earning.</Empty>
          ) : (
            <ul className="divide-y divide-slate-100 -my-2">
              {data.recentCustomers.map((c) => (
                <li key={c.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">{c.businessName}</div>
                    <div className="text-xs text-slate-500">{c.productName} · {fmtDate(c.createdAt)}</div>
                  </div>
                  <StatusBadge status={c.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Recent commission" action={<Link to="/partner/commission" className="text-sm text-blue-600">View all</Link>}>
          {data.recentCommissions.length === 0 ? (
            <Empty icon="IndianRupee" title="No commission yet">Commission appears here when Reynrel approves your customers.</Empty>
          ) : (
            <ul className="divide-y divide-slate-100 -my-2">
              {data.recentCommissions.map((l) => (
                <li key={l.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-slate-900 truncate">{l.description}</div>
                    <div className="text-xs text-slate-500">{fmtDate(l.createdAt)}{l.percent ? ` · ${l.percent}% of ${inr(l.baseAmount)}` : ''}</div>
                  </div>
                  <span className={`tabular-nums font-medium ${l.amount < 0 ? 'text-red-600' : 'text-emerald-700'}`}>{l.amount < 0 ? '−' : '+'}{inr(Math.abs(l.amount))}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PartnerDashboard;

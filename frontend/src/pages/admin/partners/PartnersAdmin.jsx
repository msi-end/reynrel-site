import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { adminApi } from '../../../lib/apiClient';
import { Card, StatCard, StatusBadge, Table, Td, Empty, inputCls, inr, fmtDate } from '../../../components/partner/ui';

const TABS = [['', 'All'], ['pending', 'Applications'], ['approved', 'Active'], ['suspended', 'Suspended'], ['rejected', 'Rejected']];

const PartnersAdmin = () => {
  const [overview, setOverview] = useState(null);
  const [list, setList] = useState(null);
  const [status, setStatus] = useState('pending');
  const [q, setQ] = useState('');

  useEffect(() => {
    adminApi.get('/admin/partners/overview').then((r) => setOverview(r.data));
  }, []);
  useEffect(() => {
    const t = setTimeout(() => adminApi.get('/admin/partners', { params: { status: status || undefined, q: q || undefined } }).then((r) => setList(r.data)), 200);
    return () => clearTimeout(t);
  }, [status, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Partners</h1>
        <div className="flex gap-2 text-sm">
          <Link to="/admin/partner-customers" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-300 bg-white"><Icon name="Users" size={16} />Customer reviews</Link>
          <Link to="/admin/partner-withdrawals" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-300 bg-white"><Icon name="Landmark" size={16} />Withdrawals</Link>
          <Link to="/admin/partner-program" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-300 bg-white"><Icon name="Settings2" size={16} />Program & terms</Link>
        </div>
      </div>

      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon="UserPlus" tone="amber" label="Applications to review" value={overview.partners.pending} hint={`${overview.partners.approved} active partners`} />
          <StatCard icon="ClipboardCheck" tone="violet" label="Customers awaiting approval" value={overview.customers.pending} hint={`${overview.customers.installationsOpen} installations open`} />
          <StatCard icon="Landmark" tone="green" label="Withdrawals to process" value={overview.withdrawals.requested + overview.withdrawals.approvedUnpaid} hint={`${inr(overview.withdrawals.requestedAmount)} requested`} />
          <StatCard icon="IndianRupee" label="Commission this month" value={inr(overview.commission.thisMonth)} hint={`on ${inr(overview.commission.salesValueThisMonth)} partner sales`} />
        </div>
      )}
      {overview?.partners.bankChanges > 0 && (
        <div className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">{overview.partners.bankChanges} partner bank-account change(s) need verification — look for the “Bank change” flag below.</div>
      )}

      <Card>
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between mb-4">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(([k, l]) => (
              <button key={k} onClick={() => setStatus(k)} className={`px-3 h-8 rounded-lg text-sm whitespace-nowrap ${status === k ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{l}</button>
            ))}
          </div>
          <input className={`${inputCls()} md:w-72`} placeholder="Search name, code, email, city…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {!list ? <p className="text-sm text-slate-500">Loading…</p> : (
          <Table head={['Partner', 'Type', 'Location', 'Expected/mo', 'Customers', 'Earned', 'Available', 'Status']} empty={list.length === 0 && <Empty icon="Handshake" title="No partners here" />}>
            {list.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <Td>
                  <Link to={`/admin/partners/${p.id}`} className="font-medium text-slate-900 hover:text-blue-600">{p.fullName}</Link>
                  <div className="text-xs text-slate-500">{p.businessName || '—'} · <span className="font-mono">{p.partnerCode}</span></div>
                  <div className="text-xs text-slate-400">Applied {fmtDate(p.createdAt)}</div>
                </Td>
                <Td className="text-xs">{p.partnerTypeLabel}</Td>
                <Td className="text-xs">{p.city}, {p.state}</Td>
                <Td className="tabular-nums">{p.expectedMonthlyCustomers}</Td>
                <Td className="tabular-nums">{p.approvedCustomers}/{p.customers}{p.pendingCustomers > 0 && <span className="ml-1 text-xs text-amber-600">({p.pendingCustomers} pending)</span>}</Td>
                <Td className="tabular-nums">{inr(p.balance.totalEarned)}</Td>
                <Td className="tabular-nums">{inr(p.balance.available)}</Td>
                <Td>
                  <StatusBadge status={p.status} />
                  {p.hasPendingBankChange && <div className="mt-1"><StatusBadge status="pending" label="Bank change" /></div>}
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
};

export default PartnersAdmin;

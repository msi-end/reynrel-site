import React, { useDeferredValue, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { adminApi, qs } from '../lib/api';
import { inr, date, today, pct } from '../lib/format';
import { Card, PageHeader, Pills, Table, Td, Badge, Empty, Loading, Input, Button, Modal, Field, Textarea, Alert, useAction } from '../components/ui';

const plusYear = (d) => { const x = new Date(`${d}T00:00:00Z`); x.setUTCFullYear(x.getUTCFullYear() + 1); x.setUTCDate(x.getUTCDate() - 1); return x.toISOString().slice(0, 10); };

export default function Orders() {
  const [params] = useSearchParams();
  const partnerId = params.get('partnerId') || '';
  const [view, setView] = useState(partnerId ? '' : 'submitted');
  const [q, setQ] = useState('');
  const dq = useDeferredValue(q);
  const [modal, setModal] = useState(null);
  const filter = view === 'expiring' ? { expiring: 1 } : view === 'active' ? { subscription: 'active' } : { status: view };
  const key = ['admin', 'orders', { view, dq, partnerId }];
  const { data } = useQuery({ queryKey: key, queryFn: () => adminApi.get(`/admin/orders${qs({ ...filter, q: dq, partnerId, limit: 100 })}`) });
  const qc = useQueryClient();
  const done = () => { setModal(null); qc.invalidateQueries({ queryKey: ['admin'] }); };

  return (
    <>
      <PageHeader title="Customer approvals" subtitle="Customers added by partners. Approve once the customer is verified and onboarded — the partner's commission is credited automatically." />
      <Card padded={false}>
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between p-4 border-b border-slate-100">
          <Pills value={view} onChange={setView} options={[['submitted', 'Awaiting approval'], ['approved', 'Approved'], ['active', 'Active subscriptions'], ['expiring', 'Expiring in 30 days'], ['rejected', 'Rejected'], ['cancelled', 'Cancelled'], ['', 'All']]} />
          <div className="relative lg:w-72"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><Input className="pl-9" placeholder="Customer, mobile, order, partner" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </div>
        {partnerId && <div className="px-4 pt-3 text-sm text-slate-600">Filtered to one partner · <Link to="/admin/orders" className="text-brand-600">clear</Link></div>}
        {!data ? <div className="p-4"><Loading /></div> : (
          <Table head={['Order', 'Customer', 'Partner', 'Product & items', 'Value', 'Status', 'Subscription', '']} empty={data.rows.length === 0 && <Empty title="Nothing here" />}>
            {data.rows.map((o) => (
              <tr key={o.id} className="align-top">
                <Td className="font-mono text-xs whitespace-nowrap">{o.reference}<div className="font-sans text-slate-400">{date(o.created_at)}</div></Td>
                <Td><div className="font-medium text-slate-900">{o.business_name}</div><div className="text-xs text-slate-500">{o.contact_name} · {o.customer_mobile}</div><div className="text-xs text-slate-500">{o.city}, {o.state}{o.customer_gstin && <> · <span className="font-mono">{o.customer_gstin}</span></>}</div></Td>
                <Td><Link to={`/admin/partners/${o.partner_id}`} className="text-brand-600">{o.partner_name}</Link><div className="text-xs font-mono text-slate-500">{o.partner_code}</div></Td>
                <Td><div>{o.product_name}</div>{o.services.map((l) => <div key={l.id} className="text-xs text-slate-500">{l.name} · {inr(l.amount)}{l.negotiated && <Badge tone="violet">special</Badge>}</div>)}</Td>
                <Td className="tabular whitespace-nowrap"><div className="font-medium">{inr(o.sale_amount)}</div>{Number(o.list_amount) !== Number(o.sale_amount) && <div className="text-xs text-slate-400 line-through">{inr(o.list_amount)}</div>}{Number(o.commission_total) !== 0 && <div className="text-xs text-emerald-700">comm. {inr(o.commission_total)}</div>}</Td>
                <Td><Badge status={o.status} />{o.installation_status && <div className="mt-1"><Badge status={o.installation_status}>Install: {o.installation_status.replace('_', ' ')}</Badge></div>}{o.review_note && <div className="text-xs text-slate-500 mt-1 max-w-[160px]">{o.review_note}</div>}</Td>
                <Td className="text-xs whitespace-nowrap">{o.subscription_status ? <><Badge status={o.subscription_status} /><div className="mt-1">{date(o.start_date)} → {date(o.end_date)}</div>{o.license_key && <div className="font-mono text-slate-500 truncate max-w-[140px]">{o.license_key}</div>}</> : '—'}</Td>
                <Td>
                  <div className="flex flex-col gap-1 items-start">
                    {o.status === 'submitted' && <><Button size="xs" variant="success" onClick={() => setModal({ kind: 'approve', o })}>Approve</Button><Button size="xs" variant="outline" onClick={() => setModal({ kind: 'reject', o })}>Reject</Button></>}
                    {o.status === 'approved' && <><Button size="xs" variant="ghost" onClick={() => setModal({ kind: 'renew', o })}>Record renewal</Button><Button size="xs" variant="ghost" onClick={() => setModal({ kind: 'sub', o })}>Edit subscription</Button></>}
                    {Number(o.commission_total) > 0 && <Button size="xs" variant="danger-ghost" onClick={() => setModal({ kind: 'reverse', o })}>Refund / reverse</Button>}
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      {modal && <OrderModal {...modal} onClose={() => setModal(null)} onDone={done} />}
    </>
  );
}

function OrderModal({ kind, o, onClose, onDone }) {
  const [run, busy] = useAction();
  const start = today();
  const [f, setF] = useState({
    saleAmount: o.sale_amount, commissionPct: '', startDate: start, endDate: plusYear(start), licenseKey: o.license_key || '', note: '', reason: '',
    amount: o.sale_amount, renewEnd: o.end_date ? plusYear(new Date(Date.parse(`${o.end_date}T00:00:00Z`) + 864e5).toISOString().slice(0, 10)) : '',
    subscriptionStatus: o.subscription_status, endDate2: o.end_date
  });
  const s = (k) => ({ value: f[k] ?? '', onChange: (e) => setF({ ...f, [k]: e.target.value }) });
  const lines = o.services || [];
  const estimate = lines.reduce((t, l) => t + (Number(l.amount) * (Number(o.sale_amount) ? Number(f.saleAmount) / Number(o.sale_amount) : 0) * (f.commissionPct !== '' ? Number(f.commissionPct) : Number(l.commissionPct))) / 100, 0);
  const actions = {
    approve: () => adminApi.put(`/admin/orders/${o.id}/review`, { action: 'approve', saleAmount: f.saleAmount, commissionPct: f.commissionPct, startDate: f.startDate, endDate: f.endDate, licenseKey: f.licenseKey, note: f.note }),
    reject: () => adminApi.put(`/admin/orders/${o.id}/review`, { action: 'reject', note: f.note }),
    renew: () => adminApi.post(`/admin/orders/${o.id}/renewal`, { amount: f.amount, endDate: f.renewEnd }),
    reverse: () => adminApi.post(`/admin/orders/${o.id}/reverse`, { reason: f.reason }),
    sub: () => adminApi.put(`/admin/orders/${o.id}/subscription`, { endDate: f.endDate2, subscriptionStatus: f.subscriptionStatus, licenseKey: f.licenseKey })
  };
  const msg = { approve: (r) => `Approved · ${inr(r.commission)} credited to ${o.partner_name}`, reject: 'Order rejected', renew: (r) => `Renewed to ${date(r.endDate)} · ${inr(r.commission)} commission`, reverse: (r) => `${inr(r.reversed)} reversed`, sub: 'Subscription updated' };
  const titles = { approve: 'Approve order', reject: 'Reject order', renew: 'Record renewal', reverse: 'Refund / reverse commission', sub: 'Edit subscription' };
  return (
    <Modal open title={`${titles[kind]} · ${o.business_name}`} size={kind === 'approve' ? 'lg' : 'md'} onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant={['reject', 'reverse'].includes(kind) ? 'danger' : 'primary'} loading={busy} onClick={() => run(actions[kind], { success: msg[kind] }).then((r) => r !== undefined && onDone())}>Confirm</Button></>}>
      <div className="space-y-4 text-sm">
        {kind === 'approve' && (
          <>
            <Table head={['Item', 'Price', 'Rate', 'Commission']} dense>
              {lines.map((l) => <tr key={l.id}><Td>{l.name}{l.negotiated && <span className="text-xs text-violet-700"> · special price</span>}</Td><Td className="tabular">{inr(l.amount)}</Td><Td>{pct(f.commissionPct !== '' ? f.commissionPct : l.commissionPct)}</Td><Td className="tabular">{inr((Number(l.amount) * (f.commissionPct !== '' ? Number(f.commissionPct) : Number(l.commissionPct))) / 100)}</Td></tr>)}
            </Table>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Amount received, excl. GST (₹)" hint="Change if the final amount differs"><Input type="number" {...s('saleAmount')} /></Field>
              <Field label="Commission % override" hint="Blank = rates above"><Input type="number" min={0} max={100} {...s('commissionPct')} /></Field>
              <Field label="Subscription start"><Input type="date" {...s('startDate')} /></Field>
              <Field label="Subscription end"><Input type="date" {...s('endDate')} /></Field>
              <Field label="License key" className="sm:col-span-2"><Input {...s('licenseKey')} /></Field>
            </div>
            <Field label="Note"><Input {...s('note')} /></Field>
            <Alert tone="green">{inr(Math.round(estimate * 100) / 100)} will be credited to {o.partner_name} immediately.</Alert>
          </>
        )}
        {kind === 'reject' && <Field label="Reason (shown to the partner)" required><Textarea {...s('note')} /></Field>}
        {kind === 'renew' && (
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Renewal amount, excl. GST (₹)"><Input type="number" {...s('amount')} /></Field>
            <Field label="New end date"><Input type="date" {...s('renewEnd')} /></Field>
            <p className="sm:col-span-2 text-slate-500">The partner's renewal rate for this product is applied automatically.</p>
          </div>
        )}
        {kind === 'reverse' && <><Alert tone="amber">All {inr(o.commission_total)} credited on this order is debited from the partner, and the subscription is marked cancelled.</Alert><Field label="Reason" required><Input {...s('reason')} /></Field></>}
        {kind === 'sub' && (
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="End date"><Input type="date" {...s('endDate2')} /></Field>
            <Field label="Status"><select className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm" {...s('subscriptionStatus')}><option value="active">Active</option><option value="expired">Expired</option><option value="cancelled">Cancelled</option></select></Field>
            <Field label="License key" className="sm:col-span-2"><Input {...s('licenseKey')} /></Field>
          </div>
        )}
      </div>
    </Modal>
  );
}

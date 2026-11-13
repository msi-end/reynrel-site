import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adminApi } from '../../../lib/apiClient';
import { Card, StatusBadge, Table, Td, Empty, Btn, Field, inputCls, Alert, Modal, inr, fmtDate, errMsg } from '../../../components/partner/ui';

const today = () => new Date().toISOString().slice(0, 10);
const plusYear = (d) => { const x = new Date(`${d}T00:00:00Z`); x.setUTCFullYear(x.getUTCFullYear() + 1); x.setUTCDate(x.getUTCDate() - 1); return x.toISOString().slice(0, 10); };

const PartnerCustomersAdmin = () => {
  const location = useLocation();
  const partnerId = new URLSearchParams(location.search).get('partnerId') || '';
  const [list, setList] = useState(null);
  const [status, setStatus] = useState(partnerId ? '' : 'submitted');
  const [inst, setInst] = useState('');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(null); // {kind, c}
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [flash, setFlash] = useState('');

  const load = () => adminApi.get('/admin/partner-ops/customers', { params: { status: status || undefined, installation: inst || undefined, q: q || undefined, partnerId: partnerId || undefined } }).then((r) => setList(r.data));
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [status, inst, q, partnerId]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = (kind, c) => {
    setErr('');
    setModal({ kind, c });
    if (kind === 'approve') setForm({ saleAmount: c.planAmount, plan: c.plan, startDate: today(), endDate: plusYear(today()), commissionPercent: '', licenseKey: '', note: '' });
    if (kind === 'reject') setForm({ note: '' });
    if (kind === 'install') setForm({ status: c.installation.status === 'not_requested' ? 'scheduled' : c.installation.status, scheduledFor: c.installation.scheduledFor || '', engineer: c.installation.engineer || '', adminNotes: c.installation.adminNotes || '' });
    if (kind === 'renew') setForm({ amount: c.saleAmount || c.planAmount, endDate: c.subscription ? plusYear(new Date(Date.parse(c.subscription.endDate) + 86400000).toISOString().slice(0, 10)) : '' });
    if (kind === 'reverse') setForm({ reason: '' });
    if (kind === 'sub') setForm({ endDate: c.subscription?.endDate, status: c.subscription?.status, licenseKey: c.subscription?.licenseKey || '' });
  };

  const submit = async () => {
    const { kind, c } = modal;
    setBusy(true);
    setErr('');
    try {
      let r;
      if (kind === 'approve') r = await adminApi.put(`/admin/partner-ops/customers/${c.id}/review`, { action: 'approve', ...form, saleAmount: Number(form.saleAmount) });
      if (kind === 'reject') r = await adminApi.put(`/admin/partner-ops/customers/${c.id}/review`, { action: 'reject', note: form.note });
      if (kind === 'install') r = await adminApi.put(`/admin/partner-ops/customers/${c.id}/installation`, form);
      if (kind === 'renew') r = await adminApi.post(`/admin/partner-ops/customers/${c.id}/renewal`, { amount: Number(form.amount), endDate: form.endDate });
      if (kind === 'reverse') r = await adminApi.post(`/admin/partner-ops/customers/${c.id}/reverse`, form);
      if (kind === 'sub') r = await adminApi.put(`/admin/partner-ops/customers/${c.id}/subscription`, form);
      const comm = r?.data?.commission;
      setFlash(comm ? `Done. ${inr(Math.abs(comm.amount), { decimals: 2 })} ${comm.amount < 0 ? 'reversed from' : 'credited to'} ${c.partner?.name}.` : 'Saved.');
      setModal(null);
      load();
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  };
  const F = (k, props = {}) => <input className={inputCls()} value={form[k] ?? ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} {...props} />;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin/partners" className="text-sm text-slate-500">← Partners</Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Partner customers</h1>
        <p className="text-sm text-slate-500">Approve registrations (commission is credited automatically), track installations, subscriptions and renewals.</p>
      </div>
      {flash && <Alert tone="green">{flash}</Alert>}
      <Card>
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between mb-4">
          <div className="flex gap-1 overflow-x-auto">
            {[['submitted', 'Awaiting approval'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['', 'All']].map(([k, l]) => (
              <button key={k} onClick={() => setStatus(k)} className={`px-3 h-8 rounded-lg text-sm whitespace-nowrap ${status === k ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{l}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <select className={`${inputCls()} w-48`} value={inst} onChange={(e) => setInst(e.target.value)}>
              <option value="">Any installation</option>
              {['requested', 'scheduled', 'in_progress', 'completed', 'cancelled', 'not_requested'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <input className={`${inputCls()} w-56`} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        {!list ? <p className="text-sm text-slate-500">Loading…</p> : (
          <Table head={['Customer', 'Partner', 'Software / value', 'Status', 'Installation', 'Subscription', 'Actions']} empty={list.length === 0 && <Empty icon="ClipboardCheck" title="Nothing here" />}>
            {list.map((c) => (
              <tr key={c.id} className="align-top">
                <Td>
                  <div className="font-medium text-slate-900">{c.businessName}</div>
                  <div className="text-xs text-slate-500">{c.contactName} · {c.mobile}{c.email && ` · ${c.email}`}</div>
                  <div className="text-xs text-slate-500">{[c.city, c.state].filter(Boolean).join(', ')}{c.gstin && <> · <span className="font-mono">{c.gstin}</span></>}</div>
                  {c.notes && <div className="text-xs text-slate-600 mt-1 max-w-xs">“{c.notes}”</div>}
                  <div className="text-xs text-slate-400">Submitted {fmtDate(c.createdAt)}</div>
                </Td>
                <Td>{c.partner ? <Link className="text-blue-600" to={`/admin/partners/${c.partner.id}`}>{c.partner.name}</Link> : '—'}<div className="text-xs font-mono text-slate-500">{c.partner?.partnerCode}</div></Td>
                <Td>{c.productName}<div className="text-xs text-slate-500">{c.plan} · {inr(c.saleAmount ?? c.planAmount)}{c.counters > 1 && ` · ${c.counters} counters`}</div>{c.commissionEarned !== 0 && <div className="text-xs text-emerald-700">Commission {inr(c.commissionEarned, { decimals: 2 })}</div>}</Td>
                <Td><StatusBadge status={c.status} /></Td>
                <Td><StatusBadge status={c.installation.status} />{c.installation.preferredDate && <div className="text-xs text-slate-500 mt-1">pref. {c.installation.preferredDate} · {c.installation.mode}</div>}{c.installation.scheduledFor && <div className="text-xs text-slate-500">sched. {c.installation.scheduledFor}</div>}</Td>
                <Td className="text-xs">{c.subscription ? <><StatusBadge status={c.subscription.status} /><div className="mt-1">{fmtDate(c.subscription.startDate)} → {fmtDate(c.subscription.endDate)}</div>{c.subscription.renewals?.length > 0 && <div className="text-slate-500">{c.subscription.renewals.length} renewal(s)</div>}</> : '—'}</Td>
                <Td>
                  <div className="flex flex-col gap-1.5 items-start">
                    {c.status === 'submitted' && (<><Btn size="sm" variant="success" onClick={() => open('approve', c)}>Approve</Btn><Btn size="sm" variant="outline" onClick={() => open('reject', c)}>Reject</Btn></>)}
                    {c.status !== 'rejected' && <Btn size="sm" variant="ghost" icon="Wrench" onClick={() => open('install', c)}>Installation</Btn>}
                    {c.subscription && (<><Btn size="sm" variant="ghost" icon="RefreshCcw" onClick={() => open('renew', c)}>Record renewal</Btn><Btn size="sm" variant="ghost" icon="CalendarCog" onClick={() => open('sub', c)}>Subscription</Btn></>)}
                    {c.commissionEarned > 0 && <Btn size="sm" variant="ghost" icon="Undo2" onClick={() => open('reverse', c)}>Refund / reverse</Btn>}
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {modal && (
        <Modal open title={{ approve: 'Approve customer & credit commission', reject: 'Reject customer', install: 'Update installation', renew: 'Record renewal', reverse: 'Reverse commission', sub: 'Edit subscription' }[modal.kind] + ` — ${modal.c.businessName}`} onClose={() => setModal(null)}>
          <div className="space-y-4 text-sm">
            {err && <Alert>{err}</Alert>}
            {modal.kind === 'approve' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Final sale value excl. GST (₹)">{F('saleAmount', { type: 'number' })}</Field>
                  <Field label="Plan">{F('plan')}</Field>
                  <Field label="Start date">{F('startDate', { type: 'date' })}</Field>
                  <Field label="End date">{F('endDate', { type: 'date' })}</Field>
                  <Field label="Commission % override" hint="Blank = partner's assigned rate">{F('commissionPercent', { type: 'number', min: 0, max: 100 })}</Field>
                  <Field label="License key">{F('licenseKey')}</Field>
                </div>
                <Field label="Note">{F('note')}</Field>
                <p className="text-xs text-slate-500">Approve only after the customer's payment is received. Commission is credited to the partner immediately.</p>
              </>
            )}
            {modal.kind === 'reject' && <Field label="Reason (shown to partner)" required>{F('note')}</Field>}
            {modal.kind === 'install' && (
              <>
                <Field label="Status"><select className={inputCls()} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{['requested', 'scheduled', 'in_progress', 'completed', 'cancelled'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select></Field>
                <div className="grid grid-cols-2 gap-3"><Field label="Scheduled for">{F('scheduledFor', { type: 'datetime-local' })}</Field><Field label="Engineer">{F('engineer')}</Field></div>
                <Field label="Notes (visible to partner)">{F('adminNotes')}</Field>
                {modal.c.installation.notes && <p className="text-xs text-slate-500">Partner notes: {modal.c.installation.notes}</p>}
              </>
            )}
            {modal.kind === 'renew' && (
              <div className="grid grid-cols-2 gap-3"><Field label="Renewal amount excl. GST (₹)">{F('amount', { type: 'number' })}</Field><Field label="New end date">{F('endDate', { type: 'date' })}</Field></div>
            )}
            {modal.kind === 'reverse' && <><p className="text-slate-600">All {inr(modal.c.commissionEarned, { decimals: 2 })} credited for this customer will be debited from the partner and the subscription marked cancelled.</p><Field label="Reason" required>{F('reason')}</Field></>}
            {modal.kind === 'sub' && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="End date">{F('endDate', { type: 'date' })}</Field>
                <Field label="Status"><select className={inputCls()} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{['active', 'expired', 'cancelled'].map((s) => <option key={s}>{s}</option>)}</select></Field>
                <Field label="License key" className="col-span-2">{F('licenseKey')}</Field>
              </div>
            )}
            <div className="flex justify-end gap-2"><Btn variant="outline" onClick={() => setModal(null)}>Cancel</Btn><Btn variant={['reject', 'reverse'].includes(modal.kind) ? 'danger' : 'primary'} loading={busy} onClick={submit}>Confirm</Btn></div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PartnerCustomersAdmin;

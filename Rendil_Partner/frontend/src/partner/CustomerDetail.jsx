import React, { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Wrench, Pencil } from 'lucide-react';
import { PartnerAuth } from '../auth';
import { partnerApi } from '../lib/api';
import { inr, date, dateTime, INDIAN_STATES } from '../lib/format';
import { Card, PageHeader, Badge, Button, Dl, Loading, Modal, Field, Input, Select, Textarea, useForm, useAction } from '../components/ui';
import OrderPicker from './OrderPicker';
import { useCatalogue } from './useCatalogue';

export default function CustomerDetail() {
  const { id } = useParams();
  const { user: me } = PartnerAuth.useAuth();
  const key = ['partner', 'customer', id];
  const { data: c } = useQuery({ queryKey: key, queryFn: () => partnerApi.get(`/partner/customers/${id}`) });
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const apply = (next) => { if (next) { qc.setQueryData(key, next); qc.invalidateQueries({ queryKey: ['partner', 'customers'] }); qc.invalidateQueries({ queryKey: ['partner', 'dashboard'] }); setModal(null); } };
  if (!c) return <Loading rows={6} />;
  return (
    <>
      <PageHeader title={c.business_name} subtitle={`${c.contact_name} · ${c.mobile} · ${c.city}, ${c.state}`}
        back={<Link to="/customers" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-1"><ArrowLeft size={14} />Customers</Link>}
        actions={me.permissions.addCustomers && <><Button variant="outline" icon={Pencil} onClick={() => setModal({ kind: 'edit' })}>Edit details</Button><Button icon={Plus} onClick={() => setModal({ kind: 'order' })}>Add product</Button></>} />
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          {c.orders.map((o) => {
            const inst = o.installations[0];
            const canInstall = me.permissions.requestInstallations && !['rejected', 'cancelled'].includes(o.status) && (!inst || ['completed', 'cancelled'].includes(inst.status));
            return (
              <Card key={o.id} title={<span className="flex items-center gap-2 flex-wrap">{o.product_name} <Badge status={o.status} /></span>} subtitle={`${o.reference} · submitted ${date(o.created_at)}`}
                action={canInstall && <Button size="sm" variant="outline" icon={Wrench} onClick={() => setModal({ kind: 'install', o })}>{inst ? 'New installation' : 'Request installation'}</Button>}>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <ul className="text-sm space-y-1">
                      {o.services.map((l) => <li key={l.id} className="flex justify-between gap-2"><span>{l.name}{l.negotiated && <span className="text-xs text-violet-700"> · special price</span>}</span><span className="tabular">{inr(l.amount)}</span></li>)}
                      <li className="flex justify-between gap-2 pt-1 border-t border-slate-100 font-medium"><span>Total excl. GST</span><span className="tabular">{inr(o.sale_amount)}</span></li>
                    </ul>
                    {o.review_note && <p className={`mt-3 text-sm ${o.status === 'rejected' ? 'text-red-700' : 'text-slate-600'}`}>Note from Reynrel: {o.review_note}</p>}
                    {o.subscription_status && <p className="mt-3 text-sm text-slate-600">Subscription <Badge status={o.subscription_status} /> {date(o.start_date)} → {date(o.end_date)}</p>}
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Installation</div>
                    {!inst ? <p className="text-sm text-slate-500">Not requested.</p> : (
                      <>
                        <div className="flex items-center gap-2 text-sm"><Badge status={inst.status} />{inst.scheduled_for && <span className="text-slate-600">{dateTime(inst.scheduled_for)}</span>}</div>
                        {inst.engineer && <p className="text-xs text-slate-500 mt-1">Engineer: {inst.engineer}</p>}
                        {inst.admin_notes && <p className="text-xs text-slate-600 mt-1">{inst.admin_notes}</p>}
                        <ol className="mt-3 border-l border-slate-200 ml-1 space-y-1.5">
                          {inst.events.map((e) => <li key={e.id} className="pl-3 relative text-xs"><span className="absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full bg-slate-300" /><span className="capitalize">{e.status.replace('_', ' ')}</span> <span className="text-slate-400">{dateTime(e.created_at)}</span></li>)}
                        </ol>
                        {inst.status === 'requested' && <CancelInstall inst={inst} apply={apply} />}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        <Card title="Customer details">
          <Dl items={[['Contact', c.contact_name], ['Mobile', c.mobile], ['Email', c.email], ['GSTIN', c.gstin && <span className="font-mono">{c.gstin}</span>], ['Type', c.business_type], ['Address', [c.address, c.city, c.state, c.pincode].filter(Boolean).join(', ')], ['Notes', c.notes], ['Added', date(c.created_at)]]} />
        </Card>
      </div>
      {modal?.kind === 'order' && <AddOrder c={c} onClose={() => setModal(null)} apply={apply} />}
      {modal?.kind === 'install' && <RequestInstall o={modal.o} onClose={() => setModal(null)} apply={apply} />}
      {modal?.kind === 'edit' && <EditCustomer c={c} onClose={() => setModal(null)} apply={apply} />}
    </>
  );
}

function CancelInstall({ inst, apply }) {
  const [run, busy] = useAction();
  return <Button size="xs" variant="ghost" className="mt-2" loading={busy} onClick={() => run(() => partnerApi.post(`/partner/installations/${inst.id}/cancel`), { success: 'Request cancelled' }).then(apply)}>Cancel request</Button>;
}

function AddOrder({ c, onClose, apply }) {
  const { data: catalogue } = useCatalogue();
  const [order, setOrder] = useState({ productId: '', planId: '', serviceIds: [] });
  const onChange = useCallback((o) => setOrder(o), []);
  const [run, busy] = useAction();
  return (
    <Modal open size="lg" title={`Add product for ${c.business_name}`} onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={() => run(() => partnerApi.post(`/partner/customers/${c.id}/orders`, order), { success: 'Order submitted for approval' }).then(apply)}>Submit order</Button></>}>
      {catalogue ? <OrderPicker catalogue={catalogue} value={order} onChange={onChange} /> : <Loading />}
    </Modal>
  );
}

function RequestInstall({ o, onClose, apply }) {
  const [run, busy] = useAction();
  const [f, setF] = useState({ mode: 'remote', preferredDate: '', notes: '' });
  return (
    <Modal open title={`Installation · ${o.product_name}`} onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={() => run(() => partnerApi.post(`/partner/orders/${o.id}/installation`, f), { success: 'Installation requested' }).then(apply)}>Request</Button></>}>
      <div className="space-y-3">
        <Field label="Mode"><Select value={f.mode} onChange={(e) => setF({ ...f, mode: e.target.value })}><option value="remote">Remote</option><option value="onsite">On-site</option></Select></Field>
        <Field label="Preferred date"><Input type="date" value={f.preferredDate} onChange={(e) => setF({ ...f, preferredDate: e.target.value })} /></Field>
        <Field label="Notes"><Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}

function EditCustomer({ c, onClose, apply }) {
  const [run, busy] = useAction();
  const { values: v, set, bind, errors, setErrors } = useForm({ businessName: c.business_name, contactName: c.contact_name, mobile: c.mobile, email: c.email || '', gstin: c.gstin || '', businessType: c.business_type || '', address: c.address || '', city: c.city, state: c.state, pincode: c.pincode || '', notes: c.notes || '' });
  return (
    <Modal open size="lg" title="Edit customer" onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={() => run(() => partnerApi.put(`/partner/customers/${c.id}`, v), { success: 'Customer updated', onFieldErrors: setErrors }).then(apply)}>Save</Button></>}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Business name" error={errors.businessName} className="sm:col-span-2"><Input {...bind('businessName')} /></Field>
        <Field label="Contact person" error={errors.contactName}><Input {...bind('contactName')} /></Field>
        <Field label="Mobile" error={errors.mobile}><Input {...bind('mobile')} /></Field>
        <Field label="Email" error={errors.email}><Input {...bind('email')} /></Field>
        <Field label="GSTIN" error={errors.gstin}><Input {...bind('gstin', (x) => x.toUpperCase())} /></Field>
        <Field label="Address" className="sm:col-span-2"><Input {...bind('address')} /></Field>
        <Field label="City" error={errors.city}><Input {...bind('city')} /></Field>
        <Field label="State"><Select value={v.state} onChange={(e) => set('state', e.target.value)}>{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <Field label="Notes" className="sm:col-span-2"><Textarea {...bind('notes')} /></Field>
      </div>
    </Modal>
  );
}

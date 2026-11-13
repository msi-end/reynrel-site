import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { partnerApi } from '../../lib/apiClient';
import { Card, Btn, Modal, Field, inputCls, StatusBadge, Table, Td, Empty, Alert, inr, fmtDate, errMsg, INDIAN_STATES } from '../../components/partner/ui';

const BUSINESS_TYPES = ['Kirana / General Store', 'Pharmacy', 'FMCG Distributor', 'Wholesale', 'Garments & Footwear', 'Electronics', 'Hardware', 'Restaurant / Café', 'Manufacturing', 'Other'];
const blank = { businessName: '', contactName: '', mobile: '', email: '', gstin: '', businessType: '', addressLine: '', city: '', state: '', pincode: '', productId: '', plan: '', planAmount: '', counters: 1, notes: '', consent: false, requestInstallation: true, installMode: 'remote', preferredDate: '', installNotes: '' };

const CustomerForm = ({ software, initial, onSaved, onCancel }) => {
  const editing = !!initial?.id;
  const [f, setF] = useState(initial ? { ...blank, ...initial, consent: true } : { ...blank, productId: software[0]?.productId || '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const product = software.find((s) => s.productId === f.productId);

  useEffect(() => {
    if (!f.productId && software[0]) setF((s) => ({ ...s, productId: software[0].productId }));
  }, [software]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!editing && product?.plans?.length && !f.plan) setF((s) => ({ ...s, plan: product.plans[0].name, planAmount: product.plans[0].price }));
  }, [product]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => {
    let v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    if (k === 'gstin') v = v.toUpperCase().replace(/\s/g, '');
    if (['mobile', 'pincode'].includes(k)) v = v.replace(/[^0-9]/g, '');
    setF((s) => ({ ...s, [k]: v }));
    setErrors((s) => ({ ...s, [k]: undefined }));
  };
  const pickPlan = (e) => {
    const pl = product?.plans?.find((p) => p.name === e.target.value);
    setF((s) => ({ ...s, plan: e.target.value, planAmount: pl ? pl.price : s.planAmount }));
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = { ...f, planAmount: Number(f.planAmount) };
      const res = editing ? await partnerApi.put(`/partner/customers/${initial.id}`, body) : await partnerApi.post('/partner/customers', body);
      onSaved(res.data);
    } catch (err) {
      setError(errMsg(err));
      setErrors(err?.response?.data?.fields || {});
    } finally {
      setBusy(false);
    }
  };
  const commission = product ? Math.round((Number(f.planAmount || 0) * product.commissionPercent) / 100) : 0;

  return (
    <form onSubmit={save} className="space-y-5">
      {error && <Alert>{error}</Alert>}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Business name" required error={errors.businessName} className="sm:col-span-2"><input className={inputCls(errors.businessName)} value={f.businessName} onChange={set('businessName')} /></Field>
        <Field label="Contact person" required error={errors.contactName}><input className={inputCls(errors.contactName)} value={f.contactName} onChange={set('contactName')} /></Field>
        <Field label="Mobile" required error={errors.mobile}><input className={inputCls(errors.mobile)} value={f.mobile} onChange={set('mobile')} maxLength={10} inputMode="numeric" /></Field>
        <Field label="Email" error={errors.email}><input className={inputCls(errors.email)} type="email" value={f.email} onChange={set('email')} /></Field>
        <Field label="GSTIN" error={errors.gstin}><input className={inputCls(errors.gstin)} value={f.gstin} onChange={set('gstin')} maxLength={15} /></Field>
        <Field label="Business type">
          <select className={inputCls()} value={f.businessType} onChange={set('businessType')}><option value="">Select</option>{BUSINESS_TYPES.map((b) => <option key={b}>{b}</option>)}</select>
        </Field>
        <Field label="Billing counters / users"><input className={inputCls()} type="number" min={1} max={50} value={f.counters} onChange={set('counters')} /></Field>
        <Field label="Address" className="sm:col-span-2"><input className={inputCls()} value={f.addressLine} onChange={set('addressLine')} /></Field>
        <Field label="City" required error={errors.city}><input className={inputCls(errors.city)} value={f.city} onChange={set('city')} /></Field>
        <Field label="State" required error={errors.state}>
          <select className={inputCls(errors.state)} value={f.state} onChange={set('state')}><option value="">Select</option>{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="PIN code" error={errors.pincode}><input className={inputCls(errors.pincode)} value={f.pincode} onChange={set('pincode')} maxLength={6} inputMode="numeric" /></Field>
      </div>

      <div className="rounded-xl bg-slate-50 p-4 grid sm:grid-cols-2 gap-4">
        <Field label="Software" required error={errors.productId}>
          <select className={inputCls(errors.productId)} value={f.productId} onChange={(e) => setF((s) => ({ ...s, productId: e.target.value, plan: '', planAmount: '' }))}>
            {software.map((s) => <option key={s.productId} value={s.productId}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="Plan">
          {product?.plans?.length ? (
            <select className={inputCls()} value={f.plan} onChange={pickPlan}>{product.plans.map((p) => <option key={p.name} value={p.name}>{p.name} — {inr(p.price)}</option>)}</select>
          ) : (
            <input className={inputCls()} value={f.plan} onChange={set('plan')} placeholder="Plan name" />
          )}
        </Field>
        <Field label="Plan value, excl. GST (₹)" required error={errors.planAmount} hint="Final value is confirmed by Reynrel at approval"><input className={inputCls(errors.planAmount)} type="number" min={0} value={f.planAmount} onChange={set('planAmount')} /></Field>
        <div className="text-sm self-end pb-2 text-slate-600">
          Estimated commission at {product?.commissionPercent ?? 0}%: <strong className="text-slate-900 tabular-nums">{inr(commission)}</strong>
        </div>
        <Field label="Notes for Reynrel" className="sm:col-span-2"><textarea className={`${inputCls()} h-20 py-2`} value={f.notes} onChange={set('notes')} placeholder="Existing software, data migration needs, special requirements…" /></Field>
      </div>

      {!editing && (
        <div className="rounded-xl border border-slate-200 p-4 space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
            <input type="checkbox" checked={f.requestInstallation} onChange={set('requestInstallation')} className="h-4 w-4" /> Request installation now
          </label>
          {f.requestInstallation && (
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Mode">
                <select className={inputCls()} value={f.installMode} onChange={set('installMode')}><option value="remote">Remote (AnyDesk)</option><option value="onsite">On-site</option></select>
              </Field>
              <Field label="Preferred date"><input type="date" className={inputCls()} value={f.preferredDate} onChange={set('preferredDate')} /></Field>
              <Field label="Installation notes"><input className={inputCls()} value={f.installNotes} onChange={set('installNotes')} placeholder="Printer model, PCs…" /></Field>
            </div>
          )}
        </div>
      )}

      {!editing && (
        <label className="flex gap-2 items-start text-sm text-slate-700">
          <input type="checkbox" className="mt-0.5 h-4 w-4" checked={f.consent} onChange={set('consent')} />
          <span>I confirm this customer has agreed to share these details with Reynrel for onboarding and installation. {errors.consent && <span className="text-red-600 block">{errors.consent}</span>}</span>
        </label>
      )}
      <div className="flex justify-end gap-2">
        <Btn type="button" variant="outline" onClick={onCancel}>Cancel</Btn>
        <Btn type="submit" loading={busy}>{editing ? 'Save changes' : 'Submit for approval'}</Btn>
      </div>
    </form>
  );
};

const InstallModal = ({ customer, onClose, onSaved }) => {
  const [f, setF] = useState({ mode: 'remote', preferredDate: '', notes: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    setBusy(true);
    try {
      onSaved((await partnerApi.post(`/partner/customers/${customer.id}/installation`, { action: 'request', ...f })).data);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open title={`Installation request — ${customer.businessName}`} onClose={onClose}>
      <div className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Mode"><select className={inputCls()} value={f.mode} onChange={(e) => setF({ ...f, mode: e.target.value })}><option value="remote">Remote (AnyDesk)</option><option value="onsite">On-site</option></select></Field>
        <Field label="Preferred date"><input type="date" className={inputCls()} value={f.preferredDate} onChange={(e) => setF({ ...f, preferredDate: e.target.value })} /></Field>
        <Field label="Notes"><textarea className={`${inputCls()} h-20 py-2`} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
        <div className="flex justify-end gap-2"><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn loading={busy} onClick={submit}>Submit request</Btn></div>
      </div>
    </Modal>
  );
};

const Detail = ({ c, onClose }) => (
  <Modal open wide title={c.businessName} onClose={onClose}>
    <div className="grid md:grid-cols-2 gap-6 text-sm">
      <dl className="grid grid-cols-3 gap-y-2">
        <dt className="text-slate-500">Contact</dt><dd className="col-span-2">{c.contactName} · {c.mobile}</dd>
        <dt className="text-slate-500">Email</dt><dd className="col-span-2">{c.email || '—'}</dd>
        <dt className="text-slate-500">GSTIN</dt><dd className="col-span-2 font-mono">{c.gstin || '—'}</dd>
        <dt className="text-slate-500">Location</dt><dd className="col-span-2">{[c.addressLine, c.city, c.state, c.pincode].filter(Boolean).join(', ')}</dd>
        <dt className="text-slate-500">Software</dt><dd className="col-span-2">{c.productName} · {c.plan}</dd>
        <dt className="text-slate-500">Plan value</dt><dd className="col-span-2">{inr(c.saleAmount ?? c.planAmount)}</dd>
        <dt className="text-slate-500">Registration</dt><dd className="col-span-2"><StatusBadge status={c.status} /> {c.reviewNote && <span className="text-slate-600"> — {c.reviewNote}</span>}</dd>
        {c.subscription && (<><dt className="text-slate-500">Subscription</dt><dd className="col-span-2"><StatusBadge status={c.subscription.status} /> {fmtDate(c.subscription.startDate)} → {fmtDate(c.subscription.endDate)}</dd></>)}
      </dl>
      <div>
        <h4 className="font-medium text-slate-900 mb-2">Installation</h4>
        <div className="mb-3"><StatusBadge status={c.installation.status} /> {c.installation.scheduledFor && <span className="text-slate-600">· scheduled {c.installation.scheduledFor}</span>}{c.installation.engineer && <span className="text-slate-600"> · {c.installation.engineer}</span>}</div>
        {c.installation.adminNotes && <p className="text-slate-600 mb-3">{c.installation.adminNotes}</p>}
        <ol className="border-l border-slate-200 ml-1 space-y-2">
          {c.installation.history.map((h, i) => (
            <li key={i} className="pl-3 relative"><span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-300" /><span className="capitalize">{h.status.replace('_', ' ')}</span> <span className="text-xs text-slate-500">{new Date(h.at).toLocaleString('en-IN')}</span></li>
          ))}
          {c.installation.history.length === 0 && <li className="pl-3 text-slate-500">No installation requested yet.</li>}
        </ol>
      </div>
    </div>
  </Modal>
);

const PartnerCustomers = () => {
  const location = useLocation();
  const [list, setList] = useState(null);
  const [software, setSoftware] = useState(null);
  const [form, setForm] = useState(new URLSearchParams(location.search).get('new') ? {} : null);
  const [install, setInstall] = useState(null);
  const [detail, setDetail] = useState(null);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [flash, setFlash] = useState('');

  const load = () => partnerApi.get('/partner/customers').then((r) => setList(r.data));
  useEffect(() => {
    load();
    partnerApi.get('/partner/software').then((r) => setSoftware(r.data)).catch(() => setSoftware([]));
  }, []);

  const shown = useMemo(() => (list || []).filter((c) => (filter === 'all' || c.status === filter) && (!q || `${c.businessName} ${c.contactName} ${c.mobile} ${c.city}`.toLowerCase().includes(q.toLowerCase()))), [list, filter, q]);
  const counts = useMemo(() => ({ all: list?.length || 0, submitted: list?.filter((c) => c.status === 'submitted').length || 0, approved: list?.filter((c) => c.status === 'approved').length || 0, rejected: list?.filter((c) => c.status === 'rejected').length || 0 }), [list]);

  const saved = (msg) => () => { setForm(null); setInstall(null); setFlash(msg); load(); setTimeout(() => setFlash(''), 4000); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Register customers before they buy so the sale is credited to you.</p>
        </div>
        <Btn icon="UserPlus" onClick={() => setForm({})} disabled={!software?.length}>Add customer</Btn>
      </div>
      {software && !software.length && <Alert tone="amber">No software has been assigned to your account yet. Contact Reynrel to get product access.</Alert>}
      {flash && <Alert tone="green">{flash}</Alert>}

      <Card>
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between mb-4">
          <div className="flex gap-1 overflow-x-auto">
            {[['all', 'All'], ['submitted', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} className={`px-3 h-8 rounded-lg text-sm whitespace-nowrap ${filter === k ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{l} <span className="opacity-60">{counts[k]}</span></button>
            ))}
          </div>
          <div className="relative md:w-64">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className={`${inputCls()} pl-9`} placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        {!list ? <div className="text-slate-500 text-sm">Loading…</div> : (
          <Table head={['Customer', 'Software', 'Value', 'Registration', 'Installation', '']} empty={shown.length === 0 && <Empty icon="Users" title="No customers here" />}>
            {shown.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <Td><button className="text-left" onClick={() => setDetail(c)}><div className="font-medium text-slate-900 hover:text-blue-600">{c.businessName}</div><div className="text-xs text-slate-500">{c.contactName} · {c.city} · {fmtDate(c.createdAt)}</div></button></Td>
                <Td><div>{c.productName}</div><div className="text-xs text-slate-500">{c.plan}</div></Td>
                <Td className="tabular-nums whitespace-nowrap">{inr(c.saleAmount ?? c.planAmount)}</Td>
                <Td><StatusBadge status={c.status} />{c.status === 'rejected' && c.reviewNote && <div className="text-xs text-slate-500 mt-1 max-w-[180px]">{c.reviewNote}</div>}</Td>
                <Td><StatusBadge status={c.installation.status} /></Td>
                <Td className="whitespace-nowrap text-right">
                  {c.status === 'submitted' && <Btn size="sm" variant="ghost" icon="Pencil" onClick={() => setForm(c)}>Edit</Btn>}
                  {c.status !== 'rejected' && ['not_requested', 'cancelled', 'completed'].includes(c.installation.status) && <Btn size="sm" variant="outline" icon="Wrench" onClick={() => setInstall(c)}>{c.installation.status === 'completed' ? 'Reinstall' : 'Request install'}</Btn>}
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {form && software?.length > 0 && (
        <Modal open wide title={form.id ? `Edit ${form.businessName}` : 'Add customer'} onClose={() => setForm(null)}>
          <CustomerForm software={software} initial={form.id ? form : null} onCancel={() => setForm(null)} onSaved={saved(form.id ? 'Customer updated.' : 'Customer submitted for approval.')} />
        </Modal>
      )}
      {install && <InstallModal customer={install} onClose={() => setInstall(null)} onSaved={saved('Installation requested. Our team will contact the customer.')} />}
      {detail && <Detail c={detail} onClose={() => setDetail(null)} />}
    </div>
  );
};

export default PartnerCustomers;

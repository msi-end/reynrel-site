import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Eye, KeyRound, ExternalLink, Check, X, Trash2, Upload } from 'lucide-react';
import { adminApi, qs } from '../lib/api';
import { inr, date, dateTime, pct, labelize, INDIAN_STATES } from '../lib/format';
import { Card, PageHeader, Tabs, Stat, Badge, Button, Field, Input, Select, Textarea, Table, Td, Empty, Loading, Modal, Alert, Dl, Toggle, Checkbox, Money, useForm, useAction } from '../components/ui';
import BarChart from '../components/BarChart';
import { useSettings, typeLabel } from './useConfig';

const SOURCE = { partner_product: 'partner × product', partner: 'partner default', product: 'product default', program: 'programme default', none: '—' };

export default function PartnerDetail() {
  const { id } = useParams();
  const [tab, setTab] = useState('overview');
  const key = ['admin', 'partner', id];
  const { data: d } = useQuery({ queryKey: key, queryFn: () => adminApi.get(`/admin/partners/${id}`) });
  const settings = useSettings();
  const qc = useQueryClient();
  const refresh = () => { qc.invalidateQueries({ queryKey: key }); qc.invalidateQueries({ queryKey: ['admin', 'overview'] }); qc.invalidateQueries({ queryKey: ['admin', 'partners'] }); };
  if (!d) return <Loading rows={8} />;
  const p = d.partner;
  const docsToVerify = d.documents.filter((x) => x.status === 'pending').length;

  return (
    <>
      <PageHeader
        back={<Link to="/admin/partners" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-1"><ArrowLeft size={14} />Partners</Link>}
        title={<span className="flex items-center gap-2 flex-wrap">{p.fullName} <Badge status={p.status} />{p.tier && <Badge tone="violet">{p.tier}</Badge>}</span>}
        subtitle={<><span className="font-mono">{p.code}</span> · {typeLabel(settings.data, p.partnerType)} · {p.businessName || 'Individual'} · {p.address.city}, {p.address.state}</>}
        actions={<StatusActions partner={p} docs={d.documentSummary} onDone={refresh} products={d.products} />}
      />
      <Tabs value={tab} onChange={setTab} tabs={[
        ['overview', 'Overview'], ['profile', 'Profile'], ['kyc', 'KYC & documents', docsToVerify || null], ['products', 'Products & commission'],
        ['pricing', 'Negotiated pricing', d.prices.length || null], ['access', 'Permissions'], ['orders', 'Customers'], ['earnings', 'Earnings']
      ]} />
      <div key={tab} className="rp-fade">
        {tab === 'overview' && <Overview d={d} />}
        {tab === 'profile' && <Profile p={p} settings={settings.data} onDone={refresh} />}
        {tab === 'kyc' && <Kyc d={d} onDone={refresh} />}
        {tab === 'products' && <Products d={d} onDone={refresh} />}
        {tab === 'pricing' && <Pricing d={d} onDone={refresh} />}
        {tab === 'access' && <Permissions p={p} onDone={refresh} />}
        {tab === 'orders' && <Orders partnerId={p.id} />}
        {tab === 'earnings' && <Earnings partnerId={p.id} balance={d.balance} onDone={refresh} />}
      </div>
    </>
  );
}

function StatusActions({ partner: p, docs, onDone, products }) {
  const [modal, setModal] = useState(null);
  const [reason, setReason] = useState('');
  const [assign, setAssign] = useState(true);
  const [run, busy] = useAction();
  const submit = () => run(() => adminApi.put(`/admin/partners/${p.id}/status`, {
    status: modal, reason, productIds: modal === 'approved' && assign ? products.filter((x) => x.status === 'active').map((x) => x.productId) : undefined
  }), { success: `Partner ${modal === 'approved' ? 'approved' : modal}` }).then((r) => { if (r) { setModal(null); setReason(''); onDone(); } });
  const unassigned = !products.some((x) => x.assigned);
  return (
    <>
      {p.status !== 'approved' && <Button variant="success" icon={Check} onClick={() => setModal('approved')}>{p.status === 'suspended' ? 'Reactivate' : 'Approve'}</Button>}
      {p.status === 'pending' && <Button variant="outline" icon={X} onClick={() => setModal('rejected')}>Reject</Button>}
      {p.status === 'approved' && <Button variant="outline" onClick={() => setModal('suspended')}>Suspend</Button>}
      <Modal open={!!modal} title={{ approved: 'Approve partner', rejected: 'Reject application', suspended: 'Suspend partner' }[modal]} onClose={() => setModal(null)}
        footer={<><Button variant="outline" onClick={() => setModal(null)}>Cancel</Button><Button variant={modal === 'approved' ? 'success' : 'danger'} loading={busy} onClick={submit}>Confirm</Button></>}>
        <div className="space-y-4 text-sm">
          {modal === 'approved' && (
            <>
              {docs.verified < docs.required && <Alert tone="amber">Only {docs.verified} of {docs.required} required documents are verified.</Alert>}
              <p className="text-slate-600">The partner gets dashboard access. Their bank account is marked verified (if provided).</p>
              {unassigned && <Checkbox checked={assign} onChange={(e) => setAssign(e.target.checked)} label="Give access to all active products at default rates (refine under Products & commission)" />}
            </>
          )}
          <Field label={modal === 'approved' ? 'Note (optional)' : 'Reason (shown to the partner)'} required={modal !== 'approved'}><Textarea value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
          {modal === 'suspended' && <p className="text-slate-500">Suspension logs the partner out immediately. Approved commission is kept.</p>}
        </div>
      </Modal>
    </>
  );
}

function Overview({ d }) {
  const p = d.partner;
  const t = d.performance.totals;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total earned" value={d.balance.totalEarned} money hint={`${inr(d.balance.available)} available`} />
        <Stat label="Paid out (net)" value={d.balance.paidNet} money hint={`TDS ${inr(d.balance.tdsDeducted)}`} tone="green" />
        <Stat label="Approved orders" value={t.approved} hint={`${t.pending} pending · ${t.approvalRate ?? '—'}% approval rate`} tone="violet" />
        <Stat label="Sales value" value={t.sales} money hint={`expected ${p.expectedMonthlyCustomers || '—'} customers/month`} tone="slate" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card title="Commission, last 12 months" className="lg:col-span-2">
          <BarChart data={d.performance.months} valueKey="earnings" detail={(m) => `${m.orders} approved orders`} />
        </Card>
        <Card title="Checklist">
          <ul className="space-y-3 text-sm">
            <Check2 ok={d.documentSummary.verified >= d.documentSummary.required} label={`Documents verified ${d.documentSummary.verified}/${d.documentSummary.required}`} />
            <Check2 ok={p.bank.verified} label={p.bank.accountMasked ? `Bank ${p.bank.accountMasked} ${p.bank.verified ? 'verified' : 'not verified'}` : 'No bank account yet'} />
            <Check2 ok={!!p.pan.masked} label={p.pan.masked ? `PAN ${p.pan.masked}` : 'No PAN yet'} />
            <Check2 ok={d.termsAccepted.length > 0} label={d.termsAccepted[0] ? `Terms v${d.termsAccepted[0].version} accepted ${date(d.termsAccepted[0].accepted_at)}` : 'Terms not accepted'} />
            <Check2 ok={d.products.some((x) => x.assigned && x.enabled)} label={`${d.products.filter((x) => x.assigned && x.enabled).length} product(s) assigned`} />
            {d.bankRequest && <li className="text-amber-700">Bank change requested {date(d.bankRequest.created_at)}</li>}
          </ul>
        </Card>
      </div>
      <Card title="History" padded={false}>
        <Table head={['When', 'By', 'Event']} dense empty={d.activity.length === 0 && <Empty title="No activity yet" />}>
          {d.activity.map((a, i) => (
            <tr key={i}><Td className="whitespace-nowrap text-slate-500">{dateTime(a.created_at)}</Td><Td className="text-slate-600">{a.actor}</Td>
              <Td>{labelize(a.action.replace('partner.', '').replace('.', ' → '))}{a.meta?.reason ? ` — ${a.meta.reason}` : ''}</Td></tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
const Check2 = ({ ok, label }) => (
  <li className="flex items-center gap-2"><span className={`w-5 h-5 rounded-full flex items-center justify-center ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{ok ? <Check size={12} /> : <X size={12} />}</span>{label}</li>
);

function Profile({ p, settings, onDone }) {
  const [run, busy] = useAction();
  const [pw, setPw] = useState(null);
  const { values: v, set, bind, setErrors } = useForm({
    fullName: p.fullName, email: p.email, mobile: p.mobile, whatsapp: p.whatsapp || '', partnerType: p.partnerType, tier: p.tier || '',
    businessName: p.businessName || '', entityType: p.entityType || '', gstin: p.gstin || '', website: p.website || '',
    addressLine1: p.address.line1 || '', addressLine2: p.address.line2 || '', city: p.address.city || '', district: p.address.district || '', state: p.address.state || '', pincode: p.address.pincode || '',
    expectedMonthlyCustomers: p.expectedMonthlyCustomers || '', ...p.profile, adminNotes: p.adminNotes || ''
  });
  const save = (e) => { e.preventDefault(); run(() => adminApi.put(`/admin/partners/${p.id}`, v), { success: 'Profile saved', onFieldErrors: setErrors }).then((r) => r && onDone()); };
  return (
    <form onSubmit={save} className="grid lg:grid-cols-3 gap-6 items-start">
      <Card title="Contact & business" className="lg:col-span-2">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name" error={bind('fullName').error}><Input {...bind('fullName')} /></Field>
          <Field label="Partner type"><Select value={v.partnerType} onChange={(e) => set('partnerType', e.target.value)}>{settings?.partnerTypes.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}</Select></Field>
          <Field label="Email" error={bind('email').error}><Input {...bind('email')} /></Field>
          <Field label="Mobile" error={bind('mobile').error}><Input {...bind('mobile')} /></Field>
          <Field label="WhatsApp" error={bind('whatsapp').error}><Input {...bind('whatsapp')} /></Field>
          <Field label="Business name"><Input {...bind('businessName')} /></Field>
          <Field label="Entity type"><Input {...bind('entityType')} /></Field>
          <Field label="GSTIN" error={bind('gstin').error}><Input {...bind('gstin')} /></Field>
          <Field label="Address" className="sm:col-span-2"><Input {...bind('addressLine1')} /></Field>
          <Field label="City" error={bind('city').error}><Input {...bind('city')} /></Field>
          <Field label="State"><Select value={v.state} onChange={(e) => set('state', e.target.value)}>{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <Field label="PIN code" error={bind('pincode').error}><Input {...bind('pincode')} /></Field>
          <Field label="Website"><Input {...bind('website')} /></Field>
          <Field label="Qualification"><Input {...bind('qualification')} /></Field>
          <Field label="Membership no."><Input {...bind('membershipNumber')} /></Field>
          <Field label="Experience (years)"><Input {...bind('experienceYears')} /></Field>
          <Field label="Existing client base"><Input {...bind('existingClientBase')} /></Field>
          <Field label="Areas served" className="sm:col-span-2"><Input {...bind('areasServed')} /></Field>
          <Field label="Software experience" className="sm:col-span-2"><Input {...bind('softwareExperience')} /></Field>
        </div>
      </Card>
      <div className="space-y-6">
        <Card title="Internal">
          <div className="space-y-4">
            <Field label="Tier / label"><Input {...bind('tier')} /></Field>
            <Field label="Expected customers / month"><Input {...bind('expectedMonthlyCustomers')} /></Field>
            <Field label="Admin notes" hint="Never shown to the partner"><Textarea rows={5} {...bind('adminNotes')} /></Field>
            <Button type="submit" loading={busy} className="w-full">Save profile</Button>
          </div>
        </Card>
        <Card title="Login">
          <Dl cols={2} items={[['Last login', dateTime(p.lastLoginAt)], ['Created', date(p.createdAt)], ['Approved', date(p.approvedAt)]]} />
          <Button variant="outline" icon={KeyRound} className="mt-4 w-full" onClick={() => run(() => adminApi.post(`/admin/partners/${p.id}/reset-password`)).then((r) => r && setPw(r.temporaryPassword))}>Reset password</Button>
          {pw && <Alert tone="blue" className="mt-3">Temporary password: <b className="font-mono">{pw}</b> — shown once. The partner must change it after logging in.</Alert>}
        </Card>
      </div>
    </form>
  );
}

function Kyc({ d, onDone }) {
  const p = d.partner;
  const [run, busy] = useAction();
  const [revealed, setRevealed] = useState(null);
  const [reject, setReject] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [upload, setUpload] = useState({ type: d.documentTypes[0]?.key, file: null });
  const { values: k, bind } = useForm({ pan: '', nameOnPan: p.pan.name || '', accountHolder: p.bank.holder || p.fullName, accountNumber: '', ifsc: p.bank.ifsc || '', bankName: p.bank.bankName || '', branch: p.bank.branch || '', bankVerified: true });
  const label = (t) => d.documentTypes.find((x) => x.key === t)?.label || t;

  const openDoc = async (doc) => {
    const w = window.open('', '_blank');
    const blob = await adminApi.blob(`/admin/partners/${p.id}/documents/${doc.id}/file`);
    const url = URL.createObjectURL(blob);
    if (w) w.location.href = url; else window.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };
  const setDoc = (doc, status, rem) => run(() => adminApi.put(`/admin/partners/${p.id}/documents/${doc.id}`, { status, remarks: rem }), { success: `Document ${status}` }).then((r) => { if (r) { setReject(null); setRemarks(''); onDone(); } });
  const saveKyc = (e) => { e.preventDefault(); run(() => adminApi.put(`/admin/partners/${p.id}/kyc`, { ...k, pan: k.pan || undefined, accountNumber: k.accountNumber || undefined }), { success: 'KYC updated' }).then((r) => r && onDone()); };
  const uploadDoc = () => { const fd = new FormData(); fd.append(upload.type, upload.file); run(() => adminApi.post(`/admin/partners/${p.id}/documents`, fd), { success: 'Uploaded' }).then((r) => { if (r) { setUpload((s) => ({ ...s, file: null })); onDone(); } }); };
  const required = useMemo(() => new Set(d.documentTypes.filter((t) => t.required || (t.requiredIfGstin && p.gstin)).map((t) => t.key)), [d.documentTypes, p.gstin]);
  const missing = [...required].filter((t) => !d.documents.some((x) => x.doc_type === t));

  return (
    <div className="grid lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-2 space-y-6">
        <Card title="Documents" subtitle={`${d.documentSummary.verified}/${d.documentSummary.required} required verified`} padded={false}>
          {missing.length > 0 && <div className="p-4 pb-0"><Alert tone="amber">Missing: {missing.map(label).join(', ')}</Alert></div>}
          <Table head={['Document', 'Uploaded', 'Status', '']} empty={d.documents.length === 0 && <Empty title="No documents uploaded" />}>
            {d.documents.map((doc) => (
              <tr key={doc.id}>
                <Td><div className="font-medium text-slate-900">{label(doc.doc_type)}{required.has(doc.doc_type) && <span className="text-red-500"> *</span>}</div><div className="text-xs text-slate-500 truncate max-w-[220px]">{doc.original_name} · {Math.round(doc.size / 1024)} KB</div></Td>
                <Td className="text-xs text-slate-500 whitespace-nowrap">{dateTime(doc.uploaded_at)}<div>{doc.uploaded_by}</div></Td>
                <Td><Badge status={doc.status} />{doc.remarks && <div className="text-xs text-slate-500 mt-1 max-w-[200px]">{doc.remarks}</div>}{doc.verified_by && <div className="text-xs text-slate-400 mt-0.5">{doc.verified_by.replace('admin:', '')}</div>}</Td>
                <Td className="whitespace-nowrap text-right">
                  <Button size="xs" variant="ghost" icon={ExternalLink} onClick={() => openDoc(doc)}>View</Button>
                  {doc.status !== 'verified' && <Button size="xs" variant="ghost" icon={Check} onClick={() => setDoc(doc, 'verified')}>Verify</Button>}
                  {doc.status !== 'rejected' && <Button size="xs" variant="danger-ghost" icon={X} onClick={() => setReject(doc)}>Reject</Button>}
                </Td>
              </tr>
            ))}
          </Table>
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2 sm:items-end">
            <Field label="Upload on partner's behalf" className="flex-1"><Select value={upload.type} onChange={(e) => setUpload((s) => ({ ...s, type: e.target.value }))}>{d.documentTypes.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}</Select></Field>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="text-sm flex-1" onChange={(e) => setUpload((s) => ({ ...s, file: e.target.files?.[0] }))} />
            <Button icon={Upload} variant="outline" disabled={!upload.file} loading={busy} onClick={uploadDoc}>Upload</Button>
          </div>
        </Card>
        {d.bankRequest && (
          <Card title="Bank account change requested">
            <Dl items={[['Holder', d.bankRequest.holder], ['Account', <span className="font-mono">{revealed?.pendingAccountNumber || `••••••${d.bankRequest.last4}`}</span>], ['IFSC', d.bankRequest.ifsc], ['Bank', `${d.bankRequest.bank_name || ''} ${d.bankRequest.branch || ''}`], ['Requested', dateTime(d.bankRequest.created_at)]]} />
            <p className="text-xs text-slate-500 mt-3">Check the uploaded bank proof in Documents before approving. Payouts switch to the new account once approved.</p>
            <div className="flex gap-2 mt-4">
              <Button variant="success" size="sm" loading={busy} onClick={() => run(() => adminApi.put(`/admin/partners/${p.id}/bank-request`, { action: 'approve' }), { success: 'Bank account updated' }).then((r) => r && onDone())}>Approve change</Button>
              <Button variant="outline" size="sm" loading={busy} onClick={() => run(() => adminApi.put(`/admin/partners/${p.id}/bank-request`, { action: 'reject' }), { success: 'Change rejected' }).then((r) => r && onDone())}>Reject</Button>
            </div>
          </Card>
        )}
      </div>
      <div className="space-y-6">
        <Card title="PAN & bank" action={!revealed && <Button size="xs" variant="outline" icon={Eye} onClick={() => run(() => adminApi.get(`/admin/partners/${p.id}/sensitive`)).then((r) => r && setRevealed(r))}>Reveal (logged)</Button>}>
          <Dl items={[
            ['PAN', <span className="font-mono">{revealed?.pan || p.pan.masked || '—'}</span>], ['Name on PAN', p.pan.name],
            ['Holder', p.bank.holder], ['Account', <span className="font-mono">{revealed?.accountNumber || p.bank.accountMasked || '—'}</span>],
            ['IFSC', p.bank.ifsc], ['Bank', p.bank.bankName && `${p.bank.bankName}${p.bank.branch ? ` · ${p.bank.branch}` : ''}`],
            ['Status', <Badge status={p.bank.verified ? 'verified' : 'pending'}>{p.bank.verified ? 'Verified' : 'Not verified'}</Badge>]
          ]} />
          {p.bank.accountMasked && (
            <Toggle checked={p.bank.verified} label="Bank account verified" onChange={(val) => run(() => adminApi.put(`/admin/partners/${p.id}/kyc`, { bankVerified: val }), { success: 'Saved' }).then((r) => r && onDone())} />
          )}
        </Card>
        <Card title="Update PAN / bank">
          <form onSubmit={saveKyc} className="space-y-3">
            <Field label="New PAN"><Input maxLength={10} autoComplete="off" {...bind('pan', (x) => x.toUpperCase())} /></Field>
            <Field label="Name on PAN"><Input {...bind('nameOnPan')} /></Field>
            <Field label="Account holder"><Input {...bind('accountHolder')} /></Field>
            <Field label="New account number"><Input inputMode="numeric" autoComplete="off" {...bind('accountNumber', (x) => x.replace(/\D/g, ''))} /></Field>
            <div className="grid grid-cols-2 gap-3"><Field label="IFSC"><Input {...bind('ifsc', (x) => x.toUpperCase())} /></Field><Field label="Bank"><Input {...bind('bankName')} /></Field></div>
            <Button type="submit" variant="outline" loading={busy} disabled={!k.pan && !k.accountNumber} className="w-full">Save</Button>
          </form>
        </Card>
      </div>
      <Modal open={!!reject} title={`Reject ${reject ? label(reject.doc_type) : ''}`} onClose={() => setReject(null)}
        footer={<><Button variant="outline" onClick={() => setReject(null)}>Cancel</Button><Button variant="danger" loading={busy} onClick={() => setDoc(reject, 'rejected', remarks)}>Reject document</Button></>}>
        <Field label="What should the partner fix?" required><Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g. Image is blurred; upload a clear scan" /></Field>
      </Modal>
    </div>
  );
}

function Products({ d, onDone }) {
  const p = d.partner;
  const [run, busy] = useAction();
  const [defaults, setDefaults] = useState({ c: p.defaultCommissionPct ?? '', r: p.defaultRenewalPct ?? '' });
  const [rows, setRows] = useState(() => d.products.map((x) => ({ ...x, commissionPct: x.commissionPct ?? '', renewalPct: x.renewalPct ?? '' })));
  useEffect(() => { setRows(d.products.map((x) => ({ ...x, commissionPct: x.commissionPct ?? '', renewalPct: x.renewalPct ?? '' }))); }, [d.products]);
  const upd = (i, patch) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const save = () => run(() => adminApi.put(`/admin/partners/${p.id}/products`, { items: rows.map((r) => ({ productId: r.productId, assigned: r.assigned, enabled: r.enabled, commissionPct: r.commissionPct, renewalPct: r.renewalPct, demo: r.demo })) }), { success: 'Product access saved' }).then((r) => r && onDone());
  return (
    <div className="space-y-6">
      <Card title="Partner-wide commission" subtitle="Overrides each product's default for this partner. Leave blank to use product defaults.">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="New sale %"><Input type="number" min={0} max={100} step="0.01" className="w-32" value={defaults.c} onChange={(e) => setDefaults({ ...defaults, c: e.target.value })} /></Field>
          <Field label="Renewal %"><Input type="number" min={0} max={100} step="0.01" className="w-32" value={defaults.r} onChange={(e) => setDefaults({ ...defaults, r: e.target.value })} /></Field>
          <Button variant="outline" loading={busy} onClick={() => run(() => adminApi.put(`/admin/partners/${p.id}/commission`, { defaultCommissionPct: defaults.c, defaultRenewalPct: defaults.r }), { success: 'Saved' }).then((r) => r && onDone())}>Save</Button>
        </div>
        <p className="text-xs text-slate-500 mt-3">Order of precedence: service-specific rate → partner × product → partner-wide → product default → programme default. Changes apply to orders approved from now on.</p>
      </Card>
      <Card title="Product access" padded={false} action={<Button size="sm" loading={busy} onClick={save}>Save access</Button>}>
        <Table head={['Product', 'Access', 'New sale % override', 'Renewal % override', 'Effective now', 'Demo login']}>
          {rows.map((r, i) => (
            <tr key={r.productId} className={r.assigned ? '' : 'opacity-60'}>
              <Td><div className="font-medium text-slate-900">{r.name}</div><div className="text-xs text-slate-500">default {pct(r.productDefaults.commissionPct)} / {pct(r.productDefaults.renewalPct)} {r.status !== 'active' && <Badge status={r.status} />}</div></Td>
              <Td>
                <div className="space-y-1.5">
                  <Toggle checked={r.assigned} onChange={(v) => upd(i, { assigned: v, enabled: v })} label="Assigned" />
                  {r.assigned && <Toggle checked={r.enabled} onChange={(v) => upd(i, { enabled: v })} label="Can sell" />}
                </div>
              </Td>
              <Td><Input type="number" min={0} max={100} step="0.01" className="w-24" placeholder="inherit" disabled={!r.assigned} value={r.commissionPct} onChange={(e) => upd(i, { commissionPct: e.target.value })} /></Td>
              <Td><Input type="number" min={0} max={100} step="0.01" className="w-24" placeholder="inherit" disabled={!r.assigned} value={r.renewalPct} onChange={(e) => upd(i, { renewalPct: e.target.value })} /></Td>
              <Td className="text-xs"><div className="text-sm font-medium tabular">{pct(r.effective.commissionPct)} / {pct(r.effective.renewalPct)}</div><div className="text-slate-500">from {SOURCE[r.effective.commissionSource]}</div></Td>
              <Td>
                {r.assigned && (
                  <div className="space-y-1 w-48">
                    <Input className="h-8" placeholder="Demo URL" value={r.demo.url} onChange={(e) => upd(i, { demo: { ...r.demo, url: e.target.value } })} />
                    <div className="flex gap-1"><Input className="h-8" placeholder="User" value={r.demo.username} onChange={(e) => upd(i, { demo: { ...r.demo, username: e.target.value } })} /><Input className="h-8" placeholder="Pass" value={r.demo.password} onChange={(e) => upd(i, { demo: { ...r.demo, password: e.target.value } })} /></div>
                  </div>
                )}
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

function Pricing({ d, onDone }) {
  const p = d.partner;
  const [run, busy] = useAction();
  const products = d.products.filter((x) => x.assigned);
  const [f, setF] = useState({ productId: products[0]?.productId || '', target: '', price: '', validUntil: '', note: '' });
  const prod = products.find((x) => x.productId === f.productId);
  const options = prod ? [...prod.plans.map((x) => ({ key: `plan:${x.id}`, label: `Plan · ${x.name}`, price: Number(x.price), floor: x.min_partner_price })), ...prod.services.map((x) => ({ key: `service:${x.id}`, label: `Service · ${x.name}`, price: Number(x.price) }))] : [];
  const target = options.find((o) => o.key === f.target);
  const names = useMemo(() => {
    const m = {};
    d.products.forEach((x) => { x.plans.forEach((pl) => { m[pl.id] = { product: x.name, name: pl.name, price: Number(pl.price) }; }); x.services.forEach((s) => { m[s.id] = { product: x.name, name: s.name, price: Number(s.price) }; }); });
    return m;
  }, [d.products]);
  const add = () => {
    const [kind, id] = f.target.split(':');
    run(() => adminApi.post(`/admin/partners/${p.id}/prices`, { [kind === 'plan' ? 'planId' : 'serviceId']: id, price: f.price, validUntil: f.validUntil, note: f.note }), { success: 'Special price saved' })
      .then((r) => { if (r) { setF((s) => ({ ...s, price: '', note: '', validUntil: '' })); onDone(); } });
  };
  return (
    <div className="grid lg:grid-cols-3 gap-6 items-start">
      <Card title="Negotiated prices" className="lg:col-span-2" padded={false} subtitle="Customers of this partner are quoted these prices instead of the list price. Commission is calculated on the price actually charged.">
        <Table head={['Product · item', 'List', 'Special price', 'Valid until', 'Note', '']} empty={d.prices.length === 0 && <Empty title="No negotiated prices">This partner sells at list prices.</Empty>}>
          {d.prices.map((x) => {
            const n = names[x.plan_id || x.service_id] || {};
            const diff = n.price ? Math.round(((Number(x.price) - n.price) / n.price) * 100) : 0;
            return (
              <tr key={x.id}>
                <Td><div className="font-medium">{n.name}</div><div className="text-xs text-slate-500">{n.product} · {x.plan_id ? 'plan' : 'service'}</div></Td>
                <Td className="tabular text-slate-500">{inr(n.price)}</Td>
                <Td className="tabular font-medium">{inr(x.price)} <span className="text-xs text-slate-500">({diff > 0 ? '+' : ''}{diff}%)</span></Td>
                <Td className="text-xs">{x.valid_until ? date(x.valid_until) : 'No expiry'}</Td>
                <Td className="text-xs text-slate-600">{x.note}</Td>
                <Td><Button size="xs" variant="danger-ghost" icon={Trash2} onClick={() => run(() => adminApi.del(`/admin/partners/${p.id}/prices/${x.id}`), { success: 'Removed' }).then(() => onDone())}>Remove</Button></Td>
              </tr>
            );
          })}
        </Table>
      </Card>
      <Card title="Add / replace a special price">
        {products.length === 0 ? <p className="text-sm text-slate-500">Assign a product first.</p> : (
          <div className="space-y-3">
            <Field label="Product"><Select value={f.productId} onChange={(e) => setF({ ...f, productId: e.target.value, target: '' })}>{products.map((x) => <option key={x.productId} value={x.productId}>{x.name}</option>)}</Select></Field>
            <Field label="Plan or service"><Select value={f.target} onChange={(e) => setF({ ...f, target: e.target.value })}><option value="">Select</option>{options.map((o) => <option key={o.key} value={o.key}>{o.label} — {inr(o.price)}</option>)}</Select></Field>
            <Field label="Special price (₹, excl. GST)" hint={target?.floor ? `Minimum allowed ${inr(target.floor)}` : undefined}><Input type="number" min={0} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></Field>
            <Field label="Valid until" hint="Optional"><Input type="date" value={f.validUntil} onChange={(e) => setF({ ...f, validUntil: e.target.value })} /></Field>
            <Field label="Note"><Input value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="e.g. 10+ licences per quarter" /></Field>
            <Button className="w-full" loading={busy} disabled={!f.target || f.price === ''} onClick={add}>Save price</Button>
          </div>
        )}
      </Card>
    </div>
  );
}

const PERMS = [
  ['addCustomers', 'Add customers & orders', 'Register customers and submit product orders'],
  ['requestInstallations', 'Request installations', 'Raise installation requests for their customers'],
  ['requestWithdrawals', 'Request withdrawals', 'Withdraw available commission to their bank'],
  ['viewPricing', 'See list prices', 'Show catalogue list prices next to their special prices'],
  ['viewDemoAccess', 'See demo logins', 'Show demo URLs and credentials you set per product']
];
function Permissions({ p, onDone }) {
  const [run] = useAction();
  const [perm, setPerm] = useState(p.permissions);
  const flip = (k, val) => { setPerm((s) => ({ ...s, [k]: val })); run(() => adminApi.put(`/admin/partners/${p.id}/permissions`, { [k]: val }), { success: 'Permission updated' }).then((r) => (r ? onDone() : setPerm((s) => ({ ...s, [k]: !val })))); };
  return (
    <Card title="What this partner can do" subtitle="Account status controls login; these control individual features.">
      <ul className="divide-y divide-slate-100 -my-2">
        {PERMS.map(([k, label, desc]) => (
          <li key={k} className="py-3 flex items-center justify-between gap-4">
            <div><div className="font-medium text-slate-900 text-sm">{label}</div><div className="text-xs text-slate-500">{desc}</div></div>
            <Toggle checked={!!perm[k]} onChange={(v) => flip(k, v)} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Orders({ partnerId }) {
  const { data } = useQuery({ queryKey: ['admin', 'orders', { partnerId }], queryFn: () => adminApi.get(`/admin/orders${qs({ partnerId, limit: 100 })}`) });
  if (!data) return <Loading />;
  return (
    <Card padded={false} title="Customer orders" action={<Link to={`/admin/orders?partnerId=${partnerId}`} className="text-sm text-brand-600">Manage →</Link>}>
      <Table head={['Order', 'Customer', 'Product', 'Value', 'Status', 'Installation', 'Subscription']} empty={data.rows.length === 0 && <Empty title="No customers yet" />}>
        {data.rows.map((o) => (
          <tr key={o.id}>
            <Td className="font-mono text-xs">{o.reference}<div className="text-slate-400 font-sans">{date(o.created_at)}</div></Td>
            <Td><div className="font-medium">{o.business_name}</div><div className="text-xs text-slate-500">{o.contact_name} · {o.customer_mobile}</div></Td>
            <Td>{o.product_name}<div className="text-xs text-slate-500">{o.plan_name}</div></Td>
            <Td className="tabular">{inr(o.sale_amount)}</Td>
            <Td><Badge status={o.status} /></Td>
            <Td>{o.installation_status ? <Badge status={o.installation_status} /> : '—'}</Td>
            <Td className="text-xs">{o.subscription_status ? <><Badge status={o.subscription_status} /><div className="mt-1">to {date(o.end_date)}</div></> : '—'}</Td>
          </tr>
        ))}
      </Table>
    </Card>
  );
}

function Earnings({ partnerId, balance, onDone }) {
  const { data, refetch } = useQuery({ queryKey: ['admin', 'partner', partnerId, 'commissions'], queryFn: () => adminApi.get(`/admin/partners/${partnerId}/commissions`) });
  const [run, busy] = useAction();
  const [adj, setAdj] = useState({ amount: '', description: '' });
  const add = () => run(() => adminApi.post(`/admin/partners/${partnerId}/adjustments`, adj), { success: 'Adjustment recorded' }).then((r) => { if (r) { setAdj({ amount: '', description: '' }); refetch(); onDone(); } });
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total earned" value={balance.totalEarned} money />
        <Stat label="Available" value={balance.available} money tone="green" />
        <Stat label="In withdrawal" value={balance.inProcess} money tone="amber" />
        <Stat label="Paid (net)" value={balance.paidNet} money tone="slate" hint={`TDS ${inr(balance.tdsDeducted)}`} />
      </div>
      <Card title="Manual adjustment" subtitle="Bonus (positive) or recovery (negative). Shown to the partner in their ledger.">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <Field label="Amount (₹)"><Input type="number" className="sm:w-40" value={adj.amount} onChange={(e) => setAdj({ ...adj, amount: e.target.value })} /></Field>
          <Field label="Description" className="flex-1"><Input value={adj.description} onChange={(e) => setAdj({ ...adj, description: e.target.value })} placeholder="e.g. Diwali bonus 2026" /></Field>
          <Button loading={busy} disabled={!adj.amount || !adj.description} onClick={add}>Add entry</Button>
        </div>
      </Card>
      <Card title="Commission ledger" padded={false}>
        {!data ? <div className="p-4"><Loading /></div> : (
          <Table head={['Date', 'Type', 'Details', 'Base', 'Rate', 'Amount', 'By']} empty={data.length === 0 && <Empty title="No entries yet" />}>
            {data.map((l) => (
              <tr key={l.id}>
                <Td className="whitespace-nowrap">{date(l.created_at)}</Td><Td><Badge status={l.type} /></Td>
                <Td><div>{l.description}</div>{l.customer_name && <div className="text-xs text-slate-500">{l.customer_name} · {l.product_name}</div>}</Td>
                <Td className="tabular">{Number(l.base_amount) ? inr(l.base_amount) : '—'}</Td><Td>{Number(l.pct) ? pct(l.pct) : '—'}</Td>
                <Td className="font-medium"><Money value={l.amount} /></Td><Td className="text-xs text-slate-500">{l.created_by.replace('admin:', '')}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

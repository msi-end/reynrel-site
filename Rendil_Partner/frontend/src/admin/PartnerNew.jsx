import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Copy } from 'lucide-react';
import { adminApi } from '../lib/api';
import { INDIAN_STATES } from '../lib/format';
import { Card, PageHeader, Field, Input, Select, Textarea, Button, Checkbox, Alert, Modal, useForm, useAction } from '../components/ui';
import { useSettings, useProducts } from './useConfig';

const up = (v) => v.toUpperCase().replace(/\s/g, '');
const digits = (v) => v.replace(/[^0-9]/g, '');

export default function PartnerNew() {
  const settings = useSettings();
  const products = useProducts();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [run, busy] = useAction();
  const [created, setCreated] = useState(null);
  const [files, setFiles] = useState({});
  const { values: v, set, bind, setErrors } = useForm({
    fullName: '', email: '', mobile: '', partnerType: 'gst_consultant', businessName: '', entityType: '', gstin: '', city: '', state: 'Assam', pincode: '', addressLine1: '',
    pan: '', nameOnPan: '', accountHolder: '', accountNumber: '', ifsc: '', bankName: '', bankVerified: false,
    status: 'approved', defaultCommissionPct: '', defaultRenewalPct: '', tier: '', adminNotes: '', productIds: [], password: ''
  });

  const submit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('data', JSON.stringify({ ...v, accountNumberConfirm: v.accountNumber }));
    Object.entries(files).forEach(([k, f]) => f && fd.append(k, f));
    run(() => adminApi.post('/admin/partners', fd), { onFieldErrors: setErrors }).then((r) => {
      if (!r) return;
      qc.invalidateQueries({ queryKey: ['admin'] });
      setCreated(r);
    });
  };
  const toggleProduct = (id) => set('productIds', v.productIds.includes(id) ? v.productIds.filter((x) => x !== id) : [...v.productIds, id]);

  return (
    <>
      <PageHeader title="Add partner" subtitle="Create a partner account directly. They get a temporary password and must change it on first login."
        back={<Link to="/admin/partners" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-1"><ArrowLeft size={14} />Partners</Link>} />
      <form onSubmit={submit} className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Contact & business">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name" required error={bind('fullName').error}><Input {...bind('fullName')} /></Field>
              <Field label="Partner type" required>
                <Select value={v.partnerType} onChange={(e) => set('partnerType', e.target.value)}>{settings.data?.partnerTypes.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}</Select>
              </Field>
              <Field label="Email" required error={bind('email').error}><Input type="email" {...bind('email')} /></Field>
              <Field label="Mobile" required error={bind('mobile').error}><Input inputMode="numeric" maxLength={10} {...bind('mobile', digits)} /></Field>
              <Field label="Business name"><Input {...bind('businessName')} /></Field>
              <Field label="GSTIN" error={bind('gstin').error}><Input maxLength={15} {...bind('gstin', up)} /></Field>
              <Field label="Address" className="sm:col-span-2"><Input {...bind('addressLine1')} /></Field>
              <Field label="City" required error={bind('city').error}><Input {...bind('city')} /></Field>
              <Field label="State" required><Select value={v.state} onChange={(e) => set('state', e.target.value)}>{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
              <Field label="PIN code" error={bind('pincode').error}><Input maxLength={6} {...bind('pincode', digits)} /></Field>
            </div>
          </Card>
          <Card title="PAN & bank (optional now — can be added later)">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="PAN" error={bind('pan').error}><Input maxLength={10} {...bind('pan', up)} autoComplete="off" /></Field>
              <Field label="Name on PAN"><Input {...bind('nameOnPan')} /></Field>
              <Field label="Account holder"><Input {...bind('accountHolder')} /></Field>
              <Field label="Account number" error={bind('accountNumber').error}><Input inputMode="numeric" {...bind('accountNumber', digits)} autoComplete="off" /></Field>
              <Field label="IFSC" error={bind('ifsc').error}><Input maxLength={11} {...bind('ifsc', up)} /></Field>
              <Field label="Bank name"><Input {...bind('bankName')} /></Field>
            </div>
            <Checkbox className="mt-4" checked={v.bankVerified} onChange={(e) => set('bankVerified', e.target.checked)} label="I have verified this bank account (payouts allowed)" />
          </Card>
          <Card title="Documents (optional)">
            <div className="grid sm:grid-cols-2 gap-3">
              {settings.data?.documentTypes.map((d) => (
                <Field key={d.key} label={d.label}>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm"
                    onChange={(e) => setFiles((s) => ({ ...s, [d.key]: e.target.files?.[0] }))} />
                </Field>
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-6 lg:sticky lg:top-6">
          <Card title="Access & commission">
            <div className="space-y-4">
              <Field label="Account status">
                <Select value={v.status} onChange={(e) => set('status', e.target.value)}><option value="approved">Active — can log in now</option><option value="pending">Pending review</option></Select>
              </Field>
              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">Products</div>
                <div className="space-y-2">
                  {products.data?.map((p) => <Checkbox key={p.id} checked={v.productIds.includes(p.id)} onChange={() => toggleProduct(p.id)} label={<>{p.name} {p.status !== 'active' && <span className="text-xs text-slate-400">({p.status})</span>}</>} />)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Commission %" hint="Blank = product default"><Input type="number" min={0} max={100} step="0.01" {...bind('defaultCommissionPct')} /></Field>
                <Field label="Renewal %" hint="Blank = product default"><Input type="number" min={0} max={100} step="0.01" {...bind('defaultRenewalPct')} /></Field>
              </div>
              <Field label="Tier / label"><Input placeholder="e.g. Gold" {...bind('tier')} /></Field>
              <Field label="Internal notes"><Textarea {...bind('adminNotes')} /></Field>
              <Button type="submit" loading={busy} className="w-full">Create partner</Button>
            </div>
          </Card>
        </div>
      </form>
      <Modal open={!!created} title="Partner created" onClose={() => navigate(`/admin/partners/${created.id}`)}
        footer={<Button onClick={() => navigate(`/admin/partners/${created.id}`)}>Open partner</Button>}>
        {created && (
          <div className="space-y-3 text-sm">
            <p>Partner ID <b className="font-mono">{created.code}</b>. Share these login details securely — the password is shown only once.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 font-mono text-sm flex items-center justify-between gap-2">
              <span>{v.email} / {created.temporaryPassword}</span>
              <Button size="xs" variant="ghost" icon={Copy} onClick={() => navigator.clipboard?.writeText(`${v.email} / ${created.temporaryPassword}`)}>Copy</Button>
            </div>
            <Alert tone="blue">They will be asked to set their own password after logging in.</Alert>
          </div>
        )}
      </Modal>
    </>
  );
}

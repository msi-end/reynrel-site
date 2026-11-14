import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PartnerAuth } from '../auth';
import { partnerApi } from '../lib/api';
import { date, INDIAN_STATES } from '../lib/format';
import { Card, PageHeader, Field, Input, Select, Button, Alert, Badge, Dl, Toggle, useForm, useAction } from '../components/ui';

export default function Profile() {
  const { user: me, refresh, signIn } = PartnerAuth.useAuth();
  const [run, busy] = useAction();
  const { values: v, set, bind, errors, setErrors } = useForm({
    fullName: me.fullName, email: me.email, mobile: me.mobile, whatsapp: me.whatsapp || '', businessName: me.businessName || '', gstin: me.gstin || '', website: me.website || '',
    addressLine1: me.address.line1 || '', addressLine2: me.address.line2 || '', city: me.address.city || '', district: me.address.district || '', state: me.address.state || '', pincode: me.address.pincode || '',
    qualification: me.profile.qualification || '', experienceYears: me.profile.experienceYears || '', teamSize: me.profile.teamSize || '', areasServed: me.profile.areasServed || ''
  });
  const save = (e) => { e.preventDefault(); run(() => partnerApi.put('/partner/profile', v), { success: 'Profile saved', onFieldErrors: setErrors }).then((r) => r && refresh()); };
  return (
    <>
      <PageHeader title="Profile" subtitle={<>Partner ID <span className="font-mono">{me.code}</span> · approved {date(me.approvedAt)}</>} />
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <form onSubmit={save} className="lg:col-span-2">
          <Card title="Personal & business details">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name" error={errors.fullName}><Input {...bind('fullName')} /></Field>
              <Field label="Business name"><Input {...bind('businessName')} /></Field>
              <Field label="Email" error={errors.email}><Input type="email" {...bind('email')} /></Field>
              <Field label="Mobile" error={errors.mobile}><Input maxLength={10} {...bind('mobile')} /></Field>
              <Field label="WhatsApp" error={errors.whatsapp}><Input maxLength={10} {...bind('whatsapp')} /></Field>
              <Field label="GSTIN" error={errors.gstin}><Input maxLength={15} {...bind('gstin', (x) => x.toUpperCase())} /></Field>
              <Field label="Address" className="sm:col-span-2"><Input {...bind('addressLine1')} /></Field>
              <Field label="City"><Input {...bind('city')} /></Field>
              <Field label="State"><Select value={v.state} onChange={(e) => set('state', e.target.value)}>{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
              <Field label="PIN code" error={errors.pincode}><Input maxLength={6} {...bind('pincode')} /></Field>
              <Field label="Website"><Input {...bind('website')} /></Field>
              <Field label="Qualification"><Input {...bind('qualification')} /></Field>
              <Field label="Experience (years)"><Input {...bind('experienceYears')} /></Field>
              <Field label="Areas served" className="sm:col-span-2"><Input {...bind('areasServed')} /></Field>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs text-slate-500">PAN {me.pan.masked} ({me.pan.name}) can only be changed by Reynrel.</p>
              <Button type="submit" loading={busy}>Save profile</Button>
            </div>
          </Card>
        </form>
        <div className="space-y-6">
          <BankCard me={me} />
          <PasswordCard onChanged={signIn} />
          <Card title="Your permissions">
            <ul className="space-y-2 text-sm">
              {[['addCustomers', 'Add customers'], ['requestInstallations', 'Request installations'], ['requestWithdrawals', 'Request withdrawals']].map(([k, l]) => (
                <li key={k} className="flex justify-between"><span>{l}</span><Badge status={me.permissions[k] ? 'active' : 'suspended'}>{me.permissions[k] ? 'Enabled' : 'Disabled'}</Badge></li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}

function BankCard({ me }) {
  const { data: pending, refetch } = useQuery({ queryKey: ['partner', 'bank-change'], queryFn: () => partnerApi.get('/partner/bank-change') });
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [run, busy] = useAction();
  const { values: v, bind, errors, setErrors } = useForm({ accountHolder: me.bank.holder || me.fullName, accountNumber: '', accountNumberConfirm: '', ifsc: '', bankName: '', branch: '', accountType: 'savings', password: '' });
  const submit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(v).forEach(([k, x]) => fd.append(k, x));
    if (file) fd.append('bank_proof', file);
    run(() => partnerApi.post('/partner/bank-change', fd), { success: 'Submitted for verification', onFieldErrors: setErrors }).then((r) => { if (r) { setOpen(false); refetch(); qc.invalidateQueries({ queryKey: ['partner', 'withdrawals'] }); } });
  };
  return (
    <Card title="Bank account">
      <Dl items={[['Name', me.bank.holder], ['Account', <span className="font-mono">{me.bank.accountMasked || '—'}</span>], ['IFSC', me.bank.ifsc], ['Bank', me.bank.bankName], ['Status', <Badge status={me.bank.verified ? 'verified' : 'pending'}>{me.bank.verified ? 'Verified' : 'Not verified'}</Badge>]]} />
      {pending ? <Alert tone="amber" className="mt-4">Change to {pending.bank_name} ••{pending.last4} requested {date(pending.created_at)} — awaiting verification.</Alert> : (
        <div className="mt-4"><Toggle checked={open} onChange={setOpen} label="Change bank account" /></div>
      )}
      {open && !pending && (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <p className="text-xs text-slate-500">For your security, a new account is used only after Reynrel verifies it.</p>
          <Field label="Account holder" error={errors.accountHolder}><Input {...bind('accountHolder')} /></Field>
          <Field label="Account number" error={errors.accountNumber}><Input type="password" inputMode="numeric" autoComplete="off" {...bind('accountNumber', (x) => x.replace(/\D/g, ''))} /></Field>
          <Field label="Confirm account number" error={errors.accountNumberConfirm}><Input inputMode="numeric" autoComplete="off" {...bind('accountNumberConfirm', (x) => x.replace(/\D/g, ''))} /></Field>
          <div className="grid grid-cols-2 gap-3"><Field label="IFSC" error={errors.ifsc}><Input maxLength={11} {...bind('ifsc', (x) => x.toUpperCase())} /></Field><Field label="Bank" error={errors.bankName}><Input {...bind('bankName')} /></Field></div>
          <Field label="Cancelled cheque / passbook" error={errors.bank_proof}><input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="text-sm" onChange={(e) => setFile(e.target.files?.[0])} /></Field>
          <Field label="Your password" error={errors.password}><Input type="password" autoComplete="current-password" {...bind('password')} /></Field>
          <Button type="submit" variant="dark" loading={busy} className="w-full">Submit for verification</Button>
        </form>
      )}
    </Card>
  );
}

function PasswordCard({ onChanged }) {
  const [run, busy] = useAction();
  const [f, setF] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [err, setErr] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (f.newPassword !== f.confirm) return setErr('New passwords do not match');
    setErr('');
    return run(() => partnerApi.put('/auth/partner/password', f), { success: 'Password changed' }).then((r) => { if (r) { setF({ currentPassword: '', newPassword: '', confirm: '' }); onChanged(r.token); } });
  };
  return (
    <Card title="Change password">
      <form onSubmit={submit} className="space-y-3">
        {err && <Alert>{err}</Alert>}
        <Field label="Current password"><Input type="password" autoComplete="current-password" value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} /></Field>
        <Field label="New password"><Input type="password" autoComplete="new-password" value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} /></Field>
        <Field label="Confirm new password"><Input type="password" autoComplete="new-password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} /></Field>
        <Button type="submit" variant="outline" loading={busy} className="w-full">Update password</Button>
      </form>
    </Card>
  );
}

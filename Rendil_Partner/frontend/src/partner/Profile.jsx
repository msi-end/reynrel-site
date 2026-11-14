import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PartnerAuth } from '../auth';
import { partnerApi } from '../lib/api';
import { date, INDIAN_STATES } from '../lib/format';
import { Card, PageHeader, Field, Input, Select, Button, Alert, Badge, Dl, useForm, useAction } from '../components/ui';

export default function Profile() {
  const { user: me, refresh, signIn } = PartnerAuth.useAuth();
  const [run, busy] = useAction();
  const { values: v, set, bind, errors, setErrors } = useForm({
    fullName: me.fullName, email: me.email, mobile: me.mobile, whatsapp: me.whatsapp || '', businessName: me.businessName || '', gstin: me.gstin || '', website: me.website || '',
    addressLine1: me.address.line1 || '', addressLine2: me.address.line2 || '', city: me.address.city || '', district: me.address.district || '', state: me.address.state || '', pincode: me.address.pincode || ''
  });
  const save = (e) => { e.preventDefault(); run(() => partnerApi.put('/partner/profile', v), { success: 'Profile saved', onFieldErrors: setErrors }).then((r) => r && refresh()); };
  return (
    <>
      <PageHeader title="Profile" subtitle={<>Partner ID <span className="font-mono">{me.code}</span> · partner since {date(me.approvedAt)}</>} />
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <PayoutCard me={me} onSaved={refresh} />
          <form onSubmit={save}>
            <Card title="Your details">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name" error={errors.fullName}><Input {...bind('fullName')} /></Field>
                <Field label="Business name" hint="Optional"><Input {...bind('businessName')} /></Field>
                <Field label="Email" error={errors.email}><Input type="email" {...bind('email')} /></Field>
                <Field label="Mobile" error={errors.mobile}><Input maxLength={10} inputMode="numeric" {...bind('mobile')} /></Field>
                <Field label="City"><Input {...bind('city')} /></Field>
                <Field label="State"><Select value={v.state} onChange={(e) => set('state', e.target.value)}><option value="">Select</option>{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
                <Field label="GSTIN" hint="Optional" error={errors.gstin}><Input maxLength={15} {...bind('gstin', (x) => x.toUpperCase())} /></Field>
                <Field label="PIN code" hint="Optional" error={errors.pincode}><Input maxLength={6} inputMode="numeric" {...bind('pincode')} /></Field>
              </div>
              <div className="mt-5 flex justify-end"><Button type="submit" loading={busy}>Save details</Button></div>
            </Card>
          </form>
        </div>
        <PasswordCard onChanged={signIn} />
      </div>
    </>
  );
}

// PAN and bank account for commission payouts. Entered once after approval, password-confirmed.
function PayoutCard({ me, onSaved }) {
  const qc = useQueryClient();
  const has = !!(me.pan.masked && me.bank.accountMasked);
  const [editing, setEditing] = useState(!has);
  const [run, busy] = useAction();
  const blank = { pan: '', accountHolder: me.bank.holder || me.fullName, accountNumber: '', accountNumberConfirm: '', ifsc: '', bankName: '', accountType: 'savings', password: '' };
  const { values: v, set, bind, errors, setErrors } = useForm(blank);
  const submit = (e) => {
    e.preventDefault();
    run(() => partnerApi.put('/partner/payout', v), { success: 'Payout details saved', onFieldErrors: setErrors }).then((r) => {
      if (r) { setEditing(false); onSaved(); qc.invalidateQueries({ queryKey: ['partner', 'withdrawals'] }); }
    });
  };
  return (
    <Card title="Payout details" action={has && !editing && <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Change</Button>}>
      {!editing ? (
        <Dl cols={2} items={[['PAN', <span className="font-mono">{me.pan.masked}</span>], ['Account holder', me.bank.holder], ['Account', <span className="font-mono">{me.bank.accountMasked}</span>], ['IFSC', <span className="font-mono">{me.bank.ifsc}</span>], ['Bank', me.bank.bankName], ['Status', <Badge status={me.bank.verified ? 'verified' : 'pending'}>{me.bank.verified ? 'Verified' : 'Checked at first payout'}</Badge>]]} />
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {!has && <Alert tone="blue">Add your PAN and bank account so we can pay your commission. TDS is deducted against this PAN. Details are stored encrypted.</Alert>}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="PAN" error={errors.pan}><Input maxLength={10} autoComplete="off" placeholder="ABCDE1234F" {...bind('pan', (x) => x.toUpperCase())} /></Field>
            <Field label="Account holder name" error={errors.accountHolder}><Input {...bind('accountHolder')} /></Field>
            <Field label="Account number" error={errors.accountNumber}><Input type="password" inputMode="numeric" autoComplete="off" {...bind('accountNumber', (x) => x.replace(/\D/g, ''))} /></Field>
            <Field label="Confirm account number" error={errors.accountNumberConfirm}><Input inputMode="numeric" autoComplete="off" {...bind('accountNumberConfirm', (x) => x.replace(/\D/g, ''))} /></Field>
            <Field label="IFSC" error={errors.ifsc}><Input maxLength={11} placeholder="SBIN0001234" {...bind('ifsc', (x) => x.toUpperCase())} /></Field>
            <Field label="Bank name" error={errors.bankName}><Input {...bind('bankName')} /></Field>
            <Field label="Account type"><Select value={v.accountType} onChange={(e) => set('accountType', e.target.value)}><option value="savings">Savings</option><option value="current">Current</option></Select></Field>
            <Field label="Your login password" error={errors.password}><Input type="password" autoComplete="current-password" {...bind('password')} /></Field>
          </div>
          <div className="flex justify-end gap-2">
            {has && <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>}
            <Button type="submit" loading={busy}>Save payout details</Button>
          </div>
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

import React, { useState } from 'react';
import { partnerApi } from '../../lib/apiClient';
import { usePartnerAuth } from '../../context/PartnerAuthContext';
import { Card, Field, inputCls, Btn, Alert, StatusBadge, INDIAN_STATES, errMsg, fmtDate } from '../../components/partner/ui';

const fromPartner = (p) => ({
  fullName: p.personal.fullName, email: p.contact.email, mobile: p.contact.mobile, whatsapp: p.contact.whatsapp,
  addressLine1: p.address.line1, addressLine2: p.address.line2, city: p.address.city, district: p.address.district, state: p.address.state, pincode: p.address.pincode,
  businessName: p.business.name, gstin: p.business.gstin, website: p.business.website,
  qualification: p.professional.qualification, experienceYears: p.professional.experienceYears, teamSize: p.professional.teamSize, areasServed: p.professional.areasServed
});

const PartnerProfile = () => {
  const { partner, refresh, logout } = usePartnerAuth();
  const [f, setF] = useState(() => fromPartner(partner));
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const [bank, setBank] = useState({ accountHolder: '', accountNumber: '', accountNumberConfirm: '', ifsc: '', bankName: '', branch: '', accountType: 'savings', password: '' });
  const [cheque, setCheque] = useState(null);
  const [bankErr, setBankErr] = useState({});
  const [bankMsg, setBankMsg] = useState(null);
  const [bankBusy, setBankBusy] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState(null);

  const set = (k) => (e) => { setF((s) => ({ ...s, [k]: k === 'gstin' ? e.target.value.toUpperCase() : e.target.value })); setErrors((s) => ({ ...s, [k]: undefined })); };
  const I = (k, props = {}) => <input className={inputCls(errors[k])} value={f[k] || ''} onChange={set(k)} {...props} />;

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await partnerApi.put('/partner/profile', f);
      await refresh();
      setMsg({ tone: 'green', text: 'Profile saved.' });
    } catch (err) {
      setErrors(err?.response?.data?.fields || {});
      setMsg({ tone: 'red', text: errMsg(err) });
    } finally {
      setBusy(false);
    }
  };

  const saveBank = async (e) => {
    e.preventDefault();
    setBankBusy(true);
    setBankMsg(null);
    try {
      const fd = new FormData();
      Object.entries(bank).forEach(([k, v]) => fd.append(k, v));
      if (cheque) fd.append('cancelledCheque', cheque);
      await partnerApi.post('/partner/profile/bank', fd);
      await refresh();
      setBank({ accountHolder: '', accountNumber: '', accountNumberConfirm: '', ifsc: '', bankName: '', branch: '', accountType: 'savings', password: '' });
      setCheque(null);
      setBankMsg({ tone: 'green', text: 'Bank change submitted. Payouts use your current account until Reynrel verifies the new one.' });
    } catch (err) {
      setBankErr(err?.response?.data?.fields || {});
      setBankMsg({ tone: 'red', text: errMsg(err) });
    } finally {
      setBankBusy(false);
    }
  };

  const changePw = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return setPwMsg({ tone: 'red', text: 'New passwords do not match' });
    try {
      await partnerApi.put('/partner/password', pw);
      setPwMsg({ tone: 'green', text: 'Password changed. Logging you out…' });
      setTimeout(() => { logout(); window.location.href = '/partners/login'; }, 1500);
    } catch (err) {
      setPwMsg({ tone: 'red', text: errMsg(err) });
    }
  };

  const B = (k, props = {}) => (
    <input className={inputCls(bankErr[k])} value={bank[k]} onChange={(e) => { let v = e.target.value; if (k === 'ifsc') v = v.toUpperCase(); if (k.startsWith('accountNumber')) v = v.replace(/[^0-9]/g, ''); setBank((s) => ({ ...s, [k]: v })); setBankErr((s) => ({ ...s, [k]: undefined })); }} {...props} />
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500">Partner ID <span className="font-mono">{partner.partnerCode}</span> · approved {fmtDate(partner.approvedAt)}</p>
      </div>

      <Card title="Personal & business details">
        <form onSubmit={save} className="space-y-5">
          {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Full name" error={errors.fullName}>{I('fullName')}</Field>
            <Field label="Business name">{I('businessName')}</Field>
            <Field label="Email" error={errors.email}>{I('email', { type: 'email' })}</Field>
            <Field label="Mobile" error={errors.mobile}>{I('mobile', { maxLength: 10 })}</Field>
            <Field label="WhatsApp" error={errors.whatsapp}>{I('whatsapp', { maxLength: 10 })}</Field>
            <Field label="GSTIN" error={errors.gstin}>{I('gstin', { maxLength: 15 })}</Field>
            <Field label="Address line 1" className="md:col-span-2">{I('addressLine1')}</Field>
            <Field label="Address line 2" className="md:col-span-2">{I('addressLine2')}</Field>
            <Field label="City">{I('city')}</Field>
            <Field label="District">{I('district')}</Field>
            <Field label="State"><select className={inputCls()} value={f.state} onChange={set('state')}>{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</select></Field>
            <Field label="PIN code" error={errors.pincode}>{I('pincode', { maxLength: 6 })}</Field>
            <Field label="Website">{I('website')}</Field>
            <Field label="Qualification">{I('qualification')}</Field>
            <Field label="Experience (years)">{I('experienceYears')}</Field>
            <Field label="Team size">{I('teamSize')}</Field>
            <Field label="Areas served" className="md:col-span-2">{I('areasServed')}</Field>
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-slate-500">PAN {partner.pan.masked} ({partner.pan.nameOnPan}) cannot be changed online. Contact Reynrel to update it.</p>
            <Btn type="submit" loading={busy}>Save profile</Btn>
          </div>
        </form>
      </Card>

      <Card title="Bank account" className="scroll-mt-20" >
        <div id="bank" className="grid lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-3">Current payout account</h3>
            <dl className="text-sm grid grid-cols-3 gap-y-2">
              <dt className="text-slate-500">Name</dt><dd className="col-span-2">{partner.bank.accountHolder}</dd>
              <dt className="text-slate-500">Account</dt><dd className="col-span-2 font-mono">{partner.bank.accountMasked}</dd>
              <dt className="text-slate-500">IFSC</dt><dd className="col-span-2 font-mono">{partner.bank.ifsc}</dd>
              <dt className="text-slate-500">Bank</dt><dd className="col-span-2">{partner.bank.bankName} {partner.bank.branch && `· ${partner.bank.branch}`}</dd>
              <dt className="text-slate-500">Status</dt><dd className="col-span-2"><StatusBadge status={partner.bank.verified ? 'approved' : 'pending'} label={partner.bank.verified ? 'Verified' : 'Pending'} /></dd>
            </dl>
            {partner.pendingBankChange && (
              <div className="mt-4"><Alert tone="amber">Change to {partner.pendingBankChange.bankName} {partner.pendingBankChange.accountMasked} requested on {fmtDate(partner.pendingBankChange.requestedAt)} — awaiting verification.</Alert></div>
            )}
          </div>
          <form onSubmit={saveBank} className="space-y-3">
            <h3 className="text-sm font-medium text-slate-900">Change bank account</h3>
            <p className="text-xs text-slate-500">For your security, a new account is used only after Reynrel verifies it against the cancelled cheque.</p>
            {bankMsg && <Alert tone={bankMsg.tone}>{bankMsg.text}</Alert>}
            <Field label="Account holder" error={bankErr.accountHolder}>{B('accountHolder')}</Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Account number" error={bankErr.accountNumber}>{B('accountNumber', { type: 'password', autoComplete: 'off' })}</Field>
              <Field label="Confirm" error={bankErr.accountNumberConfirm}>{B('accountNumberConfirm', { autoComplete: 'off' })}</Field>
              <Field label="IFSC" error={bankErr.ifsc}>{B('ifsc', { maxLength: 11 })}</Field>
              <Field label="Bank name" error={bankErr.bankName}>{B('bankName')}</Field>
            </div>
            <Field label="Cancelled cheque / passbook" error={bankErr.cancelledCheque}><input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="text-sm" onChange={(e) => setCheque(e.target.files?.[0])} /></Field>
            <Field label="Your password" error={bankErr.password}>{B('password', { type: 'password', autoComplete: 'current-password' })}</Field>
            <Btn type="submit" variant="dark" loading={bankBusy} disabled={!!partner.pendingBankChange}>Submit for verification</Btn>
          </form>
        </div>
      </Card>

      <Card title="Change password">
        <form onSubmit={changePw} className="grid md:grid-cols-4 gap-3 items-end">
          <Field label="Current password"><input type="password" className={inputCls()} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} autoComplete="current-password" /></Field>
          <Field label="New password"><input type="password" className={inputCls()} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} autoComplete="new-password" /></Field>
          <Field label="Confirm new"><input type="password" className={inputCls()} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" /></Field>
          <Btn type="submit" variant="outline">Update password</Btn>
          {pwMsg && <div className="md:col-span-4"><Alert tone={pwMsg.tone}>{pwMsg.text}</Alert></div>}
        </form>
      </Card>
    </div>
  );
};

export default PartnerProfile;

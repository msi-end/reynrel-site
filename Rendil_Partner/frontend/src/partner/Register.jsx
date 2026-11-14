import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, Upload, RefreshCw } from 'lucide-react';
import { publicApi } from '../lib/api';
import { INDIAN_STATES } from '../lib/format';
import { Button, Field, Input, Select, Checkbox, Alert, Loading, cx, useForm } from '../components/ui';

const RE = { pan: /^[A-Z]{5}[0-9]{4}[A-Z]$/, ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/, gstin: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, mobile: /^[6-9][0-9]{9}$/, email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, pin: /^[1-9][0-9]{5}$/ };
const STEPS = ['You', 'Business', 'PAN & bank', 'Documents', 'Submit'];
const ENTITY = ['Individual / Freelancer', 'Proprietorship', 'Partnership firm', 'LLP', 'Private limited company', 'Other'];
const RANGES = ['1-2', '3-5', '6-10', '11-25', '25+'];
const up = (v) => v.toUpperCase().replace(/\s/g, '');
const digits = (v) => v.replace(/[^0-9]/g, '');

const STEP_FIELDS = [
  ['fullName', 'email', 'mobile', 'whatsapp', 'partnerType', 'addressLine1', 'city', 'state', 'pincode'],
  ['entityType', 'businessName', 'gstin', 'expectedMonthlyCustomers'],
  ['pan', 'nameOnPan', 'accountHolder', 'accountNumber', 'accountNumberConfirm', 'ifsc', 'bankName']
];

export default function Register() {
  const { data: cfg } = useQuery({ queryKey: ['public', 'config'], queryFn: () => publicApi.get('/public/config'), staleTime: 5 * 60_000 });
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState({});
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState('');
  const { values: v, set, bind, errors, setErrors } = useForm({
    fullName: '', email: '', mobile: '', whatsapp: '', partnerType: '', addressLine1: '', addressLine2: '', city: '', district: '', state: '', pincode: '',
    entityType: '', businessName: '', gstin: '', website: '', qualification: '', membershipNumber: '', experienceYears: '', existingClientBase: '', areasServed: '', softwareExperience: '',
    interestedProducts: [], expectedMonthlyCustomers: '', howDidYouHear: '',
    pan: '', nameOnPan: '', accountHolder: '', accountNumber: '', accountNumberConfirm: '', ifsc: '', bankName: '', branch: '', accountType: 'savings',
    password: '', passwordConfirm: '', acceptTerms: false, consent: false
  });
  if (!cfg) return <div className="p-8"><Loading /></div>;
  if (!cfg.registrationOpen) return <Centered><h1 className="text-xl font-bold">Applications are closed</h1><p className="text-slate-600 mt-2">Please contact {cfg.supportEmail} for partnership enquiries.</p></Centered>;
  if (done) {
    return (
      <Centered>
        <CheckCircle2 size={44} className="text-emerald-600 mx-auto" />
        <h1 className="mt-3 text-2xl font-bold">Application received</h1>
        <p className="mt-2 text-slate-600">Your partner ID is <b className="font-mono">{done.code}</b>. We will verify your details and documents and contact you. You can log in any time to check your status.</p>
        <Link to="/login"><Button className="mt-6">Go to login</Button></Link>
      </Centered>
    );
  }

  const requiredDocs = cfg.documentTypes.filter((d) => d.required || (d.requiredIfGstin && v.gstin));
  const validate = (s) => {
    const e = {};
    const need = (k, msg = 'Required') => { if (!String(v[k] || '').trim()) e[k] = msg; };
    if (s === 0) {
      need('fullName'); need('partnerType', 'Choose one'); need('addressLine1'); need('city'); need('state', 'Choose a state');
      if (!RE.email.test(v.email)) e.email = 'Enter a valid email';
      if (!RE.mobile.test(v.mobile)) e.mobile = '10-digit mobile number';
      if (v.whatsapp && !RE.mobile.test(v.whatsapp)) e.whatsapp = '10-digit number';
      if (!RE.pin.test(v.pincode)) e.pincode = '6-digit PIN code';
    }
    if (s === 1) {
      need('entityType', 'Choose one'); need('expectedMonthlyCustomers', 'Choose a range');
      if (v.gstin && !RE.gstin.test(v.gstin)) e.gstin = 'Invalid GSTIN';
    }
    if (s === 2) {
      if (!RE.pan.test(v.pan)) e.pan = 'Format ABCDE1234F';
      need('nameOnPan'); need('accountHolder'); need('bankName');
      if (!/^[0-9]{9,18}$/.test(v.accountNumber)) e.accountNumber = '9–18 digits';
      if (v.accountNumber !== v.accountNumberConfirm) e.accountNumberConfirm = 'Does not match';
      if (!RE.ifsc.test(v.ifsc)) e.ifsc = 'Format SBIN0001234';
    }
    if (s === 3) requiredDocs.forEach((d) => { if (!files[d.key]) e[d.key] = 'Required'; else if (files[d.key].size > 5 * 1024 * 1024) e[d.key] = 'Max 5 MB'; });
    if (s === 4) {
      if (v.password.length < 8 || !/[A-Za-z]/.test(v.password) || !/[0-9]/.test(v.password)) e.password = 'At least 8 characters with letters and numbers';
      if (v.password !== v.passwordConfirm) e.passwordConfirm = 'Does not match';
      if (!v.acceptTerms) e.acceptTerms = 'Required';
      if (!v.consent) e.consent = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const next = () => { if (validate(step)) { setStep(step + 1); window.scrollTo({ top: 0 }); } };
  const submit = async () => {
    if (!validate(4)) return;
    setBusy(true);
    setServerError('');
    const fd = new FormData();
    const data = { ...v, termsVersion: cfg.terms.version };
    delete data.passwordConfirm;
    fd.append('data', JSON.stringify(data));
    Object.entries(files).forEach(([k, f]) => f && fd.append(k, f));
    try {
      setDone(await publicApi.post('/public/register', fd));
      window.scrollTo({ top: 0 });
    } catch (err) {
      setServerError(err.message);
      if (err.fields) {
        setErrors(err.fields);
        const s = STEP_FIELDS.findIndex((fs) => fs.some((k) => err.fields[k]));
        setStep(s >= 0 ? s : cfg.documentTypes.some((d) => err.fields[d.key]) ? 3 : 4);
      }
    } finally {
      setBusy(false);
    }
  };
  const toggleProduct = (id) => set('interestedProducts', v.interestedProducts.includes(id) ? v.interestedProducts.filter((x) => x !== id) : [...v.interestedProducts, id]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2"><img src="/logo.png" alt="" className="w-7 h-7" /><span className="font-semibold">Rendil Partner</span></div>
          <Link to="/login" className="text-sm text-brand-600">Log in</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold">Become a {cfg.companyName} partner</h1>
        <p className="text-slate-600 mt-1">Takes about 10 minutes. Fields marked <span className="text-red-500">*</span> are required.</p>
        <ol className="mt-6 grid grid-cols-5 gap-2" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s}><div className={cx('h-1.5 rounded-full transition-colors', i <= step ? 'bg-brand-600' : 'bg-slate-200')} /><div className={cx('mt-1.5 text-xs hidden sm:block', i === step ? 'text-brand-700 font-medium' : 'text-slate-500')}>{s}</div></li>
          ))}
        </ol>
        <p className="sm:hidden mt-2 text-sm font-medium text-brand-700">Step {step + 1} of 5 · {STEPS[step]}</p>

        <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-5 md:p-7">
          {serverError && <Alert className="mb-5">{serverError}</Alert>}
          {step === 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name (as on PAN)" required error={errors.fullName} className="sm:col-span-2"><Input autoComplete="name" {...bind('fullName')} /></Field>
              <Field label="Email" required error={errors.email}><Input type="email" autoComplete="email" {...bind('email')} /></Field>
              <Field label="Mobile" required error={errors.mobile}><Input inputMode="numeric" maxLength={10} autoComplete="tel-national" {...bind('mobile', digits)} /></Field>
              <Field label="WhatsApp" hint="Leave blank if same as mobile" error={errors.whatsapp}><Input inputMode="numeric" maxLength={10} {...bind('whatsapp', digits)} /></Field>
              <div />
              <Field label="I am a…" required error={errors.partnerType} className="sm:col-span-2">
                <div className="grid sm:grid-cols-2 gap-2">
                  {cfg.partnerTypes.map((t) => (
                    <button type="button" key={t.key} onClick={() => set('partnerType', t.key)} className={cx('text-left px-3 py-2.5 rounded-lg border text-sm transition-colors', v.partnerType === t.key ? 'border-brand-600 bg-brand-50 text-brand-900 font-medium' : 'border-slate-300 text-slate-700 hover:border-slate-400')}>{t.label}</button>
                  ))}
                </div>
              </Field>
              <Field label="Address" required error={errors.addressLine1} className="sm:col-span-2"><Input autoComplete="address-line1" {...bind('addressLine1')} /></Field>
              <Field label="City / town" required error={errors.city}><Input {...bind('city')} /></Field>
              <Field label="District"><Input {...bind('district')} /></Field>
              <Field label="State" required error={errors.state}><Select value={v.state} error={errors.state} onChange={(e) => set('state', e.target.value)}><option value="">Select</option>{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
              <Field label="PIN code" required error={errors.pincode}><Input inputMode="numeric" maxLength={6} {...bind('pincode', digits)} /></Field>
            </div>
          )}
          {step === 1 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Business type" required error={errors.entityType}><Select value={v.entityType} error={errors.entityType} onChange={(e) => set('entityType', e.target.value)}><option value="">Select</option>{ENTITY.map((x) => <option key={x}>{x}</option>)}</Select></Field>
              <Field label="Business / firm name"><Input {...bind('businessName')} /></Field>
              <Field label="GSTIN" error={errors.gstin} hint="Optional"><Input maxLength={15} {...bind('gstin', up)} /></Field>
              <Field label="Website / social page"><Input {...bind('website')} /></Field>
              <Field label="Qualification"><Input placeholder="e.g. CA, B.Com, MCA" {...bind('qualification')} /></Field>
              <Field label="Membership no." hint="ICAI / ICMAI / GST practitioner ID"><Input {...bind('membershipNumber')} /></Field>
              <Field label="Experience (years)"><Input inputMode="numeric" {...bind('experienceYears', digits)} /></Field>
              <Field label="Business clients you serve"><Select value={v.existingClientBase} onChange={(e) => set('existingClientBase', e.target.value)}><option value="">Select</option>{['Under 25', '25-50', '50-100', '100-250', '250+'].map((x) => <option key={x}>{x}</option>)}</Select></Field>
              <Field label="Areas you cover" className="sm:col-span-2"><Input placeholder="e.g. Guwahati, Nalbari, Barpeta" {...bind('areasServed')} /></Field>
              <Field label="Software you've worked with" className="sm:col-span-2"><Input placeholder="e.g. Tally, Busy, Vyapar" {...bind('softwareExperience')} /></Field>
              {cfg.products.length > 0 && (
                <Field label="Products you're interested in" className="sm:col-span-2">
                  <div className="flex flex-wrap gap-2">{cfg.products.map((p) => <button type="button" key={p.id} onClick={() => toggleProduct(p.id)} className={cx('px-3 py-1.5 rounded-full border text-sm', v.interestedProducts.includes(p.id) ? 'border-brand-600 bg-brand-50 text-brand-900' : 'border-slate-300 text-slate-600')}>{p.name}</button>)}</div>
                </Field>
              )}
              <Field label="New customers you expect to bring per month" required error={errors.expectedMonthlyCustomers} hint="An honest estimate helps us plan support. It is not a commitment." className="sm:col-span-2">
                <div className="grid grid-cols-5 gap-2">{RANGES.map((r) => <button type="button" key={r} onClick={() => set('expectedMonthlyCustomers', r)} className={cx('h-10 rounded-lg border text-sm font-medium', v.expectedMonthlyCustomers === r ? 'border-brand-600 bg-brand-50 text-brand-900' : 'border-slate-300 text-slate-600')}>{r}</button>)}</div>
              </Field>
              <Field label="How did you hear about us?" className="sm:col-span-2"><Input {...bind('howDidYouHear')} /></Field>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-5">
              <Alert tone="blue"><span className="inline-flex gap-2"><Lock size={14} className="mt-0.5" />PAN and account numbers are encrypted before storage and visible only to authorised Reynrel staff.</span></Alert>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="PAN" required error={errors.pan}><Input maxLength={10} autoComplete="off" placeholder="ABCDE1234F" {...bind('pan', up)} /></Field>
                <Field label="Name on PAN" required error={errors.nameOnPan}><Input {...bind('nameOnPan')} /></Field>
                <Field label="Account holder name" required error={errors.accountHolder} hint="Must match your name or business name" className="sm:col-span-2"><Input {...bind('accountHolder')} /></Field>
                <Field label="Account number" required error={errors.accountNumber}><Input type="password" inputMode="numeric" autoComplete="off" maxLength={18} {...bind('accountNumber', digits)} /></Field>
                <Field label="Confirm account number" required error={errors.accountNumberConfirm}><Input inputMode="numeric" autoComplete="off" maxLength={18} onPaste={(e) => e.preventDefault()} {...bind('accountNumberConfirm', digits)} /></Field>
                <Field label="IFSC" required error={errors.ifsc}><Input maxLength={11} placeholder="SBIN0001234" {...bind('ifsc', up)} /></Field>
                <Field label="Account type"><Select value={v.accountType} onChange={(e) => set('accountType', e.target.value)}><option value="savings">Savings</option><option value="current">Current</option></Select></Field>
                <Field label="Bank name" required error={errors.bankName}><Input {...bind('bankName')} /></Field>
                <Field label="Branch"><Input {...bind('branch')} /></Field>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">PDF, JPG, PNG or WEBP, up to 5 MB each. Stored privately.</p>
              {cfg.documentTypes.map((d) => {
                const req = d.required || (d.requiredIfGstin && v.gstin);
                const f = files[d.key];
                return (
                  <div key={d.key} className={cx('flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-xl p-4', errors[d.key] ? 'border-red-300 bg-red-50/50' : 'border-slate-200')}>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{d.label} {req && <span className="text-red-500">*</span>}</div>
                      <div className="text-xs text-slate-500 truncate">{f ? `${f.name} · ${Math.round(f.size / 1024)} KB` : req ? 'Required' : 'Optional'}</div>
                      {errors[d.key] && <div className="text-xs text-red-600">{errors[d.key]}</div>}
                    </div>
                    <label className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-300 text-sm font-medium cursor-pointer hover:bg-slate-50 shrink-0">
                      {f ? <RefreshCw size={14} /> : <Upload size={14} />}{f ? 'Replace' : 'Upload'}
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="sr-only" onChange={(e) => { setFiles((s) => ({ ...s, [d.key]: e.target.files?.[0] })); setErrors((s) => ({ ...s, [d.key]: undefined })); }} />
                    </label>
                  </div>
                );
              })}
            </div>
          )}
          {step === 4 && (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Create password" required error={errors.password} hint="For your partner portal"><Input type="password" autoComplete="new-password" {...bind('password')} /></Field>
                <Field label="Confirm password" required error={errors.passwordConfirm}><Input type="password" autoComplete="new-password" {...bind('passwordConfirm')} /></Field>
              </div>
              <details className="rounded-xl border border-slate-200">
                <summary className="px-4 py-3 text-sm font-medium cursor-pointer">Partner terms & conditions (version {cfg.terms.version})</summary>
                <pre className="px-4 pb-4 max-h-80 overflow-y-auto whitespace-pre-wrap font-sans text-sm text-slate-600">{cfg.terms.content}</pre>
              </details>
              <Checkbox checked={v.acceptTerms} onChange={(e) => set('acceptTerms', e.target.checked)} label={<>I accept the partner terms and understand no sales or income are guaranteed. {errors.acceptTerms && <span className="text-red-600 block">{errors.acceptTerms}</span>}</>} />
              <Checkbox checked={v.consent} onChange={(e) => set('consent', e.target.checked)} label={<>I consent to {cfg.companyName} processing my personal, PAN and bank details to verify this application and pay commission. {errors.consent && <span className="text-red-600 block">{errors.consent}</span>}</>} />
            </div>
          )}
          <div className="mt-8 flex justify-between gap-3">
            <Button variant="outline" icon={ArrowLeft} disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
            {step < 4 ? <Button onClick={next}>Continue <ArrowRight size={16} /></Button> : <Button loading={busy} onClick={submit}>Submit application</Button>}
          </div>
        </div>
      </main>
    </div>
  );
}

const Centered = ({ children }) => <div className="min-h-screen flex items-center justify-center p-4"><div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center">{children}</div></div>;

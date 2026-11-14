import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { partnerApi } from '../lib/api';
import { INDIAN_STATES } from '../lib/format';
import { Button, Field, Input, Select, Textarea, Alert, Checkbox, Modal, useForm, useAction } from '../components/ui';
import { PublicHeader, PublicFooter, usePublicConfig, useSeo } from './PublicLayout';

export default function Apply() {
  useSeo('Apply to become a Reynrel software partner', 'Apply in two minutes to join the Reynrel Partner Program. Free to join, commission on every sale and renewal.');
  const { data: cfg } = usePublicConfig();
  const [run, busy] = useAction();
  const [done, setDone] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const { values: v, set, bind, errors, setErrors } = useForm({
    fullName: '', mobile: '', email: '', city: '', state: '', partnerType: '', businessName: '', interestedProducts: [], message: '', password: '', acceptTerms: false, website_url: ''
  });
  const toggleProduct = (id) => set('interestedProducts', v.interestedProducts.includes(id) ? v.interestedProducts.filter((x) => x !== id) : [...v.interestedProducts, id]);
  const submit = (e) => {
    e.preventDefault();
    run(() => partnerApi.post('/public/register', v), { onFieldErrors: setErrors }).then((r) => { if (r) { setDone(r); window.scrollTo(0, 0); } });
  };

  if (cfg && !cfg.registrationOpen) {
    return <Frame><div className="max-w-lg mx-auto text-center py-16"><h1 className="text-2xl font-bold">Applications are closed for now</h1><p className="mt-3 text-slate-600">Please check back soon or contact us at {cfg.supportPhone}.</p></div></Frame>;
  }

  if (done) {
    return (
      <Frame>
        <div className="max-w-lg mx-auto text-center py-12">
          <span className="mx-auto w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={30} /></span>
          <h1 className="mt-5 text-2xl font-bold">Application received</h1>
          <p className="mt-3 text-slate-600">Your partner ID is <span className="font-mono font-semibold text-slate-900">{done.code}</span>. We will review your application and contact you. Once approved, log in with your email or mobile number and the password you chose.</p>
          <Link to="/login"><Button className="mt-8" size="lg">Go to partner login</Button></Link>
        </div>
      </Frame>
    );
  }

  return (
    <Frame>
      <div className="grid lg:grid-cols-5 gap-10 items-start">
        <aside className="lg:col-span-2 lg:sticky lg:top-24">
          <h1 className="text-3xl font-bold tracking-tight">Become a Reynrel partner</h1>
          <p className="mt-3 text-slate-600">Takes about two minutes. No documents needed to apply.</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            {['Free to join, no targets', 'Commission on every sale and renewal', 'We install and support the software', 'Withdraw your earnings to your bank'].map((t) => (
              <li key={t} className="flex gap-2"><CheckCircle2 size={18} className="text-emerald-600 shrink-0" />{t}</li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-slate-500 flex gap-2"><ShieldCheck size={16} className="shrink-0" />We use your details only to review your application and contact you about the partner programme.</p>
        </aside>
        <form onSubmit={submit} noValidate className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full name" required error={errors.fullName}><Input autoComplete="name" {...bind('fullName')} /></Field>
            <Field label="Mobile number" required error={errors.mobile}><Input type="tel" inputMode="numeric" maxLength={10} autoComplete="tel-national" placeholder="10-digit mobile" {...bind('mobile', (x) => x.replace(/\D/g, ''))} /></Field>
            <Field label="Email" required error={errors.email}><Input type="email" autoComplete="email" {...bind('email')} /></Field>
            <Field label="You are a" required error={errors.partnerType}>
              <Select value={v.partnerType} onChange={(e) => set('partnerType', e.target.value)}>
                <option value="">Select</option>
                {cfg?.partnerTypes.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </Select>
            </Field>
            <Field label="City" required error={errors.city}><Input autoComplete="address-level2" {...bind('city')} /></Field>
            <Field label="State" required error={errors.state}>
              <Select value={v.state} onChange={(e) => set('state', e.target.value)}><option value="">Select</option>{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</Select>
            </Field>
            <Field label="Business / firm name" hint="Optional" className="sm:col-span-2"><Input autoComplete="organization" {...bind('businessName')} /></Field>
          </div>
          {cfg?.products?.length > 0 && (
            <fieldset>
              <legend className="text-sm font-medium text-slate-700 mb-2">Products you want to sell <span className="font-normal text-slate-400">(optional)</span></legend>
              <div className="flex flex-wrap gap-2">
                {cfg.products.map((p) => {
                  const on = v.interestedProducts.includes(p.id);
                  return <button key={p.id} type="button" aria-pressed={on} onClick={() => toggleProduct(p.id)} className={`h-9 px-3 rounded-full border text-sm transition-colors ${on ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}>{p.name}</button>;
                })}
              </div>
            </fieldset>
          )}
          <Field label="Anything you want to tell us?" hint="Optional — e.g. the kind of clients you work with"><Textarea rows={3} maxLength={500} {...bind('message')} /></Field>
          <Field label="Choose a password" required hint="At least 8 characters with letters and numbers. You will use it to log in once approved." error={errors.password}>
            <Input type="password" autoComplete="new-password" {...bind('password')} />
          </Field>
          <input type="text" name="website_url" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={v.website_url} onChange={(e) => set('website_url', e.target.value)} />
          <div>
            <Checkbox checked={v.acceptTerms} onChange={(e) => set('acceptTerms', e.target.checked)}
              label={<>I agree to the <button type="button" className="text-brand-600 underline" onClick={() => setShowTerms(true)}>partner terms</button> and to be contacted about my application.</>} />
            {errors.acceptTerms && <p className="mt-1 text-xs text-red-600">{errors.acceptTerms}</p>}
          </div>
          {Object.keys(errors).some((k) => errors[k]) && <Alert>Please correct the highlighted fields.</Alert>}
          <Button type="submit" size="lg" loading={busy} className="w-full">Submit application</Button>
          <p className="text-sm text-slate-500 text-center">Already applied? <Link to="/login" className="text-brand-600 font-medium">Log in to check your status</Link></p>
        </form>
      </div>
      <Modal open={showTerms} size="lg" title={`Partner terms${cfg?.terms ? ` — version ${cfg.terms.version}` : ''}`} onClose={() => setShowTerms(false)}
        footer={<Button onClick={() => { set('acceptTerms', true); setShowTerms(false); }}>I agree</Button>}>
        <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">{cfg?.terms?.content}</pre>
      </Modal>
    </Frame>
  );
}

function Frame({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 md:py-14">{children}</main>
      <PublicFooter />
    </div>
  );
}

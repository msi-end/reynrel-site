import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../../components/Seo';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import { publicApi } from '../../lib/apiClient';
import { Field, inputCls, Btn, Alert, INDIAN_STATES, errMsg } from '../../components/partner/ui';

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const MOBILE_RE = /^[6-9][0-9]{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ENTITY_TYPES = ['Individual / Freelancer', 'Proprietorship', 'Partnership Firm', 'LLP', 'Private Limited Company', 'Public Limited Company', 'Other'];
const INDUSTRIES = ['Kirana / General Store', 'Pharmacy', 'FMCG Distribution', 'Wholesale', 'Garments & Footwear', 'Electronics', 'Hardware', 'Restaurants', 'Manufacturing', 'Services'];

const STEPS = [
  { key: 'personal', title: 'Personal & contact', icon: 'User' },
  { key: 'business', title: 'Business & professional', icon: 'Briefcase' },
  { key: 'kyc', title: 'PAN & bank', icon: 'Landmark' },
  { key: 'docs', title: 'Documents', icon: 'FileUp' },
  { key: 'review', title: 'Terms & submit', icon: 'ShieldCheck' }
];

const DOCS = [
  { key: 'panCard', label: 'PAN card', required: true },
  { key: 'cancelledCheque', label: 'Cancelled cheque / bank passbook', required: true },
  { key: 'addressProof', label: 'Address proof', required: true, hint: 'Aadhaar (mask first 8 digits), utility bill or rent agreement' },
  { key: 'gstCertificate', label: 'GST registration certificate', requiredIf: 'gstin' },
  { key: 'qualificationCertificate', label: 'Professional / qualification certificate', hint: 'ICAI, ICMAI, GST practitioner enrolment, etc.' },
  { key: 'photo', label: 'Passport-size photo' }
];

const initial = {
  fullName: '', email: '', mobile: '', whatsapp: '', dateOfBirth: '', partnerType: '',
  addressLine1: '', addressLine2: '', city: '', district: '', state: '', pincode: '',
  businessName: '', entityType: '', gstin: '', website: '', yearsInBusiness: '',
  qualification: '', membershipNumber: '', experienceYears: '', existingClientBase: '', teamSize: '',
  industriesServed: [], areasServed: '', softwareExperience: '', interestedProducts: [], expectedMonthlyCustomers: '', howDidYouHear: '',
  pan: '', nameOnPan: '', accountHolder: '', accountNumber: '', accountNumberConfirm: '', ifsc: '', bankName: '', branch: '', accountType: 'savings',
  password: '', passwordConfirm: '', acceptTerms: false, consentDataProcessing: false
};

function validateStep(step, f, files) {
  const e = {};
  const req = (k, msg = 'Required') => { if (!String(f[k] || '').trim()) e[k] = msg; };
  if (step === 0) {
    req('fullName'); req('partnerType', 'Select one');
    if (!EMAIL_RE.test(f.email)) e.email = 'Enter a valid email';
    if (!MOBILE_RE.test(f.mobile)) e.mobile = 'Enter a 10-digit mobile number';
    if (f.whatsapp && !MOBILE_RE.test(f.whatsapp)) e.whatsapp = 'Enter a 10-digit number';
    req('addressLine1'); req('city'); req('state', 'Select state');
    if (!/^[1-9][0-9]{5}$/.test(f.pincode)) e.pincode = '6-digit PIN code';
  }
  if (step === 1) {
    req('entityType', 'Select one'); req('expectedMonthlyCustomers', 'Select a range');
    if (f.gstin && !GSTIN_RE.test(f.gstin)) e.gstin = 'Invalid GSTIN format';
    if (f.entityType && !f.entityType.startsWith('Individual') && !f.businessName.trim()) e.businessName = 'Required for registered businesses';
  }
  if (step === 2) {
    if (!PAN_RE.test(f.pan)) e.pan = 'Format: ABCDE1234F';
    req('nameOnPan');
    req('accountHolder');
    if (!/^[0-9]{9,18}$/.test(f.accountNumber)) e.accountNumber = '9–18 digits';
    if (f.accountNumber !== f.accountNumberConfirm) e.accountNumberConfirm = 'Does not match';
    if (!IFSC_RE.test(f.ifsc)) e.ifsc = 'Format: SBIN0001234';
    req('bankName');
  }
  if (step === 3) {
    DOCS.forEach((d) => {
      const needed = d.required || (d.requiredIf && f[d.requiredIf]);
      if (needed && !files[d.key]) e[d.key] = 'Required';
      if (files[d.key] && files[d.key].size > 5 * 1024 * 1024) e[d.key] = 'Max 5 MB';
    });
  }
  if (step === 4) {
    if (f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/[0-9]/.test(f.password)) e.password = 'At least 8 characters with letters and numbers';
    if (f.password !== f.passwordConfirm) e.passwordConfirm = 'Does not match';
    if (!f.acceptTerms) e.acceptTerms = 'Required';
    if (!f.consentDataProcessing) e.consentDataProcessing = 'Required';
  }
  return e;
}

const STEP_OF_FIELD = (k) => {
  if (['fullName', 'email', 'mobile', 'whatsapp', 'partnerType', 'addressLine1', 'city', 'state', 'pincode'].includes(k)) return 0;
  if (['entityType', 'gstin', 'businessName', 'expectedMonthlyCustomers'].includes(k)) return 1;
  if (['pan', 'nameOnPan', 'accountHolder', 'accountNumber', 'accountNumberConfirm', 'ifsc', 'bankName'].includes(k)) return 2;
  if (DOCS.some((d) => d.key === k)) return 3;
  return 4;
};

const PartnerRegister = () => {
  const [program, setProgram] = useState(null);
  const [step, setStep] = useState(0);
  const [f, setF] = useState(initial);
  const [files, setFiles] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState(null);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    publicApi.get('/partners/program').then((r) => setProgram(r.data)).catch(() => setServerError('Could not load the partner program. Please refresh.'));
  }, []);

  const set = (k) => (e) => {
    let v = e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
    if (['pan', 'ifsc', 'gstin'].includes(k)) v = v.toUpperCase().replace(/\s/g, '');
    if (['mobile', 'whatsapp', 'accountNumber', 'accountNumberConfirm', 'pincode'].includes(k)) v = v.replace(/[^0-9]/g, '');
    setF((s) => ({ ...s, [k]: v }));
    setErrors((s) => ({ ...s, [k]: undefined }));
  };
  const toggleArr = (k, v) => setF((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));

  const next = () => {
    const e = validateStep(step, f, files);
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const submit = async () => {
    const e = validateStep(4, f, files);
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    setServerError('');
    try {
      const fd = new FormData();
      const data = { ...f };
      delete data.passwordConfirm;
      fd.append('data', JSON.stringify({ ...data, termsVersion: program?.terms?.version }));
      Object.entries(files).forEach(([k, file]) => file && fd.append(k, file));
      const res = await publicApi.post('/partners/register', fd);
      setDone(res.data);
      window.scrollTo({ top: 0 });
    } catch (err) {
      const fields = err?.response?.data?.fields;
      setServerError(errMsg(err, 'Could not submit your application.'));
      if (fields) {
        setErrors(fields);
        setStep(Math.min(...Object.keys(fields).map(STEP_OF_FIELD)));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const types = program?.partnerTypes || {};
  const ranges = program?.expectedCustomerRanges || ['1-2', '3-5', '6-10', '11-25', '25+'];

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Seo title="Application received" description="Partner application submitted" path="/partners/register" />
        <Header />
        <main className="pt-28 pb-20 px-4">
          <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><Icon name="CheckCircle2" size={28} /></div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">Application received</h1>
            <p className="mt-2 text-slate-600">Your partner ID is <strong className="font-mono">{done.partnerCode}</strong>. Our team will verify your details and documents and contact you. You can log in any time to check your status.</p>
            <Link to="/partners/login" className="mt-6 inline-flex items-center justify-center h-11 px-6 rounded-lg bg-blue-600 text-white font-semibold">Go to partner login</Link>
          </div>
        </main>
      </div>
    );
  }

  const I = (k, props = {}) => <input className={inputCls(errors[k])} value={f[k]} onChange={set(k)} {...props} />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Seo title="Partner registration" description="Apply to become a Reynrel software partner." path="/partners/register" />
      <Header />
      <main className="pt-24 lg:pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link to="/partners" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><Icon name="ArrowLeft" size={14} /> Partner Program</Link>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Become a Reynrel partner</h1>
          <p className="mt-1 text-slate-600">Takes about 10 minutes. Fields marked <span className="text-red-500">*</span> are required.</p>

          {/* stepper */}
          <ol className="mt-8 grid grid-cols-5 gap-2">
            {STEPS.map((s, i) => (
              <li key={s.key} className="text-center">
                <div className={`h-1.5 rounded-full ${i <= step ? 'bg-blue-600' : 'bg-slate-200'}`} />
                <div className={`mt-2 text-xs font-medium hidden sm:block ${i === step ? 'text-blue-700' : 'text-slate-500'}`}>{s.title}</div>
              </li>
            ))}
          </ol>
          <p className="sm:hidden mt-2 text-sm font-medium text-blue-700">Step {step + 1} of 5 · {STEPS[step].title}</p>

          <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-5 md:p-8">
            {serverError && <div className="mb-5"><Alert>{serverError}</Alert></div>}

            {step === 0 && (
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Full name (as per PAN)" required error={errors.fullName} className="md:col-span-2">{I('fullName', { autoComplete: 'name' })}</Field>
                <Field label="Email" required error={errors.email}>{I('email', { type: 'email', autoComplete: 'email' })}</Field>
                <Field label="Mobile" required error={errors.mobile}>{I('mobile', { inputMode: 'numeric', maxLength: 10, placeholder: '10-digit', autoComplete: 'tel-national' })}</Field>
                <Field label="WhatsApp number" error={errors.whatsapp} hint="Leave blank if same as mobile">{I('whatsapp', { inputMode: 'numeric', maxLength: 10 })}</Field>
                <Field label="Date of birth" error={errors.dateOfBirth}>{I('dateOfBirth', { type: 'date' })}</Field>
                <Field label="I am a…" required error={errors.partnerType} className="md:col-span-2">
                  <div className="grid sm:grid-cols-2 gap-2">
                    {Object.entries(types).map(([k, label]) => (
                      <button type="button" key={k} onClick={() => set('partnerType')(k)} className={`text-left px-3 py-2.5 rounded-lg border text-sm ${f.partnerType === k ? 'border-blue-600 bg-blue-50 text-blue-800 font-medium' : 'border-slate-300 text-slate-700 hover:border-slate-400'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Address line 1" required error={errors.addressLine1} className="md:col-span-2">{I('addressLine1', { autoComplete: 'address-line1' })}</Field>
                <Field label="Address line 2" className="md:col-span-2">{I('addressLine2', { autoComplete: 'address-line2' })}</Field>
                <Field label="City / Town" required error={errors.city}>{I('city')}</Field>
                <Field label="District">{I('district')}</Field>
                <Field label="State" required error={errors.state}>
                  <select className={inputCls(errors.state)} value={f.state} onChange={set('state')}>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="PIN code" required error={errors.pincode}>{I('pincode', { inputMode: 'numeric', maxLength: 6 })}</Field>
              </div>
            )}

            {step === 1 && (
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Business type" required error={errors.entityType}>
                  <select className={inputCls(errors.entityType)} value={f.entityType} onChange={set('entityType')}>
                    <option value="">Select</option>
                    {ENTITY_TYPES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Business / firm name" error={errors.businessName}>{I('businessName')}</Field>
                <Field label="GSTIN" error={errors.gstin} hint="Optional — needed if you'll invoice us for commission">{I('gstin', { maxLength: 15, placeholder: '18ABCDE1234F1Z5' })}</Field>
                <Field label="Website / social page">{I('website', { placeholder: 'https://' })}</Field>
                <Field label="Years in business">{I('yearsInBusiness', { inputMode: 'numeric' })}</Field>
                <Field label="Highest qualification">{I('qualification', { placeholder: 'e.g. CA, B.Com, MCA' })}</Field>
                <Field label="Professional membership no." hint="ICAI / ICMAI / GST practitioner ID, if any">{I('membershipNumber')}</Field>
                <Field label="Total experience (years)">{I('experienceYears', { inputMode: 'numeric' })}</Field>
                <Field label="Business clients you currently serve">
                  <select className={inputCls()} value={f.existingClientBase} onChange={set('existingClientBase')}>
                    <option value="">Select</option>
                    {['Under 25', '25-50', '50-100', '100-250', '250-500', '500+'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Team size">
                  <select className={inputCls()} value={f.teamSize} onChange={set('teamSize')}>
                    <option value="">Select</option>
                    {['Just me', '2-5', '6-15', '16-50', '50+'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Industries you serve" className="md:col-span-2">
                  <div className="flex flex-wrap gap-2">
                    {INDUSTRIES.map((x) => (
                      <button type="button" key={x} onClick={() => toggleArr('industriesServed', x)} className={`px-3 py-1.5 rounded-full border text-sm ${f.industriesServed.includes(x) ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-300 text-slate-600'}`}>{x}</button>
                    ))}
                  </div>
                </Field>
                <Field label="Areas / cities you cover" className="md:col-span-2">{I('areasServed', { placeholder: 'e.g. Guwahati, Nalbari, Barpeta' })}</Field>
                <Field label="Billing/accounting software you've worked with" className="md:col-span-2">{I('softwareExperience', { placeholder: 'e.g. Tally, Busy, Vyapar, Marg' })}</Field>
                <Field label="Products you're interested in" className="md:col-span-2">
                  <div className="flex flex-wrap gap-2">
                    {(program?.products || []).map((p) => (
                      <button type="button" key={p.id} onClick={() => toggleArr('interestedProducts', p.id)} className={`px-3 py-1.5 rounded-full border text-sm ${f.interestedProducts.includes(p.id) ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-300 text-slate-600'}`}>{p.name}</button>
                    ))}
                  </div>
                </Field>
                <Field label="New customers you expect to bring per month" required error={errors.expectedMonthlyCustomers} className="md:col-span-2" hint="An honest estimate helps us plan support for you. It is not a commitment.">
                  <div className="grid grid-cols-5 gap-2">
                    {ranges.map((r) => (
                      <button type="button" key={r} onClick={() => set('expectedMonthlyCustomers')(r)} className={`h-10 rounded-lg border text-sm font-medium ${f.expectedMonthlyCustomers === r ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-300 text-slate-600'}`}>{r}</button>
                    ))}
                  </div>
                </Field>
                <Field label="How did you hear about us?" className="md:col-span-2">{I('howDidYouHear')}</Field>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <Alert tone="blue">
                  <span className="inline-flex items-start gap-2"><Icon name="Lock" size={16} className="mt-0.5 shrink-0" />Your PAN and account number are encrypted before they are stored and are only visible to authorised Reynrel finance staff.</span>
                </Alert>
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="PAN" required error={errors.pan}>{I('pan', { maxLength: 10, placeholder: 'ABCDE1234F', autoComplete: 'off' })}</Field>
                  <Field label="Name as on PAN" required error={errors.nameOnPan}>{I('nameOnPan')}</Field>
                </div>
                <hr className="border-slate-100" />
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Account holder name" required error={errors.accountHolder} hint="Must match your name or business name" className="md:col-span-2">{I('accountHolder')}</Field>
                  <Field label="Account number" required error={errors.accountNumber}>{I('accountNumber', { inputMode: 'numeric', maxLength: 18, autoComplete: 'off', type: 'password' })}</Field>
                  <Field label="Confirm account number" required error={errors.accountNumberConfirm}>{I('accountNumberConfirm', { inputMode: 'numeric', maxLength: 18, autoComplete: 'off', onPaste: (e) => e.preventDefault() })}</Field>
                  <Field label="IFSC" required error={errors.ifsc}>{I('ifsc', { maxLength: 11, placeholder: 'SBIN0001234' })}</Field>
                  <Field label="Account type">
                    <select className={inputCls()} value={f.accountType} onChange={set('accountType')}>
                      <option value="savings">Savings</option>
                      <option value="current">Current</option>
                    </select>
                  </Field>
                  <Field label="Bank name" required error={errors.bankName}>{I('bankName')}</Field>
                  <Field label="Branch">{I('branch')}</Field>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">PDF, JPG, PNG or WEBP, up to 5 MB each. Documents are stored privately and never published.</p>
                {DOCS.map((d) => {
                  const needed = d.required || (d.requiredIf && f[d.requiredIf]);
                  const file = files[d.key];
                  return (
                    <div key={d.key} className={`flex flex-col sm:flex-row sm:items-center gap-3 justify-between border rounded-xl p-4 ${errors[d.key] ? 'border-red-300 bg-red-50/40' : 'border-slate-200'}`}>
                      <div>
                        <div className="font-medium text-slate-900 text-sm">{d.label} {needed && <span className="text-red-500">*</span>}</div>
                        <div className="text-xs text-slate-500">{file ? `${file.name} · ${(file.size / 1024).toFixed(0)} KB` : d.hint || (needed ? 'Required' : 'Optional')}</div>
                        {errors[d.key] && <div className="text-xs text-red-600 mt-1">{errors[d.key]}</div>}
                      </div>
                      <label className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-300 text-sm font-medium cursor-pointer hover:bg-slate-50 shrink-0">
                        <Icon name={file ? 'RefreshCw' : 'Upload'} size={14} /> {file ? 'Replace' : 'Upload'}
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="sr-only" onChange={(e) => { setFiles((s) => ({ ...s, [d.key]: e.target.files?.[0] })); setErrors((s) => ({ ...s, [d.key]: undefined })); }} />
                      </label>
                    </div>
                  );
                })}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Create password" required error={errors.password} hint="For your Partner Dashboard login">{I('password', { type: 'password', autoComplete: 'new-password' })}</Field>
                  <Field label="Confirm password" required error={errors.passwordConfirm}>{I('passwordConfirm', { type: 'password', autoComplete: 'new-password' })}</Field>
                </div>
                <div className="rounded-xl border border-slate-200">
                  <button type="button" onClick={() => setShowTerms((s) => !s)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-800">
                    Partner Terms &amp; Conditions (version {program?.terms?.version})
                    <Icon name={showTerms ? 'ChevronUp' : 'ChevronDown'} size={16} />
                  </button>
                  {showTerms && <pre className="px-4 pb-4 max-h-80 overflow-y-auto whitespace-pre-wrap font-sans text-sm text-slate-600 leading-relaxed">{program?.terms?.content}</pre>}
                </div>
                <label className="flex gap-3 items-start text-sm text-slate-700">
                  <input type="checkbox" className="mt-0.5 h-4 w-4" checked={f.acceptTerms} onChange={set('acceptTerms')} />
                  <span>I have read and accept the Partner Terms &amp; Conditions. I understand Reynrel does not guarantee any sales or income. {errors.acceptTerms && <span className="text-red-600 block">{errors.acceptTerms}</span>}</span>
                </label>
                <label className="flex gap-3 items-start text-sm text-slate-700">
                  <input type="checkbox" className="mt-0.5 h-4 w-4" checked={f.consentDataProcessing} onChange={set('consentDataProcessing')} />
                  <span>I consent to Reynrel collecting and processing my personal, PAN and bank details to verify my application and pay commission, as described in the <Link to="/privacy-policy" className="text-blue-600 underline" target="_blank">Privacy Policy</Link>. {errors.consentDataProcessing && <span className="text-red-600 block">{errors.consentDataProcessing}</span>}</span>
                </label>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              <Btn variant="outline" icon="ArrowLeft" onClick={() => setStep((s) => s - 1)} disabled={step === 0} type="button">Back</Btn>
              {step < 4 ? (
                <Btn onClick={next} type="button">Continue <Icon name="ArrowRight" size={16} /></Btn>
              ) : (
                <Btn onClick={submit} loading={submitting} icon="Send" type="button" disabled={!program}>Submit application</Btn>
              )}
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">Already applied? <Link to="/partners/login" className="text-blue-600 font-medium">Log in to check status</Link></p>
        </div>
      </main>
    </div>
  );
};

export default PartnerRegister;

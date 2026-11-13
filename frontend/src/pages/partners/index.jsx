import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../../components/Seo';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import Icon from '../../components/AppIcon';
import { publicApi } from '../../lib/apiClient';
import { inr } from '../../components/partner/ui';

const PARTNER_TYPES = [
  { icon: 'FileText', title: 'GST Consultants & Tax Practitioners', text: 'You already file GSTR-1 and 3B for shop owners. Clients who bill in software give you cleaner data and fewer month-end corrections.' },
  { icon: 'Calculator', title: 'Chartered Accountants & Accountants', text: 'Recommend a billing system that exports GST-ready reports, so books close faster and you spend less time re-keying paper bills.' },
  { icon: 'Laptop', title: 'IT Consultants & System Integrators', text: 'Bundle installation, printer and barcode setup with a license. Earn on the software and keep your service income.' },
  { icon: 'Printer', title: 'POS & Computer Hardware Dealers', text: 'Every thermal printer, scanner or billing PC you sell is a chance to offer the software that runs on it.' },
  { icon: 'Handshake', title: 'Technology Partners & Resellers', text: 'Add Reynrel products to your catalogue with partner pricing, demo access and installation support from our team.' },
  { icon: 'Users', title: 'Business Associations & Trainers', text: 'Trade bodies, MSME trainers and Tally/GST instructors who regularly advise small businesses on going digital.' }
];

const BENEFITS = [
  { icon: 'IndianRupee', title: 'Commission on every approved sale', text: 'Earn a percentage of each license your customers buy. Your rate is set per product and visible in your dashboard.' },
  { icon: 'RefreshCcw', title: 'Renewal income', text: 'Billing OS is an annual license. When your customer renews, you can earn renewal commission — income that builds year on year.' },
  { icon: 'LayoutDashboard', title: 'Your own Partner Dashboard', text: 'Add customers, request installations, track approval status, see every commission entry and request payouts.' },
  { icon: 'Wrench', title: 'We handle installation', text: 'Submit an installation request; our team sets up the software remotely or on-site and trains the customer.' },
  { icon: 'BadgeCheck', title: 'No joining fee, no targets', text: 'Free to join. There is no minimum sales commitment and you can start with a single customer.' },
  { icon: 'Landmark', title: 'Direct bank payouts', text: 'Withdraw once your available balance reaches ₹5,000. Payouts go to your verified bank account with TDS certificate.' }
];

const STEPS = [
  { title: 'Apply online', text: 'Fill the partner form with your business, PAN and bank details and upload documents. Takes about 10 minutes.' },
  { title: 'Verification', text: 'Our team verifies your documents and calls you for a short onboarding conversation.' },
  { title: 'Get dashboard access', text: 'Once approved, log in to your Partner Dashboard. We assign products, demo access and your commission rates.' },
  { title: 'Register customers', text: 'Add each customer in the dashboard before they buy, and raise an installation request in the same step.' },
  { title: 'Earn & withdraw', text: 'Commission is credited automatically when Reynrel approves the customer. Withdraw from ₹5,000.' }
];

const OPPORTUNITIES = [
  { icon: 'Store', title: 'Kirana & general stores', text: 'Most still bill by hand or on a basic calculator. Fast barcode billing and digital udhar (credit) are easy to demonstrate.' },
  { icon: 'Pill', title: 'Pharmacies & medical stores', text: 'Batch and expiry tracking is a daily pain point. Expiry alerts alone often justify the license.' },
  { icon: 'Truck', title: 'FMCG distributors & wholesalers', text: 'B2B GST invoices, vendor ledgers and purchase entry for businesses that bill other businesses.' },
  { icon: 'Shirt', title: 'Garment, footwear & hardware shops', text: 'Large SKU counts, barcode labels and stock reports across counters.' },
  { icon: 'MapPin', title: 'Tier-2 & Tier-3 towns', text: 'Fewer software vendors on the ground — local consultants are the trusted advisor. Strong fit for the North-East, where Reynrel is based.' },
  { icon: 'Building2', title: 'Newly GST-registered businesses', text: 'New registrations need compliant invoices from day one — the moment they speak to their consultant.' }
];

const FAQ = [
  { q: 'Is there any fee to become a partner?', a: 'No. Joining is free and there is no minimum sales target.' },
  { q: 'Who can apply?', a: 'Any Indian resident or business with a valid PAN and a bank account in the same name — GST consultants, CAs, accountants, IT consultants, hardware dealers, resellers and other professionals who advise businesses.' },
  { q: 'How is commission calculated?', a: 'On the license value Reynrel actually receives (excluding GST), at the commission percentage assigned to you for that product. It is credited automatically when we approve your customer registration.' },
  { q: 'When can I withdraw?', a: 'When your available commission reaches ₹5,000. Request the withdrawal from your dashboard; once approved we transfer it to your verified bank account. Applicable TDS is deducted and reflected in your Form 26AS.' },
  { q: 'Do I have to install the software myself?', a: 'No. Raise an installation request from the dashboard and our support team installs and trains the customer. IT partners can choose to install themselves.' },
  { q: 'What if the customer asks for a refund?', a: 'If a sale is refunded or cancelled, the related commission is reversed. This is shown as a reversal entry in your commission history.' },
  { q: 'How much can I earn?', a: 'It depends entirely on how many customers you bring. We do not promise any income. Use the estimator on this page with your own numbers to plan.' },
  { q: 'Is my PAN and bank information safe?', a: 'PAN and account numbers are encrypted before storage, documents are kept in private storage that is never publicly accessible, and only authorised Reynrel staff can view them — every access is logged.' }
];

const Slider = ({ label, value, set, min, max, step, format }) => (
  <label className="block">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900 tabular-nums">{format(value)}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="w-full accent-blue-600" />
  </label>
);

const EarningsEstimator = ({ defaultRate, renewalRate }) => {
  const [customers, setCustomers] = useState(4);
  const [planValue, setPlanValue] = useState(4999);
  const [rate, setRate] = useState(defaultRate || 20);
  const [renewalShare, setRenewalShare] = useState(60);

  const monthly = (customers * planValue * rate) / 100;
  const yearOne = monthly * 12;
  const renewalYearTwo = customers * 12 * (renewalShare / 100) * planValue * ((renewalRate || 10) / 100);
  const monthsToThreshold = monthly > 0 ? Math.ceil(5000 / monthly) : null;


  return (
    <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
      <div className="space-y-5 bg-white rounded-2xl border border-slate-200 p-5 md:p-6">
        <Slider label="New customers per month" value={customers} set={setCustomers} min={1} max={25} step={1} format={(v) => v} />
        <label className="block">
          <span className="text-sm text-slate-600">Average plan value (excl. GST)</span>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[{ v: 4999, l: 'Standard ₹4,999' }, { v: 12999, l: 'Business ₹12,999' }].map((o) => (
              <button key={o.v} type="button" onClick={() => setPlanValue(o.v)} className={`h-10 rounded-lg border text-sm font-medium ${planValue === o.v ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300 text-slate-600'}`}>
                {o.l}
              </button>
            ))}
          </div>
        </label>
        <Slider label="Your commission rate" value={rate} set={setRate} min={10} max={30} step={1} format={(v) => `${v}%`} />
        <Slider label="Customers who renew next year" value={renewalShare} set={setRenewalShare} min={0} max={100} step={5} format={(v) => `${v}%`} />
      </div>
      <div className="rounded-2xl bg-slate-900 text-white p-6 md:p-8">
        <p className="text-sm text-slate-300">Illustrative commission at these inputs</p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-3xl md:text-4xl font-bold tabular-nums">{inr(Math.round(monthly))}</div>
            <div className="text-sm text-slate-400">per month</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold tabular-nums">{inr(Math.round(yearOne))}</div>
            <div className="text-sm text-slate-400">first 12 months</div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-white/10 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-400">Renewal commission in year 2 (at {renewalRate || 10}%)</span><span className="font-semibold tabular-nums">{inr(Math.round(renewalYearTwo))}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Months to reach ₹5,000 withdrawal threshold</span><span className="font-semibold tabular-nums">{monthsToThreshold ?? '—'}</span></div>
        </div>
        <p className="mt-6 text-xs text-slate-400 leading-relaxed">
          This is a calculator, not a forecast. It multiplies the numbers you enter; it does not reflect what any partner has earned. Actual earnings depend on the customers you register and Reynrel approves, the plans they buy, refunds, renewals and your assigned rates. TDS applies on payouts.
        </p>
      </div>
    </div>
  );
};

const PartnersLanding = () => {
  const [program, setProgram] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    publicApi.get('/partners/program').then((r) => setProgram(r.data)).catch(() => {});
  }, []);

  const tiers = useMemo(() => program?.tiers || [
    { name: 'Associate', minCustomersPerQuarter: 0, commissionPercent: 20, renewalPercent: 10 },
    { name: 'Silver', minCustomersPerQuarter: 10, commissionPercent: 25, renewalPercent: 12 },
    { name: 'Gold', minCustomersPerQuarter: 30, commissionPercent: 30, renewalPercent: 15 }
  ], [program]);
  const minW = program?.minWithdrawal ?? 5000;

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Partner Program — Earn by bringing customers to Reynrel software"
        description="Become a Reynrel software partner. GST consultants, accountants, IT consultants and resellers earn commission and renewal income with a dedicated partner dashboard."
        path="/partners"
      />
      <Header />
      <main className="pt-16 lg:pt-20">
        {/* HERO */}
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(60% 60% at 80% 10%, #2563eb55 0%, transparent 60%), radial-gradient(40% 50% at 0% 100%, #10b98133 0%, transparent 60%)' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-200 ring-1 ring-white/15">
                <Icon name="Handshake" size={14} /> Reynrel Partner Program
              </span>
              <h1 className="mt-5 text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                Your clients need billing software.<br className="hidden md:block" /> <span className="text-blue-400">You earn when they choose ours.</span>
              </h1>
              <p className="mt-5 text-lg text-slate-300 max-w-xl">
                For GST consultants, accountants, IT consultants and resellers. Register customers, request installations and track every rupee of commission from your own Partner Dashboard.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/partners/register" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold">
                  Apply to become a partner <Icon name="ArrowRight" size={18} />
                </Link>
                <Link to="/partners/login" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg ring-1 ring-white/25 hover:bg-white/10 font-semibold">
                  Partner login
                </Link>
              </div>
              <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-300">
                {['Free to join, no targets', `Commission from ${tiers[0]?.commissionPercent}% per sale`, 'Renewal commission', `Withdraw from ${inr(minW)}`].map((t) => (
                  <li key={t} className="flex items-center gap-2"><Icon name="CheckCircle2" size={16} className="text-emerald-400" />{t}</li>
                ))}
              </ul>
            </div>
            {/* Dashboard preview built from the real portal layout */}
            <div className="hidden lg:block">
              <div className="rounded-2xl bg-white text-slate-900 shadow-2xl ring-1 ring-white/10 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs text-slate-500">Partner Dashboard — sample data</span>
                </div>
                <div className="p-5 grid grid-cols-3 gap-3">
                  {[['Available', '₹6,250'], ['Customers', '14'], ['Pending', '2']].map(([l, v]) => (
                    <div key={l} className="rounded-lg border border-slate-200 p-3"><div className="text-xs text-slate-500">{l}</div><div className="text-xl font-semibold">{v}</div></div>
                  ))}
                  <div className="col-span-3 rounded-lg border border-slate-200 p-3">
                    <div className="text-xs text-slate-500 mb-2">Commission, last 6 months</div>
                    <div className="flex items-end gap-2 h-24">
                      {[30, 45, 38, 60, 72, 90].map((h, i) => <div key={i} className="flex-1 rounded-t bg-blue-600" style={{ height: `${h}%`, opacity: 0.5 + i * 0.1 }} />)}
                    </div>
                  </div>
                  <div className="col-span-3 rounded-lg border border-slate-200 divide-y divide-slate-100 text-sm">
                    {[['Sharma General Store', 'Approved', 'text-emerald-600'], ['Medicare Pharmacy', 'Installation scheduled', 'text-blue-600'], ['Brahmaputra Traders', 'Pending approval', 'text-amber-600']].map(([n, s, c]) => (
                      <div key={n} className="flex justify-between px-3 py-2"><span>{n}</span><span className={`text-xs font-medium ${c}`}>{s}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MARKET */}
        <section className="border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div>
              <div className="text-3xl font-bold text-slate-900">1.5 crore+</div>
              <p className="text-sm text-slate-500 mt-1">active GST taxpayers in India (GSTN, mid-2025) — every one must issue GST-compliant invoices.</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900">20–55%</div>
              <p className="text-sm text-slate-500 mt-1">range of first-sale commissions advertised by Indian billing-software partner programs. Ours is set per product, starting at {tiers[0]?.commissionPercent}%.</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900">Annual</div>
              <p className="text-sm text-slate-500 mt-1">license model — each customer you bring can renew every year, so your client base keeps paying off.</p>
            </div>
          </div>
        </section>

        {/* WHO */}
        <section className="py-16 md:py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Who it's for</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">Built for people small businesses already trust</h2>
              <p className="mt-3 text-slate-600">If shop owners ask you “which billing software should I use?”, you are already doing the hard part.</p>
            </div>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {PARTNER_TYPES.map((t) => (
                <div key={t.title} className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Icon name={t.icon} size={20} /></div>
                  <h3 className="mt-4 font-semibold text-slate-900">{t.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{t.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Why partner with Reynrel</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">More than a referral link</h2>
              <p className="mt-3 text-slate-600">You get a full business workspace: customers, installations, commission ledger and payouts in one place.</p>
            </div>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {BENEFITS.map((b) => (
                <div key={b.title} className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-slate-900 text-white flex items-center justify-center"><Icon name={b.icon} size={18} /></div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{b.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">{b.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TIERS */}
        <section className="py-16 md:py-20 bg-slate-50" id="commission">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Commission structure</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">Grow your rate as you grow</h2>
              <p className="mt-3 text-slate-600">Typical starting rates by partner level. Your exact rate for each product is confirmed at approval and always visible in your dashboard.</p>
            </div>
            <div className="mt-10 grid md:grid-cols-3 gap-5">
              {tiers.map((t, i) => (
                <div key={t.name} className={`rounded-2xl p-6 border ${i === 1 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{t.name}</h3>
                    {i === 1 && <span className="text-xs bg-blue-600 rounded-full px-2 py-0.5">Most partners aim here</span>}
                  </div>
                  <p className={`text-sm mt-1 ${i === 1 ? 'text-slate-300' : 'text-slate-500'}`}>
                    {t.minCustomersPerQuarter ? `${t.minCustomersPerQuarter}+ approved customers per quarter` : 'Every new partner starts here'}
                  </p>
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{t.commissionPercent}%</span>
                    <span className={`text-sm ${i === 1 ? 'text-slate-300' : 'text-slate-500'}`}>on first-year license</span>
                  </div>
                  <div className={`mt-2 text-sm ${i === 1 ? 'text-slate-300' : 'text-slate-600'}`}>+ {t.renewalPercent}% on renewals</div>
                  <div className={`mt-6 pt-4 border-t text-sm ${i === 1 ? 'border-white/10 text-slate-300' : 'border-slate-100 text-slate-600'}`}>
                    Example: Billing OS Standard ₹4,999 → <strong className={i === 1 ? 'text-white' : 'text-slate-900'}>{inr(Math.round(4999 * t.commissionPercent / 100))}</strong> per sale
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ESTIMATOR */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Plan your numbers</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">Commission estimator</h2>
              <p className="mt-3 text-slate-600">
                A realistic way to plan: if you advise 100 business clients and 3–5 a month move to proper billing software, that's where most new partners start. Enter your own numbers.
              </p>
            </div>
            <EarningsEstimator key={tiers[0]?.commissionPercent} defaultRate={tiers[0]?.commissionPercent} renewalRate={tiers[0]?.renewalPercent} />
          </div>
        </section>

        {/* OPPORTUNITY */}
        <section className="py-16 md:py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Where the opportunity is</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">Segments that convert well</h2>
            </div>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {OPPORTUNITIES.map((o) => (
                <div key={o.title} className="bg-white rounded-xl border border-slate-200 p-6">
                  <Icon name={o.icon} size={22} className="text-blue-600" />
                  <h3 className="mt-3 font-semibold text-slate-900">{o.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{o.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">How it works</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">From application to first payout</h2>
            </div>
            <ol className="mt-10 grid md:grid-cols-5 gap-6">
              {STEPS.map((s, i) => (
                <li key={s.title} className="relative">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center">{i + 1}</div>
                  <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ELIGIBILITY */}
        <section className="py-16 md:py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Eligibility</h2>
              <ul className="mt-6 space-y-3 text-slate-700">
                {[
                  'Indian resident individual, proprietorship, partnership, LLP or company',
                  'Valid PAN (individual or business)',
                  'Bank account in the same name as the PAN holder or business',
                  'You work with, or have access to, small and medium businesses',
                  'Agreement to describe products accurately and follow the partner terms'
                ].map((t) => (
                  <li key={t} className="flex gap-3"><Icon name="Check" size={18} className="text-emerald-600 mt-0.5 shrink-0" />{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Keep these documents ready</h2>
              <ul className="mt-6 space-y-3 text-slate-700">
                {[
                  ['PAN card', 'required'],
                  ['Cancelled cheque or first page of bank passbook', 'required'],
                  ['Address proof (Aadhaar with first 8 digits masked, utility bill, rent agreement)', 'required'],
                  ['GST registration certificate', 'if you have a GSTIN'],
                  ['Professional certificate (ICAI/ICMAI membership, GST practitioner enrolment)', 'optional'],
                  ['Passport-size photo', 'optional']
                ].map(([t, tag]) => (
                  <li key={t} className="flex gap-3 items-start">
                    <Icon name="FileCheck2" size={18} className="text-blue-600 mt-0.5 shrink-0" />
                    <span>{t} <span className="text-xs text-slate-500">· {tag}</span></span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-slate-500">PDF, JPG or PNG, up to 5 MB each.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900 text-center">Questions partners ask</h2>
            <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
              {FAQ.map((f, i) => (
                <div key={f.q}>
                  <button className="w-full flex items-center justify-between py-4 text-left font-medium text-slate-900" onClick={() => setOpenFaq(openFaq === i ? -1 : i)} aria-expanded={openFaq === i}>
                    {f.q}
                    <Icon name={openFaq === i ? 'Minus' : 'Plus'} size={18} className="text-slate-400 shrink-0 ml-4" />
                  </button>
                  {openFaq === i && <p className="pb-4 text-slate-600 text-sm leading-relaxed">{f.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-blue-600 text-white px-6 py-12 md:p-14 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div>
                <h2 className="text-3xl font-bold">Ready to add a new income line to your practice?</h2>
                <p className="mt-2 text-blue-100">Apply in about 10 minutes. We'll review and get back to you.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link to="/partners/register" className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-white text-blue-700 font-semibold hover:bg-blue-50">Apply now</Link>
                <a href="https://wa.me/919864773099?text=Hi%2C%20I%27d%20like%20to%20know%20more%20about%20the%20Reynrel%20Partner%20Program" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg ring-1 ring-white/40 font-semibold hover:bg-white/10">
                  <Icon name="MessageCircle" size={18} /> Talk to us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PartnersLanding;

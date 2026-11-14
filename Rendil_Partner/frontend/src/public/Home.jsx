import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BadgeIndianRupee, Repeat, Headset, LayoutDashboard, Landmark, Tag, Wallet, Check, ChevronDown,
  Calculator, Building2, Laptop, Store, BookOpen, ShieldCheck, Clock, UserPlus, CircleCheck
} from 'lucide-react';
import { inr } from '../lib/format';
import { PublicHeader, PublicFooter, usePublicProducts, useSeo } from './PublicLayout';

const WHO = [
  { icon: BookOpen, title: 'GST consultants & CAs', text: 'Your clients already ask which billing software to use. Recommend one you can support and earn on it.' },
  { icon: Laptop, title: 'IT consultants & hardware dealers', text: 'Bundle software with the computers, printers and barcode scanners you already sell and install.' },
  { icon: Store, title: 'Inventory & POS software partners', text: 'Serve kirana, pharmacy, FMCG and retail stores in your area with a product built for them.' },
  { icon: Building2, title: 'Software resellers', text: 'Add products to your catalogue with partner pricing, commission on renewals and no stock to hold.' }
];

const BENEFITS = [
  { icon: Wallet, title: 'No joining fee', text: 'Apply free. No deposit, minimum target or stock to buy.' },
  { icon: BadgeIndianRupee, title: 'Commission on every sale', text: 'A fixed percentage of every customer you bring, shown upfront for each product.' },
  { icon: Repeat, title: 'Renewal income', text: 'Earn again every year your customers renew their licence.' },
  { icon: Headset, title: 'We handle setup & support', text: 'Installation, training and technical support come from Reynrel, so you stay focused on selling.' },
  { icon: Tag, title: 'Partner pricing', text: 'Active partners can get special prices to close bigger or price-sensitive deals.' },
  { icon: LayoutDashboard, title: 'Your own dashboard', text: 'Add customers, follow their approval and see every rupee you have earned.' },
  { icon: Landmark, title: 'Bank payouts', text: 'Withdraw to your bank account once you cross the minimum. TDS is deducted as per law.' },
  { icon: ShieldCheck, title: 'Local, honest product', text: 'Made in India for Indian businesses: GST billing, offline-ready, simple yearly pricing.' }
];

// Market estimates. Assumptions: average sale ₹5,000–₹12,000, commission 20–30%, new sales only (renewals are extra).
const MARKET = [
  { who: 'GST consultant / CA (part-time)', sales: '1–4', range: '₹1,000 – ₹15,000', note: 'Converts a few of an existing client base each month.' },
  { who: 'IT consultant / hardware dealer', sales: '3–8', range: '₹3,000 – ₹30,000', note: 'Bundles software with hardware and installation jobs.' },
  { who: 'Inventory / POS software partner', sales: '5–15', range: '₹5,000 – ₹55,000', note: 'Focuses on retail stores in one city or district.' },
  { who: 'Full-time software reseller with a team', sales: '15–40', range: '₹15,000 – ₹1,40,000', note: 'Runs field sales and demos as a business.' }
];

const STEPS = [
  { icon: UserPlus, title: 'Apply in 2 minutes', text: 'Tell us who you are and where you work. No documents needed to apply.' },
  { icon: Clock, title: 'Get approved', text: 'We review your application and call you. Once approved, log in with the password you chose.' },
  { icon: Building2, title: 'Add your customers', text: 'Enter the business details and the product they want. We verify and onboard the customer.' },
  { icon: BadgeIndianRupee, title: 'Earn and withdraw', text: 'Commission is credited when the customer is approved. Withdraw to your bank from the dashboard.' }
];

export default function Home() {
  useSeo('Reynrel Partner Program — earn commission selling GST billing & inventory software',
    'Become a Reynrel software partner. GST consultants, IT consultants and resellers earn commission and renewal income on inventory and billing software. Free to join.');
  const { data, isLoading } = usePublicProducts();
  const products = data?.products || [];
  const minWithdrawal = data?.minWithdrawal ?? 5000;
  const topRate = products.reduce((m, p) => Math.max(m, p.commissionPct), 0);

  return (
    <div className="bg-white text-slate-900">
      <PublicHeader home />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white border border-brand-100 px-3 py-1 text-xs font-medium text-brand-700">Free to join · Commission + renewals</span>
              <h1 className="mt-5 text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight">Earn by recommending software your clients already need</h1>
              <p className="mt-5 text-lg text-slate-600 max-w-xl">Join the Reynrel Partner Program as a GST consultant, IT consultant or software reseller. Bring customers for our billing and inventory software. We install and support it, and you earn commission on every sale and renewal.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/apply" className="inline-flex h-12 px-6 items-center gap-2 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700">Apply now <ArrowRight size={18} /></Link>
                <a href="#earnings" className="inline-flex h-12 px-6 items-center gap-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-50"><Calculator size={18} />Estimate earnings</a>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                {['No joining fee', 'No sales target', 'Payouts to your bank'].map((t) => <li key={t} className="flex items-center gap-1.5"><CircleCheck size={16} className="text-emerald-600" />{t}</li>)}
              </ul>
            </div>
            <HeroCard products={products} loading={isLoading} />
          </div>
        </section>

        {/* Who it's for */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <SectionHead eyebrow="Who can join" title="Built for people who already advise businesses" />
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHO.map((w) => (
              <div key={w.title} className="rounded-xl border border-slate-200 p-5">
                <span className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><w.icon size={20} /></span>
                <h3 className="mt-4 font-semibold">{w.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{w.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="bg-slate-50 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <SectionHead eyebrow="Benefits" title="Why partner with Reynrel" text="A simple programme: clear commission, no hidden conditions, and a team that does the technical work for you." />
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {BENEFITS.map((b) => (
                <div key={b.title} className="rounded-xl bg-white border border-slate-200 p-5">
                  <b.icon size={22} className="text-brand-600" />
                  <h3 className="mt-3 font-semibold">{b.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-600">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products */}
        <section id="products" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 scroll-mt-16">
          <SectionHead eyebrow="Products" title="Software you can sell" text="Each product solves a daily problem for Indian businesses. Prices and commission below are current partner programme rates." />
          <div className="mt-10 space-y-6">
            {isLoading && [0, 1].map((i) => <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />)}
            {!isLoading && products.length === 0 && <p className="text-center text-slate-500">Products will be listed here soon.</p>}
            {products.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>

        {/* Earnings */}
        <section id="earnings" className="bg-slate-950 text-white scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <SectionHead dark eyebrow="Earnings" title="What can you realistically earn?" text="Your income depends on how many customers you bring. Here is an honest way to estimate it." />
            <div className="mt-10 grid lg:grid-cols-5 gap-6">
              <EarningsCalculator products={products} />
              <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-6">
                <h3 className="font-semibold">How commission works</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  <li className="flex gap-2"><Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />{topRate ? `Up to ${topRate}% of the sale value on new customers, set per product.` : 'A fixed percentage of the sale value on new customers, set per product.'}</li>
                  <li className="flex gap-2"><Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />A renewal percentage each year the customer renews.</li>
                  <li className="flex gap-2"><Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />Credited when we approve and onboard the customer — you can see it in your dashboard.</li>
                  <li className="flex gap-2"><Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />Withdraw once your balance reaches {inr(minWithdrawal)}. TDS is deducted under the Income Tax Act.</li>
                  <li className="flex gap-2"><Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />Consistent partners can be offered higher rates and special pricing.</li>
                </ul>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-xl font-semibold">Market research: typical software partner income in India</h3>
              <p className="mt-2 text-sm text-slate-400 max-w-3xl">Published partner programmes of Indian billing and accounting software brands advertise 20–40% on licence sales (a few up to 55% including incentives) and quote ₹20,000–₹50,000 a month for active resellers. Headline “up to” figures are usually top performers, not averages. Our estimates below assume an average sale of ₹5,000–₹12,000 at 20–30% commission, new sales only.</p>
              <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm min-w-[620px]">
                  <thead className="bg-white/5 text-slate-300 text-left">
                    <tr><th className="px-4 py-3 font-medium">Partner type</th><th className="px-4 py-3 font-medium">New customers / month</th><th className="px-4 py-3 font-medium">Estimated monthly commission</th><th className="px-4 py-3 font-medium">Typical pattern</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {MARKET.map((m) => (
                      <tr key={m.who}><td className="px-4 py-3 font-medium">{m.who}</td><td className="px-4 py-3 tabular">{m.sales}</td><td className="px-4 py-3 tabular text-emerald-300 font-medium whitespace-nowrap">{m.range}</td><td className="px-4 py-3 text-slate-400">{m.note}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-slate-500">Estimates for planning only — not a promise of income. Actual earnings depend on your effort, market and the products you sell.</p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 scroll-mt-16">
          <SectionHead eyebrow="How it works" title="From application to first payout" />
          <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-xl border border-slate-200 p-5">
                <span className="absolute top-5 right-5 text-3xl font-bold text-slate-100 tabular">{i + 1}</span>
                <s.icon size={22} className="text-brand-600" />
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-slate-50 scroll-mt-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
            <SectionHead eyebrow="FAQ" title="Common questions" />
            <div className="mt-8 space-y-3">
              {[
                ['Does it cost anything to join?', 'No. There is no joining fee, deposit or minimum target.'],
                ['What do I need to apply?', 'Only your name, mobile, email, city and what kind of work you do. After approval you add your PAN and bank account in your profile so we can pay you.'],
                ['When do I get my commission?', 'When we approve and onboard the customer you added. The amount is credited to your dashboard straight away and can be withdrawn once your balance reaches the minimum.'],
                ['Do I have to install or support the software?', 'No. Reynrel installs the software, trains the customer and provides support. You can help if you want to, but it is not required.'],
                ['Do I need GST registration?', 'No. GST registration is optional. TDS is deducted from payouts as required by the Income Tax Act.'],
                ['Can I earn on renewals?', 'Yes. Each product has a renewal commission that is credited every year the customer renews.'],
                ['Can I get special prices for a customer?', 'Yes. Active partners can ask for negotiated pricing. Approved prices show in your dashboard.']
              ].map(([q, a]) => (
                <details key={q} className="group rounded-xl bg-white border border-slate-200 px-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer font-medium">{q}<ChevronDown size={18} className="text-slate-400 shrink-0 transition-transform group-open:rotate-180" /></summary>
                  <p className="pb-4 -mt-1 text-sm text-slate-600">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="rounded-2xl bg-brand-600 text-white px-6 py-12 md:px-12 text-center">
            <h2 className="text-3xl font-bold">Ready to become a Reynrel partner?</h2>
            <p className="mt-3 text-brand-100 max-w-xl mx-auto">Apply in two minutes. We will review your application and get in touch.</p>
            <Link to="/apply" className="mt-8 inline-flex h-12 px-7 items-center gap-2 rounded-lg bg-white text-brand-700 font-semibold hover:bg-brand-50">Apply now <ArrowRight size={18} /></Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

function SectionHead({ eyebrow, title, text, dark }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className={`text-sm font-semibold uppercase tracking-wide ${dark ? 'text-brand-100' : 'text-brand-600'}`}>{eyebrow}</div>
      <h2 className="mt-2 text-3xl font-bold tracking-tight">{title}</h2>
      {text && <p className={`mt-3 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{text}</p>}
    </div>
  );
}

const bestPlan = (p) => p.plans.find((x) => x.price > 0) || p.plans[0];

function HeroCard({ products, loading }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-xl shadow-brand-900/5 p-6 min-h-[280px]">
      <div className="text-sm font-semibold text-slate-500">What you earn per customer</div>
      {loading ? <div className="mt-4 space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-14 rounded-lg bg-slate-100 animate-pulse" />)}</div> : (
        <ul className="mt-4 divide-y divide-slate-100">
          {products.flatMap((p) => p.plans.filter((x) => x.price > 0).slice(0, 2).map((pl) => (
            <li key={`${p.id}-${pl.name}`} className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0"><div className="font-medium truncate">{p.name}</div><div className="text-xs text-slate-500">{pl.name} · {inr(pl.price)}/{pl.billing_cycle === 'monthly' ? 'month' : pl.billing_cycle === 'one_time' ? 'one-time' : 'year'} · {p.commissionPct}%</div></div>
              <div className="text-right shrink-0"><div className="text-lg font-bold text-emerald-700 tabular">{inr((pl.price * p.commissionPct) / 100)}</div><div className="text-[11px] text-slate-500">per sale</div></div>
            </li>
          )))}
        </ul>
      )}
      <p className="mt-4 text-xs text-slate-500">Plus renewal commission every year the customer renews.</p>
    </div>
  );
}

function ProductCard({ p }) {
  const groups = useMemo(() => p.features.slice(0, 8), [p.features]);
  const plan = bestPlan(p);
  return (
    <article className="rounded-2xl border border-slate-200 overflow-hidden grid lg:grid-cols-5">
      <div className="lg:col-span-3 p-6 md:p-8">
        {p.category && <div className="text-xs font-semibold uppercase tracking-wide text-brand-600">{p.category}</div>}
        <h3 className="mt-1 text-2xl font-bold">{p.name}</h3>
        {p.tagline && <p className="mt-1 text-slate-700 font-medium">{p.tagline}</p>}
        {p.description && <p className="mt-3 text-sm text-slate-600 whitespace-pre-line">{p.description}</p>}
        {groups.length > 0 && (
          <ul className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-3">
            {groups.map((f) => (
              <li key={f.title} className="flex gap-2 text-sm"><Check size={16} className="text-emerald-600 shrink-0 mt-0.5" /><span><span className="font-medium">{f.title}</span>{f.description && <span className="block text-slate-500">{f.description}</span>}</span></li>
            ))}
          </ul>
        )}
        {p.websiteUrl && <a href={p.websiteUrl} target="_blank" rel="noopener" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-600">See the full product page <ArrowRight size={14} /></a>}
      </div>
      <div className="lg:col-span-2 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 p-6 md:p-8 flex flex-col">
        <div className="text-sm text-slate-500">Your commission</div>
        <div className="mt-1 flex items-baseline gap-2"><span className="text-4xl font-bold text-emerald-700 tabular">{p.commissionPct}%</span><span className="text-sm text-slate-600">on new sales</span></div>
        {p.renewalPct > 0 && <div className="text-sm text-slate-600">{p.renewalPct}% on every renewal</div>}
        {p.plans.length > 0 && (
          <ul className="mt-5 space-y-2 text-sm">
            {p.plans.map((pl) => (
              <li key={pl.name} className="flex justify-between gap-3 rounded-lg bg-white border border-slate-200 px-3 py-2">
                <span className="font-medium">{pl.name}</span>
                <span className="tabular text-slate-600">{pl.price > 0 ? inr(pl.price) : 'Free'}{pl.price > 0 && <span className="text-emerald-700 font-medium"> → {inr((pl.price * p.commissionPct) / 100)}</span>}</span>
              </li>
            ))}
          </ul>
        )}
        {plan?.price > 0 && <p className="mt-3 text-xs text-slate-500">Example: one {plan.name} customer earns you {inr((plan.price * p.commissionPct) / 100)}.</p>}
        <Link to="/apply" className="mt-auto pt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">Apply to sell {p.name} <ArrowRight size={14} /></Link>
      </div>
    </article>
  );
}

function EarningsCalculator({ products }) {
  const options = useMemo(() => products.flatMap((p) => p.plans.filter((x) => x.price > 0).map((pl) => ({
    key: `${p.id}:${pl.name}`, label: `${p.name} — ${pl.name} (${inr(pl.price)})`, price: pl.price, renewal: pl.renewal_price ?? pl.price, pct: p.commissionPct, rpct: p.renewalPct
  }))), [products]);
  const [sel, setSel] = useState('');
  const [perMonth, setPerMonth] = useState(3);
  const o = options.find((x) => x.key === sel) || options[0];
  const monthly = o ? (perMonth * o.price * o.pct) / 100 : 0;
  const yearOne = monthly * 12;
  const renewals = o ? (perMonth * 12 * o.renewal * o.rpct) / 100 : 0;
  return (
    <div className="lg:col-span-3 rounded-2xl bg-white text-slate-900 p-6">
      <h3 className="font-semibold flex items-center gap-2"><Calculator size={18} className="text-brand-600" />Earnings estimator</h3>
      {!o ? <p className="mt-4 text-sm text-slate-500">The estimator appears once products are published.</p> : (
        <>
          <label className="block mt-5 text-sm font-medium text-slate-700" htmlFor="calc-plan">Product and plan</label>
          <select id="calc-plan" value={o.key} onChange={(e) => setSel(e.target.value)} className="mt-1 w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm">
            {options.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
          </select>
          <label className="flex justify-between mt-5 text-sm font-medium text-slate-700" htmlFor="calc-n"><span>New customers per month</span><span className="tabular text-brand-700">{perMonth}</span></label>
          <input id="calc-n" type="range" min="1" max="20" value={perMonth} onChange={(e) => setPerMonth(Number(e.target.value))} className="mt-2 w-full accent-brand-600" />
          <dl className="mt-6 grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-emerald-50 p-4"><dt className="text-xs text-emerald-800">Per month</dt><dd className="mt-1 text-2xl font-bold text-emerald-700 tabular">{inr(Math.round(monthly))}</dd></div>
            <div className="rounded-xl bg-slate-50 p-4"><dt className="text-xs text-slate-600">First year</dt><dd className="mt-1 text-2xl font-bold tabular">{inr(Math.round(yearOne))}</dd></div>
            <div className="rounded-xl bg-slate-50 p-4"><dt className="text-xs text-slate-600">Renewals in year 2</dt><dd className="mt-1 text-2xl font-bold tabular">{inr(Math.round(renewals))}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-slate-500">{o.pct}% on new sales{o.rpct ? `, ${o.rpct}% on renewals if every customer renews` : ''}. Before TDS. Illustration only — not a guarantee of income.</p>
        </>
      )}
    </div>
  );
}

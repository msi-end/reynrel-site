import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Copy, Check, AppWindow, UserPlus } from 'lucide-react';
import { PartnerAuth } from '../auth';
import { inr, pct, labelize } from '../lib/format';
import { Card, PageHeader, Badge, Empty, Loading, Button, Tabs } from '../components/ui';
import { useCatalogue } from './useCatalogue';

function CopyBtn({ value }) {
  const [ok, setOk] = useState(false);
  return <button type="button" aria-label="Copy" className="text-slate-400 hover:text-slate-700" onClick={() => { navigator.clipboard?.writeText(value); setOk(true); setTimeout(() => setOk(false), 1200); }}>{ok ? <Check size={14} /> : <Copy size={14} />}</button>;
}

export default function Catalogue() {
  const { data } = useCatalogue();
  const { user: me } = PartnerAuth.useAuth();
  const [active, setActive] = useState(null);
  if (!data) return <Loading rows={6} />;
  if (!data.length) return (<><PageHeader title="Software & pricing" /><Card><Empty icon={AppWindow} title="No products assigned yet">Reynrel will assign products to your account.</Empty></Card></>);
  const p = data.find((x) => x.id === active) || data[0];
  const groups = p.features.reduce((m, f) => { (m[f.group_name || 'Features'] ||= []).push(f); return m; }, {});
  return (
    <>
      <PageHeader title="Software & pricing" subtitle="Products you can sell, your prices and what you earn" />
      {data.length > 1 && <Tabs value={p.id} onChange={setActive} tabs={data.map((x) => [x.id, x.name])} />}
      <div key={p.id} className="grid lg:grid-cols-3 gap-6 items-start rp-fade">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{p.name}</h2>
                <p className="text-sm text-slate-500">{[p.category, p.tagline].filter(Boolean).join(' · ')}</p>
              </div>
              {p.websiteUrl && <a href={p.websiteUrl} target="_blank" rel="noreferrer" className="text-sm text-brand-600 inline-flex items-center gap-1 shrink-0">Product page <ExternalLink size={14} /></a>}
            </div>
            {p.description && <p className="mt-4 text-sm text-slate-700 whitespace-pre-line">{p.description}</p>}
          </Card>
          <Card title="Plans" padded={false}>
            <div className="grid sm:grid-cols-2 gap-4 p-4">
              {p.plans.map((pl) => (
                <div key={pl.id} className="rounded-xl border border-slate-200 p-4 flex flex-col">
                  <div className="flex items-center justify-between"><h3 className="font-semibold">{pl.name}</h3><span className="text-xs text-slate-500">{labelize(pl.billingCycle)}</span></div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tabular">{inr(pl.price)}</span>
                    {pl.negotiated && pl.listPrice !== null && <span className="text-sm text-slate-400 line-through tabular">{inr(pl.listPrice)}</span>}
                  </div>
                  {pl.negotiated && <div className="mt-1"><Badge tone="violet">Your special price{pl.validUntil ? ` until ${pl.validUntil}` : ''}</Badge></div>}
                  <div className="mt-2 text-sm text-emerald-700 font-medium">You earn {inr(pl.earn)} <span className="text-slate-500 font-normal">({pct(p.commissionPct)})</span></div>
                  {pl.description && <p className="mt-2 text-sm text-slate-600">{pl.description}</p>}
                  {pl.inclusions.length > 0 && <ul className="mt-3 space-y-1 text-sm text-slate-700">{pl.inclusions.map((x) => <li key={x} className="flex gap-2"><Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />{x}</li>)}</ul>}
                  {pl.renewalPrice !== null && <p className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">Renews at {inr(pl.renewalPrice)} · you earn {pct(p.renewalPct)} on renewals</p>}
                </div>
              ))}
              {p.plans.length === 0 && <p className="text-sm text-slate-500">No plans published yet.</p>}
            </div>
          </Card>
          {Object.keys(groups).length > 0 && (
            <Card title="Features">
              <div className="grid sm:grid-cols-2 gap-6">
                {Object.entries(groups).map(([g, fs]) => (
                  <div key={g}>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{g}</h4>
                    <ul className="space-y-2">{fs.map((f) => <li key={f.title} className="text-sm"><div className="font-medium text-slate-900">{f.title}</div>{f.description && <div className="text-slate-600">{f.description}</div>}</li>)}</ul>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {p.media.length > 0 && (
            <Card title="Screenshots">
              <div className="grid sm:grid-cols-2 gap-4">
                {p.media.map((m) => (
                  <figure key={m.url} className={m.device === 'mobile' ? 'flex flex-col items-center' : ''}>
                    <img src={m.url} alt={m.caption || p.name} loading="lazy" className={m.device === 'mobile' ? 'h-80 rounded-xl border border-slate-200 object-cover' : 'w-full rounded-lg border border-slate-200 aspect-video object-cover object-top'} />
                    {m.caption && <figcaption className="mt-1 text-xs text-slate-500">{m.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </Card>
          )}
        </div>
        <div className="space-y-6 lg:sticky lg:top-6">
          <Card title="Your commission">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-emerald-50 p-3"><div className="text-xs text-emerald-700">New sale</div><div className="text-2xl font-semibold text-emerald-800">{pct(p.commissionPct)}</div></div>
              <div className="rounded-lg bg-violet-50 p-3"><div className="text-xs text-violet-700">Renewal</div><div className="text-2xl font-semibold text-violet-800">{pct(p.renewalPct)}</div></div>
            </div>
            <p className="mt-3 text-xs text-slate-500">On the amount received, excluding GST. Credited when Reynrel approves the order.</p>
            {me.permissions.addCustomers && <Link to={`/customers/new?product=${p.id}`}><Button icon={UserPlus} className="w-full mt-4">Add a customer for {p.name}</Button></Link>}
          </Card>
          {p.services.length > 0 && (
            <Card title="Add-on services">
              <ul className="space-y-3">
                {p.services.map((s) => (
                  <li key={s.id} className="text-sm">
                    <div className="flex justify-between gap-2"><span className="font-medium">{s.name}</span><span className="tabular">{s.price ? inr(s.price) : 'Included'}</span></div>
                    {s.description && <div className="text-xs text-slate-500">{s.description}</div>}
                    {s.price > 0 && <div className="text-xs text-emerald-700">You earn {inr(s.earn)} ({pct(s.commissionPct)})</div>}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {p.demo && (
            <Card title="Demo login">
              <div className="space-y-2 text-sm">
                <a href={p.demo.url} target="_blank" rel="noreferrer" className="text-brand-600 break-all inline-flex items-center gap-1">{p.demo.url} <ExternalLink size={12} /></a>
                {p.demo.username && <div className="flex items-center gap-2">User <span className="font-mono">{p.demo.username}</span><CopyBtn value={p.demo.username} /></div>}
                {p.demo.password && <div className="flex items-center gap-2">Password <span className="font-mono">{p.demo.password}</span><CopyBtn value={p.demo.password} /></div>}
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

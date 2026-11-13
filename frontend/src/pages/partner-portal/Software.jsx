import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { partnerApi } from '../../lib/apiClient';
import { Card, Empty, inr } from '../../components/partner/ui';
import { getProductIntroLink } from '../../utils/productIntro';

const Copy = ({ value }) => {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" className="text-slate-400 hover:text-slate-700" aria-label="Copy" onClick={() => { navigator.clipboard?.writeText(value); setOk(true); setTimeout(() => setOk(false), 1200); }}>
      <Icon name={ok ? 'Check' : 'Copy'} size={14} />
    </button>
  );
};

const PartnerSoftware = () => {
  const [list, setList] = useState(null);
  useEffect(() => {
    partnerApi.get('/partner/software').then((r) => setList(r.data));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Software access</h1>
        <p className="text-sm text-slate-500">Products you are authorised to sell, your rates, plans, demo logins and sales material.</p>
      </div>
      {!list ? <div className="text-slate-500">Loading…</div> : list.length === 0 ? (
        <Card><Empty icon="AppWindow" title="No products assigned yet">Reynrel will assign products to your account after onboarding.</Empty></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {list.map((s) => {
            const intro = getProductIntroLink({ name: s.name, introPage: s.introPage });
            return (
              <section key={s.productId} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Icon name={s.icon || 'Package'} size={22} /></div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-900">{s.name}</h2>
                    <p className="text-xs text-slate-500">{s.category}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600 line-clamp-3">{s.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-emerald-50 p-3"><div className="text-xs text-emerald-700">New sale commission</div><div className="text-xl font-semibold text-emerald-800">{s.commissionPercent}%</div></div>
                  <div className="rounded-lg bg-violet-50 p-3"><div className="text-xs text-violet-700">Renewal commission</div><div className="text-xl font-semibold text-violet-800">{s.renewalPercent}%</div></div>
                </div>
                {s.plans.length > 0 && (
                  <table className="mt-4 text-sm w-full">
                    <thead><tr className="text-xs text-slate-500 text-left"><th className="font-medium pb-1">Plan</th><th className="font-medium pb-1 text-right">Price</th><th className="font-medium pb-1 text-right">You earn</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {s.plans.map((p) => (
                        <tr key={p.name}><td className="py-1.5">{p.name}</td><td className="py-1.5 text-right tabular-nums">{inr(p.price)}</td><td className="py-1.5 text-right tabular-nums font-medium">{inr(Math.round((p.price * s.commissionPercent) / 100))}</td></tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {s.demoAccess?.url && (
                  <div className="mt-4 rounded-lg border border-slate-200 p-3 text-sm space-y-1">
                    <div className="font-medium text-slate-800">Demo login</div>
                    <div className="flex items-center gap-2"><a href={s.demoAccess.url} target="_blank" rel="noreferrer" className="text-blue-600 truncate">{s.demoAccess.url}</a></div>
                    {s.demoAccess.username && <div className="flex items-center gap-2 text-slate-600">User: <span className="font-mono">{s.demoAccess.username}</span><Copy value={s.demoAccess.username} /></div>}
                    {s.demoAccess.password && <div className="flex items-center gap-2 text-slate-600">Password: <span className="font-mono">{s.demoAccess.password}</span><Copy value={s.demoAccess.password} /></div>}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-slate-100 mt-auto">
                  {intro.external ? (
                    <a href={intro.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-300 text-xs font-medium"><Icon name="ExternalLink" size={14} />Product page</a>
                  ) : (
                    <Link to={intro.href} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-300 text-xs font-medium"><Icon name="ExternalLink" size={14} />Product page</Link>
                  )}
                  {s.resources.map((r) => (
                    <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-300 text-xs font-medium"><Icon name="FileDown" size={14} />{r.label || 'Resource'}</a>
                  ))}
                  <Link to="/partner/customers?new=1" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-blue-600 text-white text-xs font-medium ml-auto"><Icon name="UserPlus" size={14} />Add customer</Link>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PartnerSoftware;

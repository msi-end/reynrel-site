import React, { memo, useEffect } from 'react';
import { inr, pct } from '../lib/format';
import { Field, Select, Checkbox, Table, Td, cx } from '../components/ui';

// Product / plan / services selector with a live price and commission breakdown.
// Prices come from the partner's catalogue (special prices included); the server re-checks on submit.
export const quoteFor = (product, planId, serviceIds) => {
  if (!product) return { lines: [], total: 0, earn: 0 };
  const lines = [];
  const plan = product.plans.find((x) => x.id === planId);
  if (plan) lines.push({ name: plan.name, price: plan.price, pct: product.commissionPct, negotiated: plan.negotiated });
  product.services.filter((s) => serviceIds.includes(s.id)).forEach((s) => lines.push({ name: s.name, price: s.price, pct: s.commissionPct, negotiated: s.negotiated }));
  return { lines, total: lines.reduce((t, l) => t + l.price, 0), earn: Math.round(lines.reduce((t, l) => t + (l.price * l.pct) / 100, 0) * 100) / 100 };
};

export default memo(function OrderPicker({ catalogue, value, onChange, errors = {} }) {
  const product = catalogue.find((p) => p.id === value.productId);
  useEffect(() => {
    const p = catalogue.find((x) => x.id === value.productId) || catalogue[0];
    if (p && (p.id !== value.productId || (!value.planId && !value.serviceIds.length && p.plans[0]))) {
      onChange({ productId: p.id, planId: value.planId || p.plans[0]?.id || '', serviceIds: value.serviceIds });
    }
  }, [catalogue, value, onChange]);
  const q = quoteFor(product, value.planId, value.serviceIds);
  return (
    <div className="space-y-4">
      <Field label="Software" required error={errors.productId}>
        <Select value={value.productId} onChange={(e) => { const p = catalogue.find((x) => x.id === e.target.value); onChange({ productId: e.target.value, planId: p?.plans[0]?.id || '', serviceIds: [] }); }}>
          {catalogue.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </Field>
      {product && (
        <>
          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">Plan</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {product.plans.map((pl) => (
                <button type="button" key={pl.id} onClick={() => onChange({ ...value, planId: pl.id })}
                  className={cx('text-left rounded-lg border p-3 transition-colors', value.planId === pl.id ? 'border-brand-600 bg-brand-50' : 'border-slate-300 hover:border-slate-400')}>
                  <div className="flex justify-between gap-2 text-sm font-medium"><span>{pl.name}</span><span className="tabular">{inr(pl.price)}</span></div>
                  <div className="text-xs text-slate-500">{pl.description}{pl.negotiated && <span className="text-violet-700"> · special price</span>}</div>
                </button>
              ))}
            </div>
            {errors.planId && <p className="text-xs text-red-600 mt-1">{errors.planId}</p>}
          </div>
          {product.services.length > 0 && (
            <div>
              <div className="text-sm font-medium text-slate-700 mb-2">Add-on services</div>
              <div className="space-y-2">
                {product.services.map((s) => (
                  <Checkbox key={s.id} checked={value.serviceIds.includes(s.id)}
                    onChange={() => onChange({ ...value, serviceIds: value.serviceIds.includes(s.id) ? value.serviceIds.filter((x) => x !== s.id) : [...value.serviceIds, s.id] })}
                    label={<>{s.name} <span className="text-slate-500">· {s.price ? inr(s.price) : 'included'}</span></>} />
                ))}
              </div>
            </div>
          )}
          {q.lines.length > 0 && (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <Table head={['Item', 'Price', 'Rate', 'You earn']} dense>
                {q.lines.map((l) => <tr key={l.name}><Td>{l.name}</Td><Td className="tabular">{inr(l.price)}</Td><Td>{pct(l.pct)}</Td><Td className="tabular">{inr((l.price * l.pct) / 100)}</Td></tr>)}
                <tr className="bg-slate-50 font-semibold"><Td>Total (excl. GST)</Td><Td className="tabular">{inr(q.total)}</Td><Td /><Td className="tabular text-emerald-700">{inr(q.earn)}</Td></tr>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
});

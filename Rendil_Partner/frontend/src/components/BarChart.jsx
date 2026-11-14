import React, { memo, useState } from 'react';
import { inr } from '../lib/format';

// Single-series bar chart: one hue, rounded tops, hover tooltip, labelled axis.
export default memo(function BarChart({ data, valueKey = 'value', labelKey = 'label', height = 200, format = inr, detail }) {
  const [hover, setHover] = useState(null);
  if (!data.some((d) => Number(d[valueKey]) > 0)) {
    return <div className="flex items-center justify-center text-sm text-slate-400 border border-dashed border-slate-200 rounded-lg" style={{ height }}>No data for this period yet</div>;
  }
  const max = Math.max(1, ...data.map((d) => Number(d[valueKey]) || 0));
  const nice = niceMax(max);
  const ticks = [0, nice / 2, nice];
  return (
    <div className="relative select-none" style={{ height }} onMouseLeave={() => setHover(null)}>
      <div className="absolute inset-0 left-12 bottom-6 flex flex-col justify-between pointer-events-none">
        {ticks.slice().reverse().map((t) => (
          <div key={t} className="relative border-t border-slate-100"><span className="absolute -left-12 -top-2 w-10 text-right text-[11px] text-slate-400 tabular">{short(t)}</span></div>
        ))}
      </div>
      <div className="absolute inset-0 left-12 bottom-6 flex items-end gap-2 sm:gap-3">
        {data.map((d, i) => {
          const v = Number(d[valueKey]) || 0;
          return (
            <div key={i} className="flex-1 h-full flex items-end justify-center" onMouseEnter={() => setHover(i)}>
              <div className="w-full max-w-[36px] rounded-t transition-colors" style={{ height: `${(v / nice) * 100}%`, minHeight: v > 0 ? 2 : 0, background: hover === i ? '#2144b8' : '#3d6bf5' }} />
            </div>
          );
        })}
      </div>
      <div className="absolute left-12 right-0 bottom-0 flex gap-2 sm:gap-3">
        {data.map((d, i) => <div key={i} className="flex-1 text-center text-[11px] text-slate-500 truncate">{d[labelKey]}</div>)}
      </div>
      {hover !== null && (
        <div className="absolute z-10 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm pointer-events-none"
          style={{ left: `calc(3rem + ${((hover + 0.5) / data.length) * 100}% - ${((hover + 0.5) / data.length) * 3}rem)`, top: 0 }}>
          <div className="font-medium text-slate-900">{data[hover][labelKey]}</div>
          <div className="text-slate-600 tabular">{format(data[hover][valueKey])}</div>
          {detail && <div className="text-slate-500">{detail(data[hover])}</div>}
        </div>
      )}
    </div>
  );
});

function niceMax(v) {
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}
const short = (v) => (v >= 100000 ? `₹${(v / 100000).toFixed(v % 100000 ? 1 : 0)}L` : v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`);

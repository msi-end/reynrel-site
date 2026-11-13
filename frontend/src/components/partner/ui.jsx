import React, { useEffect } from 'react';
import Icon from '../AppIcon';

export const inr = (n, opts = {}) => {
  const v = Number(n || 0);
  const d = opts.decimals ?? (Math.round(v * 100) % 100 === 0 ? 0 : 2);
  return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: 2 })}`;
};

export const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export const errMsg = (err, fallback = 'Something went wrong') => err?.response?.data?.error || err?.message || fallback;

const TONES = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  gray: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20'
};

const STATUS_TONE = {
  approved: 'green', paid: 'green', completed: 'green', active: 'green', available: 'green', new: 'blue',
  pending: 'amber', submitted: 'amber', requested: 'amber', scheduled: 'blue', in_progress: 'violet', renewal: 'violet',
  rejected: 'red', suspended: 'red', cancelled: 'gray', expired: 'gray', not_requested: 'gray', reversal: 'red', adjustment: 'gray'
};

const STATUS_LABEL = {
  submitted: 'Pending approval', not_requested: 'Not requested', in_progress: 'In progress', new: 'New sale'
};

export const StatusBadge = ({ status, label }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize ${TONES[STATUS_TONE[status] || 'gray']}`}>
    {label || STATUS_LABEL[status] || String(status || '').replace(/_/g, ' ')}
  </span>
);

export const StatCard = ({ icon, label, value, hint, tone = 'blue' }) => {
  const toneBg = { blue: 'bg-blue-50 text-blue-600', green: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', violet: 'bg-violet-50 text-violet-600', slate: 'bg-slate-100 text-slate-600' }[tone];
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-500">{label}</span>
        {icon && (
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${toneBg}`}>
            <Icon name={icon} size={16} />
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold text-slate-900 tabular-nums">{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  );
};

export const Card = ({ title, action, children, className = '' }) => (
  <section className={`bg-white border border-slate-200 rounded-xl ${className}`}>
    {(title || action) && (
      <header className="flex items-center justify-between gap-3 px-4 md:px-5 py-3 border-b border-slate-100">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        {action}
      </header>
    )}
    <div className="p-4 md:p-5">{children}</div>
  </section>
);

export const Field = ({ label, error, hint, required, children, className = '' }) => (
  <label className={`block ${className}`}>
    <span className="block text-sm font-medium text-slate-700 mb-1">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </span>
    {children}
    {hint && !error && <span className="block text-xs text-slate-500 mt-1">{hint}</span>}
    {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
  </label>
);

export const inputCls = (error) =>
  `w-full h-10 rounded-lg border px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${error ? 'border-red-400' : 'border-slate-300'}`;

export const Btn = ({ variant = 'primary', size = 'md', icon, loading, children, className = '', ...props }) => {
  const v = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    dark: 'bg-slate-900 text-white hover:bg-slate-800',
    outline: 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-slate-600 hover:bg-slate-100'
  }[variant];
  const s = { sm: 'h-8 px-3 text-xs', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base' }[size];
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${v} ${s} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
};

export const Modal = ({ open, title, onClose, children, wide }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-slate-900/50 p-0 md:p-4 overflow-y-auto" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`bg-white w-full ${wide ? 'md:max-w-3xl' : 'md:max-w-lg'} md:rounded-2xl shadow-xl min-h-screen md:min-h-0`} role="dialog" aria-modal="true">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100" aria-label="Close">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export const Empty = ({ icon = 'Inbox', title, children }) => (
  <div className="text-center py-10 px-4">
    <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400 mb-3">
      <Icon name={icon} size={22} />
    </div>
    <p className="font-medium text-slate-800">{title}</p>
    {children && <div className="text-sm text-slate-500 mt-1">{children}</div>}
  </div>
);

export const Alert = ({ tone = 'red', children }) => {
  const c = { red: 'bg-red-50 text-red-700 border-red-200', green: 'bg-emerald-50 text-emerald-700 border-emerald-200', amber: 'bg-amber-50 text-amber-800 border-amber-200', blue: 'bg-blue-50 text-blue-800 border-blue-200' }[tone];
  return <div className={`border rounded-lg px-3 py-2 text-sm ${c}`}>{children}</div>;
};

export const Table = ({ head, children, empty }) => (
  <div className="overflow-x-auto -mx-4 md:-mx-5">
    <table className="min-w-full text-sm">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-100">
          {head.map((h) => (
            <th key={h} className="px-4 md:px-5 py-2 font-medium whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">{children}</tbody>
    </table>
    {empty}
  </div>
);

export const Td = ({ children, className = '' }) => <td className={`px-4 md:px-5 py-3 align-top ${className}`}>{children}</td>;

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

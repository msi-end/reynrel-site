import React, { createContext, memo, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { X, Inbox, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { inr } from '../lib/format';

export const cx = (...c) => c.filter(Boolean).join(' ');

// ---------- Buttons ----------
const BTN = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/50',
  dark: 'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-900/50',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 disabled:text-slate-300',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-600/50',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/50',
  'danger-ghost': 'text-red-600 hover:bg-red-50'
};
const SIZE = { xs: 'h-7 px-2 text-xs gap-1', sm: 'h-8 px-3 text-sm gap-1.5', md: 'h-10 px-4 text-sm gap-2', lg: 'h-11 px-5 text-base gap-2' };

export const Button = memo(function Button({ variant = 'primary', size = 'md', icon: Icon, loading, className, children, type = 'button', ...props }) {
  return (
    <button type={type} className={cx('inline-flex items-center justify-center rounded-lg font-medium transition-colors whitespace-nowrap disabled:cursor-not-allowed', BTN[variant], SIZE[size], className)} disabled={loading || props.disabled} {...props}>
      {loading ? <Loader2 className="animate-spin" size={size === 'xs' ? 12 : 16} /> : Icon && <Icon size={size === 'xs' ? 12 : 16} />}
      {children}
    </button>
  );
});

// ---------- Form fields ----------
const inputBase = 'w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 disabled:bg-slate-50 disabled:text-slate-500';
export const inputCls = (error) => cx(inputBase, 'h-10', error ? 'border-red-400' : 'border-slate-300');

export function Field({ label, error, hint, required, children, className }) {
  const id = useId();
  const child = React.isValidElement(children) ? React.cloneElement(children, { id: children.props.id || id, 'aria-invalid': !!error || undefined }) : children;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      {child}
      {error ? <p className="text-xs text-red-600 mt-1">{error}</p> : hint ? <p className="text-xs text-slate-500 mt-1">{hint}</p> : null}
    </div>
  );
}

export const Input = memo(React.forwardRef(function Input({ error, className, ...props }, ref) {
  return <input ref={ref} className={cx(inputCls(error), className)} {...props} />;
}));
export const Select = memo(function Select({ error, className, children, ...props }) {
  return <select className={cx(inputCls(error), 'pr-8', className)} {...props}>{children}</select>;
});
export const Textarea = memo(function Textarea({ error, className, rows = 3, ...props }) {
  return <textarea rows={rows} className={cx(inputBase, 'py-2', error ? 'border-red-400' : 'border-slate-300', className)} {...props} />;
});
export function Checkbox({ label, className, ...props }) {
  return (
    <label className={cx('flex items-start gap-2 text-sm text-slate-700 cursor-pointer', className)}>
      <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" {...props} />
      <span>{label}</span>
    </label>
  );
}
export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <label className={cx('inline-flex items-center gap-2 text-sm', disabled ? 'opacity-60' : 'cursor-pointer')}>
      <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)}
        className={cx('relative shrink-0 h-5 w-9 rounded-full transition-colors', checked ? 'bg-brand-600' : 'bg-slate-300')}>
        <span className={cx('absolute left-0 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-4' : 'translate-x-0.5')} />
      </button>
      {label && <span className="text-slate-700">{label}</span>}
    </label>
  );
}

// Controlled form state with per-field errors; setters are stable so inputs don't re-render needlessly.
export function useForm(initial) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const set = useCallback((k, v) => {
    setValues((s) => (s[k] === v ? s : { ...s, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
  }, []);
  const bind = useCallback((k, transform) => ({
    value: values[k] ?? '',
    error: errors[k],
    onChange: (e) => set(k, transform ? transform(e.target.value) : e.target.value)
  }), [values, errors, set]);
  return { values, setValues, errors, setErrors, set, bind };
}

// ---------- Layout ----------
export function Card({ title, subtitle, action, children, className, bodyClassName, padded = true }) {
  return (
    <section className={cx('bg-white border border-slate-200 rounded-xl', className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 px-4 md:px-5 py-3 border-b border-slate-100">
          <div className="min-w-0">
            <h2 className="font-semibold text-slate-900 truncate">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cx(padded && 'p-4 md:p-5', bodyClassName)}>{children}</div>
    </section>
  );
}

export function PageHeader({ title, subtitle, actions, back }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
      <div className="min-w-0">
        {back}
        <h1 className="text-2xl font-bold text-slate-900 truncate">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const TONE = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', amber: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20', blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20', gray: 'bg-slate-100 text-slate-600 ring-slate-500/20'
};
const STATUS_TONE = {
  approved: 'green', active: 'green', paid: 'green', completed: 'green', verified: 'green',
  pending: 'amber', submitted: 'amber', requested: 'amber', draft: 'gray', scheduled: 'blue', in_progress: 'violet',
  rejected: 'red', suspended: 'red', cancelled: 'gray', archived: 'gray', expired: 'gray', reversal: 'red',
  new: 'blue', renewal: 'violet', service: 'blue', adjustment: 'gray', owner: 'violet', manager: 'blue', viewer: 'gray'
};
const STATUS_LABEL = { submitted: 'Pending approval', in_progress: 'In progress', new: 'New sale' };
export const Badge = memo(function Badge({ status, tone, children }) {
  return (
    <span className={cx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap', TONE[tone || STATUS_TONE[status] || 'gray'])}>
      {children || STATUS_LABEL[status] || String(status || '').replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())}
    </span>
  );
});

export const Stat = memo(function Stat({ label, value, hint, icon: Icon, tone = 'blue', money }) {
  const t = { blue: 'bg-blue-50 text-blue-600', green: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', violet: 'bg-violet-50 text-violet-600', slate: 'bg-slate-100 text-slate-600' }[tone];
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-slate-500 leading-tight">{label}</span>
        {Icon && <span className={cx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', t)}><Icon size={16} /></span>}
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-900 tabular">{money ? inr(value) : value}</div>
      {hint && <div className="text-xs text-slate-500 mt-0.5 truncate">{hint}</div>}
    </div>
  );
});

export function Alert({ tone = 'red', children, className }) {
  const c = { red: 'bg-red-50 text-red-800 border-red-200', green: 'bg-emerald-50 text-emerald-800 border-emerald-200', amber: 'bg-amber-50 text-amber-900 border-amber-200', blue: 'bg-blue-50 text-blue-900 border-blue-200' }[tone];
  const I = { red: AlertCircle, green: CheckCircle2, amber: AlertCircle, blue: Info }[tone];
  return (
    <div className={cx('flex gap-2 border rounded-lg px-3 py-2 text-sm', c, className)}>
      <I size={16} className="mt-0.5 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function Empty({ icon: Icon = Inbox, title, children, action }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400"><Icon size={22} /></div>
      <p className="mt-3 font-medium text-slate-800">{title}</p>
      {children && <div className="text-sm text-slate-500 mt-1">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Skeleton appears only if loading takes longer than `delay` ms, so fast loads never flicker.
export function Loading({ rows = 4, delay = 200, className }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  if (!show) return <div className={cx('min-h-[120px]', className)} />;
  return (
    <div className={cx('space-y-3 rp-fade', className)} aria-busy="true">
      {Array.from({ length: rows }, (_, i) => <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />)}
    </div>
  );
}

export function TopProgress({ active }) {
  return (
    <div className={cx('fixed top-0 left-0 right-0 h-0.5 z-[60] overflow-hidden transition-opacity', active ? 'opacity-100' : 'opacity-0')} aria-hidden>
      <div className="h-full w-1/3 bg-brand-500 rp-progress" />
    </div>
  );
}

export function Table({ head, children, empty, dense }) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200 bg-slate-50/60">
            {head.map((h, i) => <th key={i} className={cx('px-4 font-medium whitespace-nowrap', dense ? 'py-2' : 'py-2.5')}>{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
      {empty}
    </div>
  );
}
export const Td = ({ children, className, ...p }) => <td className={cx('px-4 py-3 align-top', className)} {...p}>{children}</td>;

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-thin border-b border-slate-200 mb-6" role="tablist">
      {tabs.map(([k, label, count]) => (
        <button key={k} role="tab" aria-selected={value === k} onClick={() => onChange(k)}
          className={cx('px-3 sm:px-4 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors', value === k ? 'border-brand-600 text-brand-700 font-medium' : 'border-transparent text-slate-500 hover:text-slate-800')}>
          {label}{count !== undefined && count !== null && <span className="ml-1.5 text-xs text-slate-400">{count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Pills({ options, value, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-thin">
      {options.map(([k, label]) => (
        <button key={k} onClick={() => onChange(k)} className={cx('px-3 h-8 rounded-lg text-sm whitespace-nowrap transition-colors', value === k ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100')}>{label}</button>
      ))}
    </div>
  );
}

export function Modal({ open, title, onClose, children, size = 'md', footer }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.querySelector('input,select,textarea,button')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  const w = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' }[size];
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className={cx('bg-white w-full rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] flex flex-col rp-fade', w)}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

export function Dl({ items, cols = 3 }) {
  return (
    <dl className={cx('grid gap-x-4 gap-y-2 text-sm', cols === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
      {items.filter(Boolean).map(([k, v]) => (
        <React.Fragment key={k}>
          <dt className="text-slate-500">{k}</dt>
          <dd className={cx('text-slate-900 break-words', cols === 2 ? '' : 'col-span-2')}>{v === null || v === undefined || v === '' ? '—' : v}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

// ---------- Toasts ----------
const ToastCtx = createContext(() => {});
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, tone = 'green') => {
    const id = Math.random().toString(36).slice(2);
    setItems((s) => [...s.slice(-3), { id, message, tone }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), tone === 'red' ? 6000 : 3500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[70] flex flex-col gap-2 sm:w-96 pointer-events-none" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={cx('pointer-events-auto rounded-lg px-4 py-3 text-sm shadow-lg rp-fade', t.tone === 'red' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white')}>{t.message}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

// Runs an async action with loading state, toast feedback and field errors.
export function useAction() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const run = useCallback(async (fn, { success, onFieldErrors } = {}) => {
    setBusy(true);
    try {
      const out = await fn();
      if (success) toast(typeof success === 'function' ? success(out) : success);
      return out;
    } catch (err) {
      if (err.fields && onFieldErrors) onFieldErrors(err.fields);
      toast(err.message || 'Something went wrong', 'red');
      return undefined;
    } finally {
      setBusy(false);
    }
  }, [toast]);
  return useMemo(() => [run, busy], [run, busy]);
}

export function Money({ value, className }) {
  const v = Number(value || 0);
  return <span className={cx('tabular', v < 0 && 'text-red-600', className)}>{inr(v)}</span>;
}

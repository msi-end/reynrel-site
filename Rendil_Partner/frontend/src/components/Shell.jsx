import React, { memo, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useIsFetching } from '@tanstack/react-query';
import { Menu, X, LogOut } from 'lucide-react';
import { cx, TopProgress } from './ui';

const NavItems = memo(function NavItems({ items, onNavigate }) {
  return (
    <nav className="px-3 py-4 space-y-0.5">
      {items.map((n) =>
        n.section ? (
          <div key={n.section} className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{n.section}</div>
        ) : (
          <NavLink key={n.to} to={n.to} end={n.end} onClick={onNavigate}
            className={({ isActive }) => cx('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors', isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5')}>
            <n.icon size={18} />
            <span className="flex-1 truncate">{n.label}</span>
            {n.badge ? <span className="text-[11px] min-w-5 h-5 px-1.5 rounded-full bg-brand-500 text-white flex items-center justify-center tabular">{n.badge}</span> : null}
          </NavLink>
        )
      )}
    </nav>
  );
});

// Sidebar stays mounted across navigation; only the <Outlet/> area changes.
export default function Shell({ brand, items, user, onLogout, banner }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const fetching = useIsFetching();
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  const footer = (
    <div className="p-4 border-t border-white/10 text-sm">
      <div className="text-white font-medium truncate">{user?.name}</div>
      <div className="text-xs text-slate-400 truncate">{user?.sub}</div>
      <button onClick={onLogout} className="mt-3 flex items-center gap-2 text-slate-400 hover:text-white"><LogOut size={16} /> Log out</button>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      <TopProgress active={fetching > 0} />
      <aside className="hidden lg:flex w-64 shrink-0 bg-slate-950 flex-col sticky top-0 h-screen">
        <div className="px-5 h-16 flex items-center gap-2.5 border-b border-white/10">
          <img src="/logo.png" alt="" className="w-7 h-7" width="28" height="28" />
          <div className="leading-tight"><div className="text-white font-semibold">{brand.title}</div><div className="text-[11px] text-slate-400">{brand.subtitle}</div></div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin"><NavItems items={items} /></div>
        {footer}
      </aside>

      <div className="lg:hidden sticky top-0 z-40 bg-slate-950 h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2"><img src="/logo.png" alt="" className="w-6 h-6" /><span className="text-white font-semibold">{brand.title}</span></div>
        <button onClick={() => setOpen((s) => !s)} className="p-2 text-white" aria-label="Menu" aria-expanded={open}>{open ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
      {open && (
        <div className="lg:hidden fixed inset-0 top-14 z-40 bg-slate-950 overflow-y-auto">
          <NavItems items={items} onNavigate={() => setOpen(false)} />
          {footer}
        </div>
      )}

      <main className="flex-1 min-w-0">
        {banner}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8"><Outlet /></div>
      </main>
    </div>
  );
}

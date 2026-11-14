import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Menu, X } from 'lucide-react';
import { partnerApi } from '../lib/api';

export const usePublicConfig = () => useQuery({ queryKey: ['public', 'config'], queryFn: () => partnerApi.get('/public/config'), staleTime: 5 * 60_000 });
export const usePublicProducts = () => useQuery({ queryKey: ['public', 'products'], queryFn: () => partnerApi.get('/public/products'), staleTime: 5 * 60_000 });

// Sets title/description for public pages and keeps everything else out of search results.
export function useSeo(title, description) {
  useEffect(() => {
    document.title = title;
    const m = document.querySelector('meta[name="description"]');
    if (m && description) m.setAttribute('content', description);
  }, [title, description]);
}

const NAV = [['#benefits', 'Benefits'], ['#products', 'Products'], ['#earnings', 'Earnings'], ['#how', 'How it works'], ['#faq', 'FAQ']];

export function PublicHeader({ home = false }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header className={`sticky top-0 z-40 bg-white/90 backdrop-blur border-b transition-colors ${scrolled ? 'border-slate-200' : 'border-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src="/logo.png" alt="" width="32" height="32" className="w-8 h-8" />
          <span className="leading-tight"><span className="block font-bold text-slate-900">Reynrel</span><span className="block text-[11px] text-slate-500 -mt-0.5">Partner Program</span></span>
        </Link>
        {home && (
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            {NAV.map(([h, l]) => <a key={h} href={h} className="hover:text-slate-900">{l}</a>)}
          </nav>
        )}
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden sm:inline-flex h-10 px-4 items-center text-sm font-medium text-slate-700 hover:text-slate-900">Partner login</Link>
          <Link to="/apply" className="inline-flex h-10 px-4 items-center rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700">Apply now</Link>
          {home && (
            <button type="button" className="md:hidden w-10 h-10 inline-flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>
      {home && open && (
        <nav className="md:hidden border-t border-slate-100 bg-white px-4 py-2">
          {NAV.map(([h, l]) => <a key={h} href={h} onClick={() => setOpen(false)} className="block py-2.5 text-slate-700">{l}</a>)}
          <Link to="/login" className="block py-2.5 text-slate-700">Partner login</Link>
        </nav>
      )}
    </header>
  );
}

export function PublicFooter() {
  const { data: c } = usePublicConfig();
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid gap-8 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-white font-semibold"><img src="/logo.png" alt="" width="24" height="24" className="w-6 h-6" />Reynrel Partner Program</div>
          <p className="mt-3 max-w-xs">Business software for Indian shops, distributors and service businesses — sold and supported with local partners.</p>
        </div>
        <div>
          <div className="text-white font-medium mb-2">Partners</div>
          <ul className="space-y-1.5">
            <li><Link to="/apply" className="hover:text-white">Apply to join</Link></li>
            <li><Link to="/login" className="hover:text-white">Partner login</Link></li>
            {c?.mainSiteUrl && <li><a href={c.mainSiteUrl} className="hover:text-white">{c.mainSiteUrl.replace(/^https?:\/\//, '')}</a></li>}
          </ul>
        </div>
        <div>
          <div className="text-white font-medium mb-2">Contact</div>
          <ul className="space-y-1.5">
            {c?.supportPhone && <li><a href={`tel:${c.supportPhone.replace(/\s/g, '')}`} className="hover:text-white">{c.supportPhone}</a></li>}
            {c?.supportEmail && <li><a href={`mailto:${c.supportEmail}`} className="hover:text-white">{c.supportEmail}</a></li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs">© {new Date().getFullYear()} {c?.companyName || 'Reynrel Infotech'}. All rights reserved.</div>
    </footer>
  );
}

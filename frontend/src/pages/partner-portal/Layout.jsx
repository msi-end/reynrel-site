import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { usePartnerAuth } from '../../context/PartnerAuthContext';
import { partnerApi } from '../../lib/apiClient';
import { Btn, Alert, StatusBadge, fmtDate } from '../../components/partner/ui';

const NAV = [
  { label: 'Dashboard', path: '/partner', icon: 'LayoutDashboard', end: true },
  { label: 'Customers', path: '/partner/customers', icon: 'Users' },
  { label: 'Software Access', path: '/partner/software', icon: 'AppWindow' },
  { label: 'Commission', path: '/partner/commission', icon: 'IndianRupee' },
  { label: 'Withdrawals', path: '/partner/withdrawals', icon: 'Landmark' },
  { label: 'Profile', path: '/partner/profile', icon: 'UserCog' }
];

const StatusScreen = ({ partner, onLogout }) => {
  const map = {
    pending: { icon: 'Clock', tone: 'text-amber-600 bg-amber-50', title: 'Application under review', text: 'Our team is verifying your details and documents. You will get full dashboard access once approved.' },
    rejected: { icon: 'XCircle', tone: 'text-red-600 bg-red-50', title: 'Application not approved', text: 'Unfortunately we could not approve your application.' },
    suspended: { icon: 'Ban', tone: 'text-red-600 bg-red-50', title: 'Account suspended', text: 'Your partner account is suspended. Contact partner support for details.' }
  }[partner.status];
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center">
        <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center ${map.tone}`}><Icon name={map.icon} size={26} /></div>
        <h1 className="mt-4 text-xl font-bold text-slate-900">{map.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{map.text}</p>
        {partner.statusReason && partner.status !== 'pending' && <p className="mt-3 text-sm text-slate-700 bg-slate-50 rounded-lg p-3">Reason: {partner.statusReason}</p>}
        <dl className="mt-6 text-sm text-left grid grid-cols-2 gap-y-2">
          <dt className="text-slate-500">Partner ID</dt><dd className="font-mono text-right">{partner.partnerCode}</dd>
          <dt className="text-slate-500">Applied on</dt><dd className="text-right">{fmtDate(partner.createdAt)}</dd>
          <dt className="text-slate-500">Status</dt><dd className="text-right"><StatusBadge status={partner.status} /></dd>
        </dl>
        <div className="mt-6 flex gap-2 justify-center">
          <a href="https://wa.me/919864773099" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-300 text-sm font-medium"><Icon name="MessageCircle" size={16} />Support</a>
          <Btn variant="dark" onClick={onLogout}>Log out</Btn>
        </div>
      </div>
    </div>
  );
};

const TermsGate = ({ partner, refresh }) => {
  const [terms, setTerms] = useState(null);
  const [busy, setBusy] = useState(false);
  const open = async () => setTerms((await partnerApi.get('/partner/terms')).data);
  const accept = async () => {
    setBusy(true);
    try {
      await partnerApi.post('/partner/terms/accept', { version: terms.version });
      await refresh();
    } finally {
      setBusy(false);
    }
  };
  if (partner.termsUpToDate) return null;
  return (
    <div className="mb-6">
      <Alert tone="amber">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>The Partner Terms have been updated (version {partner.latestTermsVersion}). Please review and accept them.</span>
          {!terms && <Btn size="sm" variant="outline" onClick={open}>Review terms</Btn>}
        </div>
        {terms && (
          <div className="mt-3">
            <pre className="bg-white rounded-lg p-3 max-h-64 overflow-y-auto whitespace-pre-wrap font-sans text-xs text-slate-700">{terms.content}</pre>
            <Btn size="sm" className="mt-3" loading={busy} onClick={accept}>I accept version {terms.version}</Btn>
          </div>
        )}
      </Alert>
    </div>
  );
};

const PartnerLayout = () => {
  const { partner, logout, refresh } = usePartnerAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const doLogout = () => {
    logout();
    navigate('/partners/login');
  };

  if (partner.status !== 'approved') return <StatusScreen partner={partner} onLogout={doLogout} />;

  const nav = (
    <nav className="px-3 py-4 space-y-1">
      {NAV.map((n) => (
        <NavLink key={n.path} to={n.path} end={n.end} onClick={() => setMenuOpen(false)}
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/10'}`}>
          <Icon name={n.icon} size={18} />{n.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="hidden lg:flex w-64 shrink-0 bg-slate-950 text-white flex-col sticky top-0 h-screen">
        <Link to="/partner" className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
          <img src="/assets/images/reynrel-logo-icon.png" alt="" className="w-7 h-7" />
          <span className="font-semibold">Partner Portal</span>
        </Link>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <div className="p-4 border-t border-white/10 text-sm">
          <div className="font-medium truncate">{partner.personal?.fullName}</div>
          <div className="text-xs text-slate-400 font-mono">{partner.partnerCode} · {partner.tier}</div>
          <button onClick={doLogout} className="mt-3 flex items-center gap-2 text-slate-300 hover:text-white"><Icon name="LogOut" size={16} />Log out</button>
        </div>
      </aside>

      <div className="lg:hidden sticky top-0 z-30 bg-slate-950 text-white flex items-center justify-between px-4 h-14">
        <span className="font-semibold">Partner Portal</span>
        <button onClick={() => setMenuOpen((s) => !s)} aria-label="Menu" className="p-2"><Icon name={menuOpen ? 'X' : 'Menu'} size={22} /></button>
      </div>
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 top-14 z-30 bg-slate-950 text-white">
          {nav}
          <div className="px-6 py-4 border-t border-white/10 text-sm">
            <div>{partner.personal?.fullName} · <span className="font-mono">{partner.partnerCode}</span></div>
            <button onClick={doLogout} className="mt-3 flex items-center gap-2 text-slate-300"><Icon name="LogOut" size={16} />Log out</button>
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <TermsGate partner={partner} refresh={refresh} />
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PartnerLayout;

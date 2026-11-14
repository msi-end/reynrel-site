import React, { useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, AppWindow, Wrench, IndianRupee, Landmark, FileCheck2, UserCog } from 'lucide-react';
import { PartnerAuth } from '../auth';
import { partnerApi } from '../lib/api';
import Shell from '../components/Shell';
import { Button, Alert, Modal, useAction } from '../components/ui';
import Login from './Login';
import Register from './Register';
import StatusScreen, { ForcePassword } from './StatusScreen';
import Dashboard from './Dashboard';
import Catalogue from './Catalogue';
import Customers from './Customers';
import NewCustomer from './NewCustomer';
import CustomerDetail from './CustomerDetail';
import Installations from './Installations';
import Commission from './Commission';
import Withdrawals from './Withdrawals';
import Documents from './Documents';
import Profile from './Profile';

function TermsBanner({ me, refresh }) {
  const [open, setOpen] = useState(false);
  const [terms, setTerms] = useState(null);
  const [run, busy] = useAction();
  if (me.termsAccepted) return null;
  const show = async () => { setTerms(await partnerApi.get('/partner/terms')); setOpen(true); };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      <Alert tone="amber"><span className="mr-2">Please review and accept the partner terms (version {me.termsVersion}).</span><button className="underline font-medium" onClick={show}>Review terms</button></Alert>
      <Modal open={open} size="lg" title={`Partner terms — version ${terms?.version}`} onClose={() => setOpen(false)}
        footer={<Button loading={busy} onClick={() => run(() => partnerApi.post('/partner/terms/accept', { version: terms.version }), { success: 'Thank you' }).then((r) => { if (r) { setOpen(false); refresh(); } })}>I accept</Button>}>
        <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">{terms?.content}</pre>
      </Modal>
    </div>
  );
}

function Guarded() {
  const { user: me, ready, logout, refresh } = PartnerAuth.useAuth();
  const navigate = useNavigate();
  if (!ready) return null;
  if (!me) return <Navigate to="/login" replace />;
  const doLogout = () => { logout(); navigate('/login'); };
  if (me.mustChangePassword) return <ForcePassword onLogout={doLogout} />;
  if (me.status !== 'approved') return <StatusScreen me={me} onLogout={doLogout} />;
  const docIssues = me.documents.rejected + (me.documents.required - me.documents.uploaded);
  const items = [
    { to: '/', end: true, label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/products', label: 'Software & pricing', icon: AppWindow },
    { to: '/installations', label: 'Installations', icon: Wrench },
    { to: '/commission', label: 'Commission', icon: IndianRupee },
    { to: '/withdrawals', label: 'Withdrawals', icon: Landmark },
    { to: '/documents', label: 'Documents', icon: FileCheck2, badge: docIssues > 0 ? docIssues : 0 },
    { to: '/profile', label: 'Profile', icon: UserCog }
  ];
  return (
    <Shell brand={{ title: 'Rendil Partner', subtitle: 'Partner portal' }} items={items}
      user={{ name: me.fullName, sub: `${me.code}${me.tier ? ` · ${me.tier}` : ''}` }} onLogout={doLogout}
      banner={<TermsBanner me={me} refresh={refresh} />} />
  );
}

export default function PartnerApp() {
  return (
    <PartnerAuth.Provider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route element={<Guarded />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/new" element={<NewCustomer />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="products" element={<Catalogue />} />
          <Route path="installations" element={<Installations />} />
          <Route path="commission" element={<Commission />} />
          <Route path="withdrawals" element={<Withdrawals />} />
          <Route path="documents" element={<Documents />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </PartnerAuth.Provider>
  );
}

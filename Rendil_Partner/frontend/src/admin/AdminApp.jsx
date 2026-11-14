import React from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Users, Package, ClipboardCheck, Wrench, Landmark, Settings, UserPlus } from 'lucide-react';
import { AdminAuth } from '../auth';
import { adminApi } from '../lib/api';
import Shell from '../components/Shell';
import Login from './Login';
import Dashboard from './Dashboard';
import Partners from './Partners';
import PartnerNew from './PartnerNew';
import PartnerDetail from './PartnerDetail';
import Products from './Products';
import ProductEdit from './ProductEdit';
import Orders from './Orders';
import Installations from './Installations';
import Withdrawals from './Withdrawals';
import SettingsPage from './Settings';

function Guarded() {
  const { user, ready, logout } = AdminAuth.useAuth();
  const navigate = useNavigate();
  const ov = useQuery({ queryKey: ['admin', 'overview'], queryFn: () => adminApi.get('/admin/overview'), enabled: !!user, refetchInterval: 60_000 });
  if (!ready) return null;
  if (!user) return <Navigate to="/admin/login" replace />;
  const o = ov.data;
  const items = [
    { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
    { section: 'Partners' },
    { to: '/admin/partners', label: 'Partners', icon: Users, badge: o ? o.partners.pending + o.documentsPending + o.bankChangesPending : 0 },
    { to: '/admin/partners/new', label: 'Add partner', icon: UserPlus },
    { section: 'Sales' },
    { to: '/admin/orders', label: 'Customer approvals', icon: ClipboardCheck, badge: o?.orders.pending },
    { to: '/admin/installations', label: 'Installations', icon: Wrench, badge: o?.installationsOpen },
    { to: '/admin/withdrawals', label: 'Payouts', icon: Landmark, badge: o ? o.withdrawals.requested + o.withdrawals.approved : 0 },
    { section: 'Catalogue' },
    { to: '/admin/products', label: 'Products & pricing', icon: Package },
    { to: '/admin/settings', label: 'Settings', icon: Settings }
  ];
  return (
    <Shell
      brand={{ title: 'Reynrel Partner', subtitle: 'Admin panel' }}
      items={items}
      user={{ name: user.name, sub: `${user.email} · ${user.role}` }}
      onLogout={() => { logout(); navigate('/admin/login'); }}
    />
  );
}

export default function AdminApp() {
  return (
    <AdminAuth.Provider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={<Guarded />}>
          <Route index element={<Dashboard />} />
          <Route path="partners" element={<Partners />} />
          <Route path="partners/new" element={<PartnerNew />} />
          <Route path="partners/:id" element={<PartnerDetail />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductEdit />} />
          <Route path="orders" element={<Orders />} />
          <Route path="installations" element={<Installations />} />
          <Route path="withdrawals" element={<Withdrawals />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AdminAuth.Provider>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { adminApi } from '../../lib/apiClient';

const StatCard = ({ icon, label, value, to }) => (
  <Link
    to={to}
    className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 hover:shadow-lg transition-shadow"
  >
    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
      <Icon name={icon} size={20} className="text-[var(--color-primary)]" />
    </div>
    <div className="text-2xl font-bold text-[var(--color-foreground)]">{value}</div>
    <div className="text-sm text-[var(--color-muted-foreground)]">{label}</div>
  </Link>
);

const AdminDashboard = () => {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    Promise.all([
      adminApi.get('/products'),
      adminApi.get('/services'),
      adminApi.get('/android-apps'),
      adminApi.get('/admin/clients'),
      adminApi.get('/admin/renewals'),
      adminApi.get('/leads')
    ]).then(([products, services, apps, clients, renewals, leads]) => {
      setCounts({
        products: products.data.length,
        services: services.data.length,
        apps: apps.data.length,
        clients: clients.data.length,
        pendingRenewals: renewals.data.filter((r) => r.status === 'pending').length,
        newLeads: leads.data.filter((l) => l.status === 'new').length
      });
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon="Inbox" label="New Leads" value={counts?.newLeads ?? '...'} to="/admin/leads" />
        <StatCard icon="Package" label="Products" value={counts?.products ?? '...'} to="/admin/products" />
        <StatCard icon="Briefcase" label="Services" value={counts?.services ?? '...'} to="/admin/services" />
        <StatCard icon="Smartphone" label="Android Apps" value={counts?.apps ?? '...'} to="/admin/android-apps" />
        <StatCard icon="Users" label="Clients" value={counts?.clients ?? '...'} to="/admin/clients" />
        <StatCard
          icon="RefreshCcw"
          label="Pending Renewals"
          value={counts?.pendingRenewals ?? '...'}
          to="/admin/renewals"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;

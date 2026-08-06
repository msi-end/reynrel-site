import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { useAdminAuth } from '../../context/AdminAuthContext';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: 'LayoutDashboard', end: true },
  { label: 'Leads', path: '/admin/leads', icon: 'Inbox' },
  { label: 'Products', path: '/admin/products', icon: 'Package' },
  { label: 'Services', path: '/admin/services', icon: 'Briefcase' },
  { label: 'Android Apps', path: '/admin/android-apps', icon: 'Smartphone' },
  { label: 'Clients', path: '/admin/clients', icon: 'Users' },
  { label: 'Renewals', path: '/admin/renewals', icon: 'RefreshCcw' },
  { label: 'Settings', path: '/admin/settings', icon: 'Settings' }
];

const AdminLayout = () => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-background)]">
      <aside className="w-64 flex-shrink-0 bg-[var(--color-brand-navy)] text-white flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <span className="text-lg font-bold">Reynrel Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-[var(--color-brand-electric)] text-white' : 'text-white/80 hover:bg-white/10'
                }`
              }
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 py-2 text-xs text-white/60">Logged in as {admin?.username}</div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
          >
            <Icon name="LogOut" size={18} />
            Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

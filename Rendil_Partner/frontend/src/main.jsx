import React, { Suspense, lazy, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ToastProvider } from './components/ui';
import './styles.css';

// Two code-split areas. Pages inside an area are bundled together, so moving between
// pages never shows a loading fallback.
const AdminApp = lazy(() => import('./admin/AdminApp'));
const PartnerApp = lazy(() => import('./partner/PartnerApp'));
const Home = lazy(() => import('./public/Home'));
const Apply = lazy(() => import('./public/Apply'));

// Only the public pages are indexed; dashboards and login stay out of search results.
function Robots() {
  const { pathname } = useLocation();
  useEffect(() => {
    const m = document.querySelector('meta[name="robots"]');
    if (m) m.setAttribute('content', pathname === '/' || pathname === '/apply' ? 'index, follow' : 'noindex, nofollow');
  }, [pathname]);
  return null;
}

const Splash = () => (
  <div className="min-h-screen flex items-center justify-center">
    <img src="/logo.png" alt="" className="w-10 h-10 opacity-80 animate-pulse" />
  </div>
);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Robots />
          <Suspense fallback={<Splash />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/register" element={<Navigate to="/apply" replace />} />
              <Route path="/admin/*" element={<AdminApp />} />
              <Route path="/*" element={<PartnerApp />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

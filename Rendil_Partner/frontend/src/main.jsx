import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ToastProvider } from './components/ui';
import './styles.css';

// Two code-split areas. Pages inside an area are bundled together, so moving between
// pages never shows a loading fallback.
const AdminApp = lazy(() => import('./admin/AdminApp'));
const PartnerApp = lazy(() => import('./partner/PartnerApp'));

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
          <Suspense fallback={<Splash />}>
            <Routes>
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

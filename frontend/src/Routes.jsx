import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import CookieConsentBanner from "components/ui/CookieConsentBanner";
import Homepage from './pages/homepage';

const NotFound = lazy(() => import('pages/NotFound'));
const Services = lazy(() => import('./pages/services'));
const Products = lazy(() => import('./pages/products'));
const RoiCalculator = lazy(() => import('./pages/roi-calculator'));
const AndroidApps = lazy(() => import('./pages/android-apps'));
const WhyChooseUs = lazy(() => import('./pages/why-choose-us'));
const ClientSuccess = lazy(() => import('./pages/client-success'));
const ContactUs = lazy(() => import('./pages/contact-us'));
const ProductDevelopmentLeadGen = lazy(() => import('./pages/leadgen/ProductDevelopmentLeadGen'));
const SoftwareDevelopmentLeadGen = lazy(() => import('./pages/leadgen/SoftwareDevelopmentLeadGen'));
const WebDevelopmentLeadGen = lazy(() => import('./pages/leadgen/WebDevelopmentLeadGen'));
const About = lazy(() => import('./pages/about'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const CookiePolicy = lazy(() => import('./pages/legal/CookiePolicy'));
const RefundCancellation = lazy(() => import('./pages/legal/RefundCancellation'));

const AdminProtectedRoute = lazy(() => import('components/ui/AdminProtectedRoute'));
const ClientProtectedRoute = lazy(() => import('components/ui/ClientProtectedRoute'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminLayout = lazy(() => import('./pages/admin/Layout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductsAdmin = lazy(() => import('./pages/admin/ProductsAdmin'));
const ServicesAdmin = lazy(() => import('./pages/admin/ServicesAdmin'));
const AndroidAppsAdmin = lazy(() => import('./pages/admin/AndroidAppsAdmin'));
const ClientsAdmin = lazy(() => import('./pages/admin/ClientsAdmin'));
const ClientDetail = lazy(() => import('./pages/admin/ClientDetail'));
const SettingsAdmin = lazy(() => import('./pages/admin/SettingsAdmin'));
const RenewalsAdmin = lazy(() => import('./pages/admin/RenewalsAdmin'));
const LeadsAdmin = lazy(() => import('./pages/admin/LeadsAdmin'));

const ClientLogin = lazy(() => import('./pages/client/Login'));
const ClientSignup = lazy(() => import('./pages/client/Signup'));
const ClientDashboard = lazy(() => import('./pages/client/Dashboard'));

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
    <div className="w-10 h-10 border-4 border-[var(--color-muted)] border-t-[var(--color-primary)] rounded-full animate-spin" />
  </div>
);

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<Homepage />} />
        <Route path="/services" element={<Services />} />
        <Route path="/products" element={<Products />} />
        <Route path="/roi-calculator" element={<RoiCalculator />} />
        <Route path="/android-apps" element={<AndroidApps />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/lp/product-development" element={<ProductDevelopmentLeadGen />} />
        <Route path="/lp/software-development" element={<SoftwareDevelopmentLeadGen />} />
        <Route path="/lp/web-development" element={<WebDevelopmentLeadGen />} />
        <Route path="/why-choose-us" element={<WhyChooseUs />} />
        <Route path="/client-success" element={<ClientSuccess />} />
        <Route path="/about" element={<About />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/refund-cancellation" element={<RefundCancellation />} />

        {/* Admin Panel */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="leads" element={<LeadsAdmin />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="services" element={<ServicesAdmin />} />
          <Route path="android-apps" element={<AndroidAppsAdmin />} />
          <Route path="clients" element={<ClientsAdmin />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route path="renewals" element={<RenewalsAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
        </Route>

        {/* Client Panel */}
        <Route path="/client/login" element={<ClientLogin />} />
        <Route path="/client/signup" element={<ClientSignup />} />
        <Route
          path="/client/dashboard"
          element={
            <ClientProtectedRoute>
              <ClientDashboard />
            </ClientProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </Suspense>
      <CookieConsentBanner />
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;

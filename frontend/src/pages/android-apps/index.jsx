import React, { useEffect, useState } from 'react';
import Seo from '../../components/Seo';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import AppHero from './components/AppHero';
import AppCard from './components/AppCard';
import AppDetailModal from './components/AppDetailModal';
import Icon from '../../components/AppIcon';
import { publicApi, BASE_URL } from '../../lib/apiClient';

const UPLOADS_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');

const AndroidApps = () => {
  const [selectedApp, setSelectedApp] = useState(null);
  const [androidApps, setAndroidApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    publicApi
      .get('/android-apps')
      .then((res) => {
        setAndroidApps(
          res.data.map((app) => ({
            ...app,
            screenshots: (app.screenshots || []).map((src) => `${UPLOADS_ORIGIN}${src}`)
          }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Seo
        title="Android Apps"
        description="Companion Android apps from Reynrel Infotech for Clinic Management, CRM, and Billing Software — manage your business on the go."
        path="/android-apps"
      />
      <Header />
      <main className="pt-16 lg:pt-20">
        <AppHero />

        <section className="py-12 md:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)]/10 rounded-full mb-4">
                <Icon name="Smartphone" size={20} className="text-[var(--color-accent)]" />
                <span className="text-sm font-medium text-[var(--color-accent)]">Available Apps</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-foreground)] mb-4">
                Take Your Software Anywhere
              </h2>
              <p className="text-base md:text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
                Native Android companion apps for our product suite, with more on the way
              </p>
            </div>

            {loading ? (
              <p className="text-center text-[var(--color-muted-foreground)]">Loading apps...</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {androidApps?.map((app) => (
                  <AppCard key={app?.id} app={app} onViewDetails={setSelectedApp} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />

      {selectedApp && (
        <AppDetailModal app={selectedApp} onClose={() => setSelectedApp(null)} />
      )}
    </div>
  );
};

export default AndroidApps;

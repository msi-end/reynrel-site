import React, { useEffect } from 'react';
import Seo from '../../../components/Seo';
import Header from '../../../components/ui/Header';
import Footer from '../../homepage/components/Footer';
import Icon from '../../../components/AppIcon';

const LegalPageLayout = ({ icon, title, lastUpdated, description, path, children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {description && path && <Seo title={title} description={description} path={path} />}
      <Header />

      <main className="pt-16 lg:pt-20">
        <section className="bg-[var(--color-brand-navy)] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
            <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 rounded-xl bg-white/10 flex items-center justify-center">
              <Icon name={icon} size={28} color="var(--color-brand-electric)" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">{title}</h1>
            <p className="text-sm md:text-base text-white/70">Last updated: {lastUpdated}</p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-[var(--color-brand-navy)] prose-a:text-[var(--color-brand-electric)] prose-li:marker:text-[var(--color-brand-electric)]">
            {children}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LegalPageLayout;

import React, { useEffect } from 'react';
import Seo from '../../components/Seo';
import Header from '../../components/ui/Header';
import HeroSection from './components/HeroSection';
import ClientLogos from './components/ClientLogos';
import TestimonialsGrid from './components/TestimonialsGrid';
import CaseStudies from './components/CaseStudies';
import SuccessMetrics from './components/SuccessMetrics';
import CTASection from './components/CTASection';
import Footer from '../homepage/components/Footer';

const ClientSuccess = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Seo
        title="Client Success Stories"
        description="See how Reynrel Infotech has helped businesses across Assam and beyond with custom software, web development, and long-term technology partnerships."
        path="/client-success"
      />
      <Header />

      <main className="pt-16 lg:pt-20">
        <HeroSection />
        <ClientLogos />
        <TestimonialsGrid />
        <CaseStudies />
        <SuccessMetrics />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default ClientSuccess;
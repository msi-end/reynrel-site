import React, { useState, useEffect } from 'react';
import Seo from '../../components/Seo';
import Header from '../../components/ui/Header';
import HeroSection from './components/HeroSection';
import ROICalculatorSection from './components/ROICalculatorSection';
import ServicesPreview from './components/ServicesPreview';
import ProductsPreview from './components/ProductsPreview';
import ClientSuccessHighlights from './components/ClientSuccessHighlights';
import TrustSignals from './components/TrustSignals';
import FAQSection from './components/FAQSection';
import LeadCaptureSection from './components/LeadCaptureSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import Icon from '../../components/AppIcon';

const Homepage = () => {
  const [showConsultationModal, setShowConsultationModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleScheduleConsultation = () => {
    setShowConsultationModal(true);
  };

  const handleCloseModal = () => {
    setShowConsultationModal(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Seo
        title="Guwahati's Web & Software Development Partner"
        description="Reynrel Infotech is a Guwahati-based web and software development company offering custom software, website development, and tech consultancy across India."
        path="/"
      />
      <Header />

      <main className="pt-16 lg:pt-20">
        <HeroSection onScheduleConsultation={handleScheduleConsultation} />
        <ROICalculatorSection onScheduleConsultation={handleScheduleConsultation} />
        <ServicesPreview />
        <ProductsPreview />
        <ClientSuccessHighlights />
        <TrustSignals />
        <FAQSection />
        <LeadCaptureSection />
        <CTASection onScheduleConsultation={handleScheduleConsultation} />
      </main>

      <Footer />

      {/* Consultation Modal */}
      {showConsultationModal && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          ></div>
          <div className="relative bg-[var(--color-card)] rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-fade-in">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-[var(--color-muted)] flex items-center justify-center transition-colors"
              aria-label="Close modal"
            >
              <span className="text-2xl text-[var(--color-muted-foreground)]">&times;</span>
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Calendar" size={28} color="#fff" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">
                Schedule Your Consultation
              </h3>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Let's discuss how we can help transform your business
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-[var(--color-muted)] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-lg flex items-center justify-center">
                    <Icon name="Mail" size={18} className="text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--color-foreground)]">Email</div>
                    <a href="mailto:info.reynrel@gmail.com" className="text-xs text-[var(--color-primary)] hover:underline">
                      info.reynrel@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--color-muted)] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-lg flex items-center justify-center">
                    <Icon name="Phone" size={18} className="text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--color-foreground)]">Phone</div>
                    <a href="tel:+919401069337" className="text-xs text-[var(--color-primary)] hover:underline">
                      +91 94010 69337
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 rounded-lg p-4 border border-[var(--color-border)]">
                <div className="text-xs text-[var(--color-muted-foreground)] text-center">
                  Our team typically responds within 24 hours
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;
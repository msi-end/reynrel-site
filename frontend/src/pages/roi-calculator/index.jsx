import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Seo from '../../components/Seo';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import Icon from '../../components/AppIcon';
import HeroBackground, { HeroWaveDivider, HERO_GRADIENT_CLASS } from '../../components/ui/HeroBackground';
import AutomationROICalculator from './components/AutomationROICalculator';
import ProductROICalculator from './components/ProductROICalculator';
import WebsiteROICalculator from './components/WebsiteROICalculator';

const METHODS = [
  {
    id: 'automation',
    label: 'Automation ROI',
    icon: 'Workflow',
    description: 'Savings from automating repetitive, manual team tasks'
  },
  {
    id: 'product',
    label: 'Product ROI',
    icon: 'Package',
    description: 'Payback and ROI for a specific Reynrel product'
  },
  {
    id: 'website',
    label: 'Website ROI',
    icon: 'Globe',
    description: 'Revenue uplift from a faster, higher-converting website'
  }
];

const RoiCalculatorPage = () => {
  const navigate = useNavigate();
  const [activeMethod, setActiveMethod] = useState('automation');

  const handleScheduleConsultation = () => navigate('/contact-us');

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Seo
        title="ROI Calculator"
        description="Estimate the return on investment of automating your business, buying a Reynrel product, or rebuilding your website — with three quick, free calculators."
        path="/roi-calculator"
      />
      <Header />

      <main className="pt-16 lg:pt-20">
        {/* Hero */}
        <section className={`relative ${HERO_GRADIENT_CLASS} text-white overflow-hidden`}>
          <HeroBackground />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <Icon name="Calculator" size={18} className="text-[var(--color-brand-electric)]" />
              <span className="text-sm md:text-base font-medium">ROI Calculator</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
              Know Your Numbers Before You Invest
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
              Pick the calculator that fits what you're evaluating and get an instant, no-obligation estimate of your return.
            </p>
          </div>
          <HeroWaveDivider />
        </section>

        {/* Method Selector + Calculator */}
        <section className="py-12 md:py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-12">
              {METHODS?.map((method) => (
                <button
                  key={method?.id}
                  type="button"
                  onClick={() => setActiveMethod(method?.id)}
                  className={`text-left p-5 md:p-6 rounded-xl border transition-all duration-200 ${
                    activeMethod === method?.id
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-md'
                      : 'border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-primary)]/50'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center mb-4 ${
                      activeMethod === method?.id
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-muted)] text-[var(--color-foreground)]'
                    }`}
                  >
                    <Icon name={method?.icon} size={20} />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-[var(--color-foreground)] mb-1">
                    {method?.label}
                  </h3>
                  <p className="text-sm text-[var(--color-muted-foreground)]">{method?.description}</p>
                </button>
              ))}
            </div>

            <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-lg p-6 md:p-10">
              {activeMethod === 'automation' && (
                <AutomationROICalculator onScheduleConsultation={handleScheduleConsultation} />
              )}
              {activeMethod === 'product' && (
                <ProductROICalculator onScheduleConsultation={handleScheduleConsultation} />
              )}
              {activeMethod === 'website' && (
                <WebsiteROICalculator onScheduleConsultation={handleScheduleConsultation} />
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default RoiCalculatorPage;

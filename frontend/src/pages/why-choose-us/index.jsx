import React, { useEffect } from 'react';
import Seo from '../../components/Seo';
import Header from '../../components/ui/Header';
import HeroSection from './components/HeroSection';
import SupportCommitment from './components/SupportCommitment';
import CompetitiveDifferentiators from './components/CompetitiveDifferentiators';
import TrustDevelopment from './components/TrustDevelopment';
import CTASection from './components/CTASection';
import Footer from '../homepage/components/Footer';

const WhyChooseUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Seo
        title="Why Choose Us"
        description="See why businesses choose Reynrel Infotech: dedicated support, proven development process, and a track record built on long-term client partnerships."
        path="/why-choose-us"
      />
      <Header />

      <main className="pt-16 lg:pt-20">
        <HeroSection />
        <SupportCommitment />
        <CompetitiveDifferentiators />
        <TrustDevelopment />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default WhyChooseUs;
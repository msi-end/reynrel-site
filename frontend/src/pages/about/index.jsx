import React, { useEffect } from 'react';
import Seo from '../../components/Seo';
import Header from '../../components/ui/Header';
import HeroSection from './components/HeroSection';
import CompanyStorySection from './components/CompanyStorySection';
import PhilosophySection from './components/PhilosophySection';
import CultureSection from './components/CultureSection';
import CTASection from './components/CTASection';
import Footer from '../homepage/components/Footer';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Seo
        title="About Us"
        description="Learn about Reynrel Infotech's story, philosophy, and culture — a Guwahati-based software development company defining the future for ambitious businesses."
        path="/about"
      />
      <Header />

      <main className="pt-16 lg:pt-20">
        <HeroSection />
        <CompanyStorySection />
        <PhilosophySection />
        <CultureSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default About;
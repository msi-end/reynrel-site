import React from 'react';
import Icon from '../../../components/AppIcon';
import HeroBackground, { HeroWaveDivider, HERO_GRADIENT_CLASS } from '../../../components/ui/HeroBackground';

const HeroSection = () => {
  return (
    <section className={`relative ${HERO_GRADIENT_CLASS} text-white overflow-hidden`}>
      <HeroBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 md:px-6 py-2 md:py-3 rounded-full mb-6 md:mb-8">
            <Icon name="Award" size={20} className="text-[var(--color-brand-electric)]" />
            <span className="text-xs md:text-sm font-medium">Excellence in Software Development</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
            Why Choose <span className="text-[var(--color-brand-electric)]">Reynrel Infotech</span>
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-white/90 mb-8 md:mb-12 leading-relaxed max-w-3xl mx-auto">
            We don't just build software—we architect digital transformation through proven expertise, unwavering support, and long-term partnerships that drive measurable business outcomes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 md:px-6 py-3 md:py-4 rounded-lg">
              <Icon name="Users" size={24} className="text-[var(--color-brand-electric)]" />
              <div className="text-left">
                <div className="text-2xl md:text-3xl font-bold">05+</div>
                <div className="text-xs md:text-sm text-white/80">Years Experience</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 md:px-6 py-3 md:py-4 rounded-lg">
              <Icon name="CheckCircle2" size={24} className="text-[var(--color-brand-success)]" />
              <div className="text-left">
                <div className="text-2xl md:text-3xl font-bold">98%</div>
                <div className="text-xs md:text-sm text-white/80">Client Retention</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 md:px-6 py-3 md:py-4 rounded-lg">
              <Icon name="Trophy" size={24} className="text-[var(--color-brand-orange)]" />
              <div className="text-left">
                <div className="text-2xl md:text-3xl font-bold">37+</div>
                <div className="text-xs md:text-sm text-white/80">Projects Delivered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <HeroWaveDivider />
    </section>
  );
};

export default HeroSection;
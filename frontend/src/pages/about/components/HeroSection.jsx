import React from 'react';
import Icon from '../../../components/AppIcon';
import HeroBackground, { HeroWaveDivider, HERO_GRADIENT_CLASS } from '../../../components/ui/HeroBackground';

const HeroSection = () => {
  return (
    <section className={`relative ${HERO_GRADIENT_CLASS} text-white overflow-hidden`}>
      <HeroBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 md:mb-8">
            <Icon name="Users" size={20} color="var(--color-brand-electric)" />
            <span className="text-sm md:text-base font-medium">Meet the Team Behind Innovation</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
            Building the Future,
            <span className="block bg-gradient-to-r from-[var(--color-brand-electric)] to-[var(--color-accent)] bg-clip-text text-transparent">
              One Partnership at a Time
            </span>
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-white/90 mb-8 md:mb-12 leading-relaxed max-w-3xl mx-auto">
            At Reynrel Infotech, we're more than just developers—we're strategic technology partners committed to defining the future through proven expertise, innovation, and unwavering support.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg">
              <Icon name="Award" size={24} color="var(--color-brand-electric)" />
              <div className="text-left">
                <div className="text-2xl md:text-3xl font-bold">5+</div>
                <div className="text-xs md:text-sm text-white/80">Years Experience</div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg">
              <Icon name="Users" size={24} color="var(--color-brand-electric)" />
              <div className="text-left">
                <div className="text-2xl md:text-3xl font-bold">50+</div>
                <div className="text-xs md:text-sm text-white/80">Expert Team Members</div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg">
              <Icon name="Target" size={24} color="var(--color-brand-electric)" />
              <div className="text-left">
                <div className="text-2xl md:text-3xl font-bold">200+</div>
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
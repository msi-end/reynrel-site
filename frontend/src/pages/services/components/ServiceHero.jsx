import React from 'react';
import Icon from '../../../components/AppIcon';
import HeroBackground, { HeroWaveDivider, HERO_GRADIENT_CLASS } from '../../../components/ui/HeroBackground';

const ServiceHero = () => {
  return (
    <section className={`relative ${HERO_GRADIENT_CLASS} text-white overflow-hidden`}>
      <HeroBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 md:mb-8">
            <Icon name="Code2" size={20} color="var(--color-brand-electric)" />
            <span className="text-sm md:text-base font-medium">Enterprise Software Development</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
            Defining the Future Through
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-electric)] to-white">
              Technical Excellence
            </span>
          </h1>
          
          <p className="text-base md:text-lg lg:text-xl text-white/90 mb-8 md:mb-10 leading-relaxed max-w-3xl mx-auto">
            Transform your business with our comprehensive software development services. From custom applications to enterprise web solutions, we deliver technical expertise backed by proven experience and ongoing support.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg">
              <Icon name="CheckCircle2" size={24} color="var(--color-brand-electric)" />
              <span className="text-sm md:text-base font-medium">05+ Years Experience</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg">
              <Icon name="Users" size={24} color="var(--color-brand-electric)" />
              <span className="text-sm md:text-base font-medium">37+ Projects Delivered</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg">
              <Icon name="Award" size={24} color="var(--color-brand-electric)" />
              <span className="text-sm md:text-base font-medium">15/7 Support</span>
            </div>
          </div>
        </div>
      </div>
      
      <HeroWaveDivider />
    </section>
  );
};

export default ServiceHero;
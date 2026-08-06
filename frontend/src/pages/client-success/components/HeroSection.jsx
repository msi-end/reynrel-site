import React from 'react';
import Icon from '../../../components/AppIcon';
import HeroBackground, { HeroWaveDivider, HERO_GRADIENT_CLASS } from '../../../components/ui/HeroBackground';

const HeroSection = () => {
  return (
    <section className={`relative ${HERO_GRADIENT_CLASS} py-16 md:py-24 lg:py-32 overflow-hidden`}>
      <HeroBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 md:mb-8">
            <Icon name="Award" size={20} color="var(--color-brand-electric)" />
            <span className="text-sm md:text-base text-white font-medium">Trusted by Industry Leaders</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 font-[var(--font-headline)]">
            Client Success Stories
          </h1>
          
          <p className="text-base md:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto mb-8 md:mb-12 leading-relaxed">
            Discover how we've helped businesses transform their operations through innovative software solutions. Our clients' success is our greatest achievement.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 max-w-4xl mx-auto">
            {[
              { icon: 'Users', value: '50+', label: 'Happy Clients' },
              { icon: 'TrendingUp', value: '98%', label: 'Success Rate' },
              { icon: 'Clock', value: '24/7', label: 'Support' },
              { icon: 'Award', value: '5+', label: 'Years Experience' }
            ]?.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-white/20">
                <Icon name={stat?.icon} size={32} color="var(--color-brand-electric)" className="mx-auto mb-3" />
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">{stat?.value}</div>
                <div className="text-xs md:text-sm text-white/80">{stat?.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <HeroWaveDivider />
    </section>
  );
};

export default HeroSection;
import React from 'react';
import Icon from '../../../components/AppIcon';
import HeroBackground, { HeroWaveDivider, HERO_GRADIENT_CLASS } from '../../../components/ui/HeroBackground';

const ProductHero = () => {
  return (
    <section className={`relative ${HERO_GRADIENT_CLASS} text-white overflow-hidden`}>
      <HeroBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 md:mb-8">
            <Icon name="Sparkles" size={20} />
            <span className="text-sm md:text-base font-medium">Enterprise-Grade Software Solutions</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
            Powerful Products Built for
            <span className="block bg-gradient-to-r from-[var(--color-brand-electric)] to-white bg-clip-text text-transparent mt-2">
              Real Business Results
            </span>
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-white/90 mb-8 md:mb-10 leading-relaxed max-w-3xl mx-auto">
            Discover our suite of proven software solutions designed to streamline operations, boost productivity, and drive measurable ROI across healthcare, sales, and financial services.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-white/10 backdrop-blur-sm rounded-lg">
              <Icon name="CheckCircle2" size={20} className="text-[var(--color-brand-success)]" />
              <span className="text-sm md:text-base">Live Demos Available</span>
            </div>
            <div className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-white/10 backdrop-blur-sm rounded-lg">
              <Icon name="TrendingUp" size={20} className="text-[var(--color-brand-success)]" />
              <span className="text-sm md:text-base">ROI Calculators Included</span>
            </div>
          </div>
        </div>
      </div>

      <HeroWaveDivider />
    </section>
  );
};

export default ProductHero;
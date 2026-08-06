import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const HeroSection = ({ onScheduleConsultation }) => {
  return (
    <>
    <section className="relative min-h-screen pb-24 md:pb-32 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-brand-navy)] via-[var(--color-hero-primary)] to-[var(--color-brand-charcoal)]">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] animate-pulse"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-[var(--color-brand-electric)] rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 bg-[var(--color-accent)] rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 lg:py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6 md:mb-8">
            <Icon name="Sparkles" size={16} color="var(--color-brand-electric)" />
            <span className="text-xs md:text-sm lg:text-base text-white font-medium">Business Software Development Excellence</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 md:mb-6 lg:mb-8 leading-tight">
            Automate Businesses With Custom Software Solutions <span className="bg-gradient-to-r from-[var(--color-brand-electric)] to-[var(--color-accent)] bg-clip-text text-transparent"> <br />That Scale With You</span>
          </h1>

          {/* Subheading */}
          <p className="text-base md:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto mb-8 md:mb-10 lg:mb-12 leading-relaxed px-4">
            We create custom business systems — from workflow automation to enterprise platforms — designed to reduce operational chaos and scale efficiently.. We don't just build software—we define your Growth.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 mb-12 md:mb-16 lg:mb-20">
            <Button
              variant="default"
              size="lg"
              className="w-full sm:w-auto bg-[var(--color-brand-electric)] hover:bg-[var(--color-brand-electric)]/90 text-[var(--color-brand-navy)] font-semibold shadow-lg shadow-[var(--color-brand-electric)]/50"
              iconName="Calendar"
              iconPosition="left"
              onClick={onScheduleConsultation}
            >
              Schedule Consultation
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10"
              iconName="Play"
              iconPosition="left"
            >
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-white/10">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-brand-electric)] mb-2">05+</div>
              <div className="text-xs md:text-sm text-white/80">Years Experience</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-white/10">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-brand-electric)] mb-2">37+</div>
              <div className="text-xs md:text-sm text-white/80">Projects Delivered</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-white/10">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-brand-electric)] mb-2">98%</div>
              <div className="text-xs md:text-sm text-white/80">Client Satisfaction</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-white/10">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-brand-electric)] mb-2">24/7</div>
              <div className="text-xs md:text-sm text-white/80">Support Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <Icon name="ChevronDown" size={32} color="#d0672b" className="opacity-60 z-[100] opacity-100" />
      </div>
    <svg viewBox="0 24 150 28" preserveAspectRatio="none" className="waves " >
    <defs>
      <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
    </defs>
    <g className="parallax">
      <use href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7" />
      <use href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
      <use href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
      <use href="#gentle-wave" x="48" y="7" fill="#fff" />
    </g>
  </svg>
    </section>
    </>

  );
};

export default HeroSection;
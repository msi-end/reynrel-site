import React from 'react';

// Shared hero background used across page heroes so every hero section matches
// the homepage's animated gradient look instead of each page having its own.
const HeroBackground = () => (
  <>
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] animate-pulse"></div>
    </div>
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-[var(--color-brand-electric)] rounded-full opacity-20 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 bg-[var(--color-accent)] rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>
  </>
);

// Replaces the old flat "fade to background" strip at the bottom of hero
// sections with the same animated wave divider the homepage hero uses.
export const HeroWaveDivider = () => (
  <svg viewBox="0 24 150 28" preserveAspectRatio="none" className="waves">
    <defs>
      <path id="hero-gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
    </defs>
    <g className="parallax">
      <use href="#hero-gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
      <use href="#hero-gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
      <use href="#hero-gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
      <use href="#hero-gentle-wave" x="48" y="7" fill="var(--color-background)" />
    </g>
  </svg>
);

export const HERO_GRADIENT_CLASS = "bg-gradient-to-br from-[var(--color-brand-navy)] via-[var(--color-hero-primary)] to-[var(--color-brand-charcoal)]";

export default HeroBackground;

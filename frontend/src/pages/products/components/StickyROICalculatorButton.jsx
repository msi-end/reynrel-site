import React from 'react';
import Icon from '../../../components/AppIcon';

const StickyROICalculatorButton = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open ROI Calculator"
      className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-fixed flex items-center gap-2 pl-4 pr-5 py-3.5 rounded-full bg-gradient-to-br from-[var(--color-brand-success)] to-[var(--color-accent)] text-white font-semibold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-300 animate-roi-float"
    >
      <span className="absolute inset-0 rounded-full bg-[var(--color-accent)]/40 animate-ping" />
      <Icon name="Calculator" size={20} className="relative flex-shrink-0" />
      <span className="relative text-sm md:text-base">ROI Calculator</span>
    </button>
  );
};

export default StickyROICalculatorButton;

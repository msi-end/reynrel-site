import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import AutomationROICalculator from '../../roi-calculator/components/AutomationROICalculator';

const ROICalculatorSection = ({ onScheduleConsultation }) => {
  const navigate = useNavigate();
  const [showCalculator, setShowCalculator] = useState(false);

  return (
    <section className="py-12 md:py-16 lg:py-24 bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-lg overflow-hidden grid lg:grid-cols-2">
          {/* Left: illustration */}
          <div className="relative bg-[var(--color-muted)] p-8 md:p-10 flex items-center justify-center min-h-[280px] lg:min-h-full">
            <Image
              src="/assets/images/roi2.png"
              alt="Illustration of manual spreadsheet work being automated into a software workflow"
              className="w-full h-full max-w-md mx-auto object-contain"
            />
          </div>

          {/* Right: typography + CTAs */}
          <div className="p-8 md:p-12 lg:p-14 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)]/10 rounded-full mb-4 md:mb-6 w-fit">
              <Icon name="Calculator" size={16} color="var(--color-primary)" />
              <span className="text-xs md:text-sm font-medium text-[var(--color-primary)]">ROI Calculator</span>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-foreground)] mb-4 md:mb-6">
              How much of your money is being{' '}
              <span className="text-[var(--color-primary)]">wasted</span> on manual work?
            </h2>

            <p className="text-base md:text-lg text-[var(--color-muted-foreground)] mb-8 leading-relaxed">
              Input your business details and instantly see how many hours and money you can save
              annually by automating Excel, Data Entry, and manual processes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="default"
                size="lg"
                iconName="Calculator"
                iconPosition="left"
                onClick={() => setShowCalculator(true)}
              >
                Calculate Your Automation ROI
              </Button>
              <Button
                variant="outline"
                size="lg"
                iconName="ArrowRight"
                iconPosition="right"
                onClick={() => navigate('/roi-calculator')}
              >
                More ROI Calculations
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Popup: Automation ROI form */}
      {showCalculator && (
        <div className="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--color-card)] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--color-card)] border-b border-[var(--color-border)] p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
                  <Icon name="Calculator" size={24} color="white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-[var(--color-foreground)]">
                    Automation ROI Calculator
                  </h2>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    See what manual work is really costing you
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCalculator(false)}
                className="w-10 h-10 rounded-lg hover:bg-[var(--color-muted)] transition-colors flex items-center justify-center flex-shrink-0"
                aria-label="Close"
              >
                <Icon name="X" size={24} />
              </button>
            </div>

            <div className="p-6 md:p-8">
              <AutomationROICalculator onScheduleConsultation={onScheduleConsultation} />
              <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
                <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
                  Want to estimate ROI a different way — by product or by website performance?
                </p>
                <Button
                  variant="outline"
                  iconName="ArrowRight"
                  iconPosition="right"
                  onClick={() => {
                    setShowCalculator(false);
                    navigate('/roi-calculator');
                  }}
                >
                  More ROI Calculations
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ROICalculatorSection;

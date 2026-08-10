import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CTASection = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: "Shield",
      title: "Enterprise Security",
      description: "Bank-level encryption and compliance"
    },
    {
      icon: "Headphones",
      title: "15/7 Support",
      description: "Dedicated team available extended hours"
    },
    {
      icon: "Zap",
      title: "Quick Implementation",
      description: "Go live in weeks, not months"
    },
    {
      icon: "TrendingUp",
      title: "Proven ROI",
      description: "Average 300% return in first year"
    }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-[#5f2104] via-[var(--color-brand-navy)] to-[#5f2104] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-brand-electric)] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-accent)] rounded-full blur-3xl"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
            Join hundreds of successful businesses that have already made the switch to Reynrel Infotech solutions
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits?.map((benefit, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <Icon name={benefit?.icon} size={28} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{benefit?.title}</h3>
              <p className="text-sm text-white/80">{benefit?.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="default"
            size="lg"
            className="bg-white text-[var(--color-primary)] hover:bg-white/90"
            iconName="Calendar"
            iconPosition="left"
            onClick={() => navigate('/about')}
          >
            Schedule Consultation
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white/10"
            iconName="Phone"
            iconPosition="left"
            onClick={() => navigate('/about')}
          >
            Contact Sales
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 opacity-80">
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle2" size={20} className="text-[var(--color-brand-success)]" />
            <span className="text-sm">No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle2" size={20} className="text-[var(--color-brand-success)]" />
            <span className="text-sm">Free 30-day trial</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle2" size={20} className="text-[var(--color-brand-success)]" />
            <span className="text-sm">Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
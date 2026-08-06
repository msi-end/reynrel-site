import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CTASection = () => {
  const navigate = useNavigate();

  const nextSteps = [
    {
      icon: "MessageSquare",
      title: "Schedule Consultation",
      description: "Discuss your project requirements with our experts",
      action: "Book a Call",
      path: "/about"
    },
    {
      icon: "FileText",
      title: "View Success Stories",
      description: "See how we\'ve helped businesses like yours succeed",
      action: "Read Case Studies",
      path: "/client-success"
    },
    {
      icon: "Package",
      title: "Explore Solutions",
      description: "Discover our products and services tailored to your needs",
      action: "View Products",
      path: "/products"
    }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-primary)] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
            Ready to Experience the Reynrel Difference?
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto">
            Join 300+ satisfied clients who trust us with their digital transformation. Let's build something extraordinary together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {nextSteps?.map((step, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 md:p-8 hover:bg-white/20 transition-all duration-300 border border-white/20">
              <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/20 mb-4 md:mb-6 mx-auto">
                <Icon name={step?.icon} size={28} className="text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 text-center">{step?.title}</h3>
              <p className="text-sm md:text-base text-white/80 mb-6 text-center">{step?.description}</p>
              <Button
                variant="outline"
                size="default"
                fullWidth
                onClick={() => navigate(step?.path)}
                className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-[var(--color-primary)]"
              >
                {step?.action}
              </Button>
            </div>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 lg:p-12 border border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6">
                Why Wait? Start Your Journey Today
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle2" size={20} className="text-[var(--color-brand-success)] flex-shrink-0 mt-1" />
                  <p className="text-sm md:text-base text-white/90">Free initial consultation to understand your needs</p>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle2" size={20} className="text-[var(--color-brand-success)] flex-shrink-0 mt-1" />
                  <p className="text-sm md:text-base text-white/90">Detailed project proposal with transparent pricing</p>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle2" size={20} className="text-[var(--color-brand-success)] flex-shrink-0 mt-1" />
                  <p className="text-sm md:text-base text-white/90">No obligation—explore how we can help your business</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                variant="default"
                size="lg"
                fullWidth
                onClick={() => navigate('/about')}
                className="bg-white text-[var(--color-primary)] hover:bg-white/90"
                iconName="ArrowRight"
                iconPosition="right"
              >
                Get Started Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => navigate('/services')}
                className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-[var(--color-primary)]"
                iconName="Package"
                iconPosition="left"
              >
                Explore Our Services
              </Button>
              <div className="text-center pt-4">
                <p className="text-xs md:text-sm text-white/70">
                  Trusted by growing businesses • 5+ years of excellence
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
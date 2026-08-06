import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CTASection = () => {
  const navigate = useNavigate();

  const benefits = [
    { icon: 'CheckCircle2', text: 'Free consultation & project scoping' },
    { icon: 'Clock', text: 'Rapid response within 24 hours' },
    { icon: 'Shield', text: 'NDA protection for your ideas' },
    { icon: 'Award', text: 'No obligation proposal' }
  ];

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-br from-[#5f2104] via-[var(--color-brand-navy)] to-[var(--color-accent)] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-brand-electric)] rounded-full blur-3xl"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <Icon name="Rocket" size={20} color="var(--color-brand-electric)" />
            <span className="text-sm font-medium">Start Your Project</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto mb-8">
            Let's discuss how our custom software development services can help you achieve your business goals. Schedule a free consultation today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              variant="default"
              size="lg"
              iconName="Calendar"
              iconPosition="left"
              onClick={() => navigate('/about')}
              className="bg-white text-[var(--color-primary)] hover:bg-white/90"
            >
              Schedule Consultation
            </Button>
            <Button
              variant="outline"
              size="lg"
              iconName="MessageCircle"
              iconPosition="left"
              onClick={() => navigate('/about')}
              className="border-white text-white hover:bg-white/10"
            >
              Chat with Expert
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {benefits?.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon name={benefit?.icon} size={20} color="var(--color-brand-electric)" />
                </div>
                <span className="text-sm font-medium text-left">{benefit?.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-16">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold mb-2">5+</div>
            <div className="text-sm md:text-base text-white/80">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold mb-2">100+</div>
            <div className="text-sm md:text-base text-white/80">Projects Delivered</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
            <div className="text-sm md:text-base text-white/80">Client Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CTASection = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      id: 1,
      icon: 'Users',
      title: 'Join 50+ Happy Clients',
      description: 'Become part of our growing family of successful partnerships'
    },
    {
      id: 2,
      icon: 'Headphones',
      title: '15/7 Dedicated Support',
      description: 'Get expert assistance across extended hours, 7 days a week'
    },
    {
      id: 3,
      icon: 'TrendingUp',
      title: 'Proven Track Record',
      description: '05+ years of delivering exceptional results and ROI'
    }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-[var(--color-brand-navy)] via-[#5f2104] to-[var(--color-brand-navy)] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-brand-electric)] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-accent)] rounded-full blur-3xl"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4 font-[var(--font-headline)]">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-white/90 max-w-2xl mx-auto">
            Let's discuss how we can help transform your business with innovative software solutions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
          {benefits?.map((benefit) => (
            <div
              key={benefit?.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/20 text-center group hover:bg-white/15 transition-all duration-300"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 bg-[var(--color-brand-electric)] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icon name={benefit?.icon} size={32} color="white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                {benefit?.title}
              </h3>
              <p className="text-sm md:text-base text-white/80">
                {benefit?.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="default"
            size="lg"
            className="bg-white text-[var(--color-primary)] hover:bg-white/90 w-full sm:w-auto"
            iconName="Calendar"
            iconPosition="left"
            onClick={() => navigate('/about')}
          >
            Schedule Consultation
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white/10 w-full sm:w-auto"
            iconName="MessageCircle"
            iconPosition="left"
            onClick={() => navigate('/about')}
          >
            Contact Us
          </Button>
        </div>

        <div className="mt-8 md:mt-12 text-center">
          <p className="text-sm md:text-base text-white/80 mb-4">
            Trusted by leading organizations worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
            {['EBAH', 'North East 365', 'TechCorp', 'FinanceHub']?.map((client, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white text-sm md:text-base font-medium"
              >
                {client}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
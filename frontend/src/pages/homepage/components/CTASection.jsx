import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CTASection = ({ onScheduleConsultation }) => {
  const navigate = useNavigate();

  const contactMethods = [
    {
      id: 1,
      icon: "Mail",
      title: "Email Us",
      description: "info.reynrel@gmail.com",
      action: "mailto:info.reynrel@gmail.com"
    },
    {
      id: 2,
      icon: "Phone",
      title: "Call Us",
      description: "+91 94010 69337",
      action: "tel:+919401069337"
    },
    {
      id: 3,
      icon: "MessageSquare",
      title: "WhatsApp Us",
      description: "+91 98647 73099",
      action: "https://wa.me/+919864773099"
    }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-br from-[var(--color-brand-navy)] via-[#5f2104] to-[var(--color-brand-charcoal)] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-brand-electric)] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--color-accent)] rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6 md:mb-8">
            <Icon name="Rocket" size={16} color="var(--color-brand-electric)" />
            <span className="text-xs md:text-sm text-white font-medium">Ready to Transform Your Business?</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">
            Let's Build Something <span className="bg-gradient-to-r from-[var(--color-brand-electric)] to-[var(--color-accent)] bg-clip-text text-transparent">Extraordinary</span>
          </h2>

          {/* Description */}
          <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto mb-8 md:mb-12 leading-relaxed">
            Partner with Reynrel Infotech for proven expertise, long-term support, and innovative solutions that define your future. Schedule a consultation today to discuss your project.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 mb-12 md:mb-16">
            <Button
              variant="default"
              size="lg"
              className="w-full sm:w-auto bg-[var(--color-brand-electric)] hover:bg-[var(--color-brand-electric)]/90 text-[var(--color-brand-navy)] font-semibold shadow-lg shadow-[var(--color-brand-electric)]/50"
              iconName="Calendar"
              iconPosition="left"
              onClick={onScheduleConsultation}
            >
              Schedule Free Consultation
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10"
              iconName="FileText"
              iconPosition="left"
              onClick={() => navigate('/about')}
            >
              View Company Profile
            </Button>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
          {contactMethods?.map((method) => (
            <div
              key={method?.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
              onClick={() => method?.action && window.open(method?.action, '_blank')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br from-[var(--color-brand-electric)] to-[var(--color-accent)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon name={method?.icon} size={24} color="white" />
                </div>
                <div>
                  <div className="text-sm md:text-base font-semibold text-white mb-1">
                    {method?.title}
                  </div>
                  <div className="text-xs md:text-sm text-white/80">
                    {method?.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[var(--color-brand-electric)] mb-2">
                05+
              </div>
              <div className="text-xs md:text-sm text-white/80">
                Years Experience
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[var(--color-brand-electric)] mb-2">
                37+
              </div>
              <div className="text-xs md:text-sm text-white/80">
                Projects Delivered
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[var(--color-brand-electric)] mb-2">
                98%
              </div>
              <div className="text-xs md:text-sm text-white/80">
                Client Satisfaction
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[var(--color-brand-electric)] mb-2">
                15/7
              </div>
              <div className="text-xs md:text-sm text-white/80">
                Support Available
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
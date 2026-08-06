import React from 'react';
import Icon from '../../../components/AppIcon';

const SupportCommitment = () => {
  const supportFeatures = [
    {
      icon: "Clock",
      title: "24/7 Support Availability",
      description: "Round-the-clock technical support ensuring your business operations never face downtime. Our dedicated support team is always ready to assist.",
      metrics: ["<15 min response time", "99.9% uptime guarantee", "Multi-channel support"]
    },
    {
      icon: "Users",
      title: "Dedicated Account Manager",
      description: "Every client receives a dedicated account manager who understands your business goals and ensures seamless communication throughout the partnership.",
      metrics: ["Single point of contact", "Quarterly business reviews", "Proactive monitoring"]
    },
    {
      icon: "Zap",
      title: "Rapid Issue Resolution",
      description: "Our experienced team resolves critical issues swiftly with established escalation procedures and comprehensive knowledge base.",
      metrics: ["Priority ticket system", "Root cause analysis", "Preventive measures"]
    },
    {
      icon: "RefreshCw",
      title: "Continuous Improvement",
      description: "We don't just maintain—we continuously enhance your software with regular updates, security patches, and feature improvements.",
      metrics: ["Monthly updates", "Security monitoring", "Performance optimization"]
    }
  ];

  const serviceLevels = [
    {
      level: "Critical",
      responseTime: "15 minutes",
      resolutionTime: "4 hours",
      availability: "24/7",
      color: "var(--color-error)"
    },
    {
      level: "High",
      responseTime: "1 hour",
      resolutionTime: "8 hours",
      availability: "24/7",
      color: "var(--color-brand-orange)"
    },
    {
      level: "Medium",
      responseTime: "4 hours",
      resolutionTime: "24 hours",
      availability: "Business Hours",
      color: "var(--color-warning)"
    },
    {
      level: "Low",
      responseTime: "8 hours",
      resolutionTime: "48 hours",
      availability: "Business Hours",
      color: "var(--color-brand-success)"
    }
  ];

  const onboardingSteps = [
    {
      step: 1,
      title: "Discovery & Planning",
      description: "Comprehensive analysis of your business needs, technical requirements, and success metrics",
      duration: "Week 1-2"
    },
    {
      step: 2,
      title: "Team Introduction",
      description: "Meet your dedicated team, establish communication channels, and set project milestones",
      duration: "Week 2"
    },
    {
      step: 3,
      title: "Development Kickoff",
      description: "Begin development with regular sprint reviews and transparent progress tracking",
      duration: "Week 3+"
    },
    {
      step: 4,
      title: "Deployment & Training",
      description: "Smooth deployment with comprehensive training and documentation for your team",
      duration: "Final Week"
    },
    {
      step: 5,
      title: "Ongoing Partnership",
      description: "Continuous support, maintenance, and strategic guidance for long-term success",
      duration: "Ongoing"
    }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-24 bg-[var(--color-card)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 bg-[var(--color-brand-success)]/10 px-4 md:px-6 py-2 md:py-3 rounded-full mb-4 md:mb-6">
            <Icon name="Shield" size={20} className="text-[var(--color-brand-success)]" />
            <span className="text-xs md:text-sm font-medium text-[var(--color-brand-success)]">Unwavering Support</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-foreground)] mb-4 md:mb-6">
            Support That Goes Beyond Project Completion
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-[var(--color-muted-foreground)] max-w-3xl mx-auto">
            We believe in long-term partnerships, not just projects. Our comprehensive support ensures your success continues long after deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16 md:mb-20 lg:mb-24">
          {supportFeatures?.map((feature, index) => (
            <div key={index} className="bg-[var(--color-background)] rounded-xl p-6 md:p-8 hover:shadow-lg transition-all duration-300 border border-[var(--color-border)]">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--color-primary)]/10 flex-shrink-0">
                  <Icon name={feature?.icon} size={24} className="text-[var(--color-primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg lg:text-xl font-bold text-[var(--color-foreground)] mb-2">{feature?.title}</h3>
                  <p className="text-sm md:text-base text-[var(--color-muted-foreground)] leading-relaxed">{feature?.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {feature?.metrics?.map((metric, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 text-xs md:text-sm px-3 py-1 bg-[var(--color-brand-success)]/10 text-[var(--color-brand-success)] rounded-full">
                    <Icon name="CheckCircle2" size={14} />
                    {metric}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-accent)]/5 rounded-2xl p-6 md:p-8 lg:p-12 mb-16 md:mb-20 lg:mb-24">
          <div className="text-center mb-8 md:mb-12">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-[var(--color-foreground)] mb-3 md:mb-4">
              Service Level Commitments
            </h3>
            <p className="text-sm md:text-base text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
              Transparent SLAs that ensure your business-critical systems receive the attention they deserve
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-4 gap-4 mb-4 px-4 py-3 bg-[var(--color-card)] rounded-lg font-medium text-xs md:text-sm text-[var(--color-foreground)]">
                <div>Priority Level</div>
                <div>Response Time</div>
                <div>Resolution Time</div>
                <div>Availability</div>
              </div>
              {serviceLevels?.map((level, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 px-4 py-4 bg-[var(--color-card)] rounded-lg mb-3 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: level?.color }}></div>
                    <span className="text-sm md:text-base font-medium text-[var(--color-foreground)]">{level?.level}</span>
                  </div>
                  <div className="text-sm md:text-base text-[var(--color-muted-foreground)]">{level?.responseTime}</div>
                  <div className="text-sm md:text-base text-[var(--color-muted-foreground)]">{level?.resolutionTime}</div>
                  <div className="text-sm md:text-base text-[var(--color-muted-foreground)]">{level?.availability}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-background)] rounded-2xl p-6 md:p-8 lg:p-12">
          <div className="text-center mb-8 md:mb-12">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-[var(--color-foreground)] mb-3 md:mb-4">
              Seamless Onboarding Process
            </h3>
            <p className="text-sm md:text-base text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
              Our structured onboarding ensures smooth project initiation and sets the foundation for long-term partnership success
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-[var(--color-border)] transform -translate-x-1/2"></div>
            
            <div className="space-y-8 md:space-y-12">
              {onboardingSteps?.map((step, index) => (
                <div key={index} className={`flex flex-col lg:flex-row items-start gap-4 md:gap-6 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                    <div className="bg-[var(--color-card)] rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-primary)] text-white text-sm font-bold flex-shrink-0">
                          {step?.step}
                        </div>
                        <h4 className="text-base md:text-lg font-bold text-[var(--color-foreground)]">{step?.title}</h4>
                      </div>
                      <p className="text-sm md:text-base text-[var(--color-muted-foreground)] mb-3">{step?.description}</p>
                      <div className="inline-flex items-center gap-2 text-xs md:text-sm text-[var(--color-primary)] font-medium">
                        <Icon name="Calendar" size={14} />
                        <span>{step?.duration}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-primary)] text-white font-bold z-10 flex-shrink-0">
                    {step?.step}
                  </div>
                  
                  <div className="flex-1 hidden lg:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportCommitment;
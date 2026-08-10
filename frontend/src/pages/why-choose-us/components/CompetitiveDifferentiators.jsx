import React from 'react';
import Icon from '../../../components/AppIcon';

const CompetitiveDifferentiators = () => {
  const differentiators = [
    {
      icon: "Handshake",
      title: "Long-Term Partnerships",
      ourApproach: "We build lasting relationships focused on your continuous success and growth",
      others: "Project-based engagements with limited post-delivery involvement",
      benefits: ["Dedicated account management", "Proactive system monitoring", "Strategic technology roadmap"]
    },
    {
      icon: "Award",
      title: "Proven Expertise",
      ourApproach: "05+ years of experience with 98% client retention and 37+ successful projects",
      others: "Limited track record or focus on quantity over quality",
      benefits: ["Industry-specific knowledge", "Best practice implementation", "Risk mitigation strategies"]
    },
    {
      icon: "Shield",
      title: "Comprehensive Support",
      ourApproach: "15/7 support with <15 min response time and ongoing maintenance included",
      others: "Limited support hours with additional charges for maintenance",
      benefits: ["Extended-hours availability", "Preventive maintenance", "Regular system updates"]
    },
    {
      icon: "Target",
      title: "Results-Driven Focus",
      ourApproach: "Success measured by your business outcomes and ROI, not just deliverables",
      others: "Focus on completing tasks without measuring business impact",
      benefits: ["KPI-based tracking", "ROI optimization", "Continuous improvement"]
    },
    {
      icon: "Users",
      title: "Transparent Communication",
      ourApproach: "Regular updates, open dialogue, and collaborative decision-making throughout",
      others: "Limited visibility into development process and progress",
      benefits: ["Weekly sprint reviews", "Real-time progress tracking", "Direct team access"]
    },
    {
      icon: "Zap",
      title: "Agile & Adaptive",
      ourApproach: "Flexible approach that adapts to changing business needs and market conditions",
      others: "Rigid processes with limited flexibility for changes",
      benefits: ["Iterative development", "Quick pivots", "Scalable solutions"]
    }
  ];

  const valuePropositions = [
    {
      metric: "98%",
      label: "Client Retention Rate",
      description: "Our clients stay with us because we deliver consistent value",
      icon: "TrendingUp"
    },
    {
      metric: "05+",
      label: "Years Experience",
      description: "Deep expertise across multiple industries and technologies",
      icon: "Award"
    },
    {
      metric: "37+",
      label: "Projects Delivered",
      description: "Proven track record of successful implementations",
      icon: "CheckCircle2"
    },
    {
      metric: "<15min",
      label: "Response Time",
      description: "Rapid support when you need it most",
      icon: "Clock"
    }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-24 bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 bg-[var(--color-brand-orange)]/10 px-4 md:px-6 py-2 md:py-3 rounded-full mb-4 md:mb-6">
            <Icon name="Sparkles" size={20} className="text-[var(--color-brand-orange)]" />
            <span className="text-xs md:text-sm font-medium text-[var(--color-brand-orange)]">What Sets Us Apart</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-foreground)] mb-4 md:mb-6">
            Why Reynrel Infotech Stands Out
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-[var(--color-muted-foreground)] max-w-3xl mx-auto">
            We don't compete on price—we compete on value, expertise, and long-term partnership commitment that drives measurable business results.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-16 md:mb-20 lg:mb-24">
          {differentiators?.map((item, index) => (
            <div key={index} className="bg-[var(--color-card)] rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--color-primary)]/10 flex-shrink-0">
                    <Icon name={item?.icon} size={24} className="text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-[var(--color-foreground)]">{item?.title}</h3>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div className="bg-[var(--color-brand-success)]/5 rounded-lg p-4 border-l-4 border-[var(--color-brand-success)]">
                    <div className="flex items-start gap-2 mb-2">
                      <Icon name="CheckCircle2" size={18} className="text-[var(--color-brand-success)] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs md:text-sm font-medium text-[var(--color-brand-success)] mb-1">Our Approach</p>
                        <p className="text-sm md:text-base text-[var(--color-foreground)]">{item?.ourApproach}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--color-muted)] rounded-lg p-4 border-l-4 border-[var(--color-muted-foreground)]">
                    <div className="flex items-start gap-2 mb-2">
                      <Icon name="XCircle" size={18} className="text-[var(--color-muted-foreground)] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs md:text-sm font-medium text-[var(--color-muted-foreground)] mb-1">Others</p>
                        <p className="text-sm md:text-base text-[var(--color-muted-foreground)]">{item?.others}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs md:text-sm font-medium text-[var(--color-muted-foreground)] mb-3">Key Benefits:</p>
                    <div className="space-y-2">
                      {item?.benefits?.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Icon name="ArrowRight" size={14} className="text-[var(--color-primary)] flex-shrink-0" />
                          <span className="text-xs md:text-sm text-[var(--color-foreground)]">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-primary)] rounded-2xl p-6 md:p-8 lg:p-12 text-white">
          <div className="text-center mb-8 md:mb-12">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4">
              Numbers That Speak for Themselves
            </h3>
            <p className="text-sm md:text-base text-white/90 max-w-2xl mx-auto">
              Our commitment to excellence is reflected in measurable outcomes and long-term client relationships
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {valuePropositions?.map((item, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 mb-4 mx-auto">
                  <Icon name={item?.icon} size={24} className="text-white" />
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">{item?.metric}</div>
                  <div className="text-sm md:text-base font-medium mb-2">{item?.label}</div>
                  <div className="text-xs md:text-sm text-white/80">{item?.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 md:mt-12 text-center">
            <p className="text-base md:text-lg font-medium mb-4">
              Ready to experience the Reynrel difference?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/client-success" className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-[var(--color-primary)] rounded-lg font-medium hover:bg-white/90 transition-all duration-300">
                <span className="text-sm md:text-base">View Client Success Stories</span>
                <Icon name="ArrowRight" size={18} />
              </a>
              <a href="/about" className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300 border border-white/20">
                <span className="text-sm md:text-base">Learn About Our Team</span>
                <Icon name="Users" size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompetitiveDifferentiators;
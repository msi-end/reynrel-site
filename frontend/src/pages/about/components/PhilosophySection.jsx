import React from 'react';
import Icon from '../../../components/AppIcon';

const PhilosophySection = () => {
  const coreValues = [
    {
      icon: "Lightbulb",
      title: "Innovation with Purpose",
      description: "We embrace cutting-edge technologies not for novelty, but to solve real business challenges. Every innovation is grounded in practical value and measurable client success.",
      principles: [
        "Continuous learning and adaptation",
        "Technology evaluation based on business impact",
        "Proactive solution architecture"
      ]
    },
    {
      icon: "Shield",
      title: "Reliability as Foundation",
      description: "Our commitment to reliability means delivering solutions that work flawlessly today and scale seamlessly tomorrow. We build trust through consistent excellence.",
      principles: [
        "Rigorous quality assurance processes",
        "Comprehensive testing and validation",
        "Proactive monitoring and maintenance"
      ]
    },
    {
      icon: "Heart",
      title: "Client Success First",
      description: "We measure our success by client outcomes, not project completion. Long-term partnerships are built on sustained value delivery and unwavering support.",
      principles: [
        "Dedicated success management",
        "Ongoing optimization and enhancement",
        "Transparent communication"
      ]
    },
    {
      icon: "Users",
      title: "Partnership Mindset",
      description: "We're not vendors—we're strategic technology partners invested in your long-term success. Your challenges become our challenges, your wins become our wins.",
      principles: [
        "Collaborative problem-solving",
        "Strategic technology consulting",
        "Flexible engagement models"
      ]
    }
  ];

  const approachSteps = [
    {
      number: "01",
      title: "Deep Discovery",
      description: "We invest time understanding your business, challenges, and goals before proposing solutions.",
      icon: "Search"
    },
    {
      number: "02",
      title: "Strategic Planning",
      description: "Technology roadmaps aligned with business objectives, ensuring every decision drives value.",
      icon: "Map"
    },
    {
      number: "03",
      title: "Agile Execution",
      description: "Iterative development with continuous feedback, ensuring solutions evolve with your needs.",
      icon: "Zap"
    },
    {
      number: "04",
      title: "Ongoing Partnership",
      description: "Post-launch support, optimization, and strategic guidance for sustained success.",
      icon: "Repeat"
    }
  ];

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)]/10 rounded-full mb-4">
            <Icon name="Compass" size={20} color="var(--color-primary)" />
            <span className="text-sm font-medium text-[var(--color-primary)]">Our Philosophy</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-foreground)] mb-4">
            Values That Drive Excellence
          </h2>
          <p className="text-base md:text-lg text-[var(--color-muted-foreground)] max-w-3xl mx-auto">
            Our philosophy of innovation and reliability guides every decision, every project, and every client relationship.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16 md:mb-24 lg:mb-32">
          {coreValues?.map((value) => (
            <div
              key={value?.title}
              className="bg-[var(--color-card)] rounded-xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-[var(--color-border)] group"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Icon name={value?.icon} size={28} color="white" />
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-[var(--color-foreground)] mb-3">
                {value?.title}
              </h3>

              <p className="text-sm md:text-base text-[var(--color-muted-foreground)] mb-6 leading-relaxed">
                {value?.description}
              </p>

              <div className="space-y-3">
                {value?.principles?.map((principle) => (
                  <div key={principle} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[var(--color-brand-electric)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon name="Check" size={14} color="var(--color-brand-electric)" />
                    </div>
                    <span className="text-sm text-[var(--color-foreground)]">{principle}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-[var(--color-muted)] to-[var(--color-background)] rounded-2xl p-8 md:p-12 lg:p-16">
          <div className="text-center mb-12 md:mb-16">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-foreground)] mb-4">
              Our Partnership Approach
            </h3>
            <p className="text-base md:text-lg text-[var(--color-muted-foreground)] max-w-3xl mx-auto">
              A proven methodology that transforms technology challenges into strategic advantages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {approachSteps?.map((step, index) => (
              <div key={step?.number} className="relative">
                <div className="bg-[var(--color-card)] rounded-xl p-6 md:p-8 shadow-lg border border-[var(--color-border)] h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl md:text-5xl font-bold text-[var(--color-primary)]/20">
                      {step?.number}
                    </span>
                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-lg flex items-center justify-center">
                      <Icon name={step?.icon} size={24} color="white" />
                    </div>
                  </div>

                  <h4 className="text-lg md:text-xl font-bold text-[var(--color-foreground)] mb-3">
                    {step?.title}
                  </h4>

                  <p className="text-sm md:text-base text-[var(--color-muted-foreground)] leading-relaxed">
                    {step?.description}
                  </p>
                </div>

                {index < approachSteps?.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PhilosophySection;
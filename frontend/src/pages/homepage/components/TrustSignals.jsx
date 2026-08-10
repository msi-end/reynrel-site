import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignals = () => {
  const supportCommitments = [
    {
      id: 1,
      icon: "Clock",
      title: "15/7 Support",
      description: "Extended-hours technical assistance, 7 days a week",
      metric: "<15 min",
      metricLabel: "Response Time"
    },
    {
      id: 2,
      icon: "Users",
      title: "Dedicated Team",
      description: "Experienced professionals assigned to your project",
      metric: "10+",
      metricLabel: "Years Avg Experience"
    },
    {
      id: 3,
      icon: "TrendingUp",
      title: "Continuous Updates",
      description: "Regular feature enhancements and security patches",
      metric: "Monthly",
      metricLabel: "Release Cycle"
    },
    {
      id: 4,
      icon: "Shield",
      title: "SLA Guarantee",
      description: "99.9% uptime commitment with compensation",
      metric: "99.9%",
      metricLabel: "Uptime SLA"
    }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-24 bg-[var(--color-card)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)]/10 rounded-full mb-4 md:mb-6">
            <Icon name="ShieldCheck" size={16} color="var(--color-primary)" />
            <span className="text-xs md:text-sm font-medium text-[var(--color-primary)]">Trust & Credibility</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-foreground)] mb-4 md:mb-6">
            Support & Commitment You Can Rely On
          </h2>
          <p className="text-base md:text-lg text-[var(--color-muted-foreground)] max-w-3xl mx-auto">
            Backed by an experienced team and an unwavering commitment to your success
          </p>
        </div>

        {/* Support Commitments */}
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-[var(--color-foreground)] mb-6 md:mb-8 text-center">
            Our Support Commitment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {supportCommitments?.map((commitment) => (
              <div
                key={commitment?.id}
                className="bg-[var(--color-background)] rounded-xl p-6 md:p-8 border border-[var(--color-border)] hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon name={commitment?.icon} size={20} color="white" />
                  </div>
                  <div className="text-right">
                    <div className="text-xl md:text-2xl font-bold text-[var(--color-primary)]">
                      {commitment?.metric}
                    </div>
                    <div className="text-xs text-[var(--color-muted-foreground)]">
                      {commitment?.metricLabel}
                    </div>
                  </div>
                </div>
                <h4 className="text-base md:text-lg font-bold text-[var(--color-foreground)] mb-2">
                  {commitment?.title}
                </h4>
                <p className="text-xs md:text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                  {commitment?.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default TrustSignals;
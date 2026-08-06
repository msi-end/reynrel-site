import React from 'react';
import Icon from '../../../components/AppIcon';

const ServiceComparison = () => {
  const comparisonData = [
    {
      feature: 'Project Timeline',
      custom: '6-12 weeks',
      template: '2-4 weeks',
      icon: 'Clock'
    },
    {
      feature: 'Scalability',
      custom: 'Unlimited growth potential',
      template: 'Limited by template constraints',
      icon: 'TrendingUp'
    },
    {
      feature: 'Customization',
      custom: '100% tailored to your needs',
      template: 'Limited to template features',
      icon: 'Settings'
    },
    {
      feature: 'Performance',
      custom: 'Optimized for your use case',
      template: 'Generic optimization',
      icon: 'Zap'
    },
    {
      feature: 'Security',
      custom: 'Enterprise-grade custom security',
      template: 'Standard template security',
      icon: 'Shield'
    },
    {
      feature: 'Support',
      custom: '24/7 dedicated support',
      template: 'Community support',
      icon: 'Headphones'
    },
    {
      feature: 'Integration',
      custom: 'Seamless with existing systems',
      template: 'Limited integration options',
      icon: 'Link'
    },
    {
      feature: 'Ownership',
      custom: 'Full source code ownership',
      template: 'License-based usage',
      icon: 'Key'
    }
  ];

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)]/10 rounded-full mb-4">
            <Icon name="GitCompare" size={20} color="var(--color-accent)" />
            <span className="text-sm font-medium text-[var(--color-accent)]">Service Comparison</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-foreground)] mb-4">
            Custom vs Template Solutions
          </h2>
          <p className="text-base md:text-lg text-[var(--color-muted-foreground)] max-w-3xl mx-auto">
            Understanding the difference between custom development and template-based solutions
          </p>
        </div>

        <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white">
            <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/20">
              <h3 className="text-lg md:text-xl font-bold mb-2">Feature</h3>
            </div>
            <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Sparkles" size={24} />
                <h3 className="text-lg md:text-xl font-bold">Custom Development</h3>
              </div>
              <p className="text-sm text-white/80">Tailored to your business</p>
            </div>
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Package" size={24} />
                <h3 className="text-lg md:text-xl font-bold">Template Solution</h3>
              </div>
              <p className="text-sm text-white/80">Pre-built frameworks</p>
            </div>
          </div>

          <div className="divide-y divide-[var(--color-border)]">
            {comparisonData?.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-3 hover:bg-[var(--color-muted)]/50 transition-colors"
              >
                <div className="p-4 md:p-6 flex items-center gap-3 border-b md:border-b-0 md:border-r border-[var(--color-border)]">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center">
                    <Icon name={item?.icon} size={20} color="var(--color-accent)" />
                  </div>
                  <span className="font-semibold text-[var(--color-foreground)] text-sm md:text-base">
                    {item?.feature}
                  </span>
                </div>
                <div className="p-4 md:p-6 flex items-center border-b md:border-b-0 md:border-r border-[var(--color-border)]">
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle2" size={20} color="var(--color-success)" className="flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-[var(--color-foreground)]">{item?.custom}</span>
                  </div>
                </div>
                <div className="p-4 md:p-6 flex items-center">
                  <div className="flex items-start gap-2">
                    <Icon name="AlertCircle" size={20} color="var(--color-warning)" className="flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-[var(--color-muted-foreground)]">{item?.template}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)] text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Icon name="TrendingUp" size={32} color="white" />
            </div>
            <h4 className="text-lg font-bold text-[var(--color-foreground)] mb-2">Better ROI</h4>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Custom solutions deliver 3x better long-term ROI through optimized performance and scalability
            </p>
          </div>

          <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)] text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Icon name="Users" size={32} color="white" />
            </div>
            <h4 className="text-lg font-bold text-[var(--color-foreground)] mb-2">User Experience</h4>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Tailored UX design increases user satisfaction by 85% compared to generic templates
            </p>
          </div>

          <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)] text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Icon name="Zap" size={32} color="white" />
            </div>
            <h4 className="text-lg font-bold text-[var(--color-foreground)] mb-2">Performance</h4>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Custom-built applications load 60% faster with optimized code and architecture
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceComparison;
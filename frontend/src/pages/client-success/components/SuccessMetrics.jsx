import React from 'react';
import Icon from '../../../components/AppIcon';

const SuccessMetrics = () => {
  const metrics = [
    {
      id: 1,
      icon: 'TrendingUp',
      value: '250%',
      label: 'Average ROI',
      description: 'Clients see an average return on investment of 250% within the first year',
      color: 'var(--color-success)'
    },
    {
      id: 2,
      icon: 'Users',
      value: '98%',
      label: 'Client Retention',
      description: 'Long-term partnerships with 98% of clients continuing beyond initial projects',
      color: 'var(--color-primary)'
    },
    {
      id: 3,
      icon: 'Clock',
      value: '< 15min',
      label: 'Support Response',
      description: 'Average response time for support requests, available 15/7',
      color: 'var(--color-brand-electric)'
    },
    {
      id: 4,
      icon: 'Award',
      value: '99.9%',
      label: 'System Uptime',
      description: 'Industry-leading uptime across all deployed applications',
      color: 'var(--color-warning)'
    },
    {
      id: 5,
      icon: 'Target',
      value: '95%',
      label: 'On-Time Delivery',
      description: 'Projects delivered on schedule with full scope completion',
      color: 'var(--color-accent)'
    },
    {
      id: 6,
      icon: 'ThumbsUp',
      value: '4.9/5',
      label: 'Client Satisfaction',
      description: 'Average satisfaction rating from post-project surveys',
      color: 'var(--color-brand-orange)'
    }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-[#5f2104] to-[var(--color-brand-navy)] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-brand-electric)] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--color-accent)] rounded-full blur-3xl"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4 font-[var(--font-headline)]">
            Success by the Numbers
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-white/90 max-w-2xl mx-auto">
            Quantifiable results that demonstrate our commitment to client success
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {metrics?.map((metric) => (
            <div
              key={metric?.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4 mb-4 md:mb-6">
                <div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: metric?.color }}
                >
                  <Icon name={metric?.icon} size={24} color="white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1">
                    {metric?.value}
                  </div>
                  <div className="text-base md:text-lg font-semibold text-white/90">
                    {metric?.label}
                  </div>
                </div>
              </div>
              <p className="text-sm md:text-base text-white/80 leading-relaxed">
                {metric?.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 md:mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <Icon name="CheckCircle2" size={20} color="var(--color-success)" />
            <span className="text-sm md:text-base text-white font-medium">
              Metrics reflect outcomes across our client engagements
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessMetrics;
import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustDevelopment = () => {
  const successMetrics = [
    {
      category: "Project Success",
      metrics: [
        { label: "On-Time Delivery Rate", value: "96%", icon: "Clock", color: "var(--color-brand-success)" },
        { label: "Budget Adherence", value: "94%", icon: "DollarSign", color: "var(--color-accent)" },
        { label: "Quality Score", value: "4.8/5", icon: "Star", color: "var(--color-brand-orange)" }
      ]
    },
    {
      category: "Client Satisfaction",
      metrics: [
        { label: "Client Retention", value: "98%", icon: "Heart", color: "var(--color-error)" },
        { label: "Referral Rate", value: "85%", icon: "Users", color: "var(--color-primary)" },
        { label: "NPS Score", value: "72", icon: "TrendingUp", color: "var(--color-brand-success)" }
      ]
    },
    {
      category: "Technical Excellence",
      metrics: [
        { label: "Code Quality", value: "A+", icon: "Code", color: "var(--color-accent)" },
        { label: "Test Coverage", value: "92%", icon: "Shield", color: "var(--color-brand-success)" },
        { label: "Performance Score", value: "95/100", icon: "Zap", color: "var(--color-brand-orange)" }
      ]
    }
  ];

  const caseStudyHighlights = [
    {
      client: "EBAH",
      industry: "Business Services",
      challenge: "Needed to streamline day-to-day business operations and improve their digital presence",
      solution: "A custom web and software solution tailored to their business processes and ongoing support needs",
      results: [],
      duration: "Ongoing partnership",
      icon: "Heart",
      color: "var(--color-brand-success)"
    },
    {
      client: "North East 365",
      industry: "Business Services",
      challenge: "Needed a reliable technology partner to support day-to-day business and sales operations",
      solution: "Custom web and software support delivered as an ongoing partnership",
      results: [],
      duration: "Ongoing partnership",
      icon: "TrendingUp",
      color: "var(--color-accent)"
    }
  ];

  const relationshipDuration = [
    { years: "<1 Year", percentage: 25, clients: 8 },
    { years: "1-2 Years", percentage: 35, clients: 11 },
    { years: "3-4 Years", percentage: 25, clients: 8 },
    { years: "5+ Years", percentage: 15, clients: 5 }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-24 bg-[var(--color-card)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 bg-[var(--color-accent)]/10 px-4 md:px-6 py-2 md:py-3 rounded-full mb-4 md:mb-6">
            <Icon name="BarChart3" size={20} className="text-[var(--color-accent)]" />
            <span className="text-xs md:text-sm font-medium text-[var(--color-accent)]">Proven Results</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-foreground)] mb-4 md:mb-6">
            Trust Built on Measurable Outcomes
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-[var(--color-muted-foreground)] max-w-3xl mx-auto">
            Our commitment to excellence is validated through transparent metrics, client success stories, and long-term relationships that speak volumes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20 lg:mb-24">
          {successMetrics?.map((category, index) => (
            <div key={index} className="bg-[var(--color-background)] rounded-xl p-6 md:p-8 shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg md:text-xl font-bold text-[var(--color-foreground)] mb-6">{category?.category}</h3>
              <div className="space-y-6">
                {category?.metrics?.map((metric, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: `${metric?.color}15` }}>
                      <Icon name={metric?.icon} size={20} style={{ color: metric?.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-2xl md:text-3xl font-bold" style={{ color: metric?.color }}>{metric?.value}</div>
                      <div className="text-xs md:text-sm text-[var(--color-muted-foreground)]">{metric?.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-16 md:mb-20 lg:mb-24">
          <div className="text-center mb-8 md:mb-12">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-[var(--color-foreground)] mb-3 md:mb-4">
              Featured Client Success Stories
            </h3>
            <p className="text-sm md:text-base text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
              Real partnerships, real results—see how we've helped businesses transform through technology
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {caseStudyHighlights?.map((study, index) => (
              <div key={index} className="bg-[var(--color-background)] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full flex-shrink-0" style={{ backgroundColor: `${study?.color}15` }}>
                      <Icon name={study?.icon} size={24} style={{ color: study?.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg md:text-xl font-bold text-[var(--color-foreground)]">{study?.client}</h4>
                      <p className="text-xs md:text-sm text-[var(--color-muted-foreground)]">{study?.industry}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-[var(--color-muted-foreground)] mb-2">Challenge:</p>
                      <p className="text-sm md:text-base text-[var(--color-foreground)]">{study?.challenge}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-[var(--color-muted-foreground)] mb-2">Solution:</p>
                      <p className="text-sm md:text-base text-[var(--color-foreground)]">{study?.solution}</p>
                    </div>
                  </div>

                  <div className="bg-[var(--color-card)] rounded-lg p-4 mb-4" style={{ display: study?.results?.length ? 'block' : 'none' }}>
                    <p className="text-xs md:text-sm font-medium text-[var(--color-muted-foreground)] mb-3">Key Results:</p>
                    <div className="grid grid-cols-3 gap-4">
                      {study?.results?.map((result, idx) => (
                        <div key={idx} className="text-center">
                          <div className="text-xl md:text-2xl font-bold mb-1" style={{ color: study?.color }}>{result?.metric}</div>
                          <div className="text-xs text-[var(--color-muted-foreground)]">{result?.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs md:text-sm text-[var(--color-muted-foreground)]">
                      <Icon name="Calendar" size={14} />
                      <span>{study?.duration}</span>
                    </div>
                    <a href="/client-success" className="inline-flex items-center gap-1 text-xs md:text-sm font-medium hover:underline" style={{ color: study?.color }}>
                      <span>Read Full Story</span>
                      <Icon name="ArrowRight" size={14} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-accent)]/5 rounded-2xl p-6 md:p-8 lg:p-12">
          <div className="text-center mb-8 md:mb-12">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-[var(--color-foreground)] mb-3 md:mb-4">
              Client Relationship Duration
            </h3>
            <p className="text-sm md:text-base text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
              Our long-term partnerships demonstrate consistent value delivery and client satisfaction
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {relationshipDuration?.map((duration, index) => (
              <div key={index} className="mb-6 last:mb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm md:text-base font-medium text-[var(--color-foreground)]">{duration?.years}</span>
                  <span className="text-sm md:text-base font-bold text-[var(--color-primary)]">{duration?.percentage}% ({duration?.clients} clients)</span>
                </div>
                <div className="w-full h-3 md:h-4 bg-[var(--color-muted)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-full transition-all duration-1000"
                    style={{ width: `${duration?.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 md:mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-[var(--color-brand-success)]/10 px-4 md:px-6 py-3 md:py-4 rounded-lg">
              <Icon name="TrendingUp" size={20} className="text-[var(--color-brand-success)]" />
              <span className="text-sm md:text-base font-medium text-[var(--color-foreground)]">
                40% of our clients have been with us for <span className="font-bold text-[var(--color-brand-success)]">3+ years</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustDevelopment;
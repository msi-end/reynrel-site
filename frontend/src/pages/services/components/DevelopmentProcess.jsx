import React from 'react';
import Icon from '../../../components/AppIcon';

const DevelopmentProcess = () => {
  const processSteps = [
    {
      phase: 'Discovery & Planning',
      icon: 'Search',
      duration: '1-2 Weeks',
      color: 'from-blue-500 to-cyan-500',
      activities: [
        'Requirements gathering and analysis',
        'Technical feasibility assessment',
        'Project scope definition',
        'Technology stack selection',
        'Timeline and milestone planning'
      ]
    },
    {
      phase: 'Design & Architecture',
      icon: 'Palette',
      duration: '2-3 Weeks',
      color: 'from-purple-500 to-pink-500',
      activities: [
        'UI/UX design and prototyping',
        'System architecture design',
        'Database schema planning',
        'API design and documentation',
        'Security architecture review'
      ]
    },
    {
      phase: 'Development & Testing',
      icon: 'Code2',
      duration: '6-12 Weeks',
      color: 'from-green-500 to-emerald-500',
      activities: [
        'Agile sprint-based development',
        'Continuous integration setup',
        'Unit and integration testing',
        'Code review and quality assurance',
        'Performance optimization'
      ]
    },
    {
      phase: 'Deployment & Support',
      icon: 'Rocket',
      duration: 'Ongoing',
      color: 'from-orange-500 to-red-500',
      activities: [
        'Production environment setup',
        'Deployment and monitoring',
        'User training and documentation',
        '24/7 technical support',
        'Continuous improvement and updates'
      ]
    }
  ];

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)]/10 rounded-full mb-4">
            <Icon name="GitBranch" size={20} color="var(--color-accent)" />
            <span className="text-sm font-medium text-[var(--color-accent)]">Our Methodology</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-foreground)] mb-4">
            Proven Development Process
          </h2>
          <p className="text-base md:text-lg text-[var(--color-muted-foreground)] max-w-3xl mx-auto">
            Our structured approach ensures timely delivery, quality assurance, and transparent communication throughout the project lifecycle
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {processSteps?.map((step, index) => (
            <div
              key={index}
              className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className={`h-2 bg-gradient-to-r ${step?.color}`}></div>
              
              <div className="p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${step?.color} flex items-center justify-center`}>
                    <Icon name={step?.icon} size={28} color="white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-[var(--color-accent)]">
                        Phase {index + 1}
                      </span>
                      <span className="px-3 py-1 bg-[var(--color-muted)] text-[var(--color-foreground)] text-xs rounded-full">
                        {step?.duration}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-[var(--color-foreground)]">
                      {step?.phase}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  {step?.activities?.map((activity, actIndex) => (
                    <div key={actIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mt-0.5">
                        <Icon name="Check" size={14} color="var(--color-accent)" />
                      </div>
                      <span className="text-sm text-[var(--color-foreground)]">{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 md:mt-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-2xl p-8 md:p-12 text-white text-center">
          <Icon name="Shield" size={48} color="white" className="mx-auto mb-6" />
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Quality Assurance Guarantee
          </h3>
          <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto mb-6">
            Every project undergoes rigorous testing, code review, and security audits to ensure enterprise-grade quality and reliability
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <div className="flex items-center gap-2">
              <Icon name="CheckCircle2" size={24} />
              <span className="text-sm md:text-base font-medium">100% Code Coverage</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Lock" size={24} />
              <span className="text-sm md:text-base font-medium">Security Audited</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Award" size={24} />
              <span className="text-sm md:text-base font-medium">ISO Certified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DevelopmentProcess;
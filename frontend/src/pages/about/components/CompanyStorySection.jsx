import React from 'react';
import Icon from '../../../components/AppIcon';

const CompanyStorySection = () => {
  const milestones = [
    {
      year: "2021",
      title: "Founded by Two Self-Taught Programmers",
      description: "Reynrel Infotech was founded in Guwahati by two self-taught programmers with a shared love for coding and a vision to create software solutions that make a difference. Without formal training, we learned from every project, every challenge, and every success.",
      icon: "Rocket"
    },
    {
      year: "Early Growth",
      title: "Building Client Relationships",
      description: "From startups to established enterprises, our clients trusted us to bring their ideas to life with software tailored to their unique needs. We grew into a partner businesses in Guwahati return to for performance, reliability, and personalized service.",
      icon: "Handshake"
    },
    {
      year: "Product Innovation",
      title: "Launching Our Product Suite",
      description: "We expanded from custom client projects into our own product suite—Inventory Manager Software, CRM, Billing & Invoicing, and Small Business Management tools—built to make technology accessible and affordable for SMEs.",
      icon: "Lightbulb"
    },
    {
      year: "Today",
      title: "Defining the Future",
      description: "We continue to empower small and medium enterprises with tailored tech solutions, ongoing support, and a customer-centric approach—driven by our commitment to quality, innovation, and long-term partnership.",
      icon: "Sparkles"
    }
  ];

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)]/10 rounded-full mb-4">
            <Icon name="BookOpen" size={20} color="var(--color-primary)" />
            <span className="text-sm font-medium text-[var(--color-primary)]">Our Journey</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-foreground)] mb-4">
            The Reynrel Story
          </h2>
          <p className="text-base md:text-lg text-[var(--color-muted-foreground)] max-w-3xl mx-auto">
            From humble beginnings to enterprise excellence—our journey reflects our commitment to innovation, reliability, and client success.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-brand-electric)] transform md:-translate-x-1/2"></div>

          <div className="space-y-12 md:space-y-16">
            {milestones?.map((milestone, index) => (
              <div
                key={milestone?.year}
                className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div className="bg-[var(--color-card)] rounded-xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center ${index % 2 === 0 ? 'md:ml-auto' : ''}`}>
                        <Icon name={milestone?.icon} size={24} color="white" />
                      </div>
                      <span className="text-2xl md:text-3xl font-bold text-[var(--color-primary)]">
                        {milestone?.year}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-[var(--color-foreground)] mb-3">
                      {milestone?.title}
                    </h3>
                    <p className="text-sm md:text-base text-[var(--color-muted-foreground)] leading-relaxed">
                      {milestone?.description}
                    </p>
                  </div>
                </div>

                <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-[var(--color-brand-electric)] rounded-full border-4 border-[var(--color-background)] transform md:-translate-x-1/2 shadow-lg"></div>

                <div className="flex-1 hidden md:block"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyStorySection;
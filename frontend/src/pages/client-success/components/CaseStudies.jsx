import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const CaseStudies = () => {
  const caseStudies = [
  {
    id: 1,
    title: 'North East 365 Assam Partnership',
    client: 'North East 365 Assam',
    industry: 'Business Services',
    featured: true,
    image: '/assets/images/clients/north-east-365.png',
    imageAlt: 'North East 365 Assam company logo',
    description: 'A long-standing Reynrel client for whom we have delivered ongoing web and software support, helping the business maintain and grow its digital presence.',
    testimonial: 'Overall, a positive experience. There were a few challenges along the way, but the team was supportive and resolved issues effectively.',
    testimonialAuthor: 'Sri Pankaj Pator, Founder'
  },
  {
    id: 2,
    title: 'EBAH Partnership',
    client: 'EBAH',
    industry: 'Business Services',
    featured: true,
    image: '/assets/images/clients/ebah.png',
    imageAlt: 'EBAH company logo',
    description: 'We worked closely with EBAH to deliver a custom solution tailored to their business needs, from initial requirements through to final delivery.',
    testimonial: 'Good experience overall. The team delivered on time, but communication could have been clearer during development. The final product was solid and met our needs.',
    testimonialAuthor: 'Jishu J. Saikia, Managing Director'
  }];


  return (
    <section className="py-12 md:py-16 lg:py-20 bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-foreground)] mb-3 md:mb-4 font-[var(--font-headline)]">
            Client Partnerships
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
            A closer look at some of the long-term relationships we've built with our clients
          </p>
        </div>

        <div className="space-y-8 md:space-y-12 lg:space-y-16">
          {caseStudies?.map((study, index) =>
          <div
            key={study?.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[var(--color-border)] ring-2 ring-[var(--color-brand-electric)]">

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className={`${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className="relative h-64 md:h-80 lg:h-full min-h-[300px] bg-[var(--color-muted)] flex items-center justify-center p-10">
                    <Image
                    src={study?.image}
                    alt={study?.imageAlt}
                    className="w-full h-full object-contain" />

                  </div>
                </div>

                <div className={`p-6 md:p-8 lg:p-10 ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <span className="inline-block px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs md:text-sm font-medium rounded">
                      {study?.industry}
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-[var(--color-foreground)] mb-3 md:mb-4 font-[var(--font-headline)]">
                    {study?.title}
                  </h3>

                  <p className="text-sm md:text-base text-[var(--color-muted-foreground)] leading-relaxed mb-6 md:mb-8">
                    {study?.description}
                  </p>

                  <div className="bg-[var(--color-muted)] rounded-lg p-4 md:p-6">
                    <Icon name="Quote" size={20} color="var(--color-primary)" className="mb-2 opacity-50" />
                    <p className="text-sm md:text-base text-[var(--color-foreground)] italic mb-2">
                      "{study?.testimonial}"
                    </p>
                    <p className="text-xs md:text-sm text-[var(--color-muted-foreground)] font-medium">
                      — {study?.testimonialAuthor}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

};

export default CaseStudies;

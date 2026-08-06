import React from 'react';
import Image from '../../../components/AppImage';

const ClientLogos = () => {
  const clients = [
  {
    id: 1,
    name: 'EBAH',
    logo: '/assets/images/clients/ebah.png',
    logoAlt: 'EBAH company logo',
    featured: true,
    industry: 'Business Services'
  },
  {
    id: 2,
    name: 'North East 365 Assam',
    logo: '/assets/images/clients/north-east-365.png',
    logoAlt: 'North East 365 Assam company logo',
    featured: true,
    industry: 'Business Services'
  },
  {
    id: 3,
    name: 'Kalong Kapili Vidyapith',
    logo: '/assets/images/clients/kkv.png',
    logoAlt: 'Kalong Kapili Vidyapith logo',
    featured: false,
    industry: 'Education'
  },
  {
    id: 4,
    name: 'Jagya Construction',
    logo: '/assets/images/clients/jagya.png',
    logoAlt: 'Jagya Construction logo',
    featured: false,
    industry: 'Construction'
  },
  {
    id: 5,
    name: 'Styles Interior',
    logo: '/assets/images/clients/styles-interior.jpg',
    logoAlt: 'Styles Interior logo',
    featured: false,
    industry: 'Interior Design'
  },
  {
    id: 6,
    name: 'Breathe Wellness Center',
    logo: '/assets/images/clients/breathe.png',
    logoAlt: 'Breathe Wellness Center logo',
    featured: false,
    industry: 'Wellness'
  },
  {
    id: 7,
    name: 'Cipmedic.com',
    logo: '/assets/images/clients/cipmedic.png',
    logoAlt: 'Cipmedic.com logo',
    featured: false,
    industry: 'Healthcare'
  }];


  const featuredClients = clients?.filter((client) => client?.featured);
  const otherClients = clients?.filter((client) => !client?.featured);

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-foreground)] mb-3 md:mb-4 font-[var(--font-headline)]">
            Trusted by Growing Organizations
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
            We're proud to partner with forward-thinking organizations across various industries
          </p>
        </div>

        <div className="mb-12 md:mb-16 lg:mb-20">
          <h3 className="text-lg md:text-xl font-semibold text-[var(--color-foreground)] text-center mb-6 md:mb-8">
            Featured Partners
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {featuredClients?.map((client) =>
            <div
              key={client?.id}
              className="group bg-white rounded-xl p-8 md:p-10 lg:p-12 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-[var(--color-brand-electric)]">

                <div className="flex flex-col items-center">
                  <div className="w-full h-24 md:h-28 lg:h-32 mb-4 md:mb-6 flex items-center justify-center bg-[var(--color-muted)] rounded-lg overflow-hidden">
                    <Image
                    src={client?.logo}
                    alt={client?.logoAlt}
                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300" />

                  </div>
                  <h4 className="text-xl md:text-2xl font-bold text-[var(--color-foreground)] mb-2">{client?.name}</h4>
                  <span className="inline-block px-3 py-1 bg-[var(--color-brand-electric)]/10 text-[var(--color-brand-electric)] text-xs md:text-sm font-medium rounded-full">
                    {client?.industry}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg md:text-xl font-semibold text-[var(--color-foreground)] text-center mb-6 md:mb-8">
            Our Valued Clients
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {otherClients?.map((client) =>
            <div
              key={client?.id}
              className="group bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-[var(--color-border)]">

                <div className="w-full h-16 md:h-20 mb-3 md:mb-4 flex items-center justify-center bg-[var(--color-muted)] rounded overflow-hidden">
                  <Image
                  src={client?.logo}
                  alt={client?.logoAlt}
                  className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-300" />

                </div>
                <p className="text-xs md:text-sm text-[var(--color-muted-foreground)] text-center">{client?.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>);

};

export default ClientLogos;

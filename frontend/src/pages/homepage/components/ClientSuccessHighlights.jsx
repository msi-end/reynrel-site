import React from 'react';
import { useNavigate } from 'react-router-dom';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ClientSuccessHighlights = () => {
  const navigate = useNavigate();

  const featuredClients = [
  {
    id: 1,
    name: "North East 365 Assam",
    logo: "/assets/images/clients/north-east-365.png",
    logoAlt: "North East 365 Assam company logo",
    industry: "Business Services",
    description: "A long-standing Reynrel client for whom we've delivered ongoing web and software support.",
    testimonial: "Overall, a positive experience. There were a few challenges along the way, but the team was supportive and resolved issues effectively.",
    author: "Sri Pankaj Pator",
    authorRole: "Founder, North East 365 Assam",
    authorImage: "/assets/images/testimonials/pankaj-pator.jpeg",
    authorImageAlt: "Photo of Sri Pankaj Pator, Founder of North East 365 Assam"
  },
  {
    id: 2,
    name: "EBAH",
    logo: "/assets/images/clients/ebah.png",
    logoAlt: "EBAH company logo",
    industry: "Business Services",
    description: "A trusted client partnership built on delivering solutions tailored to their business needs.",
    testimonial: "Good experience overall. The team delivered on time, but communication could have been clearer during development. The final product was solid and met our needs.",
    author: "Jishu J. Saikia",
    authorRole: "Managing Director",
    authorImage: "/assets/images/testimonials/jishu-saikia.jpg",
    authorImageAlt: "Photo of Jishu J. Saikia, Managing Director"
  }];


  const clientLogos = [
  { name: "EBAH", logo: "/assets/images/clients/ebah.png", logoAlt: "EBAH company logo" },
  { name: "Kalong Kapili Vidyapith", logo: "/assets/images/clients/kkv.png", logoAlt: "Kalong Kapili Vidyapith logo" },
  { name: "Jagya Construction", logo: "/assets/images/clients/jagya.png", logoAlt: "Jagya Construction logo" },
  { name: "Styles Interior", logo: "/assets/images/clients/styles-interior.jpg", logoAlt: "Styles Interior logo" },
  { name: "North East 365 Assam", logo: "/assets/images/clients/north-east-365.png", logoAlt: "North East 365 Assam logo" },
  { name: "Breathe Wellness Center", logo: "/assets/images/clients/breathe.png", logoAlt: "Breathe Wellness Center logo" },
  { name: "Cipmedic.com", logo: "/assets/images/clients/cipmedic.png", logoAlt: "Cipmedic.com logo" }];


  return (
    <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-b from-[var(--color-background)] to-[var(--color-muted)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-success)]/10 rounded-full mb-4 md:mb-6">
            <Icon name="Award" size={16} color="var(--color-success)" />
            <span className="text-xs md:text-sm font-medium text-[var(--color-success)]">Client Success Stories</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-foreground)] mb-4 md:mb-6">
            Trusted by Growing Businesses
          </h2>
          <p className="text-base md:text-lg text-[var(--color-muted-foreground)] max-w-3xl mx-auto">
            Building long-term partnerships through proven results and unwavering support
          </p>
        </div>

        {/* Featured Case Studies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16 lg:mb-20">
          {featuredClients?.map((client) =>
          <div
            key={client?.id}
            className="bg-[var(--color-card)] rounded-2xl overflow-hidden border border-[var(--color-border)] hover:shadow-2xl transition-all duration-300 group">

              {/* Client Logo Header */}
              <div className="relative h-32 md:h-40 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] p-6 md:p-8 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <Image
                src={client?.logo}
                alt={client?.logoAlt}
                className="relative z-10 w-full h-full object-contain bg-white rounded-lg p-2" />

              </div>

              <div className="p-6 md:p-8">
                {/* Industry Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-muted)] rounded-full mb-4">
                  <Icon name="Building2" size={14} color="var(--color-primary)" />
                  <span className="text-xs font-medium text-[var(--color-foreground)]">{client?.industry}</span>
                </div>

                {/* Description */}
                <p className="text-sm md:text-base text-[var(--color-muted-foreground)] mb-6 leading-relaxed">
                  {client?.description}
                </p>

                {/* Testimonial */}
                <div className="bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-accent)]/5 rounded-xl p-4 md:p-6 mb-6">
                  <Icon name="Quote" size={24} color="var(--color-primary)" className="mb-3 opacity-50" />
                  <p className="text-sm md:text-base text-[var(--color-foreground)] italic mb-4 leading-relaxed">
                    {client?.testimonial}
                  </p>
                  <div className="flex items-center gap-3">
                    <Image
                    src={client?.authorImage}
                    alt={client?.authorImageAlt}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-[var(--color-primary)]" />

                    <div>
                      <div className="font-semibold text-sm md:text-base text-[var(--color-foreground)]">
                        {client?.author}
                      </div>
                      <div className="text-xs text-[var(--color-muted-foreground)]">
                        {client?.authorRole}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Client Logos Showcase */}
        <div className="bg-[var(--color-card)] rounded-2xl p-8 md:p-12 border border-[var(--color-border)]">
          <h3 className="text-xl md:text-2xl font-bold text-center text-[var(--color-foreground)] mb-8 md:mb-12">
            Trusted by Leading Organizations
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6 md:gap-8 items-center">
            {clientLogos?.map((client, idx) =>
            <div
              key={idx}
              className="flex items-center justify-center p-4 rounded-lg hover:bg-[var(--color-muted)] transition-colors duration-300 group"
              title={client?.name}>

                <Image
                src={client?.logo}
                alt={client?.logoAlt}
                className="w-full h-12 md:h-16 object-contain grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-300" />

              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 md:mt-16">
          <Button
            variant="default"
            size="lg"
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
            iconName="Users"
            iconPosition="right"
            onClick={() => navigate('/client-success')}>

            View All Success Stories
          </Button>
        </div>
      </div>
    </section>);

};

export default ClientSuccessHighlights;

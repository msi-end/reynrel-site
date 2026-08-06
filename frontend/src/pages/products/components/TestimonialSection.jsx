import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TestimonialSection = () => {
  const testimonials = [
  {
    id: 1,
    name: "Jishu J. Saikia",
    role: "Managing Director",
    company: "Reynrel Construction",
    image: "/assets/images/testimonials/jishu-saikia.jpg",
    imageAlt: "Photo of Jishu J. Saikia, Managing Director, provided as a client testimonial",
    quote: "Good experience overall. The team delivered on time, but communication could have been clearer during development. The final product was solid and met our needs."
  },
  {
    id: 2,
    name: "Sri Bidhan Boruah",
    role: "Rector",
    company: "Kalong Kapili Vidyapith",
    image: "/assets/images/testimonials/bidhan-boruah.jpg",
    imageAlt: "Photo of Sri Bidhan Boruah, Rector of Kalong Kapili Vidyapith, provided as a client testimonial",
    quote: "The agency provided valuable insights and a functional solution. Responsive and professional team. They delivered what we asked for, the project took a bit longer than expected, but the end result was worth the wait."
  },
  {
    id: 3,
    name: "Sri Pankaj Pator",
    role: "Founder",
    company: "North East 365 Assam",
    image: "/assets/images/testimonials/pankaj-pator.jpeg",
    imageAlt: "Photo of Sri Pankaj Pator, Founder of North East 365 Assam, provided as a client testimonial",
    quote: "Overall, a positive experience. There were a few challenges along the way, but the team was supportive and resolved issues effectively."
  }];


  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-[var(--color-muted)] to-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-success)]/10 rounded-full mb-4">
            <Icon name="Star" size={20} className="text-[var(--color-brand-success)]" />
            <span className="text-sm font-medium text-[var(--color-brand-success)]">Client Success Stories</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-foreground)] mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-base md:text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
            See how our products have transformed businesses across healthcare, sales, and financial services
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials?.map((testimonial) =>
          <div
            key={testimonial?.id}
            className="bg-[var(--color-card)] rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[var(--color-border)] flex flex-col">

              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <div className="flex items-start gap-4 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--color-primary)]">
                      <Image
                      src={testimonial?.image}
                      alt={testimonial?.imageAlt}
                      className="w-full h-full object-cover" />

                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--color-brand-success)] rounded-full flex items-center justify-center border-2 border-[var(--color-card)]">
                      <Icon name="Check" size={14} color="white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--color-foreground)] mb-1">
                      {testimonial?.name}
                    </h3>
                    <p className="text-sm text-[var(--color-muted-foreground)] mb-1">
                      {testimonial?.role}
                    </p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      {testimonial?.company}
                    </p>
                  </div>
                </div>

                <blockquote className="text-sm md:text-base text-[var(--color-foreground)]/80 leading-relaxed flex-1">
                  "{testimonial?.quote}"
                </blockquote>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-[var(--color-card)] rounded-xl shadow-lg border border-[var(--color-border)]">
            <div className="flex -space-x-2">
              {testimonials?.map((testimonial) =>
              <div key={testimonial?.id} className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--color-card)]">
                  <Image
                  src={testimonial?.image}
                  alt={testimonial?.imageAlt}
                  className="w-full h-full object-cover" />

                </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <p className="font-semibold text-[var(--color-foreground)] mb-1">
                Join 500+ satisfied clients
              </p>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                See why businesses trust Reynrel Infotech
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>);

};

export default TestimonialSection;
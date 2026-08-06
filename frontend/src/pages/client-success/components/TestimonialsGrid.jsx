import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TestimonialsGrid = () => {
  const testimonials = [
  {
    id: 1,
    name: 'Jishu J. Saikia',
    position: 'Managing Director',
    company: 'Reynrel Construction',
    avatar: '/assets/images/testimonials/jishu-saikia.jpg',
    avatarAlt: 'Photo of Jishu J. Saikia, Managing Director, provided as a client testimonial',
    testimonial: 'Good experience overall. The team delivered on time, but communication could have been clearer during development. The final product was solid and met our needs.',
    industry: 'Construction'
  },
  {
    id: 2,
    name: 'Sri Bidhan Boruah',
    position: 'Rector',
    company: 'Kalong Kapili Vidyapith',
    avatar: '/assets/images/testimonials/bidhan-boruah.jpg',
    avatarAlt: 'Photo of Sri Bidhan Boruah, Rector of Kalong Kapili Vidyapith, provided as a client testimonial',
    testimonial: 'The agency provided valuable insights and a functional solution. Responsive and professional team. They delivered what we asked for, the project took a bit longer than expected, but the end result was worth the wait.',
    industry: 'Education'
  },
  {
    id: 3,
    name: 'Sri Pankaj Pator',
    position: 'Founder',
    company: 'North East 365 Assam',
    avatar: '/assets/images/testimonials/pankaj-pator.jpeg',
    avatarAlt: 'Photo of Sri Pankaj Pator, Founder of North East 365 Assam, provided as a client testimonial',
    testimonial: 'Overall, a positive experience. There were a few challenges along the way, but the team was supportive and resolved issues effectively.',
    industry: 'Business Services'
  }];


  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-foreground)] mb-3 md:mb-4 font-[var(--font-headline)]">
            What Our Clients Say
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
            Real feedback from real clients who have experienced the Reynrel difference
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials?.map((testimonial) =>
          <div
            key={testimonial?.id}
            className="bg-[var(--color-background)] rounded-xl p-6 md:p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-[var(--color-border)] flex flex-col">

              <div className="flex items-start gap-4 mb-4 md:mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-[var(--color-brand-electric)]">
                  <Image
                  src={testimonial?.avatar}
                  alt={testimonial?.avatarAlt}
                  className="w-full h-full object-cover" />

                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base md:text-lg font-bold text-[var(--color-foreground)] mb-1 truncate">
                    {testimonial?.name}
                  </h4>
                  <p className="text-xs md:text-sm text-[var(--color-muted-foreground)] mb-1 truncate">
                    {testimonial?.position}
                  </p>
                  <p className="text-xs md:text-sm font-medium text-[var(--color-primary)] truncate">
                    {testimonial?.company}
                  </p>
                </div>
              </div>

              <Icon name="Quote" size={24} color="var(--color-primary)" className="mb-3 opacity-40" />

              <p className="text-sm md:text-base text-[var(--color-foreground)] mb-4 md:mb-6 leading-relaxed flex-1">
                "{testimonial?.testimonial}"
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                <span className="inline-block px-2 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-medium rounded">
                  {testimonial?.industry}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

};

export default TestimonialsGrid;

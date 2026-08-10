import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AUTOPLAY_INTERVAL = 6000;

// To feature a client here, add an entry with a real "testimonial" + "author".
// Leave "testimonial" blank for a logo-only highlight until a quote is available.
// Set "videoUrl" to a YouTube embed link (https://www.youtube.com/embed/VIDEO_ID)
// to show a video instead of the photo/quote block.
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
    authorImageAlt: "Photo of Sri Pankaj Pator, Founder of North East 365 Assam",
    videoUrl: ""
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
    authorImageAlt: "Photo of Jishu J. Saikia, Managing Director",
    videoUrl: ""
  },
  {
    id: 3,
    name: "Kalong Kapili Vidyapith",
    logo: "/assets/images/clients/kkv.png",
    logoAlt: "Kalong Kapili Vidyapith logo",
    industry: "Education",
    description: "Supporting the institution's digital presence with a reliable, easy-to-manage website.",
    testimonial: "The agency provided valuable insights and a functional solution. Responsive and professional team. They delivered what we asked for, the project took a bit longer than expected, but the end result was worth the wait.",
    author: "Sri Bidhan Boruah",
    authorRole: "Rector, Kalong Kapili Vidyapith",
    authorImage: "/assets/images/testimonials/bidhan-boruah.jpg",
    authorImageAlt: "Photo of Sri Bidhan Boruah, Rector of Kalong Kapili Vidyapith",
    videoUrl: ""
  },
  {
    id: 4,
    name: "Jagya Construction",
    logo: "/assets/images/clients/jagya.png",
    logoAlt: "Jagya Construction logo",
    industry: "Construction",
    description: "Partnering with Jagya Construction on their web presence and ongoing technical support.",
    testimonial: "",
    author: "",
    authorRole: "",
    authorImage: "",
    authorImageAlt: "",
    videoUrl: ""
  },
  {
    id: 5,
    name: "Styles Interior",
    logo: "/assets/images/clients/styles-interior.jpg",
    logoAlt: "Styles Interior logo",
    industry: "Interior Design",
    description: "Helping Styles Interior showcase their portfolio and reach new clients online.",
    testimonial: "",
    author: "",
    authorRole: "",
    authorImage: "",
    authorImageAlt: "",
    videoUrl: ""
  },
  {
    id: 6,
    name: "Breathe Wellness Center",
    logo: "/assets/images/clients/breathe.png",
    logoAlt: "Breathe Wellness Center logo",
    industry: "Health & Wellness",
    description: "Building a digital presence to help Breathe Wellness Center connect with more clients.",
    testimonial: "",
    author: "",
    authorRole: "",
    authorImage: "",
    authorImageAlt: "",
    videoUrl: ""
  },
  {
    id: 7,
    name: "Cipmedic.com",
    logo: "/assets/images/clients/cipmedic.png",
    logoAlt: "Cipmedic.com logo",
    industry: "Healthcare",
    description: "Delivering a dependable web platform to support Cipmedic.com's healthcare services.",
    testimonial: "",
    author: "",
    authorRole: "",
    authorImage: "",
    authorImageAlt: "",
    videoUrl: ""
  }
];

const clientLogos = [
  { name: "EBAH", logo: "/assets/images/clients/ebah.png", logoAlt: "EBAH company logo" },
  { name: "Kalong Kapili Vidyapith", logo: "/assets/images/clients/kkv.png", logoAlt: "Kalong Kapili Vidyapith logo" },
  { name: "Jagya Construction", logo: "/assets/images/clients/jagya.png", logoAlt: "Jagya Construction logo" },
  { name: "Styles Interior", logo: "/assets/images/clients/styles-interior.jpg", logoAlt: "Styles Interior logo" },
  { name: "North East 365 Assam", logo: "/assets/images/clients/north-east-365.png", logoAlt: "North East 365 Assam logo" },
  { name: "Breathe Wellness Center", logo: "/assets/images/clients/breathe.png", logoAlt: "Breathe Wellness Center logo" },
  { name: "Cipmedic.com", logo: "/assets/images/clients/cipmedic.png", logoAlt: "Cipmedic.com logo" }
];

const MAX_CARDS_PER_VIEW = 3;
const TRANSITION_MS = 700;

const getCardsPerView = () => {
  if (typeof window === 'undefined') return MAX_CARDS_PER_VIEW;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 640) return 2;
  return 1;
};

const ClientSuccessHighlights = () => {
  const navigate = useNavigate();
  const total = featuredClients?.length;
  // Clone a few cards on each end so the track can keep sliding one card at a
  // time in the same direction and loop seamlessly instead of snapping back.
  const cloneCount = Math.min(MAX_CARDS_PER_VIEW, total);
  const extendedClients = [
    ...featuredClients?.slice(-cloneCount),
    ...featuredClients,
    ...featuredClients?.slice(0, cloneCount)
  ];

  const [cardsPerView, setCardsPerView] = useState(getCardsPerView);
  const [activeIndex, setActiveIndex] = useState(cloneCount);
  const [instant, setInstant] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setCardsPerView(getCardsPerView());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const goNext = useCallback(() => setActiveIndex((prev) => prev + 1), []);
  const goPrev = useCallback(() => setActiveIndex((prev) => prev - 1), []);
  const goTo = useCallback((logicalIndex) => setActiveIndex(logicalIndex + cloneCount), [cloneCount]);

  useEffect(() => {
    if (isPaused) return undefined;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => prev + 1);
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [isPaused]);

  // Once the track finishes sliding past the last real card (or before the
  // first), jump back into the real range instantly so it can keep going.
  useEffect(() => {
    if (activeIndex >= cloneCount + total) {
      const timeout = setTimeout(() => {
        setInstant(true);
        setActiveIndex(activeIndex - total);
      }, TRANSITION_MS);
      return () => clearTimeout(timeout);
    }
    if (activeIndex < cloneCount) {
      const timeout = setTimeout(() => {
        setInstant(true);
        setActiveIndex(activeIndex + total);
      }, TRANSITION_MS);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [activeIndex, total, cloneCount]);

  useEffect(() => {
    if (!instant) return undefined;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setInstant(false));
    });
    return () => cancelAnimationFrame(raf);
  }, [instant]);

  const activeDot = ((activeIndex - cloneCount) % total + total) % total;

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

        {/* Auto-sliding Success Story Carousel */}
        <div
          className="relative mb-12 md:mb-16 lg:mb-20"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="overflow-hidden rounded-2xl">
            <div
              className={`flex ${instant ? '' : 'transition-transform duration-700 ease-in-out'}`}
              style={{ transform: `translateX(-${activeIndex * (100 / cardsPerView)}%)` }}
            >
              {extendedClients?.map((client, idx) => (
                <div
                  key={`${client?.id}-${idx}`}
                  className="flex-shrink-0 px-2"
                  style={{ width: `${100 / cardsPerView}%` }}
                >
                  <div className="bg-[var(--color-card)] rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-lg flex flex-col h-full">
                    {/* Logo / Video */}
                    <div className="relative h-36 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] p-4 flex items-center justify-center overflow-hidden">
                      {client?.videoUrl ? (
                        <div className="relative z-10 w-full h-full aspect-video">
                          <iframe
                            className="w-full h-full rounded-lg"
                            src={client?.videoUrl}
                            title={`${client?.name} client story video`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-black/20"></div>
                          <Image
                            src={client?.logo}
                            alt={client?.logoAlt}
                            className="relative z-10 w-full h-full object-contain bg-white rounded-lg p-2"
                          />
                        </>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 md:p-6 flex flex-col flex-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-muted)] rounded-full mb-3 w-fit">
                        <Icon name="Building2" size={14} color="var(--color-primary)" />
                        <span className="text-xs font-medium text-[var(--color-foreground)]">{client?.industry}</span>
                      </div>

                      <h3 className="text-base md:text-lg font-bold text-[var(--color-foreground)] mb-2">
                        {client?.name}
                      </h3>

                      <p className="text-sm text-[var(--color-muted-foreground)] mb-4 leading-relaxed">
                        {client?.description}
                      </p>

                      {client?.testimonial ? (
                        <div className="bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-accent)]/5 rounded-xl p-4 mt-auto">
                          <Icon name="Quote" size={20} color="var(--color-primary)" className="mb-2 opacity-50" />
                          <p className="text-sm text-[var(--color-foreground)] italic mb-4 leading-relaxed">
                            {client?.testimonial}
                          </p>
                          <div className="flex items-center gap-3">
                            <Image
                              src={client?.authorImage}
                              alt={client?.authorImageAlt}
                              className="w-10 h-10 rounded-full object-cover border-2 border-[var(--color-primary)]"
                            />
                            <div>
                              <div className="font-semibold text-sm text-[var(--color-foreground)]">
                                {client?.author}
                              </div>
                              <div className="text-xs text-[var(--color-muted-foreground)]">
                                {client?.authorRole}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[var(--color-muted)]/50 rounded-xl p-4 border border-dashed border-[var(--color-border)] mt-auto">
                          <p className="text-sm text-[var(--color-muted-foreground)] italic">
                            Client testimonial coming soon.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prev / Next controls */}
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous success story"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 w-10 h-10 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] shadow-md flex items-center justify-center hover:bg-[var(--color-muted)] transition-colors"
          >
            <Icon name="ChevronLeft" size={20} color="var(--color-foreground)" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next success story"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 w-10 h-10 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] shadow-md flex items-center justify-center hover:bg-[var(--color-muted)] transition-colors"
          >
            <Icon name="ChevronRight" size={20} color="var(--color-foreground)" />
          </button>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {featuredClients?.map((client, idx) => (
              <button
                key={client?.id}
                type="button"
                onClick={() => goTo(idx)}
                aria-label={`Go to ${client?.name} story`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === activeDot ? 'w-6 bg-[var(--color-primary)]' : 'w-2.5 bg-[var(--color-border)]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Client Logos Showcase */}
        <div className="bg-[var(--color-card)] rounded-2xl p-8 md:p-12 border border-[var(--color-border)]">
          <h3 className="text-xl md:text-2xl font-bold text-center text-[var(--color-foreground)] mb-8 md:mb-12">
            Trusted by Leading Organizations
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6 md:gap-8 items-center">
            {clientLogos?.map((client, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center p-4 rounded-lg hover:bg-[var(--color-muted)] transition-colors duration-300 group"
                title={client?.name}
              >
                <Image
                  src={client?.logo}
                  alt={client?.logoAlt}
                  className="w-full h-12 md:h-16 object-contain grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-300"
                />
              </div>
            ))}
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
            onClick={() => navigate('/client-success')}
          >
            View All Success Stories
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ClientSuccessHighlights;

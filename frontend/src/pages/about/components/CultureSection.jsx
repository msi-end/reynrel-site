import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const CultureSection = () => {
  const culturePillars = [
  {
    icon: "Rocket",
    title: "Innovation Culture",
    description: "We foster an environment where creativity thrives and new ideas are celebrated. Regular hackathons, innovation labs, and technology exploration sessions keep our team at the cutting edge.",
    stats: { value: "24+", label: "Innovation Projects/Year" }
  },
  {
    icon: "Users",
    title: "Collaborative Excellence",
    description: "Cross-functional teams work together seamlessly, breaking down silos to deliver integrated solutions. Our collaborative approach ensures diverse perspectives enhance every project.",
    stats: { value: "95%", label: "Team Satisfaction" }
  },
  {
    icon: "BookOpen",
    title: "Continuous Learning",
    description: "Professional development is not optional—it's essential. We invest in certifications, training programs, and conference attendance to ensure our team stays ahead of industry trends.",
    stats: { value: "120+", label: "Training Hours/Year" }
  },
  {
    icon: "Award",
    title: "Excellence Standards",
    description: "Quality is non-negotiable. Code reviews, peer programming, and rigorous testing ensure every deliverable meets our high standards and exceeds client expectations.",
    stats: { value: "99.8%", label: "Quality Score" }
  }];


  const workEnvironment = [
  {
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1222a6f46-1766584346902.png",
    imageAlt: "Modern open office workspace with diverse team of developers collaborating around large monitors displaying code and design mockups in bright natural lighting",
    title: "Collaborative Workspaces",
    description: "Open, modern environments designed for teamwork and innovation"
  },
  {
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f2533c63-1767598755733.png",
    imageAlt: "Professional team meeting in glass-walled conference room with developers presenting technical architecture diagrams on large display screen",
    title: "Innovation Labs",
    description: "Dedicated spaces for experimentation and technology exploration"
  },
  {
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_19ed7b82d-1764843649706.png",
    imageAlt: "Casual team gathering in modern break room with developers discussing ideas over coffee with laptops and whiteboards visible in background",
    title: "Team Collaboration",
    description: "Regular knowledge sharing and cross-functional team interactions"
  },
  {
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1959e051d-1764648553754.png",
    imageAlt: "Professional training session with instructor presenting to engaged developers in modern classroom setting with multiple screens showing technical content",
    title: "Learning Programs",
    description: "Continuous professional development and skill enhancement"
  }];


  const benefits = [
  { icon: "GraduationCap", text: "Professional Certifications Sponsored" },
  { icon: "Calendar", text: "Flexible Work Arrangements" },
  { icon: "Heart", text: "Comprehensive Health Benefits" },
  { icon: "Briefcase", text: "Career Growth Pathways" },
  { icon: "Coffee", text: "Work-Life Balance Focus" },
  { icon: "Trophy", text: "Performance Recognition Programs" }];


  return (
    <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-[var(--color-background)] to-[var(--color-muted)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)]/10 rounded-full mb-4">
            <Icon name="Heart" size={20} color="var(--color-primary)" />
            <span className="text-sm font-medium text-[var(--color-primary)]">Our Culture</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-foreground)] mb-4">
            Where Innovation Meets Excellence
          </h2>
          <p className="text-base md:text-lg text-[var(--color-muted-foreground)] max-w-3xl mx-auto">
            A culture that empowers our team to deliver exceptional results while growing professionally and personally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16 md:mb-24">
          {culturePillars?.map((pillar) =>
          <div
            key={pillar?.title}
            className="bg-[var(--color-card)] rounded-xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-[var(--color-border)]">

              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-xl flex items-center justify-center">
                  <Icon name={pillar?.icon} size={28} color="white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl md:text-3xl font-bold text-[var(--color-primary)]">
                    {pillar?.stats?.value}
                  </div>
                  <div className="text-xs md:text-sm text-[var(--color-muted-foreground)]">
                    {pillar?.stats?.label}
                  </div>
                </div>
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-[var(--color-foreground)] mb-3">
                {pillar?.title}
              </h3>

              <p className="text-sm md:text-base text-[var(--color-muted-foreground)] leading-relaxed">
                {pillar?.description}
              </p>
            </div>
          )}
        </div>

        <div className="mb-16 md:mb-24">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-foreground)] text-center mb-8 md:mb-12">
            Our Work Environment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {workEnvironment?.map((env) =>
            <div
              key={env.title}
              className="group cursor-pointer">

                <div className="relative h-48 md:h-56 rounded-xl overflow-hidden mb-4 shadow-lg">
                  <Image
                  src={env.image}
                  alt={env.imageAlt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />

                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-navy)] via-transparent to-transparent opacity-60"></div>
                </div>
                <h4 className="text-lg md:text-xl font-bold text-[var(--color-foreground)] mb-2">
                  {env.title}
                </h4>
                <p className="text-sm md:text-base text-[var(--color-muted-foreground)]">
                  {env.description}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#5f2104] to-[var(--color-brand-navy)] rounded-2xl p-8 md:p-12 lg:p-16">
          <div className="text-center mb-8 md:mb-12">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              Team Benefits & Perks
            </h3>
            <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto">
              We invest in our team's growth, well-being, and success because exceptional people deliver exceptional results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {benefits?.map((benefit) =>
            <div
              key={benefit?.text}
              className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6 hover:bg-white/20 transition-colors duration-300">

                <div className="w-12 h-12 bg-[var(--color-brand-electric)]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name={benefit?.icon} size={24} color="var(--color-brand-electric)" />
                </div>
                <span className="text-sm md:text-base text-white font-medium">{benefit?.text}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>);

};

export default CultureSection;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";

const ServicesPreview = () => {
  const navigate = useNavigate();
  const [activeService, setActiveService] = useState(0);

  const services = [
    {
      id: 1,
      icon: "Code2",
      title: "Custom App Development",
      description:
        "Tailored software solutions designed to meet your unique business requirements with scalable architecture and modern technology stacks.",
      features: [
        "Native & Cross-Platform Mobile Apps",
        "Enterprise Web Applications",
        "Cloud-Native Architecture",
        "API Development & Integration",
      ],
      color: "var(--color-brand-electric)",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
    },
    {
      id: 2,
      icon: "Globe",
      title: "Web Development",
      description:
        "High-performance web applications with responsive design, optimal user experience, and seamless functionality across all devices.",
      features: [
        "Progressive Web Applications",
        "E-Commerce Solutions",
        "Content Management Systems",
        "Real-Time Web Applications",
      ],
      color: "var(--color-accent)",
      bgGradient: "from-indigo-500/10 to-purple-500/10",
    },
    {
      id: 3,
      icon: "Lightbulb",
      title: "Tech Consultation",
      description:
        "Strategic technology guidance to help you make informed decisions about your digital transformation journey and technology investments.",
      features: [
        "Technology Stack Selection",
        "Architecture Design & Review",
        "Digital Transformation Strategy",
        "Technical Due Diligence",
      ],
      color: "var(--color-brand-orange)",
      bgGradient: "from-orange-500/10 to-red-500/10",
    },
  ];

  return (
    <>
      {/* <svg viewBox="0 24 150 28" preserveAspectRatio="none" className="waves ">
        <defs>
          <path
            id="gentle-wave"
            d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
          />
        </defs>
        <g className="parallax">
          <use href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7" />
          <use href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
          <use href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
          <use href="#gentle-wave" x="48" y="7" fill="#fff" />
        </g>
      </svg> */}
      <section className="py-12 md:py-16 lg:py-24 bg-[var(--color-background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)]/10 rounded-full mb-4 md:mb-6">
              <Icon name="Zap" size={16} color="var(--color-primary)" />
              <span className="text-xs md:text-sm font-medium text-[var(--color-primary)]">
                Our Services
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-foreground)] mb-4 md:mb-6">
              Comprehensive Technology Solutions
            </h2>
            <p className="text-base md:text-lg text-[var(--color-muted-foreground)] max-w-3xl mx-auto">
              From concept to deployment, we provide end-to-end software
              development services backed by 5+ years of industry expertise
            </p>
          </div>

          {/* Interactive Service Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
            {services?.map((service, index) => (
              <div
                key={service?.id}
                className={`group relative bg-[var(--color-card)] rounded-2xl p-6 md:p-8 border-2 transition-all duration-300 cursor-pointer ${
                  activeService === index
                    ? "border-[var(--color-primary)] shadow-xl scale-105"
                    : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:shadow-lg"
                }`}
                onMouseEnter={() => setActiveService(index)}
                onClick={() => setActiveService(index)}
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${service?.bgGradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                ></div>

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon name={service?.icon} size={28} color="white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl md:text-2xl font-bold text-[var(--color-foreground)] mb-3 md:mb-4">
                    {service?.title}
                  </h3>
                  <p className="text-sm md:text-base text-[var(--color-muted-foreground)] mb-4 md:mb-6 leading-relaxed">
                    {service?.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                    {service?.features?.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 md:gap-3">
                        <Icon
                          name="CheckCircle2"
                          size={16}
                          color={service?.color}
                          className="mt-1 flex-shrink-0"
                        />
                        <span className="text-xs md:text-sm text-[var(--color-foreground)]">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors duration-300"
                    iconName="ArrowRight"
                    iconPosition="right"
                    onClick={() => navigate("/services")}
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <Button
              variant="default"
              size="lg"
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
              iconName="ExternalLink"
              iconPosition="right"
              onClick={() => navigate("/services")}
            >
              Explore All Services
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default ServicesPreview;

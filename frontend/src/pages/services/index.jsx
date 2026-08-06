import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Seo from '../../components/Seo';
import Header from '../../components/ui/Header';
import ServiceHero from './components/ServiceHero';
import ServiceCard from './components/ServiceCard';
import TechnologyStack from './components/TechnologyStack';
import DevelopmentProcess from './components/DevelopmentProcess';
import ServiceComparison from './components/ServiceComparison';
import CTASection from './components/CTASection';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Footer from '../homepage/components/Footer';
import { publicApi } from '../../lib/apiClient';

const Services = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .get('/services')
      .then((res) => setServices(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleLearnMore = (service) => {
    setSelectedService(service);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseDetail = () => {
    setSelectedService(null);
  };

  return (
    <>
      <Seo
        title="Services - Custom Software Development"
        description="Comprehensive software development services including custom app development, web development, tech consultation, API integration, cloud solutions, and DevOps automation."
        path="/services"
      />
      <div className="min-h-screen bg-[var(--color-background)]">
        <Header />

        <main className="pt-16 lg:pt-20">
          {selectedService ? (
            <section className="py-16 md:py-20 lg:py-24">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Button
                  variant="ghost"
                  iconName="ArrowLeft"
                  iconPosition="left"
                  onClick={handleCloseDetail}
                  className="mb-8"
                >
                  Back to Services
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                  <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)]/10 rounded-full mb-4">
                      <Icon name={selectedService?.icon} size={20} color="var(--color-accent)" />
                      <span className="text-sm font-medium text-[var(--color-accent)]">{selectedService?.category}</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-foreground)] mb-6">
                      {selectedService?.title}
                    </h1>

                    <p className="text-base md:text-lg text-[var(--color-muted-foreground)] mb-8 leading-relaxed">
                      {selectedService?.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-[var(--color-card)] rounded-lg p-4 border border-[var(--color-border)]">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="Clock" size={20} color="var(--color-accent)" />
                          <span className="text-sm font-medium text-[var(--color-muted-foreground)]">Timeline</span>
                        </div>
                        <div className="text-lg font-bold text-[var(--color-foreground)]">{selectedService?.timeline}</div>
                      </div>
                      <div className="bg-[var(--color-card)] rounded-lg p-4 border border-[var(--color-border)]">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="DollarSign" size={20} color="var(--color-accent)" />
                          <span className="text-sm font-medium text-[var(--color-muted-foreground)]">Starting at</span>
                        </div>
                        <div className="text-lg font-bold text-[var(--color-foreground)]">{selectedService?.startingPrice}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {selectedService?.technologies?.map((tech, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-[var(--color-muted)] text-[var(--color-foreground)] text-sm rounded-full font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        variant="default"
                        size="lg"
                        iconName="Calendar"
                        iconPosition="left"
                        onClick={() => navigate('/about')}
                      >
                        Schedule Consultation
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        iconName="MessageCircle"
                        iconPosition="left"
                        onClick={() => navigate('/about')}
                      >
                        Ask Questions
                      </Button>
                    </div>
                  </div>

                  <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-6 md:p-8">
                    <h3 className="text-xl md:text-2xl font-bold text-[var(--color-foreground)] mb-6">
                      Key Features & Capabilities
                    </h3>
                    <div className="space-y-4">
                      {selectedService?.keyFeatures?.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mt-0.5">
                            <Icon name="Check" size={16} color="var(--color-accent)" />
                          </div>
                          <span className="text-sm md:text-base text-[var(--color-foreground)]">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <>
              <ServiceHero />

              <section className="py-16 md:py-20 lg:py-24 bg-[var(--color-background)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12 md:mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)]/10 rounded-full mb-4">
                      <Icon name="Briefcase" size={20} color="var(--color-accent)" />
                      <span className="text-sm font-medium text-[var(--color-accent)]">Our Services</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-foreground)] mb-4">
                      Comprehensive Software Solutions
                    </h2>
                    <p className="text-base md:text-lg text-[var(--color-muted-foreground)] max-w-3xl mx-auto">
                      From concept to deployment, we provide end-to-end software development services tailored to your business needs
                    </p>
                  </div>

                  {loading ? (
                    <p className="text-center text-[var(--color-muted-foreground)]">Loading services...</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                      {services?.map((service) => (
                        <ServiceCard
                          key={service?.id}
                          service={service}
                          onLearnMore={handleLearnMore}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <TechnologyStack />
              <DevelopmentProcess />
              <ServiceComparison />
              <CTASection />
            </>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Services;
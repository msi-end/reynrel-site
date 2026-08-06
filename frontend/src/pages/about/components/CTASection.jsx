import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-[#5f2104] via-[var(--color-brand-navy)] to-[#5f2104] rounded-2xl overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-brand-electric)] rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--color-accent)] rounded-full blur-3xl"></div>
          </div>

          <div className="relative px-6 py-12 md:px-12 md:py-16 lg:px-16 lg:py-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <Icon name="Sparkles" size={20} color="var(--color-brand-electric)" />
                <span className="text-sm font-medium text-white">Join Our Journey</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Ready to Define the Future Together?
              </h2>

              <p className="text-base md:text-lg lg:text-xl text-white/90 mb-8 md:mb-12 leading-relaxed max-w-3xl mx-auto">
                Whether you're looking for a strategic technology partner or want to join our team of innovators, we're here to make it happen.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  variant="default"
                  size="lg"
                  className="bg-white text-[var(--color-primary)] hover:bg-white/90 w-full sm:w-auto"
                  iconName="MessageSquare"
                  iconPosition="left"
                  onClick={() => navigate('/client-success')}
                >
                  View Client Success Stories
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10 w-full sm:w-auto"
                  iconName="ArrowRight"
                  iconPosition="right"
                  onClick={() => navigate('/services')}
                >
                  Explore Our Services
                </Button>
              </div>

              <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Icon name="Users" size={32} color="var(--color-brand-electric)" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">50+</div>
                  <div className="text-sm md:text-base text-white/80">Expert Team Members</div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Icon name="Award" size={32} color="var(--color-brand-electric)" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">5+</div>
                  <div className="text-sm md:text-base text-white/80">Years of Excellence</div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Icon name="Target" size={32} color="var(--color-brand-electric)" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">200+</div>
                  <div className="text-sm md:text-base text-white/80">Successful Projects</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
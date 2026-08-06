import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ServiceCard = ({ service, onLearnMore }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="group bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[var(--color-accent)]">
      <div className="relative h-48 md:h-56 lg:h-64 overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
            <Icon name={service?.icon} size={48} color="white" />
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs md:text-sm font-medium text-white">
            {service?.category}
          </span>
        </div>
      </div>
      <div className="p-6 md:p-8">
        <h3 className="text-xl md:text-2xl font-bold text-[var(--color-foreground)] mb-3 group-hover:text-[var(--color-accent)] transition-colors">
          {service?.title}
        </h3>
        
        <p className="text-sm md:text-base text-[var(--color-muted-foreground)] mb-6 leading-relaxed line-clamp-3">
          {service?.description}
        </p>
        
        <div className="space-y-3 mb-6">
          {service?.keyFeatures?.slice(0, isExpanded ? service?.keyFeatures?.length : 3)?.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mt-0.5">
                <Icon name="Check" size={14} color="var(--color-accent)" />
              </div>
              <span className="text-sm text-[var(--color-foreground)]">{feature}</span>
            </div>
          ))}
        </div>
        
        {service?.keyFeatures?.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-[var(--color-accent)] hover:text-[var(--color-primary)] font-medium mb-4 flex items-center gap-2 transition-colors"
          >
            {isExpanded ? 'Show Less' : `Show ${service?.keyFeatures?.length - 3} More Features`}
            <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
          </button>
        )}
        
        <div className="flex flex-wrap gap-2 mb-6">
          {service?.technologies?.map((tech, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-[var(--color-muted)] text-[var(--color-foreground)] text-xs rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>
        
        <Button
          variant="outline"
          fullWidth
          iconName="ArrowRight"
          iconPosition="right"
          onClick={() => onLearnMore(service)}
        >
          Learn More
        </Button>
      </div>
    </div>
  );
};

export default ServiceCard;
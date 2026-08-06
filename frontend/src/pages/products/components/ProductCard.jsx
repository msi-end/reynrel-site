import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProductCard = ({ product, onDemoClick, onCalculateROI }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[var(--color-card)] rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[var(--color-border)] h-full flex flex-col">
      <div className="relative h-48 md:h-56 lg:h-64 overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]">
        <Image
          src={product?.image}
          alt={product?.imageAlt}
          className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          {product?.badges?.map((badge, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[var(--color-primary)] text-xs md:text-sm font-semibold rounded-full"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
      <div className="p-6 md:p-8 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
              <Icon name={product?.icon} size={24} color="white" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-[var(--color-foreground)] mb-1">
                {product?.name}
              </h3>
              <p className="text-sm text-[var(--color-muted-foreground)]">{product?.category}</p>
            </div>
          </div>
        </div>

        <p className="text-sm md:text-base text-[var(--color-foreground)]/80 mb-6 leading-relaxed line-clamp-3">
          {product?.description}
        </p>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
            <Icon name="Sparkles" size={16} className="text-[var(--color-accent)]" />
            Key Features
          </h4>
          <div className="space-y-2">
            {product?.features?.slice(0, isExpanded ? undefined : 4)?.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <Icon
                  name="CheckCircle2"
                  size={16}
                  className="text-[var(--color-brand-success)] mt-0.5 flex-shrink-0"
                />
                <span className="text-sm text-[var(--color-foreground)]/70">{feature}</span>
              </div>
            ))}
          </div>
          {product?.features?.length > 4 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-[var(--color-accent)] hover:text-[var(--color-primary)] font-medium mt-3 flex items-center gap-1"
            >
              {isExpanded ? 'Show Less' : `+${product?.features?.length - 4} More Features`}
              <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-[var(--color-muted)] rounded-lg">
          {product?.metrics?.map((metric, index) => (
            <div key={index} className="text-center">
              <div className="text-xl md:text-2xl font-bold text-[var(--color-primary)] mb-1">
                {metric?.value}
              </div>
              <div className="text-xs text-[var(--color-muted-foreground)]">{metric?.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-auto space-y-3">
          <Button
            variant="default"
            fullWidth
            iconName="Play"
            iconPosition="left"
            onClick={() => onDemoClick(product)}
          >
            Watch Live Demo
          </Button>
          <Button
            variant="outline"
            fullWidth
            iconName="Calculator"
            iconPosition="left"
            onClick={() => onCalculateROI(product)}
          >
            Calculate ROI
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
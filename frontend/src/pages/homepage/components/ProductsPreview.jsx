import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { publicApi } from '../../../lib/apiClient';
import { goToProductIntro } from '../../../utils/productIntro';

const fallbackProducts = [
  {
    id: 'inventory-manager',
    name: 'Inventory Manager',
    category: 'Retail & Inventory',
    icon: 'Package',
    description: 'Complete offline POS & inventory system for kirana, FMCG and pharmacy stores — billing, stock, and customer udhar in one app.',
    badges: ['Works Offline'],
    metrics: [
      { label: 'Monthly Fees', value: '₹0' },
      { label: 'Setup Time', value: '<10 min' }
    ]
  },
  {
    id: 'crm-software',
    name: 'CRM Software',
    category: 'Sales & Marketing',
    icon: 'Users',
    description: 'Automate sales processes, track customer interactions, and turn insights into revenue.',
    badges: ['Best ROI'],
    metrics: [
      { label: 'Productivity', value: '+75%' },
      { label: 'Revenue', value: '+120%' }
    ]
  },
  {
    id: 'billing-software',
    name: 'Billing Software',
    category: 'Financial Services',
    icon: 'Receipt',
    description: 'Eliminate manual invoicing errors, accelerate payment cycles, and get clear financial reporting.',
    badges: ['Error-Free'],
    metrics: [
      { label: 'Error Rate', value: '-95%' },
      { label: 'Collections', value: '+60%' }
    ]
  }
];

const ProductsPreview = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(fallbackProducts);

  useEffect(() => {
    publicApi
      .get('/products')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProducts(res.data.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-12 md:py-16 lg:py-24 bg-[var(--color-card)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)]/10 rounded-full mb-4 md:mb-6">
            <Icon name="Boxes" size={16} color="var(--color-accent)" />
            <span className="text-xs md:text-sm font-medium text-[var(--color-accent)]">
              Ready-Made Solutions
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-foreground)] mb-4 md:mb-6">
            Not Just Custom Dev — Proven Products
          </h2>
          <p className="text-base md:text-lg text-[var(--color-muted-foreground)] max-w-3xl mx-auto">
            Beyond custom builds, we offer battle-tested software products you can deploy fast —
            already used by clinics, sales teams, and finance departments.
          </p>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {products?.map((product) => (
            <div
              key={product?.id}
              className="group relative bg-[var(--color-background)] rounded-2xl p-6 md:p-8 border-2 border-[var(--color-border)] hover:border-[var(--color-accent)]/50 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4 md:mb-6">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon name={product?.icon} size={28} color="white" />
                </div>
                {product?.badges?.[0] && (
                  <span className="px-3 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-semibold rounded-full">
                    {product?.badges?.[0]}
                  </span>
                )}
              </div>

              <p className="text-xs font-medium text-[var(--color-muted-foreground)] mb-1">
                {product?.category}
              </p>
              <h3 className="text-xl md:text-2xl font-bold text-[var(--color-foreground)] mb-3">
                {product?.name}
              </h3>
              <p className="text-sm md:text-base text-[var(--color-muted-foreground)] mb-6 leading-relaxed">
                {product?.description}
              </p>

              {product?.metrics?.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-[var(--color-muted)] rounded-lg">
                  {product?.metrics?.slice(0, 2)?.map((metric, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-lg md:text-xl font-bold text-[var(--color-primary)]">
                        {metric?.value}
                      </div>
                      <div className="text-xs text-[var(--color-muted-foreground)]">{metric?.label}</div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="w-full group-hover:bg-[var(--color-accent)] group-hover:text-white transition-colors duration-300"
                iconName="ArrowRight"
                iconPosition="right"
                onClick={() => goToProductIntro(navigate, product)}
              >
                Product Intro
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            iconName="ExternalLink"
            iconPosition="right"
            onClick={() => navigate('/products')}
          >
            Explore All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductsPreview;

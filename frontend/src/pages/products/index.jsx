import React, { useEffect, useState } from 'react';
import Seo from '../../components/Seo';
import Header from '../../components/ui/Header';
import ProductHero from './components/ProductHero';
import ProductCard from './components/ProductCard';
import DemoModal from './components/DemoModal';
import ROICalculator from './components/ROICalculator';
import StickyROICalculatorButton from './components/StickyROICalculatorButton';
import TestimonialSection from './components/TestimonialSection';
import CTASection from './components/CTASection';
import Icon from '../../components/AppIcon';
import Footer from '../homepage/components/Footer';
import { publicApi } from '../../lib/apiClient';

const Products = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showROICalculator, setShowROICalculator] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .get('/products')
      .then((res) => {
        setProducts(res.data.map((p) => ({ ...p, pricing: { annual: p.pricingAnnual } })));
      })
      .finally(() => setLoading(false));
  }, []);


  const handleDemoClick = (product) => {
    setSelectedProduct(product);
    setShowDemoModal(true);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Seo
        title="Products - Inventory Manager, CRM & Billing Software"
        description="Ready-made software products from Reynrel Infotech: Inventory Manager, CRM Software, and Billing Software built on proven industry expertise."
        path="/products"
      />
      <Header />
      <main className="pt-16 lg:pt-20">
        <ProductHero />

        <section className="py-12 md:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)]/10 rounded-full mb-4">
                <Icon name="Package" size={20} className="text-[var(--color-accent)]" />
                <span className="text-sm font-medium text-[var(--color-accent)]">Our Product Suite</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-foreground)] mb-4">
                Choose Your Perfect Solution
              </h2>
              <p className="text-base md:text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
                Industry-specific software built on years of domain expertise and proven results
              </p>
            </div>

            {loading ? (
              <p className="text-center text-[var(--color-muted-foreground)]">Loading products...</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {products?.map((product) =>
                <ProductCard
                  key={product?.id}
                  product={product}
                  onDemoClick={handleDemoClick} />

                )}
              </div>
            )}
          </div>
        </section>

        <TestimonialSection />

        <CTASection />
      </main>
      <Footer />
      {showDemoModal && selectedProduct &&
      <DemoModal
        product={selectedProduct}
        onClose={() => {
          setShowDemoModal(false);
          setSelectedProduct(null);
        }} />

      }
      <StickyROICalculatorButton onClick={() => setShowROICalculator(true)} />
      {showROICalculator &&
      <ROICalculator
        products={products}
        onClose={() => setShowROICalculator(false)} />

      }
    </div>);

};

export default Products;
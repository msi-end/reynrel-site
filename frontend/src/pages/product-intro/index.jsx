import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Seo from '../../components/Seo';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';
import Button from '../../components/ui/Button';
import { publicApi } from '../../lib/apiClient';
import { getProductSlug } from '../../utils/productIntro';

// Fallback, per-product Product Intro page: renders a dedicated introduction
// for a single product using its own live data. Used for any product that
// doesn't have a standalone HTML file registered in data/productIntroRegistry.
const ProductIntro = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .get('/products')
      .then((res) => {
        const match = res?.data?.find((p) => getProductSlug(p) === slug);
        setProduct(match || null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (!loading && !product) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <Seo title="Product Intro" description="Product introduction page." path={`/products/${slug}`} />
        <Header />
        <main className="pt-16 lg:pt-20 min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <Icon name="PackageSearch" size={48} className="mx-auto mb-6 text-[var(--color-muted-foreground)]" />
            <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-3">
              Product Intro Coming Soon
            </h1>
            <p className="text-[var(--color-muted-foreground)] mb-8">
              We're still preparing the dedicated introduction page for this product.
            </p>
            <Button variant="default" iconName="ArrowLeft" iconPosition="left" onClick={() => navigate('/products')}>
              Back to All Products
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Seo
        title={loading ? 'Product Intro' : `${product?.name} - Product Intro`}
        description={product?.description || 'Product introduction page.'}
        path={`/products/${slug}`}
      />
      <Header />
      <main className="pt-16 lg:pt-20">
        {loading ? (
          <div className="py-24 text-center text-[var(--color-muted-foreground)]">Loading product...</div>
        ) : (
          <>
            <section className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                <button
                  onClick={() => navigate('/products')}
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-6"
                >
                  <Icon name="ArrowLeft" size={16} />
                  Back to All Products
                </button>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Icon name={product?.icon} size={28} color="white" />
                  </div>
                  <div>
                    <p className="text-sm text-white/80">{product?.category}</p>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">{product?.name}</h1>
                  </div>
                </div>
                <p className="text-base md:text-lg text-white/90 max-w-3xl leading-relaxed">
                  {product?.description}
                </p>
                {product?.badges?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {product?.badges?.map((badge, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/15 backdrop-blur-sm text-white text-xs md:text-sm font-semibold rounded-full">
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {product?.image && (
              <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-14 relative z-10">
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-border)]">
                  <Image src={product?.image} alt={product?.imageAlt} className="w-full h-auto object-cover" />
                </div>
              </section>
            )}

            {product?.metrics?.length > 0 && (
              <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {product?.metrics?.map((metric, idx) => (
                    <div key={idx} className="text-center p-4 md:p-6 bg-[var(--color-muted)] rounded-xl">
                      <div className="text-2xl md:text-3xl font-bold text-[var(--color-primary)] mb-1">
                        {metric?.value}
                      </div>
                      <div className="text-xs md:text-sm text-[var(--color-muted-foreground)]">{metric?.label}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {product?.features?.length > 0 && (
              <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-foreground)] mb-6 flex items-center gap-2">
                  <Icon name="Sparkles" size={24} className="text-[var(--color-accent)]" />
                  Key Features
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {product?.features?.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg">
                      <Icon name="CheckCircle2" size={18} className="text-[var(--color-brand-success)] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-[var(--color-foreground)]/80">{feature}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {product?.demoHighlights?.length > 0 && (
              <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-foreground)] mb-6 flex items-center gap-2">
                  <Icon name="Info" size={24} className="text-[var(--color-accent)]" />
                  What It Does
                </h2>
                <div className="space-y-4">
                  {product?.demoHighlights?.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                        <Icon name="Play" size={16} className="text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[var(--color-foreground)] mb-1">{highlight?.title}</h3>
                        <p className="text-sm text-[var(--color-muted-foreground)]">{highlight?.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {product?.pricingAnnual > 0 && (
              <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-foreground)] mb-6 flex items-center gap-2">
                  <Icon name="Tag" size={24} className="text-[var(--color-accent)]" />
                  Pricing
                </h2>
                <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 md:p-8 max-w-sm">
                  <div className="text-3xl font-bold text-[var(--color-primary)] mb-1">
                    ₹{product?.pricingAnnual?.toLocaleString()}
                    <span className="text-sm font-normal text-[var(--color-muted-foreground)]"> / year</span>
                  </div>
                  <p className="text-sm text-[var(--color-muted-foreground)]">Annual license</p>
                </div>
              </section>
            )}

            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="bg-[var(--color-muted)] rounded-2xl p-6 md:p-10 text-center">
                <h2 className="text-xl md:text-2xl font-bold text-[var(--color-foreground)] mb-3">
                  Ready to see {product?.name} in action?
                </h2>
                <p className="text-[var(--color-muted-foreground)] mb-6 max-w-xl mx-auto">
                  Head back to the products page to watch a live demo or get in touch with our team.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="default" iconName="Play" iconPosition="left" onClick={() => navigate('/products')}>
                    Watch Live Demo
                  </Button>
                  <Button variant="outline" iconName="MessageCircle" iconPosition="left" onClick={() => navigate('/contact-us')}>
                    Contact Us
                  </Button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductIntro;

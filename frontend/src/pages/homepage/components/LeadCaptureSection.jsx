import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { publicApi } from '../../../lib/apiClient';
import { trackEvent } from '../../../lib/analytics';

const LeadCaptureSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({ submitted: false, loading: false, error: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ submitted: false, loading: true, error: null });

    try {
      await publicApi.post('/leads', { ...formData, source: 'homepage' });
      trackEvent('generate_lead', { source: 'homepage', service: formData.service });
      setFormStatus({ submitted: true, loading: false, error: null });
      setFormData({ name: '', email: '', phone: '', service: '', message: '' });
    } catch {
      setFormStatus({
        submitted: false,
        loading: false,
        error: "Something went wrong — please try again or reach us on WhatsApp."
      });
    }
  };

  return (
    <section className="py-12 md:py-16 lg:py-24 bg-[var(--color-muted)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)]/10 rounded-full mb-4">
            <Icon name="Send" size={16} color="var(--color-primary)" />
            <span className="text-xs md:text-sm font-medium text-[var(--color-primary)]">Get Started</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-foreground)] mb-3">
            Let's Talk About Your Project
          </h2>
          <p className="text-base md:text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
            Share a few details below and our team will get back to you within 24 hours with next steps.
          </p>
        </div>

        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl md:rounded-3xl overflow-hidden shadow-xl grid lg:grid-cols-5">
          {/* Left info panel */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[var(--color-brand-navy)] via-[#5f2104] to-[var(--color-brand-charcoal)] p-8 md:p-10 text-white flex flex-col justify-center">
            <h3 className="text-xl md:text-2xl font-bold mb-4">
              Why reach out?
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="Clock" size={18} color="var(--color-brand-electric)" />
                </div>
                <span className="text-sm text-white/90">Response within 24 hours</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="ShieldCheck" size={18} color="var(--color-brand-electric)" />
                </div>
                <span className="text-sm text-white/90">Your information stays private</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="Users" size={18} color="var(--color-brand-electric)" />
                </div>
                <span className="text-sm text-white/90">Talk directly with our engineers</span>
              </div>
            </div>
          </div>

          {/* Right form panel */}
          <div className="lg:col-span-3 p-8 md:p-10">
            {formStatus?.submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mb-4">
                  <Icon name="CheckCircle2" size={32} color="var(--color-success)" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2">
                  Thanks — we've got it!
                </h3>
                <p className="text-sm text-[var(--color-muted-foreground)] mb-6 max-w-sm">
                  A member of our team will be in touch shortly to discuss your project.
                </p>
                <Button variant="outline" onClick={() => setFormStatus({ submitted: false, loading: false })}>
                  Submit Another Request
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Input
                    label="Full Name"
                    name="name"
                    required
                    value={formData?.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    required
                    value={formData?.phone}
                    onChange={handleChange}
                    placeholder="+91 00000 00000"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData?.email}
                    onChange={handleChange}
                    placeholder="john@company.com"
                  />
                  <div className="space-y-2">
                    <label htmlFor="lead-service" className="text-sm font-medium text-[var(--color-foreground)]">
                      Service Interested In
                    </label>
                    <select
                      id="lead-service"
                      name="service"
                      value={formData?.service}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-foreground)] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2"
                    >
                      <option value="">Select a service</option>
                      <option value="web-development">Web Development</option>
                      <option value="software-development">Software Development</option>
                      <option value="product-development">Product Development</option>
                      <option value="consulting">Technology Consulting</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="lead-message" className="text-sm font-medium text-[var(--color-foreground)]">
                    Message
                  </label>
                  <textarea
                    id="lead-message"
                    name="message"
                    rows="4"
                    value={formData?.message}
                    onChange={handleChange}
                    placeholder="Tell us a bit about what you're looking to build..."
                    className="flex w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 resize-none"
                  />
                </div>

                {formStatus?.error && (
                  <p className="text-sm text-destructive text-center">{formStatus.error}</p>
                )}

                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  fullWidth
                  loading={formStatus?.loading}
                  iconName={formStatus?.loading ? undefined : "Send"}
                  iconPosition="right"
                >
                  {formStatus?.loading ? 'Sending...' : 'Get My Free Consultation'}
                </Button>

                <p className="text-center text-xs text-[var(--color-muted-foreground)]">
                  🔒 Your information is secure and will never be shared with third parties
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadCaptureSection;

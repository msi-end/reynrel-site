import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const DemoModal = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e?.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e?.target?.name]: e?.target?.value
    });
  };

  return (
    <div className="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--color-card)] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--color-card)] border-b border-[var(--color-border)] p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
              <Icon name={product?.icon} size={24} color="white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[var(--color-foreground)]">
                {product?.name} Demo
              </h2>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Experience the power firsthand
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-[var(--color-muted)] transition-colors flex items-center justify-center"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        <div className="p-6 md:p-8">
          {!isSubmitted ? (
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
                  What You'll See in This Demo
                </h3>
                <div className="space-y-4 mb-6">
                  {product?.demoHighlights?.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                        <Icon name="Play" size={16} className="text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-[var(--color-foreground)] mb-1">
                          {highlight?.title}
                        </h4>
                        <p className="text-sm text-[var(--color-muted-foreground)]">
                          {highlight?.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-[var(--color-muted)] rounded-lg p-4">
                  <h4 className="font-semibold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
                    <Icon name="Clock" size={16} />
                    Demo Duration
                  </h4>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    Approximately 15-20 minutes with Q&A session
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
                  Schedule Your Demo
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Full Name"
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData?.name}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Work Email"
                    type="email"
                    name="email"
                    placeholder="john@company.com"
                    value={formData?.email}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Company Name"
                    type="text"
                    name="company"
                    placeholder="Your Company"
                    value={formData?.company}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    value={formData?.phone}
                    onChange={handleChange}
                    required
                  />

                  <div className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Icon
                        name="Info"
                        size={20}
                        className="text-[var(--color-primary)] flex-shrink-0 mt-0.5"
                      />
                      <p className="text-sm text-[var(--color-foreground)]/80">
                        Our product specialist will contact you within 24 hours to schedule a
                        personalized demo at your convenience.
                      </p>
                    </div>
                  </div>

                  <Button type="submit" variant="default" fullWidth iconName="Calendar">
                    Request Demo
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-[var(--color-brand-success)]/10 flex items-center justify-center mx-auto mb-6">
                <Icon name="CheckCircle2" size={40} className="text-[var(--color-brand-success)]" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-foreground)] mb-3">
                Demo Request Submitted!
              </h3>
              <p className="text-[var(--color-muted-foreground)] mb-6 max-w-md mx-auto">
                Thank you for your interest in {product?.name}. Our team will reach out to you within
                24 hours to schedule your personalized demo.
              </p>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoModal;
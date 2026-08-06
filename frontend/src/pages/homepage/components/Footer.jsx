import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { publicApi } from '../../../lib/apiClient';

const defaultSettings = {
  address: 'House No. 46, LKRB Path, Nabin Nagar, Guwahati, Assam 781024, India',
  email: 'info.reynrel@gmail.com',
  phone: '+91 94010 69337',
  socialLinks: {
    linkedin: 'https://www.linkedin.com/company/reynrel',
    instagram: 'https://www.instagram.com/reynrel_infotech',
    whatsapp: 'https://wa.me/+919864773099'
  }
};

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date()?.getFullYear();
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    publicApi
      .get('/settings')
      .then((res) => setSettings(res.data))
      .catch(() => {});
  }, []);

  const footerLinks = {
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'Why Choose Us', path: '/why-choose-us' },
      { label: 'Client Success', path: '/client-success' },
      { label: 'Contact Us', path: '/contact-us' }
    ],
    services: [
      { label: 'Custom App Development', path: '/services' },
      { label: 'Web Development', path: '/services' },
      { label: 'Tech Consultation', path: '/services' },
      { label: 'Support & Maintenance', path: '/services' }
    ],
    products: [
      { label: 'Clinic Management', path: '/products' },
      { label: 'CRM Software', path: '/products' },
      { label: 'Billing Software', path: '/products' },
      { label: 'Custom Solutions', path: '/products' }
    ]
  };

  const legalLinks = [
    { label: 'Privacy Policy', path: '/privacy-policy' },
    { label: 'Terms of Service', path: '/terms-of-service' },
    { label: 'Cookie Policy', path: '/cookie-policy' },
    { label: 'Cancellation & Refund', path: '/refund-cancellation' }
  ];

  const socialLinks = [
    { icon: 'Linkedin', url: settings?.socialLinks?.linkedin, label: 'LinkedIn' },
    { icon: 'Instagram', url: settings?.socialLinks?.instagram, label: 'Instagram' },
    { icon: 'MessageCircle', url: settings?.socialLinks?.whatsapp, label: 'WhatsApp' }
  ];

  return (
    <footer className="bg-[var(--color-brand-navy)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">
                <img
                  src="/assets/images/reynrel-logo-icon.png"
                  alt="Reynrel Infotech logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl md:text-2xl font-bold">Reynrel Infotech</span>
            </div>
            <p className="text-sm md:text-base text-white/80 mb-6 leading-relaxed">
              Defining the Future through proven expertise, long-term partnerships, and unwavering support. Your strategic technology partner for digital transformation.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks?.map((social) => (
                <a
                  key={social?.label}
                  href={social?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[var(--color-brand-electric)] flex items-center justify-center transition-all duration-300 group"
                  aria-label={social?.label}
                >
                  <Icon name={social?.icon} size={18} color="white" />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6">Company</h3>
            <ul className="space-y-3">
              {footerLinks?.company?.map((link) => (
                <li key={link?.label}>
                  <button
                    onClick={() => navigate(link?.path)}
                    className="text-sm md:text-base text-white/80 hover:text-[var(--color-brand-electric)] transition-colors duration-200"
                  >
                    {link?.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6">Services</h3>
            <ul className="space-y-3">
              {footerLinks?.services?.map((link) => (
                <li key={link?.label}>
                  <button
                    onClick={() => navigate(link?.path)}
                    className="text-sm md:text-base text-white/80 hover:text-[var(--color-brand-electric)] transition-colors duration-200"
                  >
                    {link?.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Products Links */}
          <div>
            <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6">Products</h3>
            <ul className="space-y-3">
              {footerLinks?.products?.map((link) => (
                <li key={link?.label}>
                  <button
                    onClick={() => navigate(link?.path)}
                    className="text-sm md:text-base text-white/80 hover:text-[var(--color-brand-electric)] transition-colors duration-200"
                  >
                    {link?.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-white/10 pt-8 md:pt-12 mb-8 md:mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="flex items-start gap-3">
              <Icon name="MapPin" size={20} color="var(--color-brand-electric)" className="mt-1 flex-shrink-0" />
              <div>
                <div className="text-sm md:text-base font-semibold mb-1">Address</div>
                <div className="text-xs md:text-sm text-white/80">{settings.address}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="Mail" size={20} color="var(--color-brand-electric)" className="mt-1 flex-shrink-0" />
              <div>
                <div className="text-sm md:text-base font-semibold mb-1">Email</div>
                <a href={`mailto:${settings.email}`} className="text-xs md:text-sm text-white/80 hover:text-[var(--color-brand-electric)] transition-colors">
                  {settings.email}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="Phone" size={20} color="var(--color-brand-electric)" className="mt-1 flex-shrink-0" />
              <div>
                <div className="text-sm md:text-base font-semibold mb-1">Phone</div>
                <a href={`tel:${(settings.phone || '').replace(/\s+/g, '')}`} className="text-xs md:text-sm text-white/80 hover:text-[var(--color-brand-electric)] transition-colors">
                  {settings.phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs md:text-sm text-white/60 text-center md:text-left">
              &copy; {currentYear} Reynrel Infotech. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {legalLinks?.map((link) => (
                <button
                  key={link?.label}
                  onClick={() => navigate(link?.path)}
                  className="text-xs md:text-sm text-white/60 hover:text-white transition-colors"
                >
                  {link?.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
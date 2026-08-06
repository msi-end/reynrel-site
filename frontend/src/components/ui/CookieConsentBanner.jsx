import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const STORAGE_KEY = 'reynrel_cookie_consent';

const CookieConsentBanner = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleChoice = (value) => {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[var(--z-modal)] p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-[var(--color-brand-navy)] text-white rounded-2xl shadow-2xl border border-white/10 p-5 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6">
        <Icon name="Cookie" size={28} color="var(--color-brand-electric)" className="flex-shrink-0" />
        <p className="text-sm text-white/90 flex-1 text-center md:text-left">
          We use essential and analytics cookies to run this site and understand how it's used. See our{' '}
          <button
            onClick={() => navigate('/cookie-policy')}
            className="underline hover:text-[var(--color-brand-electric)]"
          >
            Cookie Policy
          </button>{' '}
          for details.
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10" onClick={() => handleChoice('declined')}>
            Decline
          </Button>
          <Button variant="default" size="sm" className="bg-[var(--color-brand-electric)] text-[var(--color-brand-navy)] hover:bg-[var(--color-brand-electric)]/90" onClick={() => handleChoice('accepted')}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;

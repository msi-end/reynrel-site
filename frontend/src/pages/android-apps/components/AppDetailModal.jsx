import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AppDetailModal = ({ app, onClose }) => {
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const hasScreenshots = app?.screenshots?.length > 0;

  return (
    <div className="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--color-card)] rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--color-card)] border-b border-[var(--color-border)] p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
              <Icon name={app?.icon} size={24} color="white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[var(--color-foreground)]">
                {app?.name}
              </h2>
              <p className="text-sm text-[var(--color-muted-foreground)]">{app?.category}</p>
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
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Screenshot gallery */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
                Screenshots
              </h3>
              {hasScreenshots ? (
                <>
                  <div className="rounded-xl overflow-hidden border border-[var(--color-border)] mb-3 bg-[var(--color-muted)]">
                    <img
                      src={app?.screenshots?.[activeScreenshot]}
                      alt={`${app?.name} screenshot ${activeScreenshot + 1}`}
                      className="w-full h-80 object-cover"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto">
                    {app?.screenshots?.map((src, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveScreenshot(index)}
                        className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                          activeScreenshot === index
                            ? 'border-[var(--color-primary)]'
                            : 'border-transparent'
                        }`}
                      >
                        <img
                          src={src}
                          alt={`${app?.name} thumbnail ${index + 1}`}
                          className="w-16 h-28 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-muted)] h-80 flex flex-col items-center justify-center text-center px-6">
                  <Icon name="ImageOff" size={40} className="text-[var(--color-muted-foreground)] mb-3" />
                  <p className="text-sm font-medium text-[var(--color-foreground)] mb-1">
                    Screenshots coming soon
                  </p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    App screenshots will be uploaded here shortly.
                  </p>
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <p className="text-sm md:text-base text-[var(--color-foreground)]/80 mb-6 leading-relaxed">
                {app?.description}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-[var(--color-muted)] rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--color-primary)] flex items-center justify-center gap-1">
                    <Icon name="Star" size={16} className="text-[var(--color-brand-orange)]" />
                    {app?.rating}
                  </div>
                  <div className="text-xs text-[var(--color-muted-foreground)]">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--color-primary)]">{app?.downloads}</div>
                  <div className="text-xs text-[var(--color-muted-foreground)]">Downloads</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--color-primary)]">{app?.version}</div>
                  <div className="text-xs text-[var(--color-muted-foreground)]">Version</div>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
                <Icon name="Sparkles" size={16} className="text-[var(--color-accent)]" />
                Key Features
              </h4>
              <div className="space-y-2 mb-6">
                {app?.features?.map((feature, index) => (
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

              <div className="space-y-3">
                <Button
                  variant="default"
                  fullWidth
                  iconName="PlayCircle"
                  iconPosition="left"
                  disabled={!app?.playStoreUrl}
                  onClick={() => window.open(app?.playStoreUrl, '_blank', 'noopener,noreferrer')}
                >
                  {app?.playStoreUrl ? 'Get it on Google Play' : 'Play Store — Coming Soon'}
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  iconName="Download"
                  iconPosition="left"
                  disabled={!app?.apkUrl}
                  onClick={() => window.open(app?.apkUrl, '_blank', 'noopener,noreferrer')}
                >
                  {app?.apkUrl ? 'Download APK' : 'APK — Coming Soon'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDetailModal;

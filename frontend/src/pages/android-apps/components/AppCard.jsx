import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AppCard = ({ app, onViewDetails }) => {
  const hasScreenshots = app?.screenshots?.length > 0;

  return (
    <div className="bg-[var(--color-card)] rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[var(--color-border)] h-full flex flex-col">
      <div className="p-6 md:p-8 flex-1 flex flex-col">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
            <Icon name={app?.icon} size={28} color="white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg md:text-xl font-bold text-[var(--color-foreground)]">
                {app?.name}
              </h3>
              {app?.badge && (
                <span className="px-2 py-0.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-semibold rounded-full">
                  {app?.badge}
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--color-muted-foreground)]">{app?.category}</p>
          </div>
        </div>

        <p className="text-sm md:text-base text-[var(--color-foreground)]/80 mb-4 leading-relaxed line-clamp-3">
          {app?.description}
        </p>

        <div className="flex items-center gap-4 text-xs md:text-sm text-[var(--color-muted-foreground)] mb-4">
          <span className="flex items-center gap-1">
            <Icon name="Star" size={14} className="text-[var(--color-brand-orange)]" />
            {app?.rating}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Download" size={14} />
            {app?.downloads}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="HardDrive" size={14} />
            {app?.size}
          </span>
        </div>

        {/* Screenshot preview strip */}
        <div className="mb-6">
          {hasScreenshots ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {app?.screenshots?.slice(0, 4)?.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`${app?.name} screenshot ${index + 1}`}
                  className="w-16 h-28 md:w-20 md:h-36 object-cover rounded-lg border border-[var(--color-border)] flex-shrink-0"
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-muted)] rounded-lg text-xs md:text-sm text-[var(--color-muted-foreground)]">
              <Icon name="ImageOff" size={16} />
              Screenshots coming soon
            </div>
          )}
        </div>

        <div className="mt-auto space-y-3">
          <Button
            variant="default"
            fullWidth
            iconName="Eye"
            iconPosition="left"
            onClick={() => onViewDetails(app)}
          >
            View Details
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              fullWidth
              iconName="PlayCircle"
              iconPosition="left"
              disabled={!app?.playStoreUrl}
              onClick={() => window.open(app?.playStoreUrl, '_blank', 'noopener,noreferrer')}
            >
              {app?.playStoreUrl ? 'Play Store' : 'Coming Soon'}
            </Button>
            <Button
              variant="outline"
              fullWidth
              iconName="Download"
              iconPosition="left"
              disabled={!app?.apkUrl}
              onClick={() => window.open(app?.apkUrl, '_blank', 'noopener,noreferrer')}
            >
              {app?.apkUrl ? 'Download APK' : 'Coming Soon'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppCard;

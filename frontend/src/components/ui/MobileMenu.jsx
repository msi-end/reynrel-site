import React from 'react';
import Icon from '../AppIcon';

const whatsappNumber = '919864773099';

const MobileMenu = ({
  isOpen,
  onClose,
  navigationItems,
  currentPath,
  onNavigate
}) => {
  const handleNavigation = (path) => {
    onNavigate(path);
  };

  const isActivePath = (path) => {
    return currentPath === path;
  };

  return (
    <div
      className={`mobile-menu-overlay ${!isOpen ? 'closed' : ''}`}
      aria-hidden={!isOpen}
    >
      <div className="mobile-menu-content">
        <nav className="mobile-menu-nav">
          {navigationItems?.map((item) => (
            <React.Fragment key={item?.path}>
              <button
                onClick={() => handleNavigation(item?.path)}
                className={`mobile-menu-link ${isActivePath(item?.path) ? 'active' : ''}`}
              >
                {item?.label}
              </button>
              {item?.children?.map((child) => (
                <button
                  key={child?.path}
                  onClick={() => handleNavigation(child?.path)}
                  className={`mobile-menu-link pl-8 text-sm ${isActivePath(child?.path) ? 'active' : ''}`}
                >
                  {child?.label}
                </button>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="mobile-menu-cta w-full flex items-center justify-center gap-2 rounded-lg py-3 font-medium text-white bg-[#25D366] hover:bg-[#1ebe5d] transition-colors duration-200"
        >
          <Icon name="MessageCircle" size={20} color="white" />
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
};

export default MobileMenu;
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Icon from "../AppIcon";
import MobileMenu from "./MobileMenu";

const LOGO_TEXTS = ["reynrel infotech", "reynrel.in"];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoIndex, setLogoIndex] = useState(0);
  const [logoVisible, setLogoVisible] = useState(true);

  const whatsappNumber = "919864773099";

  const navigationItems = [
    { label: "Home", path: "/homepage" },
    { label: "Services", path: "/services" },
    {
      label: "Products",
      path: "/products",
      children: [
        { label: "Products", path: "/products" },
        { label: "Android Apps", path: "/android-apps" },
      ],
    },
    { label: "Why Choose Us", path: "/why-choose-us" },
    { label: "Client Success", path: "/client-success" },
    { label: "About Us", path: "/about" },
    { label: "Contact Us", path: "/contact-us" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const cycle = setInterval(() => {
      setLogoVisible(false);
      setTimeout(() => {
        setLogoIndex((prev) => (prev + 1) % LOGO_TEXTS?.length);
        setLogoVisible(true);
      }, 300);
    }, 2600);

    return () => clearInterval(cycle);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  return (
    <>
      <header className={`header-container ${isScrolled ? "shadow-lg" : ""}`}>
        <div className="header-content">
          <div
            className="header-logo cursor-pointer"
            onClick={() => handleNavigation("/homepage")}
          >
            <div className="header-logo-icon bg-none">
              <img
                src="/assets/images/reynrel-logo-icon.png"
                alt="Reynrel Infotech logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="relative inline-grid text-left">
              <span aria-hidden="true" className="header-logo-text invisible whitespace-nowrap [grid-area:1/1]">
                {LOGO_TEXTS?.[0]}
              </span>
              <span
                className={`header-logo-text whitespace-nowrap [grid-area:1/1] transition-all duration-300 ease-in-out ${
                  logoVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
                }`}
              >
                {LOGO_TEXTS?.[logoIndex]}
              </span>
            </span>
          </div>

          <nav className="header-nav">
            {navigationItems?.map((item) =>
              item?.children ? (
                <div key={item?.path} className="relative group">
                  <button
                    onClick={() => handleNavigation(item?.path)}
                    className={`header-nav-link flex items-center gap-1 ${isActivePath(item?.path) ? "active" : ""}`}
                  >
                    {item?.label}
                    <Icon name="ChevronDown" size={14} />
                  </button>
                  <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50">
                    <div className="bg-card border border-border rounded-lg shadow-lg py-2 min-w-[180px]">
                      {item?.children?.map((child) => (
                        <button
                          key={child?.path}
                          onClick={() => handleNavigation(child?.path)}
                          className={`w-full text-left px-4 py-2 text-sm font-medium text-foreground hover:bg-muted hover:text-primary transition-colors ${isActivePath(child?.path) ? "text-primary" : ""}`}
                        >
                          {child?.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  key={item?.path}
                  onClick={() => handleNavigation(item?.path)}
                  className={`header-nav-link ${isActivePath(item?.path) ? "active" : ""}`}
                >
                  {item?.label}
                </button>
              )
            )}
          </nav>

          <div className="header-actions">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex w-11 h-11 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] items-center justify-center transition-colors duration-200"
              aria-label="Chat with us on WhatsApp"
            >
              <Icon name="MessageCircle" size={22} color="white" />
            </a>

            <button
              className="mobile-menu-button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navigationItems={navigationItems}
        currentPath={location?.pathname}
        onNavigate={handleNavigation}
      />
    </>
  );
};

export default Header;

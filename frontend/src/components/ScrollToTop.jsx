import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initAnalytics, trackPageview } from "../lib/analytics";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageview(pathname);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
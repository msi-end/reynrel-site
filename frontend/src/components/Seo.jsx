import { useEffect } from 'react';

const SITE_NAME = 'Reynrel Infotech';
const DEFAULT_IMAGE = '/assets/images/reynrel-logo-full.png';

function setMetaTag(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

// Plain DOM API instead of react-helmet: react-helmet v6 relies on legacy
// lifecycle methods that don't reliably flush to document.head under React 18.
const Seo = ({ title, description, path = '/' }) => {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const url = `https://reynrel.in${path}`;

    document.title = fullTitle;
    setMetaTag('name', 'description', description);
    setCanonical(url);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', url);
    setMetaTag('property', 'og:image', DEFAULT_IMAGE);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
  }, [title, description, path]);

  return null;
};

export default Seo;

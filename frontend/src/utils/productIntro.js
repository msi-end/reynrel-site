import slugify from './slugify';

// Product pages live at /products/<slug>.
// - If a product has a custom HTML page (product.introPage = folder name under
//   public/products/), that static page is served by the backend at /products/<introPage>.
// - Otherwise the React page at /products/<slug> is built from the product's data.
//   The slug is product.slug (editable in Admin > Products) or derived from the name.

// Values saved before the URL migration ("inventory-manager/") map to the new slugs.
const LEGACY_INTRO_PAGES = { 'inventory-manager': 'inventory-management' };

export const normalizeIntroPage = (value) => {
  const v = String(value || '')
    .trim()
    .replace(/^\/?(product-intro|products)\//, '')
    .replace(/\/?(index\.html)?$/, '');
  return LEGACY_INTRO_PAGES[v] || v;
};

export const getProductSlug = (product) => {
  const intro = normalizeIntroPage(product?.introPage);
  return intro || slugify(product?.slug || product?.name || product?.id || '');
};

export const getProductIntroLink = (product) => {
  const intro = normalizeIntroPage(product?.introPage);
  if (intro) return { external: true, href: `/products/${intro}` };
  return { external: false, href: `/products/${getProductSlug(product)}` };
};

export const goToProductIntro = (navigate, product) => {
  const { external, href } = getProductIntroLink(product);
  if (external) {
    window.location.href = href;
  } else {
    navigate(href);
  }
};

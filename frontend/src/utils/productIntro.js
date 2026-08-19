import slugify from './slugify';

export const getProductSlug = (product) => slugify(product?.name || product?.id || '');

// Resolves where a product's "Product Intro" should navigate to.
// Admins pick a standalone HTML file per product (product.introPage, see
// ProductsAdmin.jsx / data/productIntroPages.js). If none is set, falls back
// to the in-app React product intro page built from the product's own data.
export const getProductIntroLink = (product) => {
  const introPage = product?.introPage?.trim?.();

  if (introPage) {
    return { external: true, href: `/product-intro/${introPage}` };
  }

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

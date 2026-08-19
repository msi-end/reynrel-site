// Standalone HTML "Product Intro" pages available in /public/product-intro.
// Selectable per-product from the admin Products screen (see ProductsAdmin.jsx).
// To add a new one: drop the file in frontend/public/product-intro/<file>.html
// and add an entry here so it shows up in the admin dropdown.
const PRODUCT_INTRO_PAGES = [
  { value: '', label: 'Auto (generated from product data)' },
  { value: 'inventory-manager/', label: 'Inventory Manager (custom page)' },
];

export default PRODUCT_INTRO_PAGES;

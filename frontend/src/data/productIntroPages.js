// Standalone HTML product pages in /public/products/<slug>/index.html, served at /products/<slug>.
// Selectable per product in Admin > Products. To add one: create
// frontend/public/products/<slug>/index.html (use absolute asset paths) and add an entry here.
const PRODUCT_INTRO_PAGES = [
  { value: '', label: 'Auto (generated from product data)' },
  { value: 'inventory-management', label: 'Inventory Management (custom page) — /products/inventory-management' },
];

export default PRODUCT_INTRO_PAGES;

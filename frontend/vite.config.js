import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { injectSiteChrome, injectProductPages } from "./site-chrome/inject.js";

// Standalone HTML product pages (public/products/<slug>/index.html):
// - served at /products/<slug> in dev, like the backend does in production;
// - the main-site header and footer (site-chrome/) are inserted in dev and after each build.
const productPages = () => {
  let outDir = "dist";
  return {
    name: "product-pages",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const m = /^\/products\/([a-z0-9-]+)(?:\/|\/index\.html)?$/.exec((req.url || "").split("?")[0]);
        const file = m && path.resolve(__dirname, "public/products", m[1], "index.html");
        if (!file || !fs.existsSync(file)) return next();
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(injectSiteChrome(fs.readFileSync(file, "utf8")));
      });
    },
    closeBundle() {
      injectProductPages(path.join(outDir, "products"));
    },
  };
};

export default defineConfig({
  plugins: [
    react(),
    productPages(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("lucide-react")) return "icons-vendor";
          if (id.includes("react-router-dom")) return "router-vendor";
          if (id.includes(`${path.sep}react${path.sep}`) || id.includes(`${path.sep}react-dom${path.sep}`) || id.includes("scheduler")) {
            return "react-vendor";
          }
          return "vendor";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      components: path.resolve(__dirname, "./src/components"),
      pages: path.resolve(__dirname, "./src/pages"),
      styles: path.resolve(__dirname, "./src/styles"),
      assets: path.resolve(__dirname, "./src/assets"),
    },
  },
});

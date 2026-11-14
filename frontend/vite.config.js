import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

// Dev-server parity with the backend: serve public/products/<slug>/index.html at /products/<slug>.
const productPages = () => ({
  name: "product-pages",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const m = /^\/products\/([a-z0-9-]+)\/?$/.exec((req.url || "").split("?")[0]);
      if (m && fs.existsSync(path.resolve(__dirname, "public/products", m[1], "index.html"))) {
        req.url = `/products/${m[1]}/index.html`;
      }
      next();
    });
  },
});

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

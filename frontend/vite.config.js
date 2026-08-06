import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
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

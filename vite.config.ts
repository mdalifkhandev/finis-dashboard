import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  preview: {
    host: "0.0.0.0",
    allowedHosts: [
      "proconstructiq.com",
      "www.proconstructiq.com",
    ],
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "chart-vendor": ["recharts"],
          "ui-vendor": ["lucide-react"],
        },
      },
    },
  },
});
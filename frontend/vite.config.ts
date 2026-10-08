import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import packageJson from "./package.json";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["argon2-browser"],
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("pdfmake") || id.includes("vfs_fonts")) {
            return "vendor-pdfmake";
          }

          if (id.includes("lowlight") || id.includes("highlight.js")) {
            return "vendor-highlight";
          }

          if (id.includes("@tiptap") || id.includes("prosemirror")) {
            return "vendor-tiptap";
          }

          if (
            id.includes("react/") ||
            id.includes("react-dom") ||
            id.includes("react-router")
          ) {
            return "vendor-react";
          }
        },
      },
    },
  },
});

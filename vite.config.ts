import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths()
  ],
  // Agregamos esto por si el framework necesita ignorar el plugin de lovable durante el build
  build: {
    rollupOptions: {
      external: [],
    },
  },
});
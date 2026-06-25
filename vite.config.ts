import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanStackStartVitePlugin } from "@tanstack/react-start-plugin/vite";

export default defineConfig({
  plugins: [
    tanStackStartVitePlugin(), // Este plugin es obligatorio para tu estructura
    react(),
  ],
});
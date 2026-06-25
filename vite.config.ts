import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import * as cloudflare from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    cloudflare.default(),
    TanStackRouterVite(),
    react(),
  ],
});
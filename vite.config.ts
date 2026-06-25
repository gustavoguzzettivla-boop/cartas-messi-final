import { defineConfig } from "vite";
import { lovableViteConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  plugins: [
    // Esto expande los plugins internos de Lovable y TanStack para que Cloudflare los reconozca
    lovableViteConfig({
      tanstackStart: {
        server: { entry: "server" }
      }
    })
  ]
});
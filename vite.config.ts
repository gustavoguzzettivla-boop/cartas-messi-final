import { defineConfig } from "vite";
import { tanstackViteConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  plugins: [
    tanstackViteConfig({
      // Esto le dice a Vite cómo manejar el servidor de TanStack Start
      tanstackStart: {
        server: { entry: "server" }
      }
    })
  ]
});
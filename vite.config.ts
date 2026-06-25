import { defineConfig } from "vite";
import config from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  plugins: [
    config({
      tanstackStart: {
        server: { entry: "server" }
      }
    })
  ]
});
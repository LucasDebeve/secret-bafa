import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/secrets/",
  server: { port: 5173, host: true },
  build: { sourcemap: false },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/ (Vite config documentation)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Expose to network (Network ma expose garne)
  },
});

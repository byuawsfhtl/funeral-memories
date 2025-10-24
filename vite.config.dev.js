import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Remove proxy to avoid connection errors
    // API calls will fail but the UI will still render
  },
});

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const base = process.env.VERCEL ? "/" : "/kstack-ai/";

export default defineConfig({
  base,
  plugins: [react()],
});

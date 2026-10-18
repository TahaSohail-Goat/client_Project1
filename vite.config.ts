import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          const path = id.replaceAll("\\", "/");
          if (/node_modules\/(three|@react-three|three-stdlib)/.test(path))
            return "model-experience";
          if (/node_modules\/(react|react-dom|scheduler)\//.test(path))
            return "react-vendor";
          if (
            /node_modules\/(motion|framer-motion|motion-dom|motion-utils)\//.test(
              path,
            )
          )
            return "motion";
          if (/node_modules\/gsap\//.test(path)) return "scroll";
        },
      },
    },
  },
});

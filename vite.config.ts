import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: { manualChunks: (id) => {
        if (/node_modules\/(three|@react-three|three-stdlib)/.test(id.replaceAll('\\', '/'))) return 'model-experience';
      } }
    }
  }
});

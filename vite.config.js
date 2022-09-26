import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue': 'vue/dist/vue.esm-bundler.js',     // Required for runtime templates
    }
  },
  build: {
    rollupOptions: {
        // input: ['./testing.html'],
        output: {
            entryFileNames: 'feedreader.js',
            format: 'umd',
            inlineDynamicImports: true, // Must be true to build to umd
        },
    }
},
})

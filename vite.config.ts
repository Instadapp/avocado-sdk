import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), dts()],
  build: {
    lib: {
      formats: ["es", 'cjs'],
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'AvocadoSafe',
      // the proper extensions will be added
      fileName: 'avocado-safe',
    },
    rollupOptions: {
      external: ["@instadapp/avocado", "@ethersproject/providers", "@ethersproject/bignumber", "mitt", "vue", /@web3-react/],
      output: {
          // Provide global variables to use in the UMD build
          // for externalized deps
          globals: {
            vue: 'Vue',
          },
      },
    },
  }
})
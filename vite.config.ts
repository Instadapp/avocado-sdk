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
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AvocadoSafe',
      // the proper extensions will be added
      fileName: 'avocado-safe',
    },
    rollupOptions: {
      external: [/@ethersproject/, "ethers", /@vue/, /@web3-react/],
    },
  }
})
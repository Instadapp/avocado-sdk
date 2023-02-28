import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue(), dts()],
    define: {
      __AVOCADO_CHAIN_ID__: parseInt(env.AVOCADO_CHAIN_ID || "634"),
      __AVOCADO_RPC__: JSON.stringify(env.AVOCADO_RPC || "https://rpc.avocado.instadapp.io"),
    },
    build: {
      lib: {
        formats: ["es", 'cjs'],
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'Avocado',
        // the proper extensions will be added
        fileName: 'avocado',
      },
      rollupOptions: {
        external: [/@ethersproject/, "ethers", /@vue/, /@web3-react/, "semver"],
      },
    }
  }
})
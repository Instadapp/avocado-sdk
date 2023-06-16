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
      __AVOCADO_AUTHORITIES_LIST_PROXY_ADDRESS__: JSON.stringify(env.AVOCADO_AUTHORITIES_LIST_PROXY_ADDRESS || "todo"),
      __AVOCADO_DEPOSIT_MANAGER_PROXY_ADDRESS__: JSON.stringify(env.AVOCADO_DEPOSIT_MANAGER_PROXY_ADDRESS || "0x093Ee278B874a969c7580F89bb7BA038c03aCd1E"),
      __AVOCADO_FACTORY_PROXY_ADDRESS__: JSON.stringify(env.AVOCADO_FACTORY_PROXY_ADDRESS || "0x3AdAE9699029AB2953F607AE1f62372681D35978"),
      __AVOCADO_FORWARDER_PROXY_ADDRESS__: JSON.stringify(env.AVOCADO_FORWARDER_PROXY_ADDRESS || "0x375F6B0CD12b34Dc28e34C26853a37012C24dDE5"),
      __AVOCADO_GAS_ESTIMATIONS_HELPER_ADDRESS__: JSON.stringify(env.AVOCADO_GAS_ESTIMATIONS_HELPER_ADDRESS || "todo"),
      __AVOCADO_SIGNERS_LIST_PROXY_ADDRESS__: JSON.stringify(env.AVOCADO_SIGNERS_LIST_PROXY_ADDRESS || "todo"),
      __AVOCADO_VERSIONS_REGISTRY_PROXY_ADDRESS__: JSON.stringify(env.AVOCADO_VERSIONS_REGISTRY_ADDRESS || "0xfbF28161ae33f492250aA12117E7a3F4593B7Aa1"),
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
import { createSafe } from '@instadapp/avocado'
import { Web3Provider, StaticJsonRpcProvider } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import { register } from "./customElement"
import { bridge } from "./bridge"

declare global {
  interface Window {
    ethereum: any
  }
}
export const RPC_URLS: { [chainId: number]: string } = {
  1: 'https://rpc.ankr.com/eth',
  137: 'https://rpc.ankr.com/polygon',
  43114: 'https://rpc.ankr.com/avalanche',
  250: 'https://rpc.ankr.com/fantom',
  10: 'https://rpc.ankr.com/optimism',
  42161: 'https://rpc.ankr.com/arbitrum',
  75: 'https://rpc.avocado.link',
  100: 'https://rpc.ankr.com/gnosis',
  56: 'https://rpc.ankr.com/bsc'
}

const rpcInstances: Record<string, StaticJsonRpcProvider> = {}

export const getRpcProvider = (chainId: number | string) => {
  if (!rpcInstances[chainId]) {
    rpcInstances[chainId] = new StaticJsonRpcProvider(RPC_URLS[Number(chainId)])
  }

  return rpcInstances[chainId]
}

export class AvocadoSafeProvider {
  isMetaMask: boolean = true

  #safe: ReturnType<typeof createSafe>
  #ethereum: any
  #chainId: number

  constructor({ chainId }: { chainId: number }) {
    this.#ethereum = window.ethereum
    const provider = new Web3Provider(window.ethereum)

    this.#safe = createSafe(provider.getSigner())
    this.#chainId = chainId
  }

  async request(request: { method: string, params?: Array<any> }) {
    console.log({ request })
    if (request.method === 'eth_getBalance') {
      return '0x0de0b6b3a7640000' // get avo balance and convert it to eth/matic?
    } else if (request.method === 'eth_requestAccounts') {
      await this.#ethereum.request(request)

      return [await this.#safe.getSafeAddress()]
    } else if (request.method === 'eth_accounts') {
      await this.#ethereum.request(request)

      return [await this.#safe.getSafeAddress()]
    } else if (request.method === 'eth_sendTransaction') {
      this.#registerUiBridge();
      if (!request.params) {
        return '0x'
      }

      const { gasLimit } = await bridge.request('sendTransaction', {
        details: request.params[0]
      })

      await this.#switchToAvoNetwork()

      const hash = await this.#safe.sendTransaction({
        ...request.params[0],
        chainId: this.#chainId,
        gasLimit: gasLimit || '8000000'
      })

      return hash.hash
    } else if (request.method === 'wallet_switchEthereumChain') {
      if (!request.params) {
        return;
      }

      let chainId =  BigNumber.from(request.params[0].chainId).toNumber() 

      if(chainId === 75) return;

      this.#chainId = chainId

      return null;
    }
    // return await this.#ethereum.request(request)
    return await getRpcProvider(this.#chainId).send(request.method, request.params || [])
  }

  async #switchToAvoNetwork() {
    try {
      await this.#ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x4b' }]
      })
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await this.#ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName: 'Avocado Network',
                nativeCurrency: {
                  name: 'Avocado',
                  symbol: 'USDC',
                  decimals: 18
                },
                rpcUrls: ['https://rpc.avocado.link/']
              }
            ]
          })
        } catch (addError) {
        }
      }
    }
  }

  #registerUiBridge() {
    register()
  }

  async enable() {
    this.#registerUiBridge();

    return await this.request({ method: 'eth_requestAccounts' })
  }

  get safe(): ReturnType<typeof createSafe> {
    return this.#safe
  }
}

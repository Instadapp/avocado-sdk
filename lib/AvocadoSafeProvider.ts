import { createSafe } from './signer'
import { Web3Provider, StaticJsonRpcProvider } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import { register } from "./customElement"
import { bridge } from "./bridge"
import { getRpcProvider } from "./providers"
import { EventEmitter } from 'events';


declare global {
  interface Window {
    ethereum: any
  }
}

export class AvocadoSafeProvider extends EventEmitter {
  isMetaMask: boolean = true

  #safe: ReturnType<typeof createSafe>
  #ethereum: any
  #chainId: number
  #avoNetworkProvider: StaticJsonRpcProvider

  constructor({ chainId }: { chainId: number }) {
    super();

    this.#ethereum = window.ethereum
    const provider = new Web3Provider(window.ethereum, "any")

    this.#safe = createSafe(provider.getSigner())
    this.#chainId = chainId
    this.#avoNetworkProvider = getRpcProvider(75)
  }

  getChainId() {
    return this.#chainId;
  }

  async request(request: { method: string, params?: Array<any> }) {
    if (request.method === 'eth_getBalance') {
      const usdcBalance = await this.#avoNetworkProvider.getBalance(await this.#safe.getOwnerddress())

      return usdcBalance.toHexString() // convert it to eth/matic/avax
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

      let chainId = BigNumber.from(request.params[0].chainId).toNumber()

      if (chainId === 75) return;

      this.#chainId = chainId


      this.emit("networkChanged", chainId)
      this.emit("chainChanged", chainId)

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

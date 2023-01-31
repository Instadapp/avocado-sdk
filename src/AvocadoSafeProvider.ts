import { createSafe } from './signer'
import { Web3Provider, StaticJsonRpcProvider } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import { register, unregister } from "./customElement"
import { bridge } from "./bridge"
import { getRpcProvider } from "./providers"
import { EventEmitter } from 'events';


declare global {
  interface Window {
    ethereum: any
  }
}

const CHAIN_USDC_ADDRESSES: any = {
  "137": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  "10": "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
  "42161": "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
  "1": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "43114": "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
  "100": "0xddafbb505ad214d7b80b1f830fccc89b60fb7a83",
  "56": "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
}

const usdcToNativeAmount = async (amountInWei: BigNumber, chainId: number) => {
  return amountInWei.toString()
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
    this.#avoNetworkProvider = getRpcProvider(634)
  }

  getChainId() {
    return this.#chainId;
  }

  get avoNetworkProvider() {
    return this.#avoNetworkProvider
  }

  async request(request: { method: string, params?: Array<any> }) {
    if (request.method === 'eth_getBalance') {
      //@ts-ignore
      const usdcBalance = await this.#avoNetworkProvider.getBalance(...request.params)
      const amount = await usdcToNativeAmount(usdcBalance, this.#chainId);

      return BigNumber.from(amount).toHexString()
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

      await this.#switchToAvoNetwork()

      const response = await bridge.request('sendTransaction', {
        raw: request.params[0],
        chainId: this.#chainId,
        signer: await this.#safe.getOwnerddress(),
        message: await this.safe.generateSignatureMessage([
          request.params[0],
        ], this.#chainId)
      })

      if (!response) {
        throw Error("Transaction cancelled")
      }

      const { gasLimit, source, validUntil, metadata } = response

      const hash = await this.#safe.sendTransaction({
        ...request.params[0],
        chainId: this.#chainId,
        gasLimit: gasLimit || '8000000',
        source: source || '0x0000000000000000000000000000000000000001',
        metadata: metadata || '0x',
        validUntil: validUntil || '0',
      })

      return hash.hash
    } else if (request.method === 'wallet_switchEthereumChain') {
      if (!request.params) {
        return;
      }

      let chainId = BigNumber.from(request.params[0].chainId).toNumber()

      if (chainId === 634) return;

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
        params: [{ chainId: '0x27a' }]
      })
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await this.#ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x27a',
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
    register(this)
  }

  async enable() {
    this.#registerUiBridge();

    const accounts = await this.request({ method: 'eth_requestAccounts' })

    bridge.setAvocadoSafeProvider(this)

    return accounts;
  }

  async dispose() {
    unregister()
  }

  async disconnect() {
    this.dispose()
  }

  async close() {
    this.dispose()
  }

  get safe(): ReturnType<typeof createSafe> {
    return this.#safe
  }
}

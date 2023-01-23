import type { AbstractConnectorArguments, ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import warning from 'tiny-warning'
import { AvocadoSafeProvider } from './AvocadoSafeProvider'

export type SendReturnResult = { result: any }
export type SendReturn = any

export type Send = (method: string, params?: any[]) => Promise<SendReturnResult | SendReturn>
export type SendOld = ({ method }: { method: string }) => Promise<SendReturnResult | SendReturn>

function parseSendReturn(sendReturn: SendReturnResult | SendReturn): any {
  // eslint-disable-next-line no-prototype-builtins
  return sendReturn.hasOwnProperty('result') ? sendReturn.result : sendReturn
}

export class NoEthereumProviderError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'No Ethereum provider was found on window.ethereum.'
  }
}

export class UserRejectedRequestError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'The user rejected the request.'
  }
}

export class AvocadoInjectedConnector extends AbstractConnector {
  #provider?: AvocadoSafeProvider
  #initialChainId: number

  constructor(kwargs: AbstractConnectorArguments & { chainId: number }) {
    super(kwargs)

    this.#initialChainId = kwargs.chainId

    this.handleNetworkChanged = this.handleNetworkChanged.bind(this)
    this.handleChainChanged = this.handleChainChanged.bind(this)
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  private handleChainChanged(chainId: string | number): void {
    this.emitUpdate({ chainId, provider: this.#provider })
  }

  private handleAccountsChanged(accounts: string[]): void {
    if (accounts.length === 0) {
      this.emitDeactivate()
    } else {
      this.emitUpdate({ account: accounts[0] })
    }
  }

  private handleClose(_code: number, _reason: string): void {
    this.emitDeactivate()
  }

  private handleNetworkChanged(networkId: string | number): void {
    this.emitUpdate({ chainId: networkId, provider: this.#provider })
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!window.ethereum) {
      throw new NoEthereumProviderError()
    }

    this.#provider = new AvocadoSafeProvider({ chainId: this.#initialChainId })

    if (window.ethereum.on) {
      window.ethereum.on('accountsChanged', this.handleAccountsChanged)
      window.ethereum.on('close', this.handleClose)
    }

    if(this.#provider.on) {
      this.#provider.on('chainChanged', this.handleChainChanged)
      this.#provider.on('networkChanged', this.handleNetworkChanged)
    }

    if ((window.ethereum as any).isMetaMask) {
      ; (window.ethereum as any).autoRefreshOnNetworkChange = false
    }

    // try to activate + get account via eth_requestAccounts
    let account
    try {
      account = await this.#provider.request({ method: 'eth_requestAccounts' }).then(
        sendReturn => parseSendReturn(sendReturn)[0]
      )
    } catch (error) {
      if ((error as any).code === 4001) {
        throw new UserRejectedRequestError()
      }
      warning(false, 'eth_requestAccounts was unsuccessful, falling back to enable')
    }

    // if unsuccessful, try enable
    if (!account) {
      // if enable is successful but doesn't return accounts, fall back to getAccount (not happy i have to do this...)
      account = await this.#provider.enable().then((sendReturn: any) => sendReturn && parseSendReturn(sendReturn)[0])
    }

    return { provider: this.#provider, ...(account ? { account } : {}) }
  }

  public async getProvider(): Promise<any> {
    return await this.#provider
  }

  public async getChainId(): Promise<number | string> {
    return await Promise.resolve(this.#provider ? this.#provider.getChainId() : this.#initialChainId)
  }

  public async getAccount(): Promise<null | string> {
    if (!this.#provider) {
      throw new NoEthereumProviderError()
    }

    return await this.#provider.safe.getSafeAddress()
  }

  public deactivate() {
    if (window.ethereum && window.ethereum.removeListener) {
      window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged)
      window.ethereum.removeListener('close', this.handleClose)
    }


    if(this.#provider && this.#provider.removeListener) {
      this.#provider.removeListener('chainChanged', this.handleChainChanged)
      this.#provider.removeListener('networkChanged', this.handleNetworkChanged)
    }

    if(this.#provider) {
      this.#provider.dispose()
    }
  }

  public async isAuthorized(): Promise<boolean> {
    if (!this.#provider) {
      return false
    }

    return !!await this.#provider.safe.getSafeAddress()
  }
}

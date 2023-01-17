/* eslint-disable camelcase */
import { TransactionResponse, Provider, TransactionRequest } from '@ethersproject/abstract-provider'
import { Signer, TypedDataDomain, TypedDataField, TypedDataSigner } from '@ethersproject/abstract-signer'
import { Deferrable } from '@ethersproject/properties'
import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { keccak256 } from '@ethersproject/solidity'
import { BigNumber } from 'ethers'
import { GaslessWallet, Forwarder, GaslessWallet__factory, Forwarder__factory } from './contracts'
import { getRpcProvider } from './providers'

const forwardsInstances: Record<number, Forwarder> = {}

export const getForwarderContract = (chainId: number) => {
  if (!forwardsInstances[chainId]) {
    forwardsInstances[chainId] = Forwarder__factory.connect('0x375F6B0CD12b34Dc28e34C26853a37012C24dDE5', getRpcProvider(chainId))
  }

  return forwardsInstances[chainId]
}

interface SignatureOption {
  metadata?: string
  source?: string
  validUntil?: string
}

class AvoSigner extends Signer implements TypedDataSigner {
  _gaslessWallet?: GaslessWallet
  _polygonForwarder: Forwarder
  _avoProvider: StaticJsonRpcProvider
  private _chainId: Promise<number> | undefined
  public customChainId: number | undefined

  constructor (readonly signer: Signer, readonly provider = signer.provider) {
    super()
    this._polygonForwarder = getForwarderContract(137)
    this._avoProvider = getRpcProvider(634)
  }

  async _signTypedData (domain: TypedDataDomain, types: Record<string, TypedDataField[]>, value: Record<string, any>): Promise<string> {
    if ('_signTypedData' in this.signer) {
      // @ts-ignore
      return await this.signer._signTypedData(domain, types, value)
    }

    throw new Error('_signTypedData is not supported')
  }

  async syncAccount (): Promise<void> {
    if (!this._gaslessWallet) {
      const owner = await this.getOwnerAddress()
      const safeAddress = await this._polygonForwarder.computeAddress(owner)

      this._gaslessWallet = GaslessWallet__factory.connect(safeAddress, this.signer)
    }

    if (this.provider) { this._chainId = this.provider.getNetwork().then(net => net.chainId) }
  }

  async getAddress (): Promise<string> {
    await this.syncAccount()
    return this._gaslessWallet!.address
  }

  async getOwnerAddress (): Promise<string> {
    return await this.signer.getAddress()
  }

  async sendTransaction (transaction: Deferrable<TransactionRequest>, options?: SignatureOption): Promise<TransactionResponse> {
    await this.syncAccount()

    if (await this._chainId !== 634) {
      throw new Error('Signer provider chain id should be 634')
    }

    const chainId: number | undefined = this.customChainId || (await transaction.chainId)

    if (!chainId) {
      throw new Error('Chain ID is required')
    }

    const owner = await this.getOwnerAddress()

    const forwarder = getForwarderContract(chainId)

    const gswNonce = await forwarder.avoSafeNonce(owner).then(String)

    const signatureData = {
      actions: [
        {
          target: transaction.to,
          data: transaction.data || '0x',
          value: transaction.value ? transaction.value.toString() : '0'
        }
      ],
      metadata: options && options.metadata ? options.metadata : '0x',
      source: options && options.source ? options.source : '0x0000000000000000000000000000000000000001',
      gswNonce,
      validUntil: options && options.validUntil ? options.validUntil : '0',
      gas: transaction.gasLimit ? transaction.gasLimit.toString() : '8000000'
    }

    const signature = await this._buildValidSignature({
      ...signatureData,
      chainId
    })

    const transactionHash = await this._avoProvider.send('txn_broadcast', [
      signature,
      signatureData,
      owner,
      String(chainId),
      false
    ])

    if (transactionHash === '0x') {
      throw new Error('Tx failed!')
    }

    await new Promise(resolve => setTimeout(resolve, 2000))

    let tx = await getRpcProvider(chainId).getTransaction(transactionHash)

    if (!tx) {
      tx = await new Promise(resolve => setTimeout(resolve, 2000))
    }

    if (!tx) {
      tx = await new Promise(resolve => setTimeout(resolve, 2000))
    }

    if (tx) { return tx }

    return {
      from: owner,
      nonce: 0,
      confirmations: 0,
      chainId,
      data: '0x',
      gasLimit: BigNumber.from(0),
      value: BigNumber.from(0),
      hash: transactionHash,
      wait: async (confirmations?: number) => {
        return await getRpcProvider(chainId).waitForTransaction(transactionHash, confirmations || 0)
      }
    }
  }

  async sendTransactions (transactions: Deferrable<TransactionRequest>[], targetChainId: Deferrable<number>, options?: SignatureOption): Promise<TransactionResponse> {
    await this.syncAccount()

    if (await this._chainId !== 634) {
      throw new Error('Signer provider chain id should be 634')
    }

    const chainId: number | undefined = this.customChainId || (await targetChainId)

    if (!chainId) {
      throw new Error('Chain ID is required')
    }

    const owner = await this.getOwnerAddress()

    const forwarder = getForwarderContract(chainId)

    const gswNonce = await forwarder.avoSafeNonce(owner).then(String)

    const signatureData = {
      actions: transactions.map(transaction => (
        {
          target: transaction.to,
          data: transaction.data || '0x',
          value: transaction.value ? transaction.value.toString() : '0'
        }
      )),
      metadata: options && options.metadata ? options.metadata : '0x',
      source: options && options.source ? options.source : '0x0000000000000000000000000000000000000001',
      gswNonce,
      validUntil: options && options.validUntil ? options.validUntil : '0',
      gas: transactions.reduce((acc, curr) => {
        return acc.add(curr.gasLimit ? curr.gasLimit.toString() : '8000000')
      }, BigNumber.from(0)).toString()
    }

    const signature = await this._buildValidSignature({
      ...signatureData,
      chainId
    })

    const transactionHash = await this._avoProvider.send('txn_broadcast', [
      signature,
      signatureData,
      owner,
      String(chainId),
      false
    ])

    if (transactionHash === '0x') {
      throw new Error('Tx failed!')
    }

    await new Promise(resolve => setTimeout(resolve, 2000))

    let tx = await getRpcProvider(chainId).getTransaction(transactionHash)

    if (!tx) {
      tx = await new Promise(resolve => setTimeout(resolve, 2000))
    }

    if (!tx) {
      tx = await new Promise(resolve => setTimeout(resolve, 2000))
    }

    if (tx) { return tx }

    return {
      from: owner,
      nonce: 0,
      confirmations: 0,
      chainId,
      data: '0x',
      gasLimit: BigNumber.from(0),
      value: BigNumber.from(0),
      hash: transactionHash,
      wait: async (confirmations?: number) => {
        return await getRpcProvider(chainId).waitForTransaction(transactionHash, confirmations || 0)
      }
    }
  }

  signMessage (_message: any): Promise<string> {
    throw new Error('Method not implemented.')
  }

  signTransaction (_transaction: any): Promise<string> {
    throw new Error('Method not implemented.')
  }

  connect (_provider: Provider): Signer {
    return this
  }

  async _buildValidSignature ({
    actions,
    validUntil,
    gas,
    source,
    metadata,
    gswNonce
    , chainId
  }: { chainId: number, validUntil: string, metadata: string, gswNonce: string, source: string, gas: string, actions: any[] }): Promise<string> {
    await this.syncAccount()

    let name = 'Instadapp-Gasless-Smart-Wallet'
    let version = '1.0.0'

    const forwarder = getForwarderContract(chainId)

    try {
      version = await this._gaslessWallet!.DOMAIN_SEPARATOR_VERSION()
      name = await this._gaslessWallet!.DOMAIN_SEPARATOR_NAME()
    } catch (error) {
      version = await forwarder.avoWalletVersion('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
      name = await forwarder.avoWalletVersionName('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
    }

    // Creating domain for signing using gasless wallet address as the verifying contract
    const domain = {
      name,
      version,
      chainId: '634',
      salt: keccak256(['uint256'], [chainId]),
      verifyingContract: await this.getAddress()
    }

    // The named list of all type definitions
    const types = {
      Cast: [
        { name: 'actions', type: 'Action[]' },
        { name: 'validUntil', type: 'uint256' },
        { name: 'gas', type: 'uint256' },
        { name: 'source', type: 'address' },
        { name: 'metadata', type: 'bytes' },
        { name: 'gswNonce', type: 'uint256' }
      ],
      Action: [
        { name: 'target', type: 'address' },
        { name: 'data', type: 'bytes' },
        { name: 'value', type: 'uint256' }
      ]
    }

    // Adding values for types mentioned
    const value = {
      actions,
      validUntil,
      gas,
      source,
      metadata,
      gswNonce
    }

    return await this._signTypedData(domain, types, value)
  }
}

export function createSafe (signer: Signer, provider = signer.provider) {
  if (!provider) {
    throw new Error('Provider')
  }

  const avoSigner = new AvoSigner(
    signer,
    provider
  )

  return {
    getSigner () {
      return avoSigner
    },

    async sendTransactions (transactions: Deferrable<TransactionRequest>[], targetChainId: number): Promise<TransactionResponse> {
      return await avoSigner.sendTransactions(transactions, targetChainId)
    },

    async sendTransaction (transaction: Deferrable<TransactionRequest>, targetChainId?: number): Promise<TransactionResponse> {
      return await avoSigner.sendTransaction({
        ...transaction,
        chainId: targetChainId || await transaction.chainId
      })
    },

    getSignerForChainId (chainId: number | string) {
      return new Proxy(avoSigner, {
        get (target, p, receiver) {
          if (p === 'customChainId') {
            return Number(chainId)
          }

          return Reflect.get(target, p, receiver)
        }
      })
    },

    async getOwnerddress () {
      return await signer.getAddress()
    },

    async getSafeAddress () {
      return await avoSigner.getAddress()
    }
  }
}

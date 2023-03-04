/* eslint-disable camelcase */
import { TransactionResponse, Provider, TransactionRequest } from '@ethersproject/abstract-provider'
import { Signer, TypedDataDomain, TypedDataField, TypedDataSigner } from '@ethersproject/abstract-signer'
import { Deferrable } from '@ethersproject/properties'
import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { keccak256 } from '@ethersproject/solidity'
import { BigNumber } from 'ethers'
import { GaslessWallet, Forwarder, GaslessWallet__factory, Forwarder__factory } from './contracts'
import { getRpcProvider } from './providers'
import { parse } from 'semver';
import { AVOCADO_CHAIN_ID } from './config'

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
  gas?: string
  id?: string
  avoSafeNonce?: string | number
}

type RawTransaction = TransactionRequest & { operation?: string }

const typesV1 = {
  Cast: [
    { name: "actions", type: "Action[]" },
    { name: "validUntil", type: "uint256" },
    { name: "gas", type: "uint256" },
    { name: "source", type: "address" },
    { name: "metadata", type: "bytes" },
    { name: "avoSafeNonce", type: "uint256" },
  ],
  Action: [
    { name: "target", type: "address" },
    { name: "data", type: "bytes" },
    { name: "value", type: "uint256" },
  ],
}

const typesV2 = {
  Cast: [
    { name: "actions", type: "Action[]" },
    { name: "params", type: "CastParams" },
    { name: "avoSafeNonce", type: "uint256" },
  ],
  Action: [
    { name: "target", type: "address" },
    { name: "data", type: "bytes" },
    { name: "value", type: "uint256" },
    { name: "operation", type: "uint256" },
  ],
  CastParams: [
    { name: "validUntil", type: "uint256" },
    { name: "gas", type: "uint256" },
    { name: "source", type: "address" },
    { name: "id", type: "uint256" },
    { name: "metadata", type: "bytes" },
  ],
};

class AvoSigner extends Signer implements TypedDataSigner {
  _gaslessWallet?: GaslessWallet
  _polygonForwarder: Forwarder
  _avoProvider: StaticJsonRpcProvider
  private _chainId: Promise<number> | undefined
  public customChainId: number | undefined

  constructor(readonly signer: Signer, readonly provider = signer.provider) {
    super()
    this._polygonForwarder = getForwarderContract(137)
    this._avoProvider = getRpcProvider(AVOCADO_CHAIN_ID)
  }

  async _signTypedData(domain: TypedDataDomain, types: Record<string, TypedDataField[]>, value: Record<string, any>): Promise<string> {
    if ('_signTypedData' in this.signer) {
      // @ts-ignore
      return await this.signer._signTypedData(domain, types, value)
    }

    throw new Error('_signTypedData is not supported')
  }

  async syncAccount(): Promise<void> {
    if (!this._gaslessWallet) {
      const owner = await this.getOwnerAddress()
      const safeAddress = await this._polygonForwarder.computeAddress(owner)

      this._gaslessWallet = GaslessWallet__factory.connect(safeAddress, this.signer)
    }

    if (this.provider) { this._chainId = this.provider.getNetwork().then(net => net.chainId) }
  }

  async getGaslessWallet(targetChainId: number) {
    const owner = await this.getOwnerAddress()
    const safeAddress = await this._polygonForwarder.computeAddress(owner)
    return GaslessWallet__factory.connect(safeAddress, getRpcProvider(targetChainId))
  }

  async getAddress(): Promise<string> {
    await this.syncAccount()
    return this._gaslessWallet!.address
  }

  async getOwnerAddress(): Promise<string> {
    return await this.signer.getAddress()
  }


  async getSafeNonce(chainId: number): Promise<string> {
    const forwarder = getForwarderContract(chainId)

    const owner = await this.getOwnerAddress()

    const avoSafeNonce = await forwarder.avoSafeNonce(owner).then(String)

    return avoSafeNonce
  }


  async generateSignatureMessage(transactions: Deferrable<RawTransaction>[], targetChainId: number, options?: SignatureOption) {
    await this.syncAccount()

    const forwarder = getForwarderContract(targetChainId)

    const avoSafeNonce = options && typeof options.avoSafeNonce !== 'undefined' ? String(options.avoSafeNonce) : await this.getSafeNonce(targetChainId)

    let version;

    let targetChainGaslessWallet = await this.getGaslessWallet(targetChainId);

    try {
      version = await targetChainGaslessWallet.DOMAIN_SEPARATOR_VERSION()
    } catch (error) {
      version = await forwarder.avoWalletVersion('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
    }

    const versionMajor = parse(version)?.major || 1;
    const isV2 = versionMajor === 2;

    if (isV2) {
      return {
        actions: transactions.map(transaction => (
          {
            operation: transaction.operation || "0",
            target: transaction.to,
            data: transaction.data || '0x',
            value: transaction.value ? transaction.value.toString() : '0'
          }
        )),
        params: {
          metadata: options && options.metadata ? options.metadata : '0x',
          source: options && options.source ? options.source : '0x0000000000000000000000000000000000000001',
          id: options && options.id ? options.id : '0',
          validUntil: options && options.validUntil ? options.validUntil : '0',
          gas: options && options.gas ? options.gas : '0',
        },
        avoSafeNonce,
      }
    }


    return {
      actions: transactions.map(transaction => (
        {
          target: transaction.to,
          data: transaction.data || '0x',
          value: transaction.value ? transaction.value.toString() : '0'
        }
      )),
      metadata: options && options.metadata ? options.metadata : '0x',
      source: options && options.source ? options.source : '0x0000000000000000000000000000000000000001',
      avoSafeNonce,
      validUntil: options && options.validUntil ? options.validUntil : '0',
      // gas: transactions.reduce((acc, curr) => {
      //   return acc.add(curr.gasLimit ? curr.gasLimit.toString() : '8000000')
      // }, BigNumber.from(0)).toString(),
      gas: options && options.gas ? options.gas : '0',
    }
  }

  async sendTransaction(transaction: Deferrable<RawTransaction>, options?: SignatureOption): Promise<TransactionResponse> {
    return await this.sendTransactions([transaction], await transaction.chainId, options);
  }

  async sendTransactions(transactions: Deferrable<RawTransaction>[], targetChainId?: Deferrable<number>, options?: SignatureOption): Promise<TransactionResponse> {
    await this.syncAccount()

    if (await this._chainId !== AVOCADO_CHAIN_ID) {
      throw new Error(`Signer provider chain id should be ${AVOCADO_CHAIN_ID}`)
    }

    const chainId: number | undefined = this.customChainId || (await targetChainId)

    if (!chainId) {
      throw new Error('Chain ID is required')
    }

    const owner = await this.getOwnerAddress()

    const message = await this.generateSignatureMessage(
      transactions,
      chainId,
      options
    );

    const signature = await this._buildValidSignature({
      message,
      chainId
    })

    const transactionHash = await this._avoProvider.send('txn_broadcast', [
      signature,
      message,
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

  signMessage(_message: any): Promise<string> {
    throw new Error('Method not implemented.')
  }

  signTransaction(_transaction: any): Promise<string> {
    throw new Error('Method not implemented.')
  }

  connect(_provider: Provider): Signer {
    return this
  }

  async _buildValidSignature({
    message,
    chainId,
  }: {
    message: any,
    chainId: number,
  }): Promise<string> {
    await this.syncAccount()

    let name;
    let version;

    const forwarder = getForwarderContract(chainId)
    let targetChainGaslessWallet = await this.getGaslessWallet(chainId);

    try {
      version = await targetChainGaslessWallet.DOMAIN_SEPARATOR_VERSION()
      name = await targetChainGaslessWallet.DOMAIN_SEPARATOR_NAME()
    } catch (error) {
      version = await forwarder.avoWalletVersion('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
      name = await forwarder.avoWalletVersionName('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
    }

    const versionMajor = parse(version)?.major || 1;
    const isV2 = versionMajor === 2;

    // Creating domain for signing using gasless wallet address as the verifying contract
    const domain = {
      name,
      version,
      chainId: String(AVOCADO_CHAIN_ID),
      salt: keccak256(['uint256'], [chainId]),
      verifyingContract: await this.getAddress()
    }

    // The named list of all type definitions
    const types = isV2 ? typesV2 : typesV1

    // Adding values for types mentioned
    const value = message

    return await this._signTypedData(domain, types, value)
  }
}

export function createSafe(signer: Signer, provider = signer.provider) {
  if (!provider) {
    throw new Error('Provider')
  }

  const avoSigner = new AvoSigner(
    signer,
    provider
  )

  return {
    getSigner() {
      return avoSigner
    },

    async generateSignatureMessage(transactions: Deferrable<RawTransaction>[], targetChainId: number, options?: SignatureOption) {
      return await avoSigner.generateSignatureMessage(transactions, targetChainId, options)
    },

    async sendTransactions(transactions: Deferrable<RawTransaction>[], targetChainId: number, options?: SignatureOption): Promise<TransactionResponse> {
      return await avoSigner.sendTransactions(transactions, targetChainId, options)
    },

    async sendTransaction(transaction: Deferrable<RawTransaction>, targetChainId?: number, options?: SignatureOption): Promise<TransactionResponse> {
      return await avoSigner.sendTransaction({
        ...transaction,
        chainId: targetChainId || await transaction.chainId
      }, options)
    },

    getSignerForChainId(chainId: number | string) {
      return new Proxy(avoSigner, {
        get(target, p, receiver) {
          if (p === 'customChainId') {
            return Number(chainId)
          }

          return Reflect.get(target, p, receiver)
        }
      })
    },

    async getOwnerddress() {
      return await signer.getAddress()
    },

    async getSafeAddress() {
      return await avoSigner.getAddress()
    },

    async getSafeNonce(chainId: number | string) {
      return await avoSigner.getSafeNonce(Number(chainId))
    }
  }
}

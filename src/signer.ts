/* eslint-disable camelcase */
import { TransactionResponse, Provider, TransactionRequest } from '@ethersproject/abstract-provider'
import { Signer, TypedDataDomain, TypedDataField, TypedDataSigner } from '@ethersproject/abstract-signer'
import { Deferrable } from '@ethersproject/properties'
import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { keccak256 } from '@ethersproject/solidity'
import { BigNumber, constants } from 'ethers'
import { AvoWallet, AvoWallet__factory, AvoForwarder, AvoForwarder__factory } from './contracts'
import { getRpcProvider } from './providers'
import { parse } from 'semver';
import { AVOCADO_CHAIN_ID, AVOCADO_FORWARDER_PROXY_ADDRESS } from './config'
import { signTypedData } from './utils/signTypedData'
import { AvoCoreStructs, IAvoWalletV1, IAvoWalletV2 } from './contracts/AvoForwarder'

const forwardsInstances: Record<number, AvoForwarder> = {}

export const getForwarderContract = (chainId: number) => {
  if (!forwardsInstances[chainId]) {
    forwardsInstances[chainId] = AvoForwarder__factory.connect(AVOCADO_FORWARDER_PROXY_ADDRESS, getRpcProvider(chainId))
  }

  return forwardsInstances[chainId]
}

export interface SignatureOption {
  /** generic additional metadata */
  metadata?: string;
  /** source address for referral system */
  source?: string;
  /** time in seconds until which the signature is valid and can be executed */
  validUntil?: string;
  /** time in seconds after which the signature is valid and can be executed */
  validAfter?: string;
  /** minimum amount of gas that the relayer (AvoForwarder) is expected to send along for successful execution */
  gas?: string;
  /** maximum gas price at which the signature is valid and can be executed. Not implemented yet. */
  gasPrice?: string;
  /** id for actions, e.g. 0 = CALL, 1 = MIXED (call and delegatecall), 20 = FLASHLOAN_CALL, 21 = FLASHLOAN_MIXED. 
   *  Default value of 0 will work for all most common use-cases. */
  id?: string;
  /** sequential avoSafeNonce as current value on the smart wallet contract or set to `-1`to use a non-sequential nonce. 
   *  Leave value as undefined to automatically use the next sequential nonce. */
  avoSafeNonce?: string | number;
  /** salt to customize non-sequential nonce (if `avoSafeNonce` is set to -1) */
  salt?: string;
  /** address of the Avocado smart wallet */
  safeAddress?: string;
}

export type RawTransaction = TransactionRequest & { operation?: string }

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

const typesV3 = {
  Cast: [
    { name: "params", type: "CastParams" },
    { name: "forwardParams", type: "CastForwardParams" },
  ],
  CastParams: [
    { name: "actions", type: "Action[]" },
    { name: "id", type: "uint256" },
    { name: "avoSafeNonce", type: "int256" },
    { name: "salt", type: "bytes32" },
    { name: "source", type: "address" },
    { name: "metadata", type: "bytes" },
  ],
  Action: [
    { name: "target", type: "address" },
    { name: "data", type: "bytes" },
    { name: "value", type: "uint256" },
    { name: "operation", type: "uint256" },
  ],
  CastForwardParams: [
    { name: "gas", type: "uint256" },
    { name: "validUntil", type: "uint256" },
    { name: "validAfter", type: "uint256" },
    { name: "gasPrice", type: "uint256" },
  ],
};

class AvoSigner extends Signer implements TypedDataSigner {
  _avoWallet?: AvoWallet
  _polygonForwarder: AvoForwarder
  _avoProvider: StaticJsonRpcProvider
  private _chainId: Promise<number> | undefined
  public customChainId: number | undefined

  constructor(readonly signer: Signer, readonly provider = signer.provider, readonly ownerAddress: string | undefined = undefined) {
    super()
    this._polygonForwarder = getForwarderContract(137)
    this._avoProvider = getRpcProvider(AVOCADO_CHAIN_ID)
  }

  async _signTypedData(domain: TypedDataDomain, types: Record<string, TypedDataField[]>, value: Record<string, any>): Promise<string> {
    const result = await signTypedData(this.signer.provider as any,
      await this.getSignerAddress(),
      {
        domain,
        types,
        value
      })

    if (!result.signature) {
      throw Error("Failed to get signature");
    }

    return result.signature
  }

  async syncAccount(): Promise<void> {
    if (!this._avoWallet) {
      const owner = await this.getOwnerAddress()
      const safeAddress = await this._polygonForwarder.computeAddress(owner)

      this._avoWallet = AvoWallet__factory.connect(safeAddress, this.signer)
    }

    if (this.provider) { this._chainId = this.provider.getNetwork().then(net => net.chainId) }
  }

  async getAvoWallet(targetChainId: number) {
    const owner = await this.getOwnerAddress()
    const safeAddress = await this._polygonForwarder.computeAddress(owner)
    return AvoWallet__factory.connect(safeAddress, getRpcProvider(targetChainId))
  }

  async getAddress(): Promise<string> {
    await this.syncAccount()
    return this._avoWallet!.address
  }

  async getSignerAddress(): Promise<string> {
    return await this.signer.getAddress()
  }

  async getOwnerAddress(): Promise<string> {
    if (this.ownerAddress) {
      return this.ownerAddress
    }

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

    let targetChainAvoWallet = await this.getAvoWallet(targetChainId);

    try {
      version = await targetChainAvoWallet.DOMAIN_SEPARATOR_VERSION()
    } catch (error) {
      version = await forwarder.avoWalletVersion('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
    }

    const versionMajor = parse(version)?.major || 1;
    const isV2 = versionMajor === 2;
    const isV3 = versionMajor === 3;

    if (isV3) {
      return {
        params: {
          actions: transactions.map(transaction => (
            {
              operation: transaction.operation || "0",
              target: transaction.to,
              data: transaction.data || '0x',
              value: transaction.value ? transaction.value.toString() : '0'
            }
          )),
          metadata: options && options.metadata ? options.metadata : '0x',
          source: options && options.source ? options.source : '0x000000000000000000000000000000000000Cad0',
          id: options && options.id ? options.id : '0',
          salt: options && options.salt ? options.salt : '0x0000000000000000000000000000000000000000000000000000000000000000',
          avoSafeNonce,
        },
        forwardParams: {
          gas: options && options.gas ? options.gas : '0',
          validUntil: options && options.validUntil ? options.validUntil : '0',
          validAfter: options && options.validAfter ? options.validAfter : '0',
          gasPrice: options && options.gasPrice ? options.gasPrice : '0',
        }
      }
    }

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
          source: options && options.source ? options.source : '0x000000000000000000000000000000000000Cad0',
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
      source: options && options.source ? options.source : '0x000000000000000000000000000000000000Cad0',
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

    const message = await this.generateSignatureMessage(
      transactions,
      chainId,
      options
    );

    const signature = await this._buildValidSignature({
      message,
      chainId
    })

    return this.broadcastSignedMessage({message, chainId, signature, safeAddress: options?.safeAddress});
  }

  async broadcastSignedMessage({ message, chainId, signature, safeAddress }: { message: any, chainId: number, signature: string, safeAddress?: string }) {
    const owner = await this.getOwnerAddress()

    const transactionHash = await this._avoProvider.send('txn_broadcast', [
      {
        signature,
        message,
        signer: await this.getSignerAddress(),
        owner,
        targetChainId: String(chainId),
        dryRun: false,
        safe: safeAddress || await this.getAddress()
      }
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

  async verify({ message, chainId, signature, safeAddress }: { message: any, chainId: number, signature: string, safeAddress?: string }) {
    const forwarder = getForwarderContract(chainId)

    // get avocado wallet version
    let version;
    let targetChainAvoWallet = AvoWallet__factory.connect(
        safeAddress || await this.getAddress(), 
        getRpcProvider(chainId)
    );
    try {
      version = await targetChainAvoWallet.DOMAIN_SEPARATOR_VERSION()
    } catch (error) {
      version = await forwarder.avoWalletVersion('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
    }

    const versionMajor = parse(version)?.major || 1;
    const isV2 = versionMajor === 2;
    const isV3 = versionMajor === 3;

    // get owner of `safeAddress` for from param
    const safeOwner = await targetChainAvoWallet.owner();

    // note verify methods are expected to be called via .callStatic because otherwise they potentially
    // would deploy the wallet if it is not deployed yet 
    if(isV3) {
      return forwarder.callStatic.verifyV3(
        safeOwner, 
        message.params as AvoCoreStructs.CastParamsStruct,
        message.forwarderParams as AvoCoreStructs.CastForwardParamsStruct,
        {
          signature, 
          signer: constants.AddressZero // will need to change this to support smart contract signatures
        }
      )
    }

    if(isV2) {
      return forwarder.callStatic.verifyV2(
        safeOwner, 
        message.actions as IAvoWalletV2.ActionStruct[],
        message.params as IAvoWalletV2.CastParamsStruct,
        signature
      )
    }

    return forwarder.callStatic.verifyV1(
      safeOwner, 
      message.actions as IAvoWalletV1.ActionStruct[],
      message.validUntil,
      message.gas,
      message.source,
      message.metadata,
      signature
    )
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

  async buildSignature({ message, chainId }: { message: any, chainId: number }) {
    return await this._buildValidSignature({ message, chainId })
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
    let targetChainAvoWallet = await this.getAvoWallet(chainId);

    try {
      version = await targetChainAvoWallet.DOMAIN_SEPARATOR_VERSION()
      name = await targetChainAvoWallet.DOMAIN_SEPARATOR_NAME()
    } catch (error) {
      version = await forwarder.avoWalletVersion('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
      name = await forwarder.avoWalletVersionName('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
    }

    const versionMajor = parse(version)?.major || 1;

    // Creating domain for signing using Avocado wallet address as the verifying contract
    const domain = {
      name,
      version,
      chainId: String(AVOCADO_CHAIN_ID),
      salt: keccak256(['uint256'], [chainId]),
      verifyingContract: await this.getAddress()
    }

    // The named list of all type definitions
    const types = {
      1: typesV1,
      2: typesV2,
      3: typesV3,
    }[versionMajor] || {}

    // Adding values for types mentioned
    const value = message

    return await this._signTypedData(domain, types, value)
  }
}

export function createSafe(signer: Signer, provider = signer.provider, ownerAddress: string | undefined = undefined) {
  if (!provider) {
    throw new Error('Provider')
  }

  const avoSigner = new AvoSigner(
    signer,
    provider,
    ownerAddress
  )

  return {
    /**
     * Get the current AvoSigner
     * 
     * @returns current AvoSigner instance
     */
    getSigner() {
      return avoSigner
    },

    /**
     * Generates the signature message for a set of `transactions` with the respective `options`. 
     * This can be subsequently used as input for {@link buildSignature} or also be used in direct interaction
     * with contracts to access methods not covered by the Avocado SDK itself.
     *
     * @param transactions - Transactions to be executed in the Avocado smart wallet. 
     * @param targetChainId - The chain id of the network where the transactions will be executable
     * @param options - Optional options to specify things such as time limiting validity, using a non-sequential nonce etc.
     * @returns Object that can be fed into {@link buildSignature} or directly used for contract interaction
     */
    async generateSignatureMessage(transactions: Deferrable<RawTransaction>[], targetChainId: number, options?: SignatureOption) {
      return await avoSigner.generateSignatureMessage(transactions, targetChainId, options)
    },

    /**
     * Builds a valid signature from the returned value of {@link generateSignatureMessage}. 
     * The returned signature can be used to execute the actions at the Avocado smart wallet.
     * This will automatically trigger the user to sign the message.
     *
     * @param message - The previously generated message with {@link generateSignatureMessage}. 
     * @param chainId - The chain id of the network where this signed transaction will be executable
     * @returns A signed, executable message for an Avocado smart wallet
     */
    async buildSignature(message: Awaited<ReturnType<typeof avoSigner.generateSignatureMessage>>, chainId: number) {
      return await avoSigner.buildSignature({
        message,
        chainId
      })
    },

    /**
     * Executes multiple `transactions` with the Avocado smart wallet,automatically triggering the user to sign the message for execution.
     *
     * @param transactions - Transactions to be executed in the Avocado smart wallet. 
     * @param targetChainId - The chain id of the network where the transactions will be executed
     * @param options - Optional options to specify things such as using a non-sequential nonce etc.
     * @returns the TransactionResponse result
     */
    async sendTransactions(transactions: Deferrable<RawTransaction>[], targetChainId: number, options?: SignatureOption): Promise<TransactionResponse> {
      return await avoSigner.sendTransactions(transactions, targetChainId, options)
    },

    /**
     * Executes a `transaction` with the Avocado smart wallet, automatically triggering the user to sign the message for execution.
     *
     * @param transaction - Transaction to be executed in the Avocado smart wallet. 
     * @param targetChainId - The chain id of the network where the transactions will be executed
     * @param options - Optional options to specify things such as using a non-sequential nonce etc.
     * @returns the TransactionResponse result
     */
    async sendTransaction(transaction: Deferrable<RawTransaction>, targetChainId?: number, options?: SignatureOption): Promise<TransactionResponse> {
      return await avoSigner.sendTransaction({
        ...transaction,
        chainId: targetChainId || await transaction.chainId
      }, options)
    },

    /**
     * Broadcasts a previously signed message with valid signature.
     *
     * @param message - The previously generated message with {@link generateSignatureMessage}. 
     * @param signature - The user signature for the message with {@link buildSignature}. 
     * @param chainId - The chain id of the network where this signed transaction will be executable
     * @param safeAddress - Optional address of the smart wallet in case it is not the one for the current signer
     * @returns the TransactionResponse result
     */
    async broadcastSignedMessage(message: Awaited<ReturnType<typeof avoSigner.generateSignatureMessage>>, signature:string, chainId: number, safeAddress?: string): Promise<TransactionResponse> {
      return await avoSigner.broadcastSignedMessage({message, signature, chainId, safeAddress})
    },

    /**
     * Verifies the validity of a signature for a previously signed message.
     *
     * @param message - The previously generated message with {@link generateSignatureMessage}. 
     * @param signature - The user signature for the message with {@link buildSignature}. 
     * @param chainId - The chain id of the network where this signed transaction will be executable
     * @param safeAddress - Optional address of the smart wallet in case it is not the one for the current signer
     * @returns the TransactionResponse result
     */
    async verify(message: Awaited<ReturnType<typeof avoSigner.generateSignatureMessage>>, signature:string, chainId: number, safeAddress?: string): Promise<boolean> {
      return await avoSigner.verify({message, signature, chainId, safeAddress})
    },

    async estimateFee(transactions: Deferrable<RawTransaction>[], targetChainId: number, options?: SignatureOption): Promise<{
      fee: string,
      multiplier: string,
      discount?: { amount: string, program: string, name: string, description: string }
    }> {
      const message = await avoSigner.generateSignatureMessage(transactions, targetChainId, options)

      const response = await avoSigner._avoProvider.send('txn_estimateFeeWithoutSignature', [
        message,
        await signer.getAddress(),
        targetChainId,
      ])

      return {
        ...response,
        fee: BigNumber.from(response.fee).toString(),
        multiplier: BigNumber.from(response.multiplier).toString(),
      }
    },

    /**
     * Get the current AvoSigner instance for a different chain id
     * 
     * @param chainId - The chain id of the network
     * @returns AvoSigner for the respective `chainId`
     */
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

    /**
     * Get the owner address of the current AvoSigner instance
     * 
     * @returns current AvoSigner instance owner's address
     */
    async getOwnerAddress() {
      return await avoSigner.getOwnerAddress()
    },

    /**
     * Get the signer address of the current AvoSigner instance
     * 
     * @returns current AvoSigner instance signer's address
     */
    async getSignerAddress() {
      return await avoSigner.getSignerAddress()
    },

    /**
     * Get the safe address of the current AvoSigner instance
     * 
     * @returns current avoSigner instance address
     */
    async getSafeAddress() {
      return await avoSigner.getAddress()
    },

    /**
     * Get the current avoSafeNonce value at the smart wallet
     * 
     * @param chainId - The chain id of the network
     * @returns current avoSafeNonce value
     */
    async getSafeNonce(chainId: number | string) {
      return await avoSigner.getSafeNonce(Number(chainId))
    }
  }
}

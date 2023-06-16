import { Provider } from "@ethersproject/providers";
import { Contract, Signer } from "ethers";
import { parse } from "semver";
import {
  AVOCADO_AUTHORITIES_LIST_PROXY_ADDRESS,
  AVOCADO_DEPOSIT_MANAGER_PROXY_ADDRESS,
  AVOCADO_FACTORY_PROXY_ADDRESS,
  AVOCADO_FORWARDER_PROXY_ADDRESS,
  AVOCADO_GAS_ESTIMATIONS_HELPER_ADDRESS,
  AVOCADO_SIGNERS_LIST_PROXY_ADDRESS,
  AVOCADO_VERSIONS_REGISTRY_PROXY_ADDRESS,
} from "./config";
import { AvoAuthoritiesList } from "./contracts/AvoAuthoritiesList";
import { AvoDepositManager } from "./contracts/AvoDepositManager";
import { AvoFactory } from "./contracts/AvoFactory";
import { AvoForwarder } from "./contracts/AvoForwarder";
import { AvoGasEstimationsHelper } from "./contracts/AvoGasEstimationsHelper";
import { AvoSignersList } from "./contracts/AvoSignersList";
import { AvoVersionsRegistry } from "./contracts/AvoVersionsRegistry";
import {
  AvoAuthoritiesList__factory,
  AvoDepositManager__factory,
  AvoFactory__factory,
  AvoForwarder__factory,
  AvoGasEstimationsHelper__factory,
  AvoMultisigV3__factory,
  AvoSignersList__factory,
  AvoVersionsRegistry__factory,
  AvoWalletV2__factory,
  AvoWalletV3__factory,
} from "./contracts/factories";
import { getRpcProvider } from "./providers";

export enum AvoSafeVersion {
  V1 = 1,
  V2 = 2,
  V3 = 3,
}

export enum AvoMultisigVersion {
  V3 = 3,
}

class AvoContracts {
  private contractInstances: Record<string, Contract> = {};

  private getContractKey = (
    chainId: number | string,
    contractAddress: string
  ) => chainId + contractAddress;

  authoritiesList(chainId: number | string, signer?: Signer) {
    const contractKey = this.getContractKey(
      chainId,
      AVOCADO_AUTHORITIES_LIST_PROXY_ADDRESS
    );
    if (!this.contractInstances[contractKey]) {
      this.contractInstances[contractKey] = AvoAuthoritiesList__factory.connect(
        AVOCADO_AUTHORITIES_LIST_PROXY_ADDRESS,
        signer || getRpcProvider(chainId)
      );
    }

    return this.contractInstances[chainId] as AvoAuthoritiesList;
  }

  depositManager(chainId: number | string, signer?: Signer) {
    const contractKey = this.getContractKey(
      chainId,
      AVOCADO_DEPOSIT_MANAGER_PROXY_ADDRESS
    );
    if (!this.contractInstances[contractKey]) {
      this.contractInstances[contractKey] = AvoDepositManager__factory.connect(
        AVOCADO_DEPOSIT_MANAGER_PROXY_ADDRESS,
        signer || getRpcProvider(chainId)
      );
    }

    return this.contractInstances[chainId] as AvoDepositManager;
  }

  factory(chainId: number | string, signer?: Signer) {
    const contractKey = this.getContractKey(
      chainId,
      AVOCADO_FACTORY_PROXY_ADDRESS
    );
    if (!this.contractInstances[contractKey]) {
      this.contractInstances[contractKey] = AvoFactory__factory.connect(
        AVOCADO_FACTORY_PROXY_ADDRESS,
        signer || getRpcProvider(chainId)
      );
    }

    return this.contractInstances[chainId] as AvoFactory;
  }

  forwarder(chainId: number | string, signer?: Signer) {
    const contractKey = this.getContractKey(
      chainId,
      AVOCADO_FORWARDER_PROXY_ADDRESS
    );
    if (!this.contractInstances[contractKey]) {
      this.contractInstances[contractKey] = AvoForwarder__factory.connect(
        AVOCADO_FORWARDER_PROXY_ADDRESS,
        signer || getRpcProvider(chainId)
      );
    }

    return this.contractInstances[chainId] as AvoForwarder;
  }

  gasEstimationsHelper(chainId: number | string, signer?: Signer) {
    const contractKey = this.getContractKey(
      chainId,
      AVOCADO_GAS_ESTIMATIONS_HELPER_ADDRESS
    );
    if (!this.contractInstances[contractKey]) {
      this.contractInstances[contractKey] =
        AvoGasEstimationsHelper__factory.connect(
          AVOCADO_GAS_ESTIMATIONS_HELPER_ADDRESS,
          signer || getRpcProvider(chainId)
        );
    }

    return this.contractInstances[chainId] as AvoGasEstimationsHelper;
  }

  multisigV3(address: string, signer: Signer | Provider) {
    return AvoMultisigV3__factory.connect(address, signer);
  }

  signersList(chainId: number | string, signer?: Signer) {
    const contractKey = this.getContractKey(
      chainId,
      AVOCADO_SIGNERS_LIST_PROXY_ADDRESS
    );
    if (!this.contractInstances[contractKey]) {
      this.contractInstances[contractKey] = AvoSignersList__factory.connect(
        AVOCADO_SIGNERS_LIST_PROXY_ADDRESS,
        signer || getRpcProvider(chainId)
      );
    }

    return this.contractInstances[chainId] as AvoSignersList;
  }

  versionsRegistry(chainId: number | string, signer?: Signer) {
    const contractKey = this.getContractKey(
      chainId,
      AVOCADO_VERSIONS_REGISTRY_PROXY_ADDRESS
    );
    if (!this.contractInstances[contractKey]) {
      this.contractInstances[contractKey] =
        AvoVersionsRegistry__factory.connect(
          AVOCADO_VERSIONS_REGISTRY_PROXY_ADDRESS,
          signer || getRpcProvider(chainId)
        );
    }

    return this.contractInstances[chainId] as AvoVersionsRegistry;
  }

  safeV2(address: string, signer: Signer | Provider) {
    return AvoWalletV2__factory.connect(address, signer);
  }

  safeV3(address: string, signer: Signer | Provider) {
    return AvoWalletV3__factory.connect(address, signer);
  }

  async safeVersion(
    chainId: number | string,
    address: string
  ): Promise<AvoSafeVersion> {
    let version;

    let targetChainAvoWallet = AvoWalletV3__factory.connect(
      address,
      getRpcProvider(chainId)
    );

    try {
      version = await targetChainAvoWallet.DOMAIN_SEPARATOR_VERSION();
    } catch (error) {
      version = await this.forwarder(chainId).avoWalletVersion(
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
      );
    }

    const versionMajor = parse(version)?.major || 1;
    switch (versionMajor) {
      case 1:
        return AvoSafeVersion.V1;
      case 2:
        return AvoSafeVersion.V2;
      case 3:
        return AvoSafeVersion.V3;
      default:
        throw new Error(`Unrecognized Avocado Safe Version: ${version}`);
    }
  }

  async multisigVersion(
    chainId: number | string,
    address: string
  ): Promise<AvoMultisigVersion> {
    let version;

    let targetChainAvoMultisig = AvoMultisigV3__factory.connect(
      address,
      getRpcProvider(chainId)
    );

    try {
      version = await targetChainAvoMultisig.DOMAIN_SEPARATOR_VERSION();
    } catch (error) {
      version = await this.forwarder(chainId).avoMultisigVersion(
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
      );
    }

    const versionMajor = parse(version)?.major || 1;
    switch (versionMajor) {
      case 3:
        return AvoMultisigVersion.V3;
      default:
        throw new Error(`Unrecognized Avocado Multisig Version: ${version}`);
    }
  }
}

export const avoContracts = new AvoContracts();

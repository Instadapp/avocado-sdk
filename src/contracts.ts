import { Provider } from "@ethersproject/providers";
import { Contract, Signer } from "ethers";
import { parse } from "semver";
import { AVOCADO_FORWARDER_PROXY_ADDRESS } from "./config";
import { AvoForwarder } from "./contracts/AvoForwarder";
import {
  AvoForwarder__factory,
  AvoMultisigV3__factory,
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

  multisigV3(address: string, signer: Signer) {
    return AvoMultisigV3__factory.connect(address, signer);
  }

  safeV3(address: string, signer: Signer) {
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

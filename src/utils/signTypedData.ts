// https://github.com/enzymefinance/protocol/blob/c9621dd5f8234bd45126772fc626252a38d46eee/packages/ethers/src/utils/signTypedData.ts
import { JsonRpcProvider } from '@ethersproject/providers';
import { hexlify } from '@ethersproject/bytes';
import { toUtf8Bytes } from '@ethersproject/strings';
import type { TypedData } from './typedData';
import { getTypedDataMessage } from './typedData';
import { _TypedDataEncoder } from '@ethersproject/hash';

export async function signTypedData(
  provider: JsonRpcProvider,
  address: string,
  data: TypedData,
): Promise<{ signature?: string; method?: string; cancelled?: boolean }> {
  const message = await getTypedDataMessage(provider, data.domain, data.types, data.value);

  // MetaMask needs to use `eth_signTypedData_v4`.
  // MetaMask has implemented `eth_signTypedData` as `eth_signTypedData_v1`.
  try {
    const method = 'eth_signTypedData_v4';
    const signature = await provider.send(method, [address.toLowerCase(), message]);

    return { method, signature };
  } catch (error) {
    if (typeof error === 'object' && (error as any)?.code === 4001) {
      return { cancelled: true };
    }
  }

  // WalletConnect needs to use `eth_signTypedData`.
  // WalletConnect wallets may not know about `eth_signTypedData_v4`.
  try {
    const method = 'eth_signTypedData';
    const signature = await provider.send(method, [address.toLowerCase(), message]);

    return { method, signature };
  } catch (error) {
    if (typeof error === 'string' && error.endsWith('User denied message signature.')) {
      return { cancelled: true };
    }
  }

  // Fallback if `eth_signedTypedData` and `eth_signTypedData_v4` are not supported
  try {
    const method = 'eth_sign';
    const signature = await provider.send(method, [address.toLowerCase(), hexlify(toUtf8Bytes(message))]);

    return { method, signature };
  } catch (error) {
    if (typeof error === 'string' && error.startsWith('Error: Transaction was rejected')) {
      return { cancelled: true };
    }
  }

  try {
    const method = 'personl_sign';
    const signature = await provider.send(method, [address.toLowerCase(), _TypedDataEncoder.encode(data.domain, data.types, data.value)]);

    return { method, signature };
  } catch (error) {
    if (typeof error === 'string' && error.startsWith('Error: Transaction was rejected')) {
      return { cancelled: true };
    }

    throw new Error(typeof error === 'string' ? error : 'An error occured.');
  }

}
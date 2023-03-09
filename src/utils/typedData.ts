import type { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import { JsonRpcProvider } from '@ethersproject/providers'
import { _TypedDataEncoder } from '@ethersproject/hash';

export interface TypedData {
    domain: TypedDataDomain;
    types: Record<string, TypedDataField[]>;
    value: Record<string, any>;
}

export interface TypedDataPayload {
    types: Record<string, TypedDataField[]>;
    domain: TypedDataDomain;
    primaryType: string;
    message: any;
}

export async function getTypedDataPayload(
    provider: JsonRpcProvider,
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    value: Record<string, any>,
): Promise<TypedDataPayload> {
    const populated = await _TypedDataEncoder.resolveNames(domain, types, value, async (name: string) => {
        const resolved = await provider.resolveName(name);

        // eslint-disable-next-line eqeqeq
        if (resolved == null) {
            throw new Error(`Failed to resolve name ${name}`);
        }

        return resolved;
    });

    return _TypedDataEncoder.getPayload(populated.domain, types, populated.value);
}

export async function getTypedDataMessage(
    provider: JsonRpcProvider,
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    value: Record<string, any>,
) {
    const payload = await getTypedDataPayload(provider, domain, types, value);

    return JSON.stringify(payload);
}
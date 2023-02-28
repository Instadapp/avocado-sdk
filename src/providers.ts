import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { AVOCADO_CHAIN_ID } from './config'

export const RPC_URLS: { [chainId: number]: string } = {
    1: 'https://rpc.ankr.com/eth',
    137: 'https://rpc.ankr.com/polygon',
    43114: 'https://rpc.ankr.com/avalanche',
    250: 'https://rpc.ankr.com/fantom',
    10: 'https://rpc.ankr.com/optimism',
    42161: 'https://arb1.arbitrum.io/rpc',
    [AVOCADO_CHAIN_ID]: 'https://rpc.avocado.instadapp.io',
    100: 'https://rpc.ankr.com/gnosis',
    56: 'https://rpc.ankr.com/bsc'
}

const rpcInstances: Record<string, StaticJsonRpcProvider> = {}

export const getRpcProvider = (chainId: number | string) => {
    if (!rpcInstances[chainId]) {
        rpcInstances[chainId] = new StaticJsonRpcProvider(RPC_URLS[Number(chainId)])
    }

    return rpcInstances[chainId]
}
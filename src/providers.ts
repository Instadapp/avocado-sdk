import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { AVOCADO_CHAIN_ID, AVOCADO_RPC } from './config'

export const RPC_URLS: { [chainId: number]: string } = {
    1: 'https://rpc.ankr.com/eth',
    137: 'https://rpc.ankr.com/polygon',
    43114: 'https://rpc.ankr.com/avalanche',
    250: 'https://rpc.ankr.com/fantom',
    10: 'https://rpc.ankr.com/optimism',
    42161: 'https://arb1.arbitrum.io/rpc',
    [AVOCADO_CHAIN_ID]: AVOCADO_RPC,
    100: 'https://rpc.ankr.com/gnosis',
    56: 'https://rpc.ankr.com/bsc',
    1101 : 'https://rpc.ankr.com/polygon_zkevm',
    1313161554: "https://mainnet.aurora.dev",
    8453: "https://rpc.ankr.com/base",
}

const rpcInstances: Record<string, StaticJsonRpcProvider> = {}

export const getRpcProvider = (chainId: number | string) => {
    if (!rpcInstances[chainId]) {
        rpcInstances[chainId] = new StaticJsonRpcProvider(RPC_URLS[Number(chainId)])
    }

    return rpcInstances[chainId]
}

export const setRpcUrls = (rpcUrls: { [chainId: number]: string }) => {
    Object.assign(RPC_URLS, rpcUrls)
    
    RPC_URLS[AVOCADO_CHAIN_ID] = AVOCADO_RPC
}